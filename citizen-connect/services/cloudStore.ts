import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
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
    const snapshot = await getDoc(doc(firebase().db, "users", id));
    return snapshot.exists() ? (snapshot.data() as User) : null;
  },
  async load(user: User): Promise<AppData> {
    const entries = await Promise.all(
      Object.entries(sources(user)).map(async ([key, source]) => [
        key,
        (await getDocs(source)).docs.map((d) => d.data()),
      ]),
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
        error,
      ),
    );
    return () => stops.forEach((stop) => stop());
  },
  async login(email: string, password: string) {
    const result = await signInWithEmailAndPassword(
      firebase().auth,
      email,
      password,
    );
    const profile = await this.profile(result.user.uid);
    if (!profile?.active) {
      await signOut(firebase().auth);
      throw new Error(
        "Your account profile is missing or disabled. Contact the administrator.",
      );
    }
    return profile;
  },
  async register(
    name: string,
    email: string,
    phone: string,
    password: string,
  ): Promise<User> {
    const credential = await createUserWithEmailAndPassword(
      firebase().auth,
      email,
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
      await credential.user.delete();
      throw e;
    }
    return user;
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
    const batch = writeBatch(db);
    let count = 0;
    for (const key of Object.keys(after) as (keyof AppData)[]) {
      const old = new Map(before[key].map((item) => [item.id, item]));
      const nextIds = new Set(after[key].map((item) => item.id));
      for (const item of after[key]) {
        const previous = old.get(item.id);
        if (JSON.stringify(previous) !== JSON.stringify(item)) {
          const clean = JSON.parse(JSON.stringify(item));
          if (previous) {
            const changes: Record<string, unknown> = {};
            for (const [field, value] of Object.entries(clean))
              if (
                JSON.stringify(
                  (previous as unknown as Record<string, unknown>)[field],
                ) !== JSON.stringify(value)
              )
                changes[field] = value;
            batch.update(doc(db, key, item.id), changes);
          } else batch.set(doc(db, key, item.id), clean);
          count++;
        }
      }
      for (const item of before[key])
        if (!nextIds.has(item.id)) {
          batch.delete(doc(db, key, item.id));
          count++;
        }
    }
    if (count > 450) throw new Error("Too many changes in one operation.");
    if (count) await batch.commit();
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
