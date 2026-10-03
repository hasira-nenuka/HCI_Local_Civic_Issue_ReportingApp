import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { useApp } from "../hooks/AppContext";
import { theme } from "../constants/theme";
export default function AppNavigator() {
  const { user } = useApp();
  const [splash, setSplash] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  if (splash)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#dce3ed",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 95 }}>🏛️</Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#1c3552",
            textAlign: "center",
            lineHeight: 36,
          }}
        >
          Local Civic Issue{"\n"}Reporting System
        </Text>
        <Text style={{ fontSize: 12, color: theme.muted }}>
          Citizen & Administration Portal
        </Text>
        <Text style={{ color: theme.blue, fontSize: 23 }}>•••</Text>
      </View>
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
