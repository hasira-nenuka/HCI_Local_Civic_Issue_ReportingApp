import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppearanceMode, useAppearance } from "../hooks/AppearanceContext";
import { useApp } from "../hooks/AppContext";

export default function DashboardOptions() {
  const app = useApp();
  const { theme, mode, setMode } = useAppearance();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open || Platform.OS !== "web") return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        event.preventDefault();
        setOpen(false);
        setConfirm(false);
        setError("");
      }
    };
    window.addEventListener("keydown", dismiss, true);
    return () => window.removeEventListener("keydown", dismiss, true);
  }, [open, busy]);
  const close = () => {
    if (!busy) {
      setOpen(false);
      setConfirm(false);
      setError("");
    }
  };
  const link = (
    path: "/OfficerProfile" | "/Main/Profile" | "/Notifications" | "/Support",
  ) => {
    close();
    router.push(path);
  };
  async function appearance(next: AppearanceMode) {
    setBusy(true);
    setError("");
    try {
      await setMode(next);
    } catch {
      setError("Could not save your appearance preference. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setError("");
    try {
      await app.logout();
      setOpen(false);
    } catch {
      setError("Could not log out. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }
  const rowStyle = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
  };
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dashboard options"
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
        aria-haspopup="menu"
        onPress={() => {
          setError("");
          setConfirm(false);
          setOpen(true);
        }}
        style={({ pressed }) => ({
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 6,
          backgroundColor: pressed ? theme.softBlue : undefined,
          borderRadius: 22,
        })}
      >
        <Ionicons name="ellipsis-vertical" size={23} color={theme.ink} />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss dashboard options"
            disabled={busy}
            onPress={close}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          />
          <View
            style={{
              width: "100%",
              maxWidth: 520,
              alignSelf: "center",
              paddingHorizontal: 16,
              paddingTop: insets.top + 54,
              paddingBottom: insets.bottom + 16,
              flexShrink: 1,
            }}
            pointerEvents="box-none"
          >
            <ScrollView
              accessibilityViewIsModal
              style={{
                alignSelf: "flex-end",
                width: 300,
                maxWidth: "100%",
                backgroundColor: theme.surface,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: theme.border,
              }}
              contentContainerStyle={{ padding: 12 }}
            >
              <View
                style={{
                  ...rowStyle,
                  justifyContent: "space-between",
                  paddingHorizontal: 10,
                }}
              >
                <Text
                  style={{ fontWeight: "800", fontSize: 17, color: theme.ink }}
                >
                  Dashboard options
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close options"
                  disabled={busy}
                  onPress={close}
                  style={{ padding: 10 }}
                >
                  <Ionicons name="close" size={22} color={theme.muted} />
                </Pressable>
              </View>
              <Text
                style={{
                  color: theme.muted,
                  fontSize: 12,
                  paddingHorizontal: 12,
                  paddingBottom: 16,
                }}
                numberOfLines={1}
              >
                {app.user?.name}
              </Text>
              <Text
                style={{
                  color: theme.muted,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 1,
                  paddingHorizontal: 14,
                  marginBottom: 8,
                }}
              >
                APPEARANCE
              </Text>
              <View
                accessibilityRole="radiogroup"
                accessibilityLabel="Appearance"
              >
                {(
                  [
                    {
                      value: "light",
                      label: "Light mode",
                      icon: "sunny-outline",
                    },
                    { value: "dark", label: "Dark mode", icon: "moon-outline" },
                  ] as const
                ).map((item) => (
                  <Pressable
                    key={item.value}
                    accessibilityRole="radio"
                    accessibilityLabel={item.label}
                    accessibilityState={{
                      checked: mode === item.value,
                      disabled: busy,
                    }}
                    aria-checked={mode === item.value}
                    disabled={busy}
                    onPress={() => void appearance(item.value)}
                    style={({ pressed }) => ({
                      ...rowStyle,
                      backgroundColor:
                        mode === item.value || pressed
                          ? theme.softBlue
                          : undefined,
                    })}
                  >
                    <Ionicons name={item.icon} size={21} color={theme.blue} />
                    <Text style={{ color: theme.ink, fontSize: 14, flex: 1 }}>
                      {item.label}
                    </Text>
                    {mode === item.value && (
                      <Ionicons name="checkmark" size={19} color={theme.blue} />
                    )}
                  </Pressable>
                ))}
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: theme.border,
                  marginVertical: 12,
                }}
              />
              {(
                [
                  {
                    label: "My Profile",
                    icon: "person-circle-outline",
                    path:
                      app.user?.role === "citizen"
                        ? "/Main/Profile"
                        : "/OfficerProfile",
                  },
                  {
                    label: "Notifications",
                    icon: "notifications-outline",
                    path: "/Notifications",
                  },
                  {
                    label: "Help & Support",
                    icon: "help-circle-outline",
                    path: "/Support",
                  },
                ] as const
              ).map((item) => (
                <Pressable
                  key={item.path}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  disabled={busy}
                  onPress={() => link(item.path)}
                  style={({ pressed }) => ({
                    ...rowStyle,
                    backgroundColor: pressed ? theme.softBlue : undefined,
                  })}
                >
                  <Ionicons name={item.icon} size={22} color={theme.muted} />
                  <Text style={{ fontSize: 14, color: theme.ink }}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
              <View
                style={{
                  height: 1,
                  backgroundColor: theme.border,
                  marginVertical: 12,
                }}
              />
              {confirm ? (
                <View
                  style={{
                    padding: 12,
                    backgroundColor: theme.softRed,
                    borderRadius: 14,
                    gap: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: theme.ink,
                    }}
                  >
                    Log out of Citizen Connect?
                  </Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <Pressable
                      accessibilityRole="button"
                      disabled={busy}
                      onPress={() => setConfirm(false)}
                      style={{ padding: 12, flex: 1, alignItems: "center" }}
                    >
                      <Text style={{ color: theme.ink, fontWeight: "700" }}>
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Confirm log out"
                      disabled={busy}
                      onPress={() => void logout()}
                      style={{
                        padding: 12,
                        flex: 1,
                        alignItems: "center",
                        backgroundColor: "#b73550",
                        borderRadius: 12,
                      }}
                    >
                      {busy ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={{ color: "white", fontWeight: "700" }}>
                          Log Out
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Log Out"
                  onPress={() => setConfirm(true)}
                  disabled={busy}
                  style={rowStyle}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={22}
                    color={theme.red}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: theme.red,
                    }}
                  >
                    Log Out
                  </Text>
                </Pressable>
              )}
              {!!error && (
                <Text
                  accessibilityRole="alert"
                  style={{
                    color: theme.red,
                    fontSize: 12,
                    lineHeight: 18,
                    padding: 12,
                  }}
                >
                  {error}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
