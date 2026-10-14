import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/AppearanceContext";
import { CommunityArtwork } from "./Artwork";
export function CitizenHero({
  title,
  subtitle,
  eyebrow = "YOUR COMMUNITY",
  art = true,
}: {
  title: string;
  subtitle: string;
  eyebrow?: string;
  art?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.softBlue,
        borderRadius: 26,
        padding: 22,
        marginBottom: 20,
        overflow: "hidden",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: t.blue,
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 1.6,
              marginBottom: 10,
            }}
          >
            {eyebrow}
          </Text>
          <Text
            style={{
              color: t.ink,
              fontSize: 25,
              fontWeight: "800",
              lineHeight: 31,
              marginBottom: 9,
            }}
          >
            {title}
          </Text>
          <Text style={{ color: t.muted, fontSize: 13, lineHeight: 21 }}>
            {subtitle}
          </Text>
        </View>
        {art && <CommunityArtwork size={94} />}
      </View>
    </View>
  );
}
export function CitizenMetrics({
  items,
}: {
  items: { label: string; value: number; tone: "blue" | "mint" | "amber" }[];
}) {
  const t = useTheme();
  const palette = {
    blue: [t.softBlue, t.blue],
    mint: [t.dark ? "#183f39" : "#e6f6ef", t.dark ? "#83e1bc" : "#197653"],
    amber: [t.dark ? "#413521" : "#fff3de", t.dark ? "#ffd58b" : "#895411"],
  };
  return (
    <View style={{ flexDirection: "row", gap: 9, marginBottom: 20 }}>
      {items.map((i) => (
        <View
          key={i.label}
          style={{
            flex: 1,
            backgroundColor: palette[i.tone][0],
            borderRadius: 18,
            padding: 13,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: palette[i.tone][1],
            }}
          >
            {i.value}
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: t.ink,
              marginTop: 5,
            }}
          >
            {i.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
export function CitizenSection({
  title,
  caption,
}: {
  title: string;
  caption?: string;
}) {
  const t = useTheme();
  return (
    <View style={{ marginTop: 8, marginBottom: 15 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="ellipse" size={8} color={t.green} />
        <Text style={{ color: t.ink, fontSize: 17, fontWeight: "800" }}>
          {title}
        </Text>
      </View>
      {caption && (
        <Text
          style={{ color: t.muted, fontSize: 12, lineHeight: 19, marginTop: 5 }}
        >
          {caption}
        </Text>
      )}
    </View>
  );
}
