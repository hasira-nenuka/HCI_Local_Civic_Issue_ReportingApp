// Member: I.N. Chinthana (IT23699526) | Prototype screen: 20_profile.png, supplied Edit Profile | Requirement: NFR1, NFR3
import React, { useState } from 'react';
import { Text, View, Pressable, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen, Button, Field, Icon, styles, ErrorText } from '../../components/UI';
import { useApp } from '../../context/AppContext';
import colors from '../../theme/colors';
import { errorMessage } from '../../api/client';
import validation from '../../utils/validation.cjs';
function Avatar({ uri, size = 74 }) { return uri ? <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} /> : <View style={{ height: size, width: size, borderRadius: size / 2, backgroundColor: colors.blueTint, alignItems: 'center', justifyContent: 'center' }}><Icon name="person" size={size / 2} /></View>; }
export function Profile({ navigation }) {
  const app = useApp(); const [error, setError] = useState('');
  return <Screen title="Profile" bell><View style={[styles.row, { marginVertical: 22, marginBottom: 32 }]}><Avatar uri={app.profile.avatar} /><View style={{ marginLeft: 16, flex: 1 }}><Text style={styles.label}>{app.profile.name}</Text><Text style={styles.subtitle}>{app.profile.mobile}</Text><Text style={styles.subtitle}>{app.profile.email}</Text></View></View>{[['Edit Profile', 'EditProfile'], ['Change Password', 'ChangePassword'], ['Help & Support', 'Help'], ['About App', 'About'], ['Log Out', 'Logout']].map(([label, route]) => <Pressable key={route} style={[styles.card, styles.between, { minHeight: 52 }]} onPress={async () => { if (route === 'Logout') { try { await app.logout(); } catch (e) { setError(errorMessage(e)); } } else navigation.navigate(route); }}><Text style={[styles.label, { marginBottom: 0, color: route === 'Logout' ? colors.red : colors.text }]}>{label}</Text><Icon name="chevron-forward" size={16} color={colors.muted} /></Pressable>)}<ErrorText>{error}</ErrorText></Screen>;
}
export function EditProfile({ navigation }) {
  const app = useApp(); const [values, setValues] = useState({ ...app.profile }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const valid = values.name.trim().length >= 3 && validation.email(values.email) && validation.mobile(values.mobile);
  async function photo() {
    try { const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!permission.granted) throw new Error('Allow photo access to change your avatar.'); const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5 }); if (!result.canceled) setValues({ ...values, avatar: result.assets[0].uri }); }
    catch (e) { setError(errorMessage(e)); }
  }
  async function save() { setBusy(true); setError(''); try { await app.updateProfile(values); navigation.goBack(); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  return <Screen title="Edit Profile" bell><Pressable onPress={photo} style={{ alignItems: 'center', marginBottom: 30, paddingVertical: 12 }}><Avatar uri={values.avatar} size={88} /><Text style={[styles.link, { marginTop: 10 }]}>Change Photo</Text></Pressable>{[['name', 'Full Name'], ['email', 'Email'], ['mobile', 'Mobile Number']].map(([key, label]) => <Field key={key} label={label} value={values[key]} onChangeText={value => setValues({ ...values, [key]: value })} keyboardType={key === 'mobile' ? 'phone-pad' : key === 'email' ? 'email-address' : 'default'} autoCapitalize={key === 'name' ? 'words' : 'none'} error={values[key] && (key === 'name' ? values.name.trim().length < 3 : key === 'email' ? !validation.email(values.email) : !validation.mobile(values.mobile)) ? `Enter a valid ${label.toLowerCase()}.` : ''} />)}<View style={styles.gap} /><ErrorText>{error}</ErrorText><Button title="Save Changes" disabled={!valid} loading={busy} onPress={save} /></Screen>;
}
export function ChangePassword({ navigation }) {
  const app = useApp(); const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirm: '' }); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function save() { setBusy(true); setError(''); try { await app.changePassword(values); Alert.alert('Password changed', 'Your password has been updated.'); navigation.goBack(); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  return <Screen title="Change Password">{[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirm', 'Confirm Password']].map(([key, label]) => <Field key={key} label={label} secureTextEntry value={values[key]} onChangeText={v => setValues({ ...values, [key]: v })} />)}<Text style={styles.subtitle}>At least 8 characters, including a letter and a number.</Text><ErrorText>{error}</ErrorText><Button title="Update Password" disabled={!values.currentPassword || !validation.password(values.newPassword) || values.newPassword !== values.confirm} loading={busy} onPress={save} /></Screen>;
}
export function Info({ route }) {
  const about = route.name === 'About'; const app = useApp();
  return <Screen title={about ? 'About App' : 'Help & Support'}><View style={{ paddingVertical: 30, alignItems: 'center' }}><Icon name={about ? 'business-outline' : 'help-buoy-outline'} size={64} /></View><View style={styles.card}><Text style={styles.title}>{about ? 'Citizen Connect' : 'How can we help?'}</Text><Text style={[styles.text, { marginTop: 18, lineHeight: 24 }]}>{about ? 'Report local civic issues, follow their progress, and stay informed about your community.\n\nCitizen mobile prototype · Version 1.0.0' : '1. Choose Report an Issue and select the category and issue type.\n\n2. Choose your area and local authority, attach a photo, and describe the problem.\n\n3. Confirm the issue location and submit.\n\n4. Open My Reports to track progress. Notifications show updates.\n\nSubmitted reports can be edited or cancelled in Report Details.'}</Text></View>{app.demo && <Text style={styles.subtitle}>Local demo: data is saved on this device. No report is sent to a real local authority.</Text>}</Screen>;
}
