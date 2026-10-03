import React from "react";
import { Text, View } from "react-native";
import { Hint } from "./ui";
export default function LocationMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
  onChange?: (latitude: number, longitude: number) => void;
}) {
  return (
    <View
      style={{
        height: 180,
        backgroundColor: "#eaf2ff",
        borderRadius: 12,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 40 }}>📍</Text>
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
