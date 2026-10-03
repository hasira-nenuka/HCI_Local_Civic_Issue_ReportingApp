import React from 'react';
import { View, Text } from 'react-native';
import { Field, Icon, styles } from './UI';
import colors from '../theme/colors';
export default function LocationMap({ location, onChange }) {
  return <View style={[styles.card, { backgroundColor: colors.blueTint }]}><Icon name="location" size={36} /><Text style={[styles.label, { marginTop: 12 }]}>Confirm your coordinates</Text><Text style={[styles.subtitle, { marginBottom: 16 }]}>Interactive maps are available in the Android and iOS app. Search an address or use your location here.</Text>{['latitude', 'longitude'].map(key => <Field key={key} label={key === 'latitude' ? 'Latitude' : 'Longitude'} value={String(location[key])} keyboardType="numbers-and-punctuation" onChangeText={value => { const number = Number(value); if (Number.isFinite(number)) onChange({ ...location, [key]: number }); }} />)}</View>;
}
