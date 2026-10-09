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

const community = require("../assets/illustrations/community.png");
const submitted = require("../assets/illustrations/submitted.png");
type IconName = React.ComponentProps<typeof Ionicons>["name"];
const symbols: Record<string, IconName> = {
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
}: {
  size?: number;
  animated?: boolean;
  variant?: "community" | "submitted";
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
        source={variant === "submitted" ? submitted : community}
        accessibilityLabel={
          variant === "submitted"
            ? "A report confirmed with a blue checkmark"
            : "Citizens connecting with their local community"
        }
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </Animated.View>
  );
}
