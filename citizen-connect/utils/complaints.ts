import type {
  AppData,
  Complaint,
  ComplaintDraft,
  User,
  Status,
} from "../types/models";
export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
export function validateDraft(draft: ComplaintDraft) {
  if (
    !draft.categoryId ||
    !draft.issueType ||
    !draft.area ||
    !draft.localAuthority
  )
    throw new Error("Complete the category, issue type, area and authority.");
  if (draft.description.trim().length < 10)
    throw new Error("Please describe the issue in at least 10 characters.");
  if (!draft.address.trim())
    throw new Error("Add an address or nearby landmark.");
  if (!draft.division.trim()) throw new Error("Add a GN division.");
  if (draft.description.length > 2000)
    throw new Error("Keep the description within 2000 characters.");
  if (
    !Number.isFinite(draft.latitude) ||
    !Number.isFinite(draft.longitude) ||
    Math.abs(draft.latitude) > 90 ||
    Math.abs(draft.longitude) > 180
  )
    throw new Error("Enter valid location coordinates.");
}
export function createComplaint(
  data: AppData,
  user: User,
  draft: ComplaintDraft,
): Complaint {
  validateDraft(draft);
  const category = data.categories.find((c) => c.id === draft.categoryId);
  if (!category || !category.types.includes(draft.issueType))
    throw new Error("Choose an available issue type.");
  const now = new Date().toISOString();
  const id = uid();
  return {
    ...draft,
    id,
    reference: `${draft.categoryId.slice(0, 2).toUpperCase()}-${id.toUpperCase()}`,
    citizenId: user.id,
    category: category.name,
    priority: category.priority,
    status: "Submitted",
    createdAt: now,
    updatedAt: now,
    history: [{ status: "Submitted", at: now }],
  };
}
export function visibleComplaints(data: AppData, user: User) {
  return data.complaints.filter(
    (c) =>
      user.role === "admin" ||
      user.role === "officer" ||
      (user.role === "citizen"
        ? c.citizenId === user.id
        : c.division === user.division),
  );
}
export function canManage(user: User) {
  return user.role === "admin" || user.role === "officer";
}
export function transitionComplaint(
  complaint: Complaint,
  status: Status,
  note?: string,
): Complaint {
  const order: Status[] = ["Submitted", "Assigned", "In Progress", "Resolved"];
  if (order.indexOf(status) < order.indexOf(complaint.status))
    throw new Error("A complaint cannot move backwards in its workflow.");
  if (status !== "Submitted" && !complaint.assignedOfficerId)
    throw new Error("Assign an officer before changing the status.");
  if (status === complaint.status) return complaint;
  const now = new Date().toISOString();
  return {
    ...complaint,
    status,
    updatedAt: now,
    history: [
      ...complaint.history,
      { status, at: now, ...(note ? { note } : {}) },
    ],
  };
}
export const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Colombo",
  });
