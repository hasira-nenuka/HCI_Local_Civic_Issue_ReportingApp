import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createComplaint,
  transitionComplaint,
  validateDraft,
  visibleComplaints,
} from "../utils/complaints.ts";
const citizen = {
  id: "citizen",
  role: "citizen",
  active: true,
  division: "Division 03",
};
const category = {
  id: "road",
  name: "Road Damage",
  types: ["Potholes"],
  priority: "Medium",
};
const draft = {
  categoryId: "road",
  issueType: "Potholes",
  area: "Colombo 03",
  localAuthority: "Colombo Municipal Council",
  description: "Large pothole near the junction.",
  division: "Division 03",
  address: "Temple Road",
  latitude: 6.9002,
  longitude: 79.8538,
};
const data = {
  categories: [category],
  complaints: [],
  users: [],
  notifications: [],
  contacts: [],
};
test("FR1: create a report with ownership, category and initial timeline", () => {
  const report = createComplaint(data, citizen, draft);
  assert.equal(report.citizenId, citizen.id);
  assert.equal(report.status, "Submitted");
  assert.equal(report.category, "Road Damage");
  assert.equal(report.history[0].status, "Submitted");
  assert.ok(report.id);
  assert.ok(report.reference);
  assert.equal(report.latitude, draft.latitude);
});
test("FR1: reject incomplete descriptions, invalid coordinates and missing division", () => {
  for (const patch of [
    { description: "short" },
    { latitude: NaN },
    { latitude: 91 },
    { longitude: 181 },
    { address: "" },
    { division: "" },
    { categoryId: "" },
  ])
    assert.throws(() => validateDraft({ ...draft, ...patch }));
});
test("FR1: reject issue types from a different category", () =>
  assert.throws(() =>
    createComplaint(data, citizen, { ...draft, issueType: "Water Leakage" }),
  ));
test("FR2/FR4: require assignment, retain history and prevent backward transitions", () => {
  const report = createComplaint(data, citizen, draft);
  assert.throws(() => transitionComplaint(report, "In Progress"));
  const assigned = transitionComplaint(
    { ...report, assignedOfficerId: "officer" },
    "Assigned",
    "Please inspect.",
  );
  assert.equal(assigned.history.length, 2);
  assert.equal(assigned.history[1].note, "Please inspect.");
  const resolved = transitionComplaint(
    transitionComplaint(assigned, "In Progress"),
    "Resolved",
  );
  assert.equal(resolved.history.length, 4);
  assert.throws(() => transitionComplaint(resolved, "Assigned"));
});
test("FR2: repeated status does not duplicate timeline entries", () => {
  const report = createComplaint(data, citizen, draft);
  assert.equal(transitionComplaint(report, "Submitted").history.length, 1);
});
test("FR5/NFR3: citizens only see their reports; GN only sees their division", () => {
  const mine = createComplaint(data, citizen, draft);
  const other = {
    ...mine,
    id: "other",
    citizenId: "other-citizen",
    division: "Division 04",
  };
  const store = { ...data, complaints: [mine, other] };
  assert.deepEqual(
    visibleComplaints(store, citizen).map((c) => c.id),
    [mine.id],
  );
  assert.deepEqual(
    visibleComplaints(store, { ...citizen, role: "gn" }).map((c) => c.id),
    [mine.id],
  );
  assert.equal(
    visibleComplaints(store, { ...citizen, role: "admin" }).length,
    2,
  );
});

import { sameRecord } from "../utils/records.ts";
test("Cloud conflict checks ignore field order but detect changed history and assignment", () => {
  const before = {
    id: "a",
    status: "Assigned",
    assignedOfficerId: "officer-a",
    history: [{ status: "Submitted", at: "2026-10-05" }],
  };
  assert.equal(
    sameRecord(before, {
      history: before.history,
      assignedOfficerId: "officer-a",
      status: "Assigned",
      id: "a",
    }),
    true,
  );
  assert.equal(
    sameRecord(before, { ...before, assignedOfficerId: "officer-b" }),
    false,
  );
  assert.equal(
    sameRecord(before, {
      ...before,
      history: [...before.history, { status: "Assigned", at: "2026-10-06" }],
    }),
    false,
  );
});

test("Reports without GPS retain address and ownership; incomplete coordinate pairs are rejected", () => {
  const { latitude, longitude, ...withoutGPS } = draft;
  const report = createComplaint(data, citizen, withoutGPS);
  assert.equal(report.address, draft.address);
  assert.equal(report.citizenId, citizen.id);
  assert.equal(report.latitude, undefined);
  assert.equal(report.longitude, undefined);
  assert.throws(() => validateDraft({ ...withoutGPS, latitude }));
  assert.throws(() => validateDraft({ ...withoutGPS, longitude }));
  assert.doesNotThrow(() =>
    validateDraft({ ...withoutGPS, latitude: 0, longitude: 0 }),
  );
});

import { createPendingWrite } from "../utils/pendingWrite.ts";
test("Stalled writes time out without permitting a duplicate before acknowledgement", async () => {
  const save = createPendingWrite(10);
  let acknowledge;
  let writes = 0;
  await assert.rejects(
    save(() => {
      writes++;
      return new Promise((resolve) => {
        acknowledge = resolve;
      });
    }),
    /result is unconfirmed/,
  );
  await assert.rejects(
    save(async () => {
      writes++;
    }),
    /previous save/,
  );
  assert.equal(writes, 1);
  acknowledge();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await save(async () => {
    writes++;
  });
  assert.equal(writes, 2);
});
test("Rejected writes propagate the error and allow corrected retries", async () => {
  const save = createPendingWrite(100);
  await assert.rejects(
    save(async () => {
      throw new Error("permission-denied");
    }),
    /permission-denied/,
  );
  await save(async () => {});
});
