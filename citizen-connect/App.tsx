import React from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "./hooks/AppContext";
import AppNavigator from "./navigation/AppNavigator";
export default function App() {
  return (
    <SafeAreaProvider>
      <View
        style={{ flex: 1, width: "100%", maxWidth: 520, alignSelf: "center" }}
      >
        <AppProvider>
          <AppNavigator />
          <StatusBar style="dark" />
        </AppProvider>
      </View>
    </SafeAreaProvider>
  );
}
