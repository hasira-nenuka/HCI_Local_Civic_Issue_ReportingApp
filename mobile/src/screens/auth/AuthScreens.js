// Member: shared team | Prototype screen: 01_splash.png, 02_login.png | Requirement: NFR1, NFR3
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Screen, Button, Field, Icon, styles, ErrorText } from '../../components/UI';
import colors from '../../theme/colors';
import font from '../../theme/typography';
import { useApp } from '../../context/AppContext';
import { errorMessage } from '../../api/client';
import validation from '../../utils/validation.cjs';

export function Splash({ navigation }) {
  useEffect(() => { const timer = setTimeout(() => navigation.replace('Login'), 2000); return () => clearTimeout(timer); }, [navigation]);
  return <View style={{ flex: 1, backgroundColor: colors.splash, alignItems: 'center', justifyContent: 'center', padding: 30 }}><View style={{ width: 170, height: 170, borderRadius: 22, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: 28 }}><Icon name="business-outline" size={100} /></View><Text style={[styles.title, { textAlign: 'center', lineHeight: 32 }]}>Local Civic Issue{ '\n' }Reporting System</Text><Text style={[styles.subtitle, { marginTop: 18 }]}>A cleaner, safer community together</Text><View style={[styles.row, { gap: 6, marginTop: 28 }]}>{[1, 2, 3].map(n => <View key={n} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, opacity: 1 / n }} />)}</View></View>;
}
export function Login({ navigation }) {
  const app = useApp(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [visible, setVisible] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function login(role) { setError(''); setBusy(true); try { await app.login(email.trim(), password, role); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  return <Screen title="" back={false}><View style={{ alignItems: 'center', paddingTop: 36, paddingBottom: 34 }}><Icon name="business-outline" size={58} /><Text style={[styles.title, { fontSize: 25, marginTop: 26 }]}>Login</Text><Text style={[styles.subtitle, { marginTop: 10 }]}>Welcome back</Text></View>
    <Field label="Email" placeholder="officer@gov.lk" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
    <Text style={styles.label}>Password</Text><View style={[styles.input, styles.row, { paddingVertical: 0 }]}><TextInput accessibilityLabel="Password" value={password} onChangeText={setPassword} secureTextEntry={!visible} placeholder="••••••••" placeholderTextColor={colors.muted} style={{ flex: 1, height: 48, color: colors.text, fontFamily: font.regular }} /><Pressable accessibilityLabel={visible ? 'Hide password' : 'Show password'} onPress={() => setVisible(!visible)} style={{ padding: 12 }}><Icon name={visible ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} /></Pressable></View>
    <ErrorText>{error}</ErrorText><View style={{ height: 56 }} /><Button title="Login As Citizen" disabled={!validation.email(email) || !password} loading={busy} onPress={() => login('citizen')} /><View style={{ height: 24 }} /><Button title="Login As Officer" disabled={!validation.email(email) || !password || busy} onPress={() => login('officer')} /><Pressable onPress={() => navigation.navigate('SignUp')} style={{ padding: 18, minHeight: 44 }}><Text style={styles.link}>Sign Up</Text></Pressable>
    {app.demo && <View style={[styles.card, { backgroundColor: colors.blueTint }]}><Text style={styles.label}>Explore the local demo</Text><Text style={styles.subtitle}>citizen@demo.lk · Citizen123</Text><Pressable style={{ paddingVertical: 12 }} onPress={() => { setEmail('citizen@demo.lk'); setPassword('Citizen123'); }}><Text style={[styles.link, { textAlign: 'left' }]}>Fill demo credentials</Text></Pressable></View>}
  </Screen>;
}
export function SignUp({ navigation }) {
  const app = useApp(); const [values, setValues] = useState({ name: '', email: '', mobile: '', password: '', confirm: '' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const valid = values.name.trim().length >= 3 && validation.email(values.email) && validation.mobile(values.mobile) && validation.password(values.password) && values.password === values.confirm;
  async function submit() { setBusy(true); setError(''); try { await app.register(values); navigation.navigate('Login'); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  return <Screen title="Sign Up"><Text style={[styles.title, { marginVertical: 24 }]}>Join your community</Text>{[['name', 'Full Name'], ['email', 'Email'], ['mobile', 'Mobile Number'], ['password', 'Password'], ['confirm', 'Confirm Password']].map(([key, label]) => <Field key={key} label={label} value={values[key]} onChangeText={v => setValues({ ...values, [key]: v })} secureTextEntry={key === 'password' || key === 'confirm'} autoCapitalize={key === 'name' ? 'words' : 'none'} keyboardType={key === 'mobile' ? 'phone-pad' : key === 'email' ? 'email-address' : 'default'} />)}<Text style={styles.subtitle}>Use a Sri Lankan number (07XXXXXXXX) and a password with at least 8 characters, a letter and a number.</Text><ErrorText>{error}</ErrorText><Button title="Create Account" onPress={submit} disabled={!valid} loading={busy} /></Screen>;
}
export function Officer() { const app = useApp(); return <Screen title="Officer Portal" back={false}><View style={{ marginTop: 60, alignItems: 'center' }}><Icon name="business-outline" size={64} /><Text style={[styles.title, { marginTop: 24 }]}>Officer portal coming soon</Text><Text style={[styles.subtitle, { marginVertical: 16 }]}>The citizen screens are ready to explore.</Text></View><Button title="Log Out" onPress={app.logout} /></Screen>; }
