import React from "react";
import { View } from "react-native";
import { VisualIcon } from "./Artwork";
import { Hint } from "./ui";
import { useTheme } from "../hooks/AppearanceContext";
export default function LocationMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
  onChange?: (latitude: number, longitude: number) => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        height: 180,
        backgroundColor: theme.softBlue,
        borderRadius: 12,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <VisualIcon symbol="📌" size={40} />
      <Hint>
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </Hint>
      <Hint>
        The interactive map is available in the mobile app. On web, use GPS or
        enter coordinates below.
      </Hint>
    </View>
  );
}
