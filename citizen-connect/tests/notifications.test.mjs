import { test } from "node:test";
import assert from "node:assert/strict";
import { userNotifications, unreadCount } from "../utils/notifications.ts";
test("notification list isolates owners and sorts newest first without mutating state", () => {
  const list = [
    { id: "a", userId: "me", createdAt: "2026-10-01T00:00:00Z", read: false },
    {
      id: "b",
      userId: "other",
      createdAt: "2026-10-15T00:00:00Z",
      read: false,
    },
    { id: "c", userId: "me", createdAt: "2026-10-14T00:00:00Z", read: true },
  ];
  assert.deepEqual(
    userNotifications(list, "me").map((n) => n.id),
    ["c", "a"],
  );
  assert.deepEqual(
    list.map((n) => n.id),
    ["a", "b", "c"],
  );
  assert.equal(unreadCount(list, "me"), 1);
});
test("read and deleted updates reduce counts; another users updates never contribute", () => {
  const n = {
    id: "a",
    userId: "me",
    createdAt: "2026-10-15T00:00:00Z",
    read: false,
  };
  assert.equal(unreadCount([n], "me"), 1);
  assert.equal(unreadCount([{ ...n, read: true }], "me"), 0);
  assert.equal(unreadCount([], "me"), 0);
  assert.equal(unreadCount([n], "other"), 0);
});
