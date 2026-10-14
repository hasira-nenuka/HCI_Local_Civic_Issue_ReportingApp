import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppTheme, darkTheme, lightTheme } from "../constants/theme";

export type AppearanceMode = "light" | "dark";
const KEY = "@citizen-connect/appearance-v1";
const Context = createContext<{
  mode: AppearanceMode;
  theme: AppTheme;
  setMode: (mode: AppearanceMode) => Promise<void>;
} | null>(null);
export function AppearanceProvider({ children }: React.PropsWithChildren) {
  const [mode, setModeState] = useState<AppearanceMode>("light");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    void AsyncStorage.getItem(KEY)
      .then((saved) => {
        if (mounted && (saved === "light" || saved === "dark"))
          setModeState(saved);
      })
      .catch(() => {
        /* A missing/unreadable preference uses the normal light theme. */
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);
  const theme = mode === "dark" ? darkTheme : lightTheme;
  async function setMode(next: AppearanceMode) {
    await AsyncStorage.setItem(KEY, next);
    setModeState(next);
  }
  return (
    <Context.Provider value={{ mode, theme, setMode }}>
      {ready ? (
        children
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.bg,
          }}
        >
          <ActivityIndicator color={theme.blue} />
        </View>
      )}
    </Context.Provider>
  );
}
export function useAppearance() {
  const context = useContext(Context);
  if (!context) throw new Error("AppearanceProvider is missing");
  return context;
}
export const useTheme = () => useAppearance().theme;
