import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Text, View } from "react-native";
import {
  AppData,
  ComplaintDraft,
  Role,
  User,
  Status,
  Category,
  Contact,
} from "../types/models";
import { localStore } from "../services/localStore";
import {
  createComplaint,
  canManage,
  transitionComplaint,
  uid,
} from "../utils/complaints";
import { theme } from "../constants/theme";
import { firebaseEnabled, firebaseConfigured } from "../services/firebase";
import { cloudStore, emptyData } from "../services/cloudStore";
type Context = {
  data: AppData;
  user: User | null;
  busy: boolean;
  cloud: boolean;
  login: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  demoLogin: (role: Role) => Promise<void>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  saveProfile: (values: Partial<User>) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  submit: (draft: ComplaintDraft) => Promise<string>;
  editReport: (id: string, description: string) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  assign: (
    id: string,
    officerId: string,
    division: string,
    note: string,
  ) => Promise<void>;
  changeStatus: (
    id: string,
    status: Status,
    priority?: "Low" | "Medium" | "High",
  ) => Promise<void>;
  feedback: (id: string, rating: number, comment: string) => Promise<void>;
  readNotification: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveUser: (values: User) => Promise<void>;
  saveContact: (contact: Contact) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
};
const AppContext = createContext<Context | null>(null);
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppProvider is missing");
  return context;
};
export function AppProvider({ children }: React.PropsWithChildren) {
  const [data, setData] = useState<AppData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dataRef = useRef<AppData | null>(null);
  const lock = useRef(false);
  const authGeneration = useRef(0);
  const authAction = useRef(false);
  useEffect(() => {
    if (firebaseEnabled) {
      const initial = emptyData();
      dataRef.current = initial;
      setData(initial);
      try {
        return cloudStore.observeAuth(async (account) => {
          const generation = ++authGeneration.current;
          // Explicit login/signup loads the profile only after its own work completes.
          if (authAction.current) return;
          if (!account) {
            setUser(null);
            const empty = emptyData();
            dataRef.current = empty;
            setData(empty);
            return;
          }
          try {
            const profile = await cloudStore.profile(account.uid);
            if (generation !== authGeneration.current) return;
            if (!profile)
              throw new Error(
                "Your user profile is missing. Ask the administrator to create users/{your Authentication UID}.",
              );
            if (profile.active !== true) {
              await cloudStore.logout();
              return;
            }
            const loaded = await cloudStore.load(profile);
            if (generation !== authGeneration.current) return;
            dataRef.current = loaded;
            setData(loaded);
            setUser(profile);
            setError("");
          } catch (e) {
            if (generation !== authGeneration.current || authAction.current)
              return;
            setUser(null);
            const empty = emptyData();
            dataRef.current = empty;
            setData(empty);
            setError(`Firebase: ${(e as Error).message}`);
          }
        });
      } catch (e) {
        setError((e as Error).message);
      }
      return;
    }
    (async () => {
      try {
        const loaded = await localStore.load();
        dataRef.current = loaded;
        setData(loaded);
        const id = await localStore.session();
        setUser(loaded.users.find((u) => u.id === id && u.active) || null);
      } catch {
        setError("Could not load saved data. Restart the app and try again.");
      }
    })();
  }, []);
  useEffect(() => {
    if (!firebaseEnabled || !user) return;
    return cloudStore.watch(
      user,
      (key, values) => {
        const current = dataRef.current;
        if (!current) return;
        const next = { ...current, [key]: values };
        dataRef.current = next;
        setData(next);
        if (key === "users") {
          const profile = next.users.find((u) => u.id === user.id);
          if (profile && !profile.active) void cloudStore.logout();
          else if (profile) setUser(profile);
        }
      },
      (e) => setError(`Firebase: ${e.message}`),
    );
  }, [user?.id, user?.role, user?.division]);
  async function commit(change: (current: AppData) => AppData) {
    if (lock.current)
      throw new Error("Please wait for the current operation to finish.");
    lock.current = true;
    setBusy(true);
    try {
      const before = dataRef.current!;
      const next = change(before);
      if (firebaseEnabled) {
        await cloudStore.save(before, next);
        // Firestore listeners are authoritative; replacing whole arrays here
        // can hide records that another device added during this operation.
        setError("");
      } else {
        await localStore.save(next);
        dataRef.current = next;
        setData(next);
      }
      if (user)
        setUser(
          dataRef.current!.users.find((u) => u.id === user.id && u.active) ||
            null,
        );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const requireUser = () => {
    if (!user?.active) throw new Error("Please sign in.");
    return user;
  };
  const requireManager = () => {
    const actor = requireUser();
    if (!canManage(actor))
      throw new Error("Officer or administrator access is required.");
    return actor;
  };
  const requireAdmin = () => {
    if (requireUser().role !== "admin")
      throw new Error("Administrator access is required.");
  };
  const value: Context | null = data
    ? {
        data,
        user,
        busy,
        cloud: firebaseEnabled,
        async login(email, password) {
          if (!firebaseEnabled)
            throw new Error(
              "Firebase is not configured yet. Use a demo account below.",
            );
          if (authAction.current)
            throw new Error("Please wait for sign-in to finish.");
          authAction.current = true;
          ++authGeneration.current;
          setError("");
          try {
            const profile = await cloudStore.login(email, password);
            const loaded = await cloudStore.load(profile);
            dataRef.current = loaded;
            setData(loaded);
            setUser(profile);
          } catch (e) {
            await cloudStore.logout().catch(() => undefined);
            setUser(null);
            const empty = emptyData();
            dataRef.current = empty;
            setData(empty);
            throw e;
          } finally {
            authAction.current = false;
          }
        },
        async resetPassword(email) {
          if (!firebaseEnabled)
            throw new Error("Password reset requires Firebase.");
          await cloudStore.resetPassword(email);
        },
        async demoLogin(role) {
          if (firebaseEnabled)
            throw new Error("Demo accounts are unavailable in Firebase mode.");
          setUser(await localStore.demoUser(role, dataRef.current!));
        },
        async register(name, email, phone, password) {
          if (firebaseEnabled) {
            if (authAction.current)
              throw new Error("Please wait for sign-in to finish.");
            authAction.current = true;
            ++authGeneration.current;
            setError("");
            let profileCreated = false;
            try {
              const profile = await cloudStore.register(
                name,
                email,
                phone,
                password,
              );
              profileCreated = true;
              const loaded = await cloudStore.load(profile);
              dataRef.current = loaded;
              setData(loaded);
              setUser(profile);
            } catch (e) {
              await cloudStore.logout().catch(() => undefined);
              setUser(null);
              const empty = emptyData();
              dataRef.current = empty;
              setData(empty);
              if (profileCreated)
                throw new Error(
                  `Your account and profile were created, but app data could not load. Use Login after fixing access; do not sign up again. ${(e as Error).message}`,
                );
              throw e;
            } finally {
              authAction.current = false;
            }
            return;
          }
          const next = await localStore.register(
            name,
            email,
            phone,
            dataRef.current!,
          );
          await commit((d) => ({ ...d, users: [...d.users, next] }));
          await localStore.setSession(next.id);
          setUser(next);
        },
        async logout() {
          if (firebaseEnabled) await cloudStore.logout();
          else await localStore.setSession(null);
          setUser(null);
        },
        async saveProfile(values) {
          const actor = requireUser();
          const photo =
            values.imageUrl && firebaseEnabled
              ? await cloudStore.uploadPhoto(values.imageUrl, actor.id)
              : values.imageUrl;
          await commit((d) => ({
            ...d,
            users: d.users.map((u) =>
              u.id === actor.id
                ? {
                    ...u,
                    name: values.name ?? u.name,
                    phone: values.phone ?? u.phone,
                    ...(photo ? { imageUrl: photo } : {}),
                  }
                : u,
            ),
          }));
        },
        async changePassword(current, next) {
          if (!firebaseEnabled)
            throw new Error(
              "Password changes require Firebase Authentication.",
            );
          await cloudStore.changePassword(current, next);
        },
        async submit(draft) {
          const actor = requireUser();
          if (actor.role !== "citizen")
            throw new Error("Only citizens can submit reports.");
          const photo =
            draft.imageUrl && firebaseEnabled
              ? await cloudStore.uploadPhoto(draft.imageUrl, actor.id)
              : draft.imageUrl;
          let id = "";
          await commit((d) => {
            const report = createComplaint(d, actor, {
              ...draft,
              ...(photo ? { imageUrl: photo } : {}),
            });
            id = report.id;
            return {
              ...d,
              complaints: [report, ...d.complaints],
              notifications: [
                {
                  id: uid(),
                  userId: actor.id,
                  complaintId: report.id,
                  title: "Report submitted",
                  body: `#${report.reference} has been received.`,
                  createdAt: report.createdAt,
                  read: false,
                },
                ...d.notifications,
              ],
            };
          });
          return id;
        },
        async editReport(id, description) {
          const actor = requireUser();
          if (description.trim().length < 10)
            throw new Error("Add at least 10 characters.");
          await commit((d) => {
            const c = d.complaints.find((c) => c.id === id);
            if (!c || c.citizenId !== actor.id || c.status !== "Submitted")
              throw new Error("Only your submitted reports can be edited.");
            return {
              ...d,
              complaints: d.complaints.map((c) =>
                c.id === id
                  ? {
                      ...c,
                      description: description.trim(),
                      updatedAt: new Date().toISOString(),
                    }
                  : c,
              ),
            };
          });
        },
        async deleteReport(id) {
          const actor = requireUser();
          await commit((d) => {
            const c = d.complaints.find((c) => c.id === id);
            if (!c || c.citizenId !== actor.id || c.status !== "Submitted")
              throw new Error("Only your submitted reports can be deleted.");
            return {
              ...d,
              complaints: d.complaints.filter((c) => c.id !== id),
              notifications: d.notifications.filter(
                (n) => n.complaintId !== id,
              ),
            };
          });
        },
        async assign(id, officerId, division, note) {
          requireManager();
          await commit((d) => {
            const officer = d.users.find(
              (u) => u.id === officerId && u.role === "officer" && u.active,
            );
            if (!officer) throw new Error("Select an active officer.");
            const complaint = d.complaints.find((c) => c.id === id);
            if (!complaint || complaint.status === "Resolved")
              throw new Error("This complaint cannot be assigned.");
            const next = transitionComplaint(
              {
                ...complaint,
                assignedOfficerId: officerId,
                division,
                assignmentNote: note,
              },
              complaint.status === "Submitted" ? "Assigned" : complaint.status,
              note,
            );
            return {
              ...d,
              complaints: d.complaints.map((c) => (c.id === id ? next : c)),
              notifications: [
                {
                  id: uid(),
                  userId: next.citizenId,
                  complaintId: id,
                  title: "Complaint assigned",
                  body: `#${next.reference} was assigned to ${officer.name}.`,
                  createdAt: new Date().toISOString(),
                  read: false,
                },
                ...d.notifications,
              ],
            };
          });
        },
        async changeStatus(id, status, priority) {
          requireManager();
          await commit((d) => {
            const c = d.complaints.find((c) => c.id === id);
            if (!c) throw new Error("Complaint not found.");
            const next = transitionComplaint(c, status);
            return {
              ...d,
              complaints: d.complaints.map((c) =>
                c.id === id
                  ? { ...next, priority: priority || next.priority }
                  : c,
              ),
              notifications:
                c.status === status
                  ? d.notifications
                  : [
                      {
                        id: uid(),
                        userId: c.citizenId,
                        complaintId: id,
                        title: "Status updated",
                        body: `#${c.reference} is now ${status}.`,
                        createdAt: new Date().toISOString(),
                        read: false,
                      },
                      ...d.notifications,
                    ],
            };
          });
        },
        async feedback(id, rating, comment) {
          const actor = requireUser();
          await commit((d) => {
            const c = d.complaints.find((c) => c.id === id);
            if (
              !c ||
              c.citizenId !== actor.id ||
              c.status !== "Resolved" ||
              rating < 1 ||
              rating > 5
            )
              throw new Error(
                "Feedback is available for your resolved reports.",
              );
            return {
              ...d,
              complaints: d.complaints.map((c) =>
                c.id === id ? { ...c, feedback: { rating, comment } } : c,
              ),
            };
          });
        },
        async readNotification(id) {
          const actor = requireUser();
          await commit((d) => ({
            ...d,
            notifications: d.notifications.map((n) =>
              n.id === id && n.userId === actor.id ? { ...n, read: true } : n,
            ),
          }));
        },
        async deleteNotification(id) {
          const actor = requireUser();
          await commit((d) => ({
            ...d,
            notifications: d.notifications.filter(
              (n) => n.id !== id || n.userId !== actor.id,
            ),
          }));
        },
        async saveCategory(category) {
          requireAdmin();
          if (!category.name.trim() || !category.types.length)
            throw new Error("Add a category name and at least one issue type.");
          await commit((d) => ({
            ...d,
            categories: d.categories.some((c) => c.id === category.id)
              ? d.categories.map((c) => (c.id === category.id ? category : c))
              : [...d.categories, category],
          }));
        },
        async deleteCategory(id) {
          requireAdmin();
          await commit((d) => {
            if (d.complaints.some((c) => c.categoryId === id))
              throw new Error("This category is used by existing reports.");
            return {
              ...d,
              categories: d.categories.filter((c) => c.id !== id),
            };
          });
        },
        async saveUser(values) {
          requireAdmin();
          if (
            values.id === user!.id &&
            (!values.active || values.role !== "admin")
          )
            throw new Error("You cannot disable or demote your own account.");
          if (
            firebaseEnabled &&
            !dataRef.current!.users.some((u) => u.id === values.id)
          )
            throw new Error(
              "Create the Auth account and matching Firestore profile in Firebase Console first.",
            );
          await commit((d) => ({
            ...d,
            users: d.users.some((u) => u.id === values.id)
              ? d.users.map((u) => (u.id === values.id ? values : u))
              : [...d.users, values],
          }));
        },
        async saveContact(contact) {
          requireAdmin();
          await commit((d) => ({
            ...d,
            contacts: d.contacts.some((c) => c.id === contact.id)
              ? d.contacts.map((c) => (c.id === contact.id ? contact : c))
              : [...d.contacts, contact],
          }));
        },
        async deleteContact(id) {
          requireAdmin();
          await commit((d) => ({
            ...d,
            contacts: d.contacts.filter((c) => c.id !== id),
          }));
        },
      }
    : null;
  if (firebaseEnabled && !firebaseConfigured)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 28,
          backgroundColor: theme.bg,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 16 }}>
          Connect Firebase
        </Text>
        <Text>
          Citizen Connect now requires real authentication. Create your Firebase
          project, enable Email/Password sign-in, and publish the supplied
          database rules.
        </Text>
        <Text style={{ marginTop: 16 }}>
          Copy citizen-connect/.env.example to .env, enter your Firebase web app
          configuration, then restart Expo with --clear. Follow
          docs/firebase-setup.md.
        </Text>
      </View>
    );
  if (!value)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.bg,
        }}
      >
        <ActivityIndicator color={theme.blue} />
        <Text>{error || "Opening Citizen Connect…"}</Text>
      </View>
    );
  return (
    <AppContext.Provider value={value}>
      {error ? (
        <View style={{ padding: 16, backgroundColor: "#feedef" }}>
          <Text accessibilityRole="alert" style={{ color: theme.red }}>
            {error}
          </Text>
        </View>
      ) : null}
      {children}
    </AppContext.Provider>
  );
}
