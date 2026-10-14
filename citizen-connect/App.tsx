import React from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "./hooks/AppContext";
import AppNavigator from "./navigation/AppNavigator";
import { AppearanceProvider, useAppearance } from "./hooks/AppearanceContext";
export default function App() {
  return (
    <SafeAreaProvider>
      <AppearanceProvider>
        <ThemedApp />
      </AppearanceProvider>
    </SafeAreaProvider>
  );
}
function ThemedApp() {
  const { theme } = useAppearance();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View
        style={{ flex: 1, width: "100%", maxWidth: 520, alignSelf: "center" }}
      >
        <AppProvider>
          <AppNavigator />
          <StatusBar style={theme.dark ? "light" : "dark"} />
        </AppProvider>
      </View>
    </View>
  );
}
