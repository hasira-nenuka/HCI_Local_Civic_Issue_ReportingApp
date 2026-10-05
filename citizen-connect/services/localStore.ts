import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppData, Role, User } from "../types/models";
import { makeSeed } from "./seed";
import { uid } from "../utils/complaints";
const KEY = "@citizen-connect/data-v1";
const SESSION = "@citizen-connect/session-v1";
export const localStore = {
  async load(): Promise<AppData> {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
    const data = makeSeed();
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
    return data;
  },
  async save(data: AppData) {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  },
  async session() {
    return AsyncStorage.getItem(SESSION);
  },
  async setSession(id: string | null) {
    if (id) await AsyncStorage.setItem(SESSION, id);
    else await AsyncStorage.removeItem(SESSION);
  },
  async demoUser(role: Role, data: AppData): Promise<User> {
    const user = data.users.find((u) => u.id === `${role}-demo`);
    if (!user?.active) throw new Error("This demo account is disabled.");
    await this.setSession(user.id);
    return user;
  },
  async register(
    name: string,
    email: string,
    phone: string,
    data: AppData,
  ): Promise<User> {
    if (data.users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
      throw new Error("An account with this email already exists.");
    return {
      id: uid(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone,
      role: "citizen",
      area: "Colombo 03",
      division: "Division 03",
      province: "Western Province",
      active: true,
    };
  },
};
