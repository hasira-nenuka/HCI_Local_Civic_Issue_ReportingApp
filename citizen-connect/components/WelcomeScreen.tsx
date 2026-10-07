import React from "react";
import { ScrollView, Text, View } from "react-native";
import { CommunityArtwork } from "./Artwork";
import { Button } from "./ui";
import { theme } from "../constants/theme";
export default function WelcomeScreen({
  onContinue,
}: {
  onContinue: () => void;
}) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 28,
        gap: 24,
      }}
    >
      <Text
        style={{
          color: theme.blue,
          fontSize: 12,
          letterSpacing: 2,
          fontWeight: "700",
        }}
      >
        YOUR COMMUNITY. CONNECTED.
      </Text>
      <CommunityArtwork size={290} animated />
      <View style={{ alignItems: "center", gap: 12 }}>
        <Text
          style={{
            color: theme.ink,
            fontSize: 34,
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          Citizen Connect
        </Text>
        <Text
          style={{
            color: theme.muted,
            fontSize: 15,
            lineHeight: 24,
            textAlign: "center",
          }}
        >
          Small actions. Better neighborhoods.{"\n"}Report issues and follow the
          progress.
        </Text>
      </View>
      <View style={{ width: "100%", maxWidth: 340 }}>
        <Button title="Get Started" onPress={onContinue} />
      </View>
      <Text style={{ color: theme.muted, fontSize: 12 }}>
        For citizens, officers and administrators
      </Text>
    </ScrollView>
  );
}
