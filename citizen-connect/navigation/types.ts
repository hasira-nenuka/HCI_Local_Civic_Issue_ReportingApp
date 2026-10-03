export type RootParams = {
  Login: undefined;
  Register: undefined;
  Main:
    | {
        screen?:
          | "Home"
          | "My Reports"
          | "Profile"
          | "Complaints"
          | "Progress"
          | "Settings";
      }
    | undefined;
  Category: undefined;
  CategoryInfo: { categoryId: string };
  ReportWizard: { categoryId: string };
  Confirmation: { id: string };
  Details: { id: string };
  Track: { id: string };
  EditReport: { id: string };
  Notifications: undefined;
  NotificationDetail: { id: string };
  EditProfile: undefined;
  Password: undefined;
  Support: undefined;
  About: undefined;
  Assign: { id: string };
  Categories: undefined;
  CategoryEdit: { id?: string };
  Users: { role?: "officer" | "gn" };
  UserEdit: { id?: string; role?: "officer" | "gn" };
  Contacts: undefined;
  ContactEdit: { id?: string };
  OfficerProfile: undefined;
};
