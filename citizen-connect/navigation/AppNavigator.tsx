import React, { useState } from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useApp } from "../hooks/AppContext";
import { theme } from "../constants/theme";
export default function AppNavigator() {
  const { user } = useApp();
  const [splash, setSplash] = useState(true);
  if (splash)
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open Citizen Connect"
        onPress={() => setSplash(false)}
        style={{
          flex: 1,
          backgroundColor: theme.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="business-outline" size={110} color={theme.blue} />
      </Pressable>
    );
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.bg },
        contentStyle: { backgroundColor: theme.bg },
        headerTitleStyle: { color: theme.ink, fontSize: 16, fontWeight: "700" },
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerTintColor: theme.ink,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Protected guard={!user}>
        <Stack.Screen name="Login" options={{ headerShown: false }} />
        <Stack.Screen name="Register" options={{ title: "Create Account" }} />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="Main" options={{ headerShown: false }} />
        <Stack.Screen name="Category" options={{ title: "Report Issue" }} />
        <Stack.Screen
          name="CategoryInfo"
          options={{ title: "Category Information" }}
        />
        <Stack.Screen name="ReportWizard" options={{ title: "Report Issue" }} />
        <Stack.Screen
          name="Confirmation"
          options={{ title: "Confirmation", headerBackVisible: false }}
        />
        <Stack.Screen
          name="Details"
          options={{
            title:
              user?.role === "citizen" ? "Report Details" : "Complaint Details",
          }}
        />
        <Stack.Screen name="Track" options={{ title: "Track Complaint" }} />
        <Stack.Screen name="EditReport" options={{ title: "Edit Report" }} />
        <Stack.Screen name="Notifications" />
        <Stack.Screen
          name="NotificationDetail"
          options={{ title: "Notification Details" }}
        />
        <Stack.Screen name="EditProfile" options={{ title: "Edit Profile" }} />
        <Stack.Screen name="Password" options={{ title: "Change Password" }} />
        <Stack.Screen name="Support" options={{ title: "Help & Support" }} />
        <Stack.Screen name="About" options={{ title: "About App" }} />
        <Stack.Screen name="Contacts" options={{ title: "Contact Finder" }} />
        <Stack.Screen name="OfficerProfile" options={{ title: "Profile" }} />
      </Stack.Protected>
      <Stack.Protected
        guard={user?.role === "officer" || user?.role === "admin"}
      >
        <Stack.Screen name="Assign" options={{ title: "Assign" }} />
      </Stack.Protected>
      <Stack.Protected guard={user?.role === "admin"}>
        <Stack.Screen
          name="Categories"
          options={{ title: "Service Categories" }}
        />
        <Stack.Screen
          name="CategoryEdit"
          options={{ title: "Edit Category" }}
        />
        <Stack.Screen name="Users" options={{ title: "User Management" }} />
        <Stack.Screen name="UserEdit" options={{ title: "Edit User" }} />
        <Stack.Screen name="ContactEdit" options={{ title: "Edit Contact" }} />
      </Stack.Protected>
    </Stack>
  );
}
