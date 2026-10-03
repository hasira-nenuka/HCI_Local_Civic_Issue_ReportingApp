// Member: K.D.S.S. Ranathunga (IT23699762) | Prototype screen: 05–15 reporting flow | Requirement: FR1, NFR1–NFR4
import React, { useState, useRef } from 'react';
import { Text, View, Pressable, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Screen, Button, Field, Radio, Icon, styles, ErrorText } from '../../components/UI';
import LocationMap from '../../components/LocationMap';
import { useApp } from '../../context/AppContext';
import { categories, areas, authorities } from '../../data/options';
import colors from '../../theme/colors';
import { errorMessage } from '../../api/client';
import validation from '../../utils/validation.cjs';
const chosenCategory = draft => categories.find(c => c.id === draft.category) || categories[0];

export function Subtype({ navigation }) {
  const { draft, setDraft } = useApp(); const category = chosenCategory(draft);
  return <Screen title={category.title}><Text style={[styles.label, { fontSize: 16, marginBottom: 30 }]}>What type of {category.short.toLowerCase()} issue is it?</Text>{category.types.map(type => <Radio key={type} label={type} selected={draft.subtype === type} onPress={() => setDraft({ ...draft, subtype: type })} />)}<View style={styles.gap} /><Button title="Next" disabled={!draft.subtype} onPress={() => navigation.navigate('Area')} /></Screen>;
}
export function Selection({ navigation, route }) {
  const { draft, setDraft } = useApp(); const isArea = route.name === 'Area'; const key = isArea ? 'area' : 'authority'; const [search, setSearch] = useState('');
  const options = (isArea ? areas : authorities).filter(item => item.toLowerCase().includes(search.toLowerCase()));
  return <Screen title={chosenCategory(draft).title}><Text style={[styles.title, { fontSize: 18, marginBottom: 24 }]}>Select {isArea ? 'Area' : 'Local Authority'}</Text><Field accessibilityLabel={`Search ${key}`} placeholder={isArea ? '⌕  Search area...' : '⌕  Search local authority...'} value={search} onChangeText={setSearch} />{options.map(item => <Radio key={item} label={item} plain={isArea} selected={draft[key] === item} onPress={() => setDraft({ ...draft, [key]: item })} />)}{!options.length && <Text style={styles.subtitle}>No matches. Try another search.</Text>}<View style={styles.gap} /><Button title="Next" disabled={!draft[key]} onPress={() => navigation.navigate(isArea ? 'Authority' : 'ComplaintForm')} /></Screen>;
}
export function ComplaintForm({ navigation }) {
  const { draft, setDraft } = useApp(); const [error, setError] = useState('');
  async function pick(camera) {
    setError('');
    try {
      const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new Error('Allow photo access in your device settings to attach an image.');
      const result = camera ? await ImagePicker.launchCameraAsync({ quality: 0.7, mediaTypes: ['images'] }) : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'] });
      if (!result.canceled) {
        const photo = result.assets[0];
        let size = photo.fileSize;
        if (size == null) size = (await (await fetch(photo.uri)).blob()).size;
        if (size > 5 * 1024 * 1024) throw new Error('Choose an image smaller than 5 MB.');
        setDraft({ ...draft, photo });
      }
    } catch (e) { setError(errorMessage(e)); }
  }
  function addPhoto() {
    if (Platform.OS === 'web') pick(false);
    else Alert.alert('Add Photo', 'Choose how to attach your photo.', [{ text: 'Camera', onPress: () => pick(true) }, { text: 'Photo Library', onPress: () => pick(false) }, { text: 'Cancel', style: 'cancel' }]);
  }
  return <Screen title={`Report ${draft.subtype}`}><View style={[styles.card, styles.between, { backgroundColor: colors.blueTint }]}><Text style={[styles.label, { color: colors.primary, flex: 1 }]}>{draft.subtype}</Text><Pressable accessibilityRole="button" onPress={() => navigation.navigate('Subtype')} style={{ backgroundColor: colors.white, borderRadius: 24, padding: 12 }}><Text style={styles.link}>Change</Text></Pressable></View><Text style={[styles.label, { marginTop: 12 }]}>Add Photo</Text>
    <Pressable accessibilityLabel="Add or change report photo" onPress={addPhoto} style={[styles.card, { height: 160, padding: 0, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }]}>{draft.photo ? <Image source={{ uri: draft.photo.uri }} style={{ width: '100%', height: '100%' }} /> : <><Icon name="image-outline" size={54} color={colors.muted} /><Text style={[styles.subtitle, { marginTop: 12 }]}>Add or capture a photo</Text></>}</Pressable>
    {draft.photo && <Button title="Remove Photo" secondary onPress={() => setDraft({ ...draft, photo: null })} />}
    <View style={styles.gap} /><Field label="Description" placeholder="Describe the issue and nearby landmarks..." value={draft.description || ''} onChangeText={description => setDraft({ ...draft, description })} multiline maxLength={500} textAlignVertical="top" style={{ height: 155 }} /><Text style={[styles.subtitle, { textAlign: 'right' }]}>{(draft.description || '').length}/500 · minimum 10 characters</Text><ErrorText>{error}</ErrorText><Button title="Next" disabled={!validation.description(draft.description || '')} onPress={() => navigation.navigate('ConfirmLocation')} />
  </Screen>;
}
export function ConfirmLocation({ navigation }) {
  const app = useApp(); const [location, setLocation] = useState({ latitude: 6.9147, longitude: 79.8515, address: 'Colombo 03, Sri Lanka' }); const [confirmed, setConfirmed] = useState(false); const [search, setSearch] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const version = useRef(0); const submitting = useRef(false);
  async function change(coords) {
    const current = ++version.current;
    if (Math.abs(coords.latitude) > 90 || Math.abs(coords.longitude) > 180) { setError('Enter valid latitude and longitude.'); setConfirmed(false); return; }
    setError(''); setConfirmed(true); setLocation({ ...coords, address: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` });
    if (Platform.OS === 'web') return;
    try {
      const results = await Location.reverseGeocodeAsync(coords); const address = results[0];
      if (address && version.current === current) setLocation({ ...coords, address: [address.street, address.city, address.region].filter(Boolean).join(', ') });
    } catch { /* Coordinates remain usable if address lookup is unavailable. */ }
  }
  async function locate() {
    setBusy(true); setError('');
    try { const permission = await Location.requestForegroundPermissionsAsync(); if (!permission.granted) throw new Error('Location access was denied. Search an address or move the pin instead.'); const result = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }); await change(result.coords); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  async function find() {
    setBusy(true); setError('');
    try { if (Platform.OS === 'web') throw new Error('Address search is available in the mobile app. Use your location or enter coordinates in the web preview.'); const permission = await Location.requestForegroundPermissionsAsync(); if (!permission.granted) throw new Error('Allow location access to search an address.'); const results = await Location.geocodeAsync(search); if (!results.length) throw new Error('Address not found. Add a city or nearby landmark.'); await change(results[0]); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  async function submit() {
    if (submitting.current) return; submitting.current = true; setBusy(true); setError('');
    try { const report = await app.submitReport(location); navigation.replace('Submitted', { id: report.id }); }
    catch (e) { setError(errorMessage(e)); } finally { submitting.current = false; setBusy(false); }
  }
  return <Screen title="Confirm Location"><Text style={[styles.subtitle, { marginBottom: 18 }]}>Move the pin to the issue, search an address, or use your current location.</Text><Field placeholder="Search or move the pin" accessibilityLabel="Search address" value={search} onChangeText={setSearch} onSubmitEditing={find} /><Button title="Search Address" secondary disabled={!search.trim() || busy} onPress={find} /><View style={styles.gap} /><LocationMap location={location} onChange={change} /><Button title="Use My Location" secondary disabled={busy} onPress={locate} /><View style={[styles.card, { marginTop: 18 }]}><Text style={styles.label}>{location.address}</Text><Text style={styles.subtitle}>{app.draft.area} · {app.draft.authority}</Text></View><Radio label="This is the correct issue location" selected={confirmed} onPress={() => setConfirmed(!confirmed)} /><ErrorText>{error}</ErrorText><Button title="Confirm Location & Submit" disabled={!confirmed} loading={busy} onPress={submit} /></Screen>;
}
export function Submitted({ navigation, route }) {
  return <Screen title="" back={false}><View style={{ alignItems: 'center', marginTop: 36, marginBottom: 30 }}><View style={{ backgroundColor: colors.greenTint, padding: 24, borderRadius: 60 }}><Icon name="checkmark-circle" size={72} color={colors.green} /></View><Text style={[styles.title, { marginTop: 22, fontSize: 23 }]}>Report Submitted!</Text><Text style={[styles.subtitle, { marginTop: 10 }]}>Your complaint has been successfully submitted.</Text></View><View style={[styles.card, { alignItems: 'center', padding: 26 }]}><Text style={styles.subtitle}>Complaint ID</Text><Text selectable style={[styles.title, { color: colors.primary, fontSize: 25, marginTop: 12 }]}>#{route.params.id}</Text></View><Button title="Track My Report" onPress={() => navigation.replace('Track', { id: route.params.id })} /><Button title="Back to Home" secondary onPress={() => navigation.popToTop()} /></Screen>;
}
