import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  runTransaction,
  writeBatch,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadString,
} from "firebase/storage";
import { AppData, User } from "../types/models";
import { firebase } from "./firebase";
import { uid } from "../utils/complaints";
import { sameRecord } from "../utils/records";
import { createPendingWrite } from "../utils/pendingWrite";
const confirmWrite = createPendingWrite();
function firestoreFailure(error: unknown, operation: string): Error {
  const code = (error as { code?: string }).code;
  if (code === "permission-denied" || code === "firestore/permission-denied")
    return new Error(
      `${operation}: Firestore denied access. In Firebase project citizen-connect-12345, publish citizen-connect/firebase/firestore.rules and check users/{your Authentication UID} has a matching id, a valid role, and active set to boolean true.`,
    );
  return new Error(`${operation}: ${(error as Error).message}`);
}
export const emptyData = (): AppData => ({
  users: [],
  complaints: [],
  categories: [],
  notifications: [],
  contacts: [],
});
function sources(user: User) {
  const { db } = firebase();
  return {
    users:
      user.role === "admin" || user.role === "officer"
        ? collection(db, "users")
        : query(collection(db, "users"), where("id", "==", user.id)),
    complaints:
      user.role === "citizen"
        ? query(collection(db, "complaints"), where("citizenId", "==", user.id))
        : user.role === "gn"
          ? query(
              collection(db, "complaints"),
              where("division", "==", user.division),
            )
          : collection(db, "complaints"),
    categories: collection(db, "categories"),
    contacts: collection(db, "contacts"),
    notifications: query(
      collection(db, "notifications"),
      where("userId", "==", user.id),
    ),
  };
}
export const cloudStore = {
  observeAuth(callback: (user: import("firebase/auth").User | null) => void) {
    return onAuthStateChanged(firebase().auth, callback);
  },
  async profile(id: string): Promise<User | null> {
    try {
      const snapshot = await getDoc(doc(firebase().db, "users", id));
      if (!snapshot.exists()) return null;
      const profile = snapshot.data() as User;
      if (
        profile.id !== id ||
        !["citizen", "admin", "officer", "gn"].includes(profile.role)
      )
        throw new Error(
          "Your Firestore profile has an incorrect id or role. Contact the administrator.",
        );
      return profile;
    } catch (error) {
      throw firestoreFailure(error, "Reading your user profile");
    }
  },
  async load(user: User): Promise<AppData> {
    const entries = await Promise.all(
      Object.entries(sources(user)).map(async ([key, source]) => {
        try {
          return [key, (await getDocs(source)).docs.map((d) => d.data())];
        } catch (error) {
          throw firestoreFailure(error, `Loading ${key}`);
        }
      }),
    );
    return Object.fromEntries(entries) as AppData;
  },
  watch(
    user: User,
    callback: (key: keyof AppData, values: AppData[keyof AppData]) => void,
    error: (error: Error) => void,
  ) {
    const stops = Object.entries(sources(user)).map(([key, source]) =>
      onSnapshot(
        source,
        (snapshot) =>
          callback(
            key as keyof AppData,
            snapshot.docs.map((d) => d.data()) as AppData[keyof AppData],
          ),
        (e) => error(firestoreFailure(e, `Listening to ${key}`)),
      ),
    );
    return () => stops.forEach((stop) => stop());
  },
  async login(email: string, password: string) {
    const result = await signInWithEmailAndPassword(
      firebase().auth,
      email.trim(),
      password,
    );
    try {
      const profile = await this.profile(result.user.uid);
      if (!profile || profile.active !== true)
        throw new Error(
          "Your account profile is missing or disabled. Create users/{your Authentication UID} with all required fields and active set to boolean true.",
        );
      return profile;
    } catch (error) {
      await signOut(firebase().auth).catch(() => undefined);
      throw error;
    }
  },
  async register(
    name: string,
    email: string,
    phone: string,
    password: string,
  ): Promise<User> {
    const credential = await createUserWithEmailAndPassword(
      firebase().auth,
      email.trim(),
      password,
    );
    const user: User = {
      id: credential.user.uid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone,
      role: "citizen",
      active: true,
      area: "Colombo 03",
      division: "Division 03",
      province: "Western Province",
    };
    try {
      await setDoc(doc(firebase().db, "users", user.id), user);
    } catch (e) {
      try {
        await credential.user.delete();
      } catch {
        await signOut(firebase().auth).catch(() => undefined);
        throw new Error(
          `${firestoreFailure(e, "Creating your user profile").message} Account cleanup also failed; ask the project administrator to check Authentication for an account without a profile before retrying.`,
        );
      }
      throw firestoreFailure(e, "Creating your user profile");
    }
    return user;
  },
  async resetPassword(email: string) {
    await sendPasswordResetEmail(firebase().auth, email.trim());
  },
  async logout() {
    await signOut(firebase().auth);
  },
  async changePassword(current: string, next: string) {
    const user = firebase().auth.currentUser;
    if (!user?.email) throw new Error("Sign in again.");
    await reauthenticateWithCredential(
      user,
      EmailAuthProvider.credential(user.email, current),
    );
    await updatePassword(user, next);
  },
  async save(before: AppData, after: AppData) {
    const { db } = firebase();
    const operations: {
      key: keyof AppData;
      id: string;
      previous?: { id: string };
      next?: { id: string };
    }[] = [];
    for (const key of Object.keys(after) as (keyof AppData)[]) {
      const old = new Map(before[key].map((item) => [item.id, item]));
      const nextIds = new Set(after[key].map((item) => item.id));
      for (const item of after[key]) {
        const previous = old.get(item.id);
        if (JSON.stringify(previous) !== JSON.stringify(item))
          operations.push({ key, id: item.id, previous, next: item });
      }
      for (const item of before[key])
        if (!nextIds.has(item.id))
          operations.push({ key, id: item.id, previous: item });
    }
    if (operations.length > 450)
      throw new Error("Too many changes in one operation.");
    if (!operations.length) return;
    const deadline = Date.now() + 30000;
    try {
      if (operations.every((op) => !op.previous && op.next)) {
        // A new complaint and its notification need one atomic write, no reads
        // or transaction retries. Existing-record edits still check conflicts.
        await confirmWrite(async () => {
          const batch = writeBatch(db);
          for (const op of operations)
            batch.set(
              doc(db, op.key, op.id),
              JSON.parse(JSON.stringify(op.next)),
            );
          await batch.commit();
        });
        return;
      }
      await confirmWrite(() =>
        runTransaction(
          db,
          async (transaction) => {
            if (Date.now() >= deadline)
              throw new Error(
                "Save timed out before committing. Check your connection and try again.",
              );
            // Read existing records before writing (new IDs are generated locally).
            // Rules may deny reads of nonexistent documents or other users' notifications.
            // Reject stale edits rather
            // than replacing another device's assignment, profile or timeline.
            const snapshots = await Promise.all(
              operations.map((op) =>
                !op.previous
                  ? Promise.resolve(null)
                  : transaction.get(doc(db, op.key, op.id)),
              ),
            );
            operations.forEach((op, index) => {
              const snapshot = snapshots[index];
              if (!snapshot) return;
              if (
                op.previous
                  ? !snapshot.exists() ||
                    !sameRecord(snapshot.data(), op.previous)
                  : snapshot.exists()
              )
                throw new Error(
                  "This record changed on another device. Wait for the latest data and try again.",
                );
            });
            for (const op of operations) {
              if (Date.now() >= deadline)
                throw new Error(
                  "Save timed out before committing. Check your connection and try again.",
                );
              const target = doc(db, op.key, op.id);
              if (!op.next) transaction.delete(target);
              else transaction.set(target, JSON.parse(JSON.stringify(op.next)));
            }
          },
          { maxAttempts: 2 },
        ),
      );
    } catch (error) {
      throw firestoreFailure(error, "Saving application data");
    }
  },
  async uploadPhoto(uri: string, userId: string) {
    if (uri.startsWith("https://")) return uri;
    const target = ref(firebase().storage, `photos/${userId}/${uid()}.jpg`);
    if (uri.startsWith("data:")) await uploadString(target, uri, "data_url");
    else {
      const response = await fetch(uri);
      const blob = await response.blob();
      await uploadBytes(target, blob, { contentType: "image/jpeg" });
    }
    return getDownloadURL(target);
  },
};
