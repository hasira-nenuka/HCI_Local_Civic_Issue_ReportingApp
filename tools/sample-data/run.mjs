import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  makeSampleData,
  SAMPLE_DATASET,
} from "../../citizen-connect/services/sampleDataset.ts";
import {
  reconcileCategories,
  validateDataset,
  summarize,
  operationsFor,
  preflightDocuments,
  createOnlyDocuments,
  checkAuthIdentities,
} from "./core.mjs";

const directory = path.dirname(fileURLToPath(import.meta.url));
const local = path.join(directory, ".local");
const args = process.argv.slice(2);
const option = (name) =>
  args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const project = option("--project") || "citizen-connect-12345";
const apply = args.includes("--apply");
const asOf = option("--as-of") ? new Date(option("--as-of")) : new Date();
const expectedProject = (
  await readFile(
    path.resolve(directory, "../../citizen-connect/.env"),
    "utf8",
  ).catch(() => "")
).match(/^EXPO_PUBLIC_FIREBASE_PROJECT_ID\s*=\s*["']?([^\s"']+)/m)?.[1];
if (
  project !== "citizen-connect-12345" ||
  (expectedProject && project !== expectedProject)
)
  throw Error(
    "Project mismatch. This importer is restricted to citizen-connect-12345 and must match the mobile app configuration.",
  );
await mkdir(local, { recursive: true });
async function saveJson(filename, value) {
  const temp = `${filename}.tmp`;
  await writeFile(temp, JSON.stringify(value, null, 2), { mode: 0o600 });
  await rename(temp, filename);
}
async function main() {
  if (!apply) {
    const data = makeSampleData({
      now: asOf,
      adminIds: ["existing-admin-placeholder"],
    });
    validateDataset(data, asOf, ["existing-admin-placeholder"]);
    await saveJson(path.join(local, "dataset-preview.json"), {
      project,
      sampleDataset: SAMPLE_DATASET,
      asOf: asOf.toISOString(),
      summary: summarize(data),
      data,
    });
    console.log("PREVIEW ONLY — no Firebase requests or writes were made.");
    console.log(JSON.stringify(summarize(data), null, 2));
    console.log("Preview: tools/sample-data/.local/dataset-preview.json");
    console.log(
      "Apply requires Firebase Admin credentials. See docs/sample-data-setup.md.",
    );
    return;
  }
  if (!args.includes("--project"))
    throw Error(
      "Applying requires --project citizen-connect-12345 explicitly.",
    );
  const credentialPath =
    option("--credentials") || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const { initializeApp, cert, applicationDefault } =
    await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");
  const { getFirestore } = await import("firebase-admin/firestore");
  let credential;
  if (credentialPath) {
    const account = JSON.parse(
      await readFile(path.resolve(credentialPath), "utf8"),
    );
    if (account.type !== "service_account" || account.project_id !== project)
      throw Error(
        "The local service-account file does not belong to citizen-connect-12345.",
      );
    credential = cert(account);
  } else {
    // Avoid silently attempting metadata-server credentials on a personal PC.
    const adc = process.env.APPDATA
      ? path.join(
          process.env.APPDATA,
          "gcloud/application_default_credentials.json",
        )
      : path.join(
          process.env.HOME || "",
          ".config/gcloud/application_default_credentials.json",
        );
    await readFile(adc).catch(() => {
      throw Error(
        "No Firebase Admin credential is configured. The public mobile .env configuration cannot authorize this import. Follow docs/sample-data-setup.md; keep the private key local.",
      );
    });
    credential = applicationDefault();
  }
  const app = initializeApp({ credential, projectId: project });
  const db = getFirestore(app);
  const auth = getAuth(app);
  console.log(`Checking existing records in ${project}...`);
  const adminProfiles = (
    await db.collection("users").where("role", "==", "admin").get()
  ).docs
    .map((d) => ({ ...d.data(), id: d.id }))
    .filter((u) => u.active === true);
  if (!adminProfiles.length)
    throw Error(
      "No active administrator profile was found. Create/fix your existing admin profile first.",
    );
  const authAdmins = await auth.getUsers(
    adminProfiles.map((u) => ({ uid: u.id })),
  );
  const adminIds = adminProfiles
    .filter((p) =>
      authAdmins.users.some(
        (u) =>
          u.uid === p.id &&
          u.email?.toLowerCase() === p.email?.toLowerCase() &&
          !u.disabled,
      ),
    )
    .map((u) => u.id);
  if (!adminIds.length)
    throw Error(
      "No active admin profile matches its Firebase Authentication UID/email.",
    );
  const existingCategories = (await db.collection("categories").get()).docs.map(
    (d) => ({ ...d.data(), id: d.id }),
  );
  const categoryPlan = reconcileCategories(existingCategories);
  const manifestFile = path.join(local, "import-manifest.json");
  let manifest = JSON.parse(
    await readFile(manifestFile, "utf8").catch(() => "null"),
  );
  if (manifest && manifest.project !== project)
    throw Error("Saved import manifest belongs to a different project.");
  const now = manifest ? new Date(manifest.asOf) : asOf;
  const data = makeSampleData({
    now,
    categories: categoryPlan.categories,
    adminIds,
  });
  validateDataset(data, now, adminIds);
  const operations = operationsFor(data, categoryPlan.created);
  await preflightDocuments(db, operations);
  const authExisting = await auth.getUsers(
    data.users.flatMap((u) => [{ uid: u.id }, { email: u.email }]),
  );
  checkAuthIdentities(data.users, authExisting.users);
  const credentialsFile = path.join(local, "credentials.json");
  let credentials = JSON.parse(
    await readFile(credentialsFile, "utf8").catch(() => "null"),
  );
  if (credentials && credentials.project !== project)
    throw Error("Saved credentials belong to another project.");
  credentials ||= { project, sampleDataset: SAMPLE_DATASET, accounts: [] };
  for (const user of data.users)
    if (
      !authExisting.users.some((u) => u.uid === user.id) &&
      !credentials.accounts.some((u) => u.uid === user.id)
    )
      credentials.accounts.push({
        uid: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        password: `Cc!7${randomBytes(18).toString("base64url")}`,
        state: "pending",
      });
  // Save recovery information before making the first remote mutation.
  await saveJson(credentialsFile, credentials);
  manifest ||= {
    project,
    sampleDataset: SAMPLE_DATASET,
    asOf: now.toISOString(),
    state: "prepared",
  };
  await saveJson(manifestFile, manifest);
  console.log(
    JSON.stringify(
      {
        planned: summarize(data),
        newCategories: categoryPlan.created.length,
        reusedCategories: 6 - categoryPlan.created.length,
      },
      null,
      2,
    ),
  );
  let createdAuth = 0;
  for (const user of data.users) {
    if (authExisting.users.some((u) => u.uid === user.id)) continue;
    const entry = credentials.accounts.find((u) => u.uid === user.id);
    await auth.createUser({
      uid: user.id,
      email: user.email,
      displayName: user.name,
      password: entry.password,
      disabled: false,
      emailVerified: false,
    });
    createdAuth++;
    entry.state = "created";
    await saveJson(credentialsFile, credentials);
  }
  console.log(
    `Authentication: ${createdAuth} accounts created; existing accounts and passwords preserved.`,
  );
  const written = await createOnlyDocuments(db, operations);
  // Read back from the server; never report completion based on write calls alone.
  for (let i = 0; i < operations.length; i += 400) {
    const chunk = operations.slice(i, i + 400);
    const snapshots = await db.getAll(
      ...chunk.map((op) => db.collection(op.collection).doc(op.record.id)),
    );
    if (
      snapshots.some(
        (s) => !s.exists || s.data().sampleDataset !== SAMPLE_DATASET,
      )
    )
      throw Error(
        "Read-back verification failed. Rerun the same import to resume safely.",
      );
  }
  const verified = await auth.getUsers(data.users.map((u) => ({ uid: u.id })));
  if (verified.notFound.length)
    throw Error("Authentication read-back verification failed.");
  manifest.state = "verified";
  manifest.summary = summarize(data);
  manifest.completedAt = new Date().toISOString();
  await saveJson(manifestFile, manifest);
  console.log(
    `Firestore verified: ${written.created} documents created, ${written.skipped} existing sample documents preserved.`,
  );
  console.log(
    "Import complete. Reload the real app. Local login credentials: tools/sample-data/.local/credentials.json (not stored in Firestore).",
  );
}
main().catch((error) => {
  console.error(`Import stopped: ${error.code || ""} ${error.message}`);
  console.error(
    "No existing documents or passwords were replaced. If any sample records were already created, rerun the same command to resume.",
  );
  process.exitCode = 1;
});
