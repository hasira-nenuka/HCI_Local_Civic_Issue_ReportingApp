import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { AppProvider, useApp } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import colors from './src/theme/colors';
function Content() {
  const { ready } = useApp(); const [fontsReady, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_700Bold });
  if (!ready || (!fontsReady && !fontError)) return <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>;
  return <><StatusBar barStyle="dark-content" backgroundColor={colors.background} /><AppNavigator /></>;
}
export default function App() { return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><AppProvider><Content /></AppProvider></SafeAreaProvider></GestureHandlerRootView>; }
