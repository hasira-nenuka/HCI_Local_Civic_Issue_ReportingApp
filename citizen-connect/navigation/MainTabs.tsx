import React from "react";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../hooks/AppContext";
import { theme } from "../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const icons = {
  Home: "home-outline",
  "My Reports": "document-text-outline",
  Profile: "person-outline",
  Complaints: "document-text-outline",
  Progress: "bar-chart-outline",
  Settings: "settings-outline",
} as const;
export default function MainTabs() {
  const { user } = useApp();
  const insets = useSafeAreaInsets();
  const citizen = user?.role === "citizen";
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: theme.bg },
        headerTitleStyle: { color: theme.ink, fontSize: 16, fontWeight: "700" },
        headerShadowVisible: false,
        headerTitleAlign: "center",
        headerRight: () => (
          <Ionicons
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            name="notifications-outline"
            size={22}
            color={theme.ink}
            onPress={() => router.push("/Notifications")}
            style={{ marginRight: 18, padding: 5 }}
          />
        ),
        tabBarActiveTintColor: theme.blue,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: theme.border,
          height: 64 + insets.bottom,
          paddingTop: 5,
          paddingBottom: Math.max(8, insets.bottom),
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            color={color}
            size={size}
            name={icons[route.name as keyof typeof icons] || "home-outline"}
          />
        ),
      })}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: citizen
            ? "Citizen Connect"
            : user?.role === "gn"
              ? "GN Dashboard"
              : user?.role === "admin"
                ? "Admin Dashboard"
                : "Officer Dashboard",
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Protected guard={citizen}>
        <Tabs.Screen name="My Reports" />
        <Tabs.Screen name="Profile" />
      </Tabs.Protected>
      <Tabs.Protected guard={!citizen}>
        <Tabs.Screen name="Complaints" />
        <Tabs.Screen name="Progress" />
        <Tabs.Screen name="Settings" />
      </Tabs.Protected>
    </Tabs>
  );
}
