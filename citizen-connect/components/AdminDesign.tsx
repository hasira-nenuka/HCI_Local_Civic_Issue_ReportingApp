import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommunityArtwork, portraitSource } from "./Artwork";
import { AppTheme } from "../constants/theme";
import { useTheme } from "../hooks/AppearanceContext";

type Icon = React.ComponentProps<typeof Ionicons>["name"];
export const adminColors = {
  blue: { background: "#e7f0ff", ink: "#1658b7" },
  mint: { background: "#def5ed", ink: "#146c54" },
  amber: { background: "#fff0d7", ink: "#925a13" },
  violet: { background: "#eee7ff", ink: "#6544ab" },
};
export type AdminTone = keyof typeof adminColors;

export function AdminHero({
  title,
  subtitle,
  eyebrow = "CITIZEN CONNECT",
  art = "operations",
  dark = false,
}: {
  title: string;
  subtitle: string;
  eyebrow?: string;
  art?: "operations" | "team";
  dark?: boolean;
}) {
  const theme = useTheme();
  const a = useAdminStyles();
  return (
    <View
      style={[
        a.hero,
        {
          backgroundColor: dark
            ? theme.primary
            : art === "team"
              ? "#eeeaff"
              : "#e7f0ff",
        },
      ]}
    >
      <View style={{ flex: 1, gap: 9 }}>
        <Text
          style={{
            color: dark ? "#e4eeff" : "#56688c",
            fontSize: 10,
            letterSpacing: 1.4,
            fontWeight: "700",
          }}
        >
          {eyebrow}
        </Text>
        <Text
          style={{
            color: dark ? "white" : "#202b39",
            fontSize: 24,
            lineHeight: 29,
            fontWeight: "800",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: dark ? "#edf4ff" : "#51617a",
            fontSize: 12,
            lineHeight: 19,
          }}
        >
          {subtitle}
        </Text>
      </View>
      <CommunityArtwork variant={art} size={100} animated />
    </View>
  );
}
export function AdminSection({
  title,
  caption,
  action,
  onPress,
}: {
  title: string;
  caption?: string;
  action?: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const a = useAdminStyles();
  return (
    <View style={[a.between, { marginTop: 24, marginBottom: 14 }]}>
      <View style={{ flex: 1 }}>
        <Text style={a.section}>{title}</Text>
        {caption && <Text style={a.caption}>{caption}</Text>}
      </View>
      {action && onPress && (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => ({
            minHeight: 44,
            justifyContent: "center",
            paddingHorizontal: 8,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ color: theme.blue, fontWeight: "700", fontSize: 12 }}>
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
export function AdminStat({
  label,
  count,
  icon,
  tone,
}: {
  label: string;
  count: number;
  icon: Icon;
  tone: AdminTone;
}) {
  const a = useAdminStyles();
  const color = adminColors[tone];
  return (
    <View style={[a.stat, { backgroundColor: color.background }]}>
      <View style={a.between}>
        <View
          style={{ backgroundColor: "#ffffffbb", borderRadius: 13, padding: 8 }}
        >
          <Ionicons name={icon} size={21} color={color.ink} />
        </View>
        <Text style={{ color: color.ink, fontSize: 30, fontWeight: "800" }}>
          {count}
        </Text>
      </View>
      <Text
        style={{
          color: color.ink,
          fontSize: 12,
          fontWeight: "600",
          marginTop: 14,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
export function AdminLink({
  title,
  subtitle,
  icon,
  tone = "blue",
  onPress,
  leading,
}: {
  title: string;
  subtitle: string;
  icon: Icon;
  tone?: AdminTone;
  onPress: () => void;
  leading?: React.ReactNode;
}) {
  const theme = useTheme();
  const a = useAdminStyles();
  const color = adminColors[tone];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        a.link,
        {
          backgroundColor: pressed ? theme.softBlue : theme.surface,
          borderLeftColor: color.ink,
        },
      ]}
    >
      {leading || (
        <View
          style={{
            padding: 12,
            backgroundColor: color.background,
            borderRadius: 17,
          }}
        >
          <Ionicons name={icon} size={24} color={color.ink} />
        </View>
      )}
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={{ color: theme.ink, fontSize: 14, fontWeight: "700" }}>
          {title}
        </Text>
        <Text style={a.caption}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.muted} />
    </Pressable>
  );
}
export function StaffAvatar({
  name,
  imageUrl,
  role,
  avatarKey,
  size = 46,
}: {
  name: string;
  imageUrl?: string;
  role: string;
  avatarKey?: string;
  size?: number;
}) {
  const color =
    adminColors[
      role === "admin"
        ? "violet"
        : role === "officer"
          ? "blue"
          : role === "gn"
            ? "mint"
            : "amber"
    ];
  const samplePortrait = portraitSource(avatarKey);
  if (imageUrl || samplePortrait)
    return (
      <Image
        source={imageUrl ? { uri: imageUrl } : samplePortrait}
        accessibilityLabel={`${name}'s profile`}
        style={{ width: size, height: size, borderRadius: size / 3 }}
      />
    );
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        backgroundColor: color.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: color.ink, fontWeight: "800", fontSize: 17 }}>
        {name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase() || "?"}
      </Text>
    </View>
  );
}
const createAdminStyles = (theme: AppTheme) =>
  StyleSheet.create({
    hero: {
      padding: 20,
      borderRadius: 26,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 20,
    },
    between: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    section: { fontSize: 17, fontWeight: "800", color: theme.ink },
    caption: { color: theme.muted, fontSize: 12, lineHeight: 18 },
    stat: { flexBasis: "47%", flexGrow: 1, padding: 16, borderRadius: 22 },
    link: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      borderLeftWidth: 4,
      padding: 15,
      marginBottom: 12,
    },
  });

export function useAdminStyles() {
  const theme = useTheme();
  return React.useMemo(() => createAdminStyles(theme), [theme]);
}
