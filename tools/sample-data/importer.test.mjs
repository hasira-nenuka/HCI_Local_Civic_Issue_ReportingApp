import { test } from "node:test";
import assert from "node:assert/strict";
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
const now = new Date("2026-10-14T06:30:00Z");
const dataset = () => makeSampleData({ now, adminIds: ["real-admin"] });
test("Four-week dataset has sufficient linked users, varied services, every workflow stage and notifications for each active role", () => {
  const data = dataset();
  assert.equal(validateDataset(data, now, ["real-admin"]), true);
  const summary = summarize(data);
  assert.deepEqual(summary.roles, { citizen: 15, officer: 8, gn: 6 });
  assert.equal(summary.complaints, 90);
  assert.equal(summary.contacts, 12);
  assert.equal(summary.feedback, 15);
  assert.equal(summary.withoutGps, 30);
  assert.deepEqual(summary.statuses, {
    Submitted: 15,
    Assigned: 15,
    "In Progress": 30,
    Resolved: 30,
  });
  assert.equal(new Set(data.complaints.map((c) => c.categoryId)).size, 6);
  assert.ok(
    new Set(
      data.categories.map(
        (c) => data.complaints.filter((r) => r.categoryId === c.id).length,
      ),
    ).size > 1,
  );
  for (const user of data.users.filter((u) => u.active)) {
    assert.ok(
      data.notifications.some((n) => n.userId === user.id),
      `Missing notifications for ${user.id}`,
    );
    if (user.role === "citizen") {
      const reports = data.complaints.filter((c) => c.citizenId === user.id);
      assert.equal(reports.length, 6);
      assert.equal(new Set(reports.map((c) => c.status)).size, 4);
    }
  }
  assert.ok(data.notifications.some((n) => n.userId === "real-admin"));
  assert.ok(+now - Date.parse(summary.firstReport) > 25 * 86400000);
  assert.ok(+now - Date.parse(summary.firstReport) < 28 * 86400000);
});
test("Validation rejects broken ownership, future history, missing GPS pair, invalid staff notifications and credentials", () => {
  const broken = dataset();
  broken.complaints[0].citizenId = "not-a-user";
  assert.throws(
    () => validateDataset(broken, now, ["real-admin"]),
    /relationship/,
  );
  const future = dataset();
  future.complaints[0].history[0].at = "2099-01-01T00:00:00Z";
  assert.throws(() => validateDataset(future, now, ["real-admin"]), /timeline/);
  const gps = dataset();
  gps.complaints[0].latitude = 6.9;
  delete gps.complaints[0].longitude;
  assert.throws(() => validateDataset(gps, now, ["real-admin"]), /GPS/);
  const secrets = dataset();
  secrets.users[0].password = "not-for-firestore";
  assert.throws(
    () => validateDataset(secrets, now, ["real-admin"]),
    /Credentials/,
  );
  const notification = dataset();
  notification.notifications[0].userId = notification.users.find(
    (u) =>
      u.role === "officer" &&
      u.id !==
        notification.complaints.find(
          (c) => c.id === notification.notifications[0].complaintId,
        ).assignedOfficerId,
  ).id;
  assert.throws(
    () => validateDataset(notification, now, ["real-admin"]),
    /recipient/,
  );
});
test("Existing categories are reused without overwriting custom issue types, IDs or priorities", () => {
  const existing = [
    {
      id: "council-water",
      name: "Water supply",
      types: ["Council water leak"],
      priority: "Low",
      icon: "water",
      color: "#ffffff",
      description: "Existing council content",
    },
  ];
  const before = JSON.stringify(existing);
  const plan = reconcileCategories(existing);
  assert.equal(plan.created.length, 5);
  assert.equal(plan.categories[0].id, "council-water");
  assert.equal(JSON.stringify(existing), before);
  const data = makeSampleData({
    now,
    categories: plan.categories,
    adminIds: ["real-admin"],
  });
  assert.equal(validateDataset(data, now, ["real-admin"]), true);
  for (const c of data.complaints.filter(
    (c) => c.categoryId === "council-water",
  )) {
    assert.equal(c.issueType, "Council water leak");
    assert.equal(c.priority, "Low");
  }
  assert.throws(
    () =>
      reconcileCategories([...existing, { ...existing[0], id: "duplicate" }]),
    /More than one/,
  );
  assert.throws(
    () => reconcileCategories([{ ...existing[0], types: [] }]),
    /incomplete/,
  );
});
test("Authentication preflight refuses UID/email collisions and never resets changed account state", () => {
  const user = dataset().users[0];
  const inactive = dataset().users.find((u) => !u.active);
  assert.doesNotThrow(() =>
    checkAuthIdentities(
      [inactive],
      [{ uid: inactive.id, email: inactive.email, disabled: false }],
    ),
  );
  assert.doesNotThrow(() =>
    checkAuthIdentities(
      [user],
      [{ uid: user.id, email: user.email, disabled: !user.active }],
    ),
  );
  assert.throws(
    () =>
      checkAuthIdentities([user], [{ uid: "real-user", email: user.email }]),
    /collision/,
  );
  assert.throws(
    () =>
      checkAuthIdentities(
        [user],
        [{ uid: user.id, email: "different@example.com" }],
      ),
    /collision/,
  );
  assert.throws(
    () =>
      checkAuthIdentities(
        [user],
        [{ uid: user.id, email: user.email, disabled: true }],
      ),
    /disabled/,
  );
});
function fakeDb() {
  const records = new Map();
  let calls = 0;
  let failAt = 0;
  const snapshot = (ref) => ({
    exists: records.has(ref.path),
    data: () => structuredClone(records.get(ref.path)),
  });
  return {
    records,
    setFailure: (n) => {
      failAt = n;
    },
    get calls() {
      return calls;
    },
    collection: (name) => ({ doc: (id) => ({ path: `${name}/${id}` }) }),
    getAll: async (...refs) => refs.map(snapshot),
    runTransaction: async (callback) => {
      calls++;
      if (calls === failAt) throw Error("Simulated disconnect");
      const writes = [];
      const result = await callback({
        getAll: async (...refs) => {
          assert.equal(writes.length, 0);
          return refs.map(snapshot);
        },
        create: (ref, record) => {
          assert.ok(!records.has(ref.path));
          writes.push([ref.path, structuredClone(record)]);
        },
      });
      for (const [key, value] of writes) records.set(key, value);
      return result;
    },
  };
}
test("Import is create-only and rerunning preserves edited sample records", async () => {
  const data = dataset();
  const ops = operationsFor(data, reconcileCategories([]).created);
  const db = fakeDb();
  await preflightDocuments(db, ops);
  const first = await createOnlyDocuments(db, ops);
  assert.equal(first.created, ops.length);
  const key = `users/${data.users[0].id}`;
  db.records.get(key).name = "Administrator edited this sample name";
  const second = await createOnlyDocuments(db, ops);
  assert.equal(second.created, 0);
  assert.equal(second.skipped, ops.length);
  assert.equal(
    db.records.get(key).name,
    "Administrator edited this sample name",
  );
});
test("Non-sample collisions abort preflight before any write", async () => {
  const data = dataset();
  const ops = operationsFor(data, reconcileCategories([]).created);
  const db = fakeDb();
  db.records.set(`users/${data.users[0].id}`, {
    id: data.users[0].id,
    name: "Real existing record",
  });
  await assert.rejects(preflightDocuments(db, ops), /non-sample/);
  assert.equal(db.calls, 0);
  assert.equal(db.records.size, 1);
});
test("Interrupted multi-batch import resumes without duplicates or replacing prior records", async () => {
  const data = dataset();
  const ops = operationsFor(data, reconcileCategories([]).created);
  const db = fakeDb();
  db.setFailure(2);
  await assert.rejects(createOnlyDocuments(db, ops), /disconnect/);
  assert.equal(db.records.size, 400);
  db.setFailure(0);
  const resumed = await createOnlyDocuments(db, ops);
  assert.equal(resumed.created, ops.length - 400);
  assert.equal(db.records.size, ops.length);
  assert.ok(
    [...db.records.values()].every(
      (record) => record.sampleDataset === SAMPLE_DATASET,
    ),
  );
});
