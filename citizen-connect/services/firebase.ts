import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { authPersistence } from "./authPersistence";
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
// Demo must be explicitly selected; missing config must never bypass login.
export const firebaseEnabled = process.env.EXPO_PUBLIC_BACKEND !== "demo";
export const firebaseConfigured = Object.values(config).every(
  (value) => !!value && !value.includes("replace-me"),
);
export function firebase() {
  if (!firebaseEnabled || !firebaseConfigured)
    throw new Error(
      "Complete all Firebase settings in .env and restart Expo. See docs/firebase-setup.md.",
    );
  const app = getApps().length ? getApp() : initializeApp(config);
  let auth: Auth;
  try {
    auth = initializeAuth(app, { persistence: authPersistence });
  } catch {
    auth = getAuth(app);
  }
  return { auth, db: getFirestore(app), storage: getStorage(app) };
}
