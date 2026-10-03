import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Icon, styles } from '../components/UI';
import colors from '../theme/colors';
import font from '../theme/typography';
import Home, { Category } from '../screens/report/HomeScreen';
import { Splash, Login, SignUp, Officer } from '../screens/auth/AuthScreens';
import { Subtype, Selection, ComplaintForm, ConfirmLocation, Submitted } from '../screens/report/ReportScreens';
import { Reports, Track, ReportDetails, Notifications, NotificationDetails } from '../screens/tracking/TrackingScreens';
import { Profile, EditProfile, ChangePassword, Info } from '../screens/profile/ProfileScreens';

const Stack = createNativeStackNavigator(); const Tabs = createBottomTabNavigator(); const Drawer = createDrawerNavigator();
const commonScreens = { Category, Subtype, Area: Selection, Authority: Selection, ComplaintForm, ConfirmLocation, Submitted, Track, ReportDetails, Notifications, NotificationDetails, EditProfile, ChangePassword, Help: Info, About: Info };
function CitizenStack({ start }) {
  const first = { Home, Reports, Profile }[start];
  return <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}><Stack.Screen name={start} component={first} />{Object.entries(commonScreens).map(([name, component]) => <Stack.Screen key={name} name={name} component={component} />)}</Stack.Navigator>;
}
const HomeStack = () => <CitizenStack start="Home" />;
const ReportsStack = () => <CitizenStack start="Reports" />;
const ProfileStack = () => <CitizenStack start="Profile" />;
function BottomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  return <View style={{ paddingHorizontal: 12, paddingBottom: Math.max(insets.bottom, 10), paddingTop: 8, backgroundColor: colors.background }}><View style={{ flexDirection: 'row', borderRadius: 22, backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, maxWidth: 550, width: '100%', alignSelf: 'center', paddingVertical: 8 }}>{state.routes.map((route, index) => {
    const active = state.index === index; const label = ['Home', 'My Reports', 'Profile'][index]; const icon = ['home-outline', 'document-text-outline', 'person-outline'][index];
    return <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => { const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true }); if (!event.defaultPrevented) navigation.navigate(route.name, { screen: route.name }); }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48 }}><Icon name={icon} color={active ? colors.primary : colors.muted} size={23} /><Text style={{ color: active ? colors.primary : colors.muted, fontFamily: active ? font.bold : font.regular, fontSize: 10, marginTop: 5 }}>{label}</Text></Pressable>;
  })}</View></View>;
}
function CitizenTabs() { return <Tabs.Navigator tabBar={props => <BottomTabBar {...props} />} screenOptions={{ headerShown: false }}><Tabs.Screen name="Home" component={HomeStack} /><Tabs.Screen name="Reports" component={ReportsStack} /><Tabs.Screen name="Profile" component={ProfileStack} /></Tabs.Navigator>; }
function DrawerMenu(props) {
  const app = useApp();
  return <DrawerContentScrollView {...props}><View style={{ padding: 24 }}><Icon name="business-outline" size={46} /><Text style={[styles.title, { marginVertical: 18 }]}>Citizen Connect</Text><Text style={styles.subtitle}>{app.profile.name}</Text>{[['Home', 'Home'], ['My Reports', 'Reports'], ['Profile', 'Profile'], ['Help & Support', 'Help'], ['Log Out', 'Logout']].map(([label, target]) => <Pressable key={target} style={{ paddingVertical: 20 }} onPress={() => { props.navigation.closeDrawer(); if (target === 'Logout') app.logout(); else props.navigation.navigate('Citizen', { screen: target === 'Help' ? 'Home' : target, params: target === 'Help' ? { screen: 'Help' } : { screen: target } }); }}><Text style={[styles.label, { color: target === 'Logout' ? colors.red : colors.text }]}>{label}</Text></Pressable>)}</View></DrawerContentScrollView>;
}
export default function AppNavigator() {
  const app = useApp();
  return <NavigationContainer>{!app.session ? <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="Splash" component={Splash} /><Stack.Screen name="Login" component={Login} /><Stack.Screen name="SignUp" component={SignUp} /></Stack.Navigator> : app.session.role === 'officer' ? <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="Officer" component={Officer} /></Stack.Navigator> : <Drawer.Navigator drawerContent={props => <DrawerMenu {...props} />} screenOptions={{ headerShown: false }}><Drawer.Screen name="Citizen" component={CitizenTabs} /></Drawer.Navigator>}</NavigationContainer>;
}
