export type Role = "citizen" | "officer" | "gn" | "admin";
export type Status = "Submitted" | "Assigned" | "In Progress" | "Resolved";
export type Priority = "Low" | "Medium" | "High";
export interface SampleRecord {
  sampleDataset?: string;
}
export interface User extends SampleRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  area: string;
  division: string;
  province: string;
  active: boolean;
  imageUrl?: string;
  nameSi?: string;
  avatarKey?: string;
}
export interface Category extends SampleRecord {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  types: string[];
  priority: Priority;
  artwork?: string;
}
export interface HistoryEntry {
  status: Status;
  at: string;
  note?: string;
}
export interface Complaint extends SampleRecord {
  id: string;
  reference: string;
  citizenId: string;
  categoryId: string;
  category: string;
  issueType: string;
  description: string;
  area: string;
  localAuthority: string;
  division: string;
  address: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  priority: Priority;
  status: Status;
  assignedOfficerId?: string;
  assignmentNote?: string;
  createdAt: string;
  updatedAt: string;
  history: HistoryEntry[];
  feedback?: { rating: number; comment: string };
}
export interface AppNotification extends SampleRecord {
  id: string;
  userId: string;
  complaintId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}
export interface Contact extends SampleRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
}
export interface AppData {
  users: User[];
  complaints: Complaint[];
  categories: Category[];
  notifications: AppNotification[];
  contacts: Contact[];
}
export type ComplaintDraft = Pick<
  Complaint,
  | "categoryId"
  | "issueType"
  | "description"
  | "area"
  | "localAuthority"
  | "division"
  | "address"
  | "latitude"
  | "longitude"
  | "imageUrl"
>;
