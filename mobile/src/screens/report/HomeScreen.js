// Member: K.D.S.S. Ranathunga (IT23699762) | Prototype screen: 03_home.png, 04_category.png | Requirement: FR1, NFR1
import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { Screen, Icon, styles } from '../../components/UI';
import colors from '../../theme/colors';
import font from '../../theme/typography';
import { useApp } from '../../context/AppContext';
import { categories } from '../../data/options';
export function CategoryTile({ category, onPress, compact }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={{ width: compact ? '31%' : '48%', minHeight: compact ? 95 : 135, backgroundColor: colors[category.tint], borderRadius: 14, alignItems: 'center', justifyContent: 'center', padding: 12, marginBottom: 14 }}><View style={{ backgroundColor: colors.white, padding: compact ? 9 : 16, borderRadius: 15 }}><Icon name={category.icon} size={compact ? 30 : 40} /></View><Text style={{ fontFamily: font.bold, fontSize: compact ? 11 : 13, color: colors.text, textAlign: 'center', marginTop: 10 }}>{compact && category.id === 'garbage' ? 'Garbage' : category.short}</Text></Pressable>;
}
export default function Home({ navigation }) {
  const app = useApp();
  function quick(category) { app.setDraft({ category: category.id }); navigation.navigate('Subtype'); }
  return <Screen title="Citizen Connect" menu bell><Text style={[styles.title, { marginTop: 4 }]}>Hello, {app.profile.name.split(' ')[0]} 👋</Text><Text style={[styles.subtitle, { marginTop: 7, marginBottom: 22 }]}>Together for a cleaner & safer community.</Text>
    <Pressable accessibilityRole="button" onPress={() => { app.setDraft({}); navigation.navigate('Category'); }} style={[styles.between, { backgroundColor: colors.primary, borderRadius: 16, padding: 20, minHeight: 102, marginBottom: 18 }]}><View style={{ flex: 1 }}><Text style={{ color: colors.white, fontFamily: font.bold, fontSize: 17 }}>Report an Issue</Text><Text style={[styles.subtitle, { color: colors.white, opacity: 0.8, marginTop: 8 }]}>Share your concern with the right authority.</Text></View><View style={{ backgroundColor: colors.white, borderRadius: 24, padding: 8 }}><Icon name="add" size={26} /></View></Pressable>
    {[['My Reports', 'View and track submitted reports', 'Reports'], ['Notifications', 'Check latest status updates', 'Notifications']].map(([title, subtitle, route]) => <Pressable key={route} onPress={() => navigation.navigate(route)} style={styles.card}><Text style={styles.label}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></Pressable>)}
    <Text style={[styles.label, { marginTop: 12, marginBottom: 18 }]}>Quick Categories</Text><View style={styles.between}>{categories.slice(0, 3).map(category => <CategoryTile key={category.id} category={category} compact onPress={() => quick(category)} />)}</View>
  </Screen>;
}
export function Category({ navigation }) { const app = useApp(); return <Screen title="Report an Issue"><Text style={[styles.title, { marginVertical: 20 }]}>What would you like to report?</Text><Text style={[styles.subtitle, { marginBottom: 24 }]}>Choose a category to send your concern to the right team.</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>{categories.map(category => <CategoryTile key={category.id} category={category} onPress={() => { app.setDraft({ category: category.id }); navigation.navigate('Subtype'); }} />)}</View></Screen>; }
