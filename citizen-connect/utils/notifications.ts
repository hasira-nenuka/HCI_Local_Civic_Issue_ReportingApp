import type { AppNotification } from "../types/models";
export function userNotifications(items: AppNotification[], userId: string) {
  return items
    .filter((n) => n.userId === userId)
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
    );
}
export function unreadCount(items: AppNotification[], userId: string) {
  return items.filter((n) => n.userId === userId && !n.read).length;
}
