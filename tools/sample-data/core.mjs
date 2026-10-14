import {
  SAMPLE_DATASET,
  serviceDefinitions,
} from "../../citizen-connect/services/sampleDataset.ts";

const aliases = {
  water: ["water", "watersupply", "watercomplaint", "watercomplaints"],
  road: ["road", "roaddamage", "roadcomplaint"],
  garbage: [
    "garbage",
    "cleanliness",
    "garbagecleanliness",
    "garbagecomplaint",
    "waste",
  ],
  light: ["streetlight", "streetlights", "streetlightcomplaint"],
  environment: ["environment", "parkenvironment", "parkenvironmentcomplaint"],
  other: ["other", "othercommunityissues"],
};
const normalize = (value) => value.toLowerCase().replace(/[^a-z]/g, "");
export function reconcileCategories(existing) {
  const created = [];
  const categories = serviceDefinitions.map((definition) => {
    const exact = existing.find((c) => c.id === definition.id);
    const candidates = exact
      ? [exact]
      : existing.filter((c) =>
          aliases[definition.id].includes(normalize(c.name || "")),
        );
    if (candidates.length > 1)
      throw Error(
        `More than one existing category matches ${definition.name}; review the duplicate categories first.`,
      );
    const found = candidates[0];
    if (found) {
      if (
        !found.name ||
        !Array.isArray(found.types) ||
        !found.types.length ||
        found.types.some((t) => typeof t !== "string" || !t.trim()) ||
        !["Low", "Medium", "High"].includes(found.priority)
      )
        throw Error(
          `Existing category ${found.id} is incomplete. It was not overwritten; correct its name, issue types and priority first.`,
        );
      return found;
    }
    const category = {
      ...definition,
      types: [...definition.types],
      sampleDataset: SAMPLE_DATASET,
    };
    created.push(category);
    return category;
  });
  return { categories, created };
}
export function validateDataset(data, asOf = new Date(), adminIds = []) {
  const ids = new Map();
  for (const [collection, records] of Object.entries(data)) {
    if (!Array.isArray(records))
      throw Error(`Invalid collection ${collection}`);
    const unique = new Set();
    for (const record of records) {
      if (!record.id || record.id.includes("/") || unique.has(record.id))
        throw Error(`Duplicate or invalid ID in ${collection}`);
      unique.add(record.id);
      if (
        /"(?:password|private_key|passwordHash)"\s*:/i.test(
          JSON.stringify(record),
        )
      )
        throw Error("Credentials must never appear in Firestore records.");
    }
    ids.set(collection, unique);
  }
  const users = new Map(data.users.map((u) => [u.id, u]));
  const admins = new Set(adminIds);
  const categories = new Map(data.categories.map((c) => [c.id, c]));
  const complaints = new Map(data.complaints.map((c) => [c.id, c]));
  const rank = { Submitted: 0, Assigned: 1, "In Progress": 2, Resolved: 3 };
  for (const user of data.users) {
    if (
      !user.name ||
      !user.nameSi ||
      (!user.email.endsWith("@citizenconnect.example") &&
        user.id !== "admin-demo") ||
      user.sampleDataset !== SAMPLE_DATASET
    )
      throw Error(`Invalid sample profile ${user.id}`);
  }
  for (const c of data.complaints) {
    const citizen = users.get(c.citizenId);
    const category = categories.get(c.categoryId);
    if (
      citizen?.role !== "citizen" ||
      !category ||
      !category.types.includes(c.issueType) ||
      category.priority !== c.priority
    )
      throw Error(`Broken citizen/category relationship: ${c.id}`);
    if (
      c.description.length < 10 ||
      c.description.length > 2000 ||
      !c.address ||
      !c.division ||
      !c.localAuthority
    )
      throw Error(`Incomplete complaint ${c.id}`);
    if (
      (c.latitude === undefined) !== (c.longitude === undefined) ||
      (c.latitude !== undefined &&
        (!Number.isFinite(c.latitude) ||
          !Number.isFinite(c.longitude) ||
          Math.abs(c.latitude) > 90 ||
          Math.abs(c.longitude) > 180))
    )
      throw Error(`Invalid GPS pair ${c.id}`);
    if (
      c.history[0]?.status !== "Submitted" ||
      c.history.at(-1)?.status !== c.status ||
      c.createdAt !== c.history[0].at ||
      c.updatedAt !== c.history.at(-1).at
    )
      throw Error(`Invalid timeline ${c.id}`);
    let previous = -1;
    let at = 0;
    for (const entry of c.history) {
      const time = Date.parse(entry.at);
      if (
        rank[entry.status] !== previous + 1 ||
        !Number.isFinite(time) ||
        time < at ||
        time > +asOf
      )
        throw Error(`Invalid timeline order/date ${c.id}`);
      previous++;
      at = time;
    }
    if (
      c.status !== "Submitted" &&
      (!users.get(c.assignedOfficerId)?.active ||
        users.get(c.assignedOfficerId)?.role !== "officer")
    )
      throw Error(`Invalid assigned officer ${c.id}`);
    if (c.status === "Submitted" && c.assignedOfficerId)
      throw Error(`Submitted report already assigned: ${c.id}`);
    if (
      c.feedback &&
      (c.status !== "Resolved" ||
        !Number.isInteger(c.feedback.rating) ||
        c.feedback.rating < 1 ||
        c.feedback.rating > 5)
    )
      throw Error(`Invalid feedback ${c.id}`);
  }
  for (const n of data.notifications) {
    const c = complaints.get(n.complaintId);
    const user = users.get(n.userId);
    if (
      !c ||
      (!user && !admins.has(n.userId)) ||
      !Number.isFinite(Date.parse(n.createdAt)) ||
      Date.parse(n.createdAt) > +asOf ||
      typeof n.read !== "boolean"
    )
      throw Error(`Broken notification ${n.id}`);
    if (
      (user?.role === "citizen" && c.citizenId !== user.id) ||
      (user?.role === "officer" && c.assignedOfficerId !== user.id) ||
      (user?.role === "gn" && c.division !== user.division)
    )
      throw Error(`Incorrect notification recipient ${n.id}`);
  }
  return true;
}
export function summarize(data) {
  const by = (records, key) =>
    records.reduce(
      (counts, r) => ({ ...counts, [r[key]]: (counts[r[key]] || 0) + 1 }),
      {},
    );
  const dates = data.complaints.map((c) => c.createdAt).sort();
  return {
    users: data.users.length,
    roles: by(data.users, "role"),
    activeUsers: data.users.filter((u) => u.active).length,
    disabledUsers: data.users.filter((u) => !u.active).length,
    categories: data.categories.length,
    complaints: data.complaints.length,
    statuses: by(data.complaints, "status"),
    notifications: data.notifications.length,
    contacts: data.contacts.length,
    feedback: data.complaints.filter((c) => c.feedback).length,
    withoutGps: data.complaints.filter((c) => c.latitude === undefined).length,
    firstReport: dates[0],
    lastReport: dates.at(-1),
  };
}
export function operationsFor(data, newCategories) {
  return [
    "users",
    "categories",
    "contacts",
    "complaints",
    "notifications",
  ].flatMap((collection) =>
    (collection === "categories" ? newCategories : data[collection]).map(
      (record) => ({ collection, record }),
    ),
  );
}
function checkExisting(op, snapshot) {
  if (snapshot.exists && snapshot.data().sampleDataset !== SAMPLE_DATASET)
    throw Error(
      `Existing non-sample record at ${op.collection}/${op.record.id}; import stopped without replacing it.`,
    );
  if (
    snapshot.exists &&
    op.collection === "users" &&
    (snapshot.data().id !== op.record.id ||
      snapshot.data().role !== op.record.role ||
      snapshot.data().active !== op.record.active)
  )
    throw Error(
      `Sample account ${op.record.id} has changed identity, role or active state. Review it before resuming; it was not reset.`,
    );
}
export function checkAuthIdentities(users, existing) {
  for (const user of users) {
    const byUid = existing.find((u) => u.uid === user.id);
    const byEmail = existing.find((u) => u.email?.toLowerCase() === user.email);
    if (
      (byUid && byUid.email?.toLowerCase() !== user.email) ||
      (byEmail && byEmail.uid !== user.id)
    )
      throw Error(
        `Authentication identity collision for ${user.id}; nothing was overwritten.`,
      );
    if (byUid && Boolean(byUid.disabled))
      throw Error(
        `Authentication account ${user.id} is disabled in Firebase Authentication. It was not reset.`,
      );
  }
}
export async function preflightDocuments(db, operations) {
  for (let i = 0; i < operations.length; i += 400) {
    const chunk = operations.slice(i, i + 400);
    const snapshots = await db.getAll(
      ...chunk.map((op) => db.collection(op.collection).doc(op.record.id)),
    );
    chunk.forEach((op, index) => checkExisting(op, snapshots[index]));
  }
}
export async function createOnlyDocuments(db, operations) {
  let created = 0,
    skipped = 0;
  // Each committed batch is atomic. Authentication and all batches together
  // are not atomic; stable IDs make a partially completed import resumable.
  for (let i = 0; i < operations.length; i += 400) {
    const chunk = operations.slice(i, i + 400);
    const result = await db.runTransaction(async (transaction) => {
      const refs = chunk.map((op) =>
        db.collection(op.collection).doc(op.record.id),
      );
      const snapshots = await transaction.getAll(...refs);
      let added = 0;
      chunk.forEach((op, index) => {
        checkExisting(op, snapshots[index]);
        if (!snapshots[index].exists) {
          transaction.create(refs[index], op.record);
          added++;
        }
      });
      return { created: added, skipped: chunk.length - added };
    });
    created += result.created;
    skipped += result.skipped;
  }
  return { created, skipped };
}
