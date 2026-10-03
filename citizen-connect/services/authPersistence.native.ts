import * as FirebaseAuth from "firebase/auth";
import type { Persistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Firebase supplies this export at runtime in its React Native entry, but its
// public browser-first declarations omit it. Keep that compatibility cast here.
const nativeAuth = FirebaseAuth as typeof FirebaseAuth & {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};
export const authPersistence =
  nativeAuth.getReactNativePersistence(AsyncStorage);
