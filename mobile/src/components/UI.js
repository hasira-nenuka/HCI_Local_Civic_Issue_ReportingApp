import React from 'react';
import { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '../theme/colors';
import font from '../theme/typography';
import radius from '../theme/radius';
import { useApp } from '../context/AppContext';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 28 },
  text: { fontFamily: font.regular, color: colors.text, fontSize: 14 }, title: { fontFamily: font.bold, fontSize: 20, color: colors.text },
  subtitle: { fontFamily: font.regular, fontSize: 11, lineHeight: 18, color: colors.muted }, label: { fontFamily: font.bold, color: colors.text, fontSize: 13, marginBottom: 8 },
  card: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: radius.card, padding: 18, marginBottom: 12 },
  input: { minHeight: 48, padding: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, borderRadius: radius.button, color: colors.text, fontFamily: font.regular, fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center' }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gap: { height: 24 }, link: { fontFamily: font.medium, color: colors.primary, textAlign: 'center', fontSize: 13 },
  error: { color: colors.red, fontFamily: font.regular, fontSize: 12, lineHeight: 18, marginVertical: 8 }
});
export function Icon({ name, size = 22, color = colors.primary }) { return <Ionicons name={name} size={size} color={color} />; }
export function IconButton({ name, onPress, label, badge = 0 }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 34, height: 34, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}><Icon name={name} size={21} color={colors.text} />{badge > 0 && <View style={{ position: 'absolute', top: -4, right: -3, backgroundColor: colors.primary, borderRadius: 8, minWidth: 16, paddingHorizontal: 3 }}><Text style={{ color: colors.white, fontSize: 9, textAlign: 'center' }}>{badge}</Text></View>}</View></Pressable>;
}
export function Screen({ title, children, bell = false, back = true, menu = false, scroll = true }) {
  const navigation = useNavigation(); const insets = useSafeAreaInsets(); const app = useApp();
  const content = <View style={styles.content}>{app.storageError ? <Text style={styles.error}>{app.storageError}</Text> : null}{children}</View>;
  return <KeyboardAvoidingView style={[styles.screen, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={[styles.between, { paddingHorizontal: 12, minHeight: 58, width: '100%', maxWidth: 576, alignSelf: 'center' }]}>
      {menu ? <IconButton name="menu-outline" label="Open menu" onPress={() => navigation.openDrawer()} /> : back ? <IconButton name="chevron-back" label="Go back" onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')} /> : <View style={{ width: 44 }} />}
      <Text style={[styles.title, { fontSize: 17, flex: 1, textAlign: 'center' }]}>{title}</Text>
      {bell ? <IconButton name="notifications-outline" label="Notifications" badge={app.notifications.filter(n => !n.read).length} onPress={() => navigation.navigate('Notifications')} /> : <View style={{ width: 44 }} />}
    </View>
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>{content}</ScrollView> : content}
  </KeyboardAvoidingView>;
}
export function Button({ title, onPress, disabled, loading, secondary, danger }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled || !!loading }} onPress={onPress} disabled={disabled || loading} style={({ pressed }) => ({ minHeight: 48, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', marginTop: 12, padding: 12, backgroundColor: secondary ? colors.white : danger ? colors.red : colors.primary, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 })}>{loading ? <ActivityIndicator color={secondary ? colors.primary : colors.white} /> : <Text style={{ color: secondary ? colors.primary : colors.white, fontFamily: font.bold, fontSize: 14 }}>{title}</Text>}</Pressable>;
}
export function Field({ label, error, style, ...props }) {
  return <View style={{ marginBottom: 12 }}>{label && <Text style={styles.label}>{label}</Text>}<TextInput placeholderTextColor={colors.muted} style={[styles.input, style]} {...props} />{error ? <Text style={styles.error}>{error}</Text> : null}</View>;
}
export function Radio({ label, selected, onPress, plain = false }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={[plain ? { padding: 12, minHeight: 48 } : styles.card, styles.row, { padding: 13, minHeight: 48, marginBottom: plain ? 0 : 10 }]}><View style={{ width: 19, height: 19, borderRadius: 10, borderWidth: selected ? 6 : 1.2, borderColor: selected ? colors.primary : colors.muted, backgroundColor: colors.white, marginRight: 13 }} /><Text style={[styles.text, { fontSize: 13, flex: 1, fontFamily: selected ? font.bold : font.regular }]}>{label}</Text></Pressable>;
}
export function Pill({ status }) {
  const tone = status === 'Resolved' ? 'green' : status === 'Under Review' ? 'orange' : status === 'Submitted' ? 'muted' : 'primary';
  const tint = status === 'Resolved' ? 'greenTint' : status === 'Under Review' ? 'orangeTint' : status === 'Submitted' ? 'background' : 'blueTint';
  return <View style={{ borderRadius: 18, paddingHorizontal: 13, paddingVertical: 7, backgroundColor: colors[tint] }}><Text style={{ fontFamily: font.bold, color: colors[tone], fontSize: 10 }}>{status}</Text></View>;
}
export function Empty({ title, message }) { return <View style={{ paddingVertical: 50, alignItems: 'center' }}><Icon name="file-tray-outline" size={42} color={colors.muted} /><Text style={[styles.label, { marginTop: 16 }]}>{title}</Text><Text style={[styles.subtitle, { textAlign: 'center' }]}>{message}</Text></View>; }
export function ErrorText({ children }) { return children ? <Text accessibilityRole="alert" style={styles.error}>{children}</Text> : null; }
