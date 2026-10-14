import React from "react";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { unreadCount } from "../utils/notifications";
import DashboardOptions from "../components/DashboardOptions";
import { useApp } from "../hooks/AppContext";
import { useTheme } from "../hooks/AppearanceContext";
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
  const theme = useTheme();
  const { user, data } = useApp();
  const unread = user ? unreadCount(data.notifications, user.id) : 0;
  const insets = useSafeAreaInsets();
  const citizen = user?.role === "citizen";
  const hasDashboardOptions = !!user;
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: theme.bg },
        headerTitleStyle: { color: theme.ink, fontSize: 16, fontWeight: "700" },
        headerShadowVisible: false,
        headerTitleAlign: "center",
        headerRight: () => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                unread ? `Notifications, ${unread} unread` : "Notifications"
              }
              onPress={() => router.push("/Notifications")}
              style={{
                width: 44,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
                marginRight:
                  hasDashboardOptions && route.name === "Home" ? 0 : 10,
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={theme.ink}
              />
              {unread > 0 && (
                <View
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    backgroundColor: theme.primary,
                    borderRadius: 10,
                    minWidth: 19,
                    paddingHorizontal: 4,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "800",
                      lineHeight: 19,
                    }}
                  >
                    {unread > 99 ? "99+" : unread}
                  </Text>
                </View>
              )}
            </Pressable>
            {hasDashboardOptions && route.name === "Home" && (
              <DashboardOptions />
            )}
          </View>
        ),
        tabBarActiveTintColor: theme.blue,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.surface,
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
