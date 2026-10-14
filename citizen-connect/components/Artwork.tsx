import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Image,
  Platform,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../constants/theme";
import type { Category } from "../types/models";

const community = require("../assets/illustrations/community.png");
const submitted = require("../assets/illustrations/submitted.png");
const operations = require("../assets/illustrations/admin-operations.png");
const team = require("../assets/illustrations/admin-team.png");
const illustrationSources = {
  community,
  submitted,
  operations,
  team,
  water: require("../assets/illustrations/services/water.png"),
  road: require("../assets/illustrations/services/road.png"),
  garbage: require("../assets/illustrations/services/garbage.png"),
  light: require("../assets/illustrations/services/light.png"),
  environment: require("../assets/illustrations/services/environment.png"),
  other: require("../assets/illustrations/services/other.png"),
};
const portraits: Record<string, ReturnType<typeof require>> = {
  "portrait-woman-1": require("../assets/illustrations/portraits/portrait-woman-1.png"),
  "portrait-woman-2": require("../assets/illustrations/portraits/portrait-woman-2.png"),
  "portrait-man-1": require("../assets/illustrations/portraits/portrait-man-1.png"),
  "portrait-man-2": require("../assets/illustrations/portraits/portrait-man-2.png"),
};
export const portraitSource = (key?: string) =>
  key && Object.hasOwn(portraits, key) ? portraits[key] : undefined;
export function CategoryArtwork({
  category,
  size = 56,
  animated = false,
}: {
  category: Pick<Category, "id" | "name" | "icon"> &
    Partial<Pick<Category, "artwork">>;
  size?: number;
  animated?: boolean;
}) {
  const keys = [
    "water",
    "road",
    "garbage",
    "light",
    "environment",
    "other",
  ] as const;
  let key: (typeof keys)[number] =
    keys.find(
      (k) => k === category.artwork || k === category.icon || k === category.id,
    ) || "other";
  if (key === "other") {
    const name = category.name.toLowerCase();
    if (/water/.test(name)) key = "water";
    else if (/road/.test(name)) key = "road";
    else if (/garbage|clean|waste/.test(name)) key = "garbage";
    else if (/light/.test(name)) key = "light";
    else if (/park|environment/.test(name)) key = "environment";
  }
  return (
    <CommunityArtwork
      size={size}
      animated={animated}
      variant={key}
      decorative
    />
  );
}
type IconName = React.ComponentProps<typeof Ionicons>["name"];
const symbols: Record<string, IconName> = {
  notifications: "notifications",
  water: "water",
  road: "construct",
  garbage: "trash",
  light: "bulb",
  environment: "leaf",
  other: "grid",
  "💧": "water",
  "🚧": "construct",
  "🗑️": "trash",
  "💡": "bulb",
  "🌳": "leaf",
  "📋": "document-text",
  "🔔": "notifications",
  "👤": "person",
  "👥": "people",
  "👮": "shield-checkmark",
  "🗂️": "layers",
  "🔎": "search",
  "💬": "chatbubbles",
  "🏛️": "business",
  "➕": "add",
  "📌": "location",
  "📁": "folder",
  "🟢": "add-circle",
  "📊": "stats-chart",
  "✅": "checkmark-circle",
  "📷": "camera",
  "🎉": "checkmark-circle",
};
export function VisualIcon({
  symbol,
  size = 26,
  tile = true,
}: {
  symbol: string;
  size?: number;
  tile?: boolean;
}) {
  const name = symbols[symbol] || "grid-outline";
  const color =
    name === "leaf" || name === "checkmark-circle" || name === "trash"
      ? theme.green
      : name === "bulb" || name === "construct"
        ? "#bb7417"
        : theme.blue;
  return (
    <View
      accessible={false}
      style={{
        width: size + (tile ? 22 : 0),
        height: size + (tile ? 22 : 0),
        borderRadius: 18,
        backgroundColor: tile
          ? color === theme.green
            ? "#e8f7f1"
            : color === theme.blue
              ? "#eaf2ff"
              : "#fff3df"
          : undefined,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}
export function CommunityArtwork({
  size = 220,
  animated = false,
  variant = "community",
  decorative = false,
}: {
  size?: number;
  animated?: boolean;
  variant?: keyof typeof illustrationSources;
  decorative?: boolean;
}) {
  const [offset] = useState(() => new Animated.Value(0));
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) setReduced(value);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    if (!animated || reduced) {
      offset.setValue(0);
      return;
    }
    const motion = Animated.loop(
      Animated.sequence([
        Animated.timing(offset, {
          toValue: -8,
          duration: 1900,
          useNativeDriver: Platform.OS !== "web",
          isInteraction: false,
        }),
        Animated.timing(offset, {
          toValue: 0,
          duration: 1900,
          useNativeDriver: Platform.OS !== "web",
          isInteraction: false,
        }),
      ]),
    );
    motion.start();
    return () => {
      motion.stop();
    };
  }, [animated, reduced, offset]);
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        maxWidth: "100%",
        borderRadius: 32,
        overflow: "hidden",
        transform: [{ translateY: offset }],
      }}
    >
      <Image
        source={illustrationSources[variant]}
        accessible={!decorative}
        accessibilityLabel={
          decorative
            ? undefined
            : variant === "operations"
              ? "Civic services dashboard illustration"
              : variant === "team"
                ? "Community service team illustration"
                : variant === "submitted"
                  ? "A report confirmed with a blue checkmark"
                  : "Citizens connecting with their local community"
        }
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </Animated.View>
  );
}
