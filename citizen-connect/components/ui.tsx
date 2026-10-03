import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../constants/theme";
import { Status } from "../types/models";
export function Screen({ children }: React.PropsWithChildren) {
  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
export function Title({ children }: React.PropsWithChildren) {
  return <Text style={s.title}>{children}</Text>;
}
export function Hint({ children }: React.PropsWithChildren) {
  return <Text style={s.hint}>{children}</Text>;
}
export function Card({
  children,
  onPress,
  style,
}: React.PropsWithChildren<{ onPress?: () => void; style?: object }>) {
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[s.card, style]}
    >
      {children}
    </Pressable>
  ) : (
    <View style={[s.card, style]}>{children}</View>
  );
}
export function Button({
  title,
  onPress,
  secondary,
  danger,
  disabled,
  busy,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy }}
      onPress={onPress}
      disabled={disabled || busy}
      style={[
        s.button,
        secondary && s.secondary,
        danger && s.danger,
        (disabled || busy) && { opacity: 0.5 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={secondary ? theme.blue : "white"} />
      ) : (
        <Text
          style={[
            s.buttonText,
            secondary && { color: theme.blue },
            danger && { color: theme.red },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.muted}
        {...props}
        style={[
          s.input,
          props.multiline && { height: 120, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function Search({
  value,
  onChangeText,
  placeholder = "Search...",
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={s.search}>
      <Ionicons name="search-outline" color={theme.muted} size={19} />
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        style={{ flex: 1, fontSize: 13, color: theme.ink, paddingVertical: 10 }}
      />
    </View>
  );
}
export function Radio({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={s.radio}
    >
      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        color={selected ? theme.blue : theme.muted}
        size={21}
      />
      <Text style={[s.text, selected && { fontWeight: "700" }]}>{label}</Text>
    </Pressable>
  );
}
export function Chips({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={s.chips}>
      {items.map((item) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: value === item }}
          key={item}
          onPress={() => onChange(item)}
          style={[
            s.chip,
            value === item && {
              backgroundColor: theme.blue,
              borderColor: theme.blue,
            },
          ]}
        >
          <Text
            style={{
              color: value === item ? "white" : theme.ink,
              fontSize: 11,
              fontWeight: "600",
            }}
          >
            {item}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export function Badge({ status }: { status: Status | "Active" | "Disabled" }) {
  const colors =
    status === "Resolved" || status === "Active"
      ? ["#e8f7f1", "#1a8a67"]
      : status === "Submitted"
        ? ["#fff4e5", "#aa6811"]
        : status === "Assigned"
          ? ["#f1ebff", "#8254cc"]
          : status === "Disabled"
            ? ["#feedef", theme.red]
            : ["#eaf2ff", theme.blue];
  return (
    <View
      style={{
        backgroundColor: colors[0],
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
      }}
    >
      <Text style={{ color: colors[1], fontSize: 10, fontWeight: "700" }}>
        {status}
      </Text>
    </View>
  );
}
export function Row({
  title,
  subtitle,
  onPress,
  icon,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: string;
}) {
  return (
    <Card onPress={onPress}>
      <View style={s.between}>
        <View style={s.inline}>
          {icon && <Text style={{ fontSize: 26 }}>{icon}</Text>}
          <View style={{ flexShrink: 1 }}>
            <Text style={s.bold}>{title}</Text>
            {subtitle && <Hint>{subtitle}</Hint>}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.muted} />
      </View>
    </Card>
  );
}
export function ErrorText({ message }: { message: string }) {
  return message ? (
    <Text
      accessibilityRole="alert"
      style={{ color: theme.red, marginBottom: 12, lineHeight: 20 }}
    >
      {message}
    </Text>
  ) : null;
}
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 20, paddingBottom: 32, flexGrow: 1 },
  title: { fontSize: 23, fontWeight: "700", color: theme.ink, marginBottom: 6 },
  hint: {
    fontSize: 12,
    color: theme.muted,
    lineHeight: 19,
    marginTop: 3,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    backgroundColor: "white",
    padding: 17,
    marginBottom: 12,
  },
  button: {
    backgroundColor: theme.blue,
    minHeight: 46,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginVertical: 7,
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 13 },
  secondary: { backgroundColor: "#eaf2ff" },
  danger: { backgroundColor: "#fceef0" },
  label: { fontSize: 12, fontWeight: "600", color: theme.ink, marginBottom: 8 },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 13,
    color: theme.ink,
    minHeight: 46,
  },
  search: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  radio: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 14,
    marginBottom: 9,
    minHeight: 48,
  },
  text: { fontSize: 13, color: theme.ink, flexShrink: 1 },
  bold: { fontSize: 14, fontWeight: "700", color: theme.ink },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 18 },
  chip: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: "white",
  },
  section: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.ink,
    marginTop: 18,
    marginBottom: 13,
  },
});
