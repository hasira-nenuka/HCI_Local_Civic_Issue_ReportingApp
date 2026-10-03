import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import colors from '../theme/colors';
export default function LocationMap({ location, onChange }) {
  return <MapView style={{ height: 280, borderRadius: 14 }} region={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.012, longitudeDelta: 0.012 }} onPress={event => onChange(event.nativeEvent.coordinate)}><Marker coordinate={location} draggable onDragEnd={event => onChange(event.nativeEvent.coordinate)} pinColor={colors.primary} /></MapView>;
}
