// Member: I.N. Chinthana (IT23699526) | Prototype screen: 16_my_reports.png, 17_track_complaint.png, 18_notifications.png, 19_notification_details.png | Requirement: FR2, FR3, NFR2, NFR4
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, Pressable, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Button, Field, Pill, Icon, Empty, ErrorText, styles } from '../../components/UI';
import { categories, statuses } from '../../data/options';
import { useApp } from '../../context/AppContext';
import colors from '../../theme/colors';
import font from '../../theme/typography';
import { errorMessage } from '../../api/client';
import validation from '../../utils/validation.cjs';
const categoryFor = report => categories.find(c => c.id === report.category) || categories[5];
const date = value => new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
function useRefresh() {
  const { refresh } = useApp(); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const retry = useCallback(async () => { setLoading(true); setError(''); try { await refresh(); } catch (e) { setError(errorMessage(e)); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { retry(); }, [retry]));
  return { loading, error, retry };
}
function ListState({ state }) { return <><ErrorText>{state.error}</ErrorText>{state.error && <Button title="Retry" secondary onPress={state.retry} />}{state.loading && <ActivityIndicator style={{ margin: 24 }} color={colors.primary} />}</>; }
export function ReportCard({ report, onPress }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.card, styles.between, { minHeight: 114 }]}><View style={{ flex: 1, paddingRight: 8 }}><Text style={styles.label}>{categoryFor(report).title}</Text><Text style={styles.subtitle}>#{report.id}</Text><Text style={[styles.subtitle, { marginTop: 5 }]}>{date(report.createdAt)}</Text></View><Pill status={report.status} /></Pressable>;
}
export function Reports({ navigation }) {
  const app = useApp(); const [filter, setFilter] = useState('All'); const [search, setSearch] = useState(''); const [query, setQuery] = useState(''); const [category, setCategory] = useState('all'); const [expanded, setExpanded] = useState(false); const state = useRefresh();
  useEffect(() => { const timer = setTimeout(() => setQuery(search.toLowerCase().trim()), 400); return () => clearTimeout(timer); }, [search]);
  const reports = app.reports.filter(r => (filter === 'All' || (filter === 'Resolved' ? r.status === 'Resolved' : r.status !== 'Resolved')) && (category === 'all' || r.category === category) && `${r.id} ${r.subtype} ${r.description} ${categoryFor(r).title}`.toLowerCase().includes(query));
  return <Screen title="My Reports" bell><View style={[styles.between, { marginVertical: 12 }]}>{['All', 'In Progress', 'Resolved'].map(item => <Pressable key={item} accessibilityRole="button" onPress={() => setFilter(item)} style={{ minHeight: 44, width: '31%', borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: filter === item ? colors.primary : colors.white, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontFamily: font.bold, fontSize: 12, color: filter === item ? colors.white : colors.text }}>{item}</Text></Pressable>)}</View><Pressable onPress={() => setExpanded(!expanded)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={[styles.link, { textAlign: 'right' }]}>{expanded ? 'Hide Search & Filters' : 'Search & Filter Reports'}</Text></Pressable>
    {expanded && <><Field accessibilityLabel="Search reports" placeholder="Search by ID or keyword..." value={search} onChangeText={setSearch} /><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>{[{ id: 'all', short: 'All categories' }, ...categories].map(c => <Pressable key={c.id} onPress={() => setCategory(c.id)} style={{ padding: 12, borderRadius: 20, backgroundColor: category === c.id ? colors.blueTint : colors.white }}><Text style={{ color: category === c.id ? colors.primary : colors.muted, fontFamily: font.medium, fontSize: 11 }}>{c.short}</Text></Pressable>)}</View></>}
    <ListState state={state} />{reports.map(report => <ReportCard key={report.id} report={report} onPress={() => navigation.navigate('Track', { id: report.id })} />)}{!state.loading && !state.error && !reports.length && <Empty title="No reports found" message="Try another filter or report your first issue." />}
  </Screen>;
}
export function Track({ navigation, route }) {
  const { reports } = useApp(); const report = reports.find(r => r.id === route.params.id);
  if (!report) return <Screen title="Track Complaint"><Empty title="Report unavailable" message="It may have been removed." /></Screen>;
  const current = statuses.indexOf(report.status);
  return <Screen title="Track Complaint" bell><View style={[styles.card, styles.between]}><Icon name={categoryFor(report).icon} size={28} /><View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.label}>{categoryFor(report).title}</Text><Text style={styles.subtitle}>#{report.id}</Text></View><Pill status={report.status} /></View>
    <View style={{ marginTop: 24, marginLeft: 16 }}>{statuses.map((status, index) => {
      const completed = index < current || (status === 'Resolved' && current === 4); const active = index === current && !completed; const entry = report.timeline?.find(item => item.status === status);
      return <View key={status} style={[styles.row, { alignItems: 'flex-start', minHeight: 70 }]}>{index < 4 && <View style={{ position: 'absolute', width: 2, height: 70, left: 11, top: 20, backgroundColor: colors.line }} />}<View style={{ height: 24, width: 24, borderRadius: 12, backgroundColor: completed ? colors.green : active ? colors.orange : colors.white, borderWidth: completed || active ? 0 : 1.5, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center', marginRight: 18 }}>{(completed || active) && <Icon name={completed ? 'checkmark' : 'time-outline'} color={colors.white} size={15} />}</View><View><Text style={[styles.label, { marginTop: 3 }]}>{status}</Text>{entry && <Text style={styles.subtitle}>{date(entry.at)} · {new Date(entry.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Text>}</View></View>;
    })}</View><Button title="View Report Details" secondary onPress={() => navigation.navigate('ReportDetails', { id: report.id })} />
  </Screen>;
}
export function ReportDetails({ navigation, route }) {
  const app = useApp(); const report = app.reports.find(r => r.id === route.params.id); const [description, setDescription] = useState(report?.description || ''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  if (!report) return <Screen title="Report Details"><Empty title="Report unavailable" message="This report has been removed." /></Screen>;
  async function save() { setBusy(true); setError(''); try { await app.updateReport(report.id, { description }); Alert.alert('Saved', 'Your report description has been updated.'); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  async function remove() { setBusy(true); try { await app.deleteReport(report.id); navigation.navigate('Reports'); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  function confirmRemove() { if (Platform.OS === 'web') { if (window.confirm('Cancel this report? This cannot be undone.')) remove(); } else Alert.alert('Cancel Report?', 'This removes your submitted report.', [{ text: 'Keep Report', style: 'cancel' }, { text: 'Cancel Report', style: 'destructive', onPress: remove }]); }
  return <Screen title="Report Details" bell><ReportCard report={report} onPress={() => navigation.navigate('Track', { id: report.id })} />{report.photo && <Image source={{ uri: report.photo.uri || report.photo }} style={{ height: 210, borderRadius: 14, marginBottom: 18 }} />}<View style={styles.card}>{[['Issue type', report.subtype], ['Area', report.area], ['Local authority', report.authority], ['Location', report.location?.address || 'Coordinates confirmed']].map(([label, value]) => <View key={label} style={{ marginBottom: 14 }}><Text style={styles.subtitle}>{label}</Text><Text style={[styles.text, { marginTop: 4 }]}>{value}</Text></View>)}</View><Field label="Description" multiline maxLength={500} style={{ minHeight: 130, textAlignVertical: 'top' }} editable={report.status === 'Submitted'} value={description} onChangeText={setDescription} /><ErrorText>{error}</ErrorText>{report.status === 'Submitted' && <><Button title="Save Description" disabled={!validation.description(description) || description === report.description} loading={busy} onPress={save} /><Button title="Cancel Report" danger disabled={busy} onPress={confirmRemove} /></>}</Screen>;
}
function relativeTime(value) { const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000); return days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`; }
export function Notifications({ navigation }) {
  const app = useApp(); const state = useRefresh(); const [error, setError] = useState('');
  async function open(item) { try { await app.notificationAction(item.id); navigation.navigate('NotificationDetails', { id: item.id }); } catch (e) { setError(errorMessage(e)); } }
  return <Screen title="Notifications" bell><ListState state={state} /><ErrorText>{error}</ErrorText>{app.notifications.map(item => <Pressable key={item.id} onPress={() => open(item)} style={[styles.card, styles.row, { alignItems: 'flex-start', minHeight: 106 }]}><View style={{ borderRadius: 15, backgroundColor: colors[item.tint] || colors.blueTint, padding: 10, marginRight: 12 }}><Icon name="notifications-outline" size={18} /></View><View style={{ flex: 1 }}><Text style={styles.label}>{item.title}</Text><Text style={[styles.subtitle, { color: colors.text }]}>{item.message}</Text><Text style={[styles.subtitle, { marginTop: 8 }]}>{relativeTime(item.createdAt)}</Text></View>{!item.read && <View accessibilityLabel="Unread" style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary }} />}</Pressable>)}{!app.notifications.length && !state.loading && <Empty title="You're all caught up" message="Report updates will appear here." />}</Screen>;
}
export function NotificationDetails({ navigation, route }) {
  const app = useApp(); const item = app.notifications.find(n => n.id === route.params.id); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  if (!item) return <Screen title="Notification"><Empty title="Notification removed" /></Screen>;
  async function remove() { setBusy(true); try { await app.notificationAction(item.id, true); navigation.goBack(); } catch (e) { setError(errorMessage(e)); setBusy(false); } }
  return <Screen title="Notification Details" bell><View style={{ alignItems: 'center', paddingVertical: 45 }}><Icon name="notifications-circle-outline" size={95} /><Text style={[styles.title, { marginTop: 18 }]}>{item.title}</Text></View><View style={styles.card}><Text style={styles.text}>{item.message}</Text><Text style={[styles.subtitle, { marginTop: 16 }]}>{date(item.createdAt)}</Text></View><ErrorText>{error}</ErrorText><Button title="View Complaint" onPress={() => navigation.navigate('Track', { id: item.reportId })} /><Button title="Delete Notification" secondary loading={busy} onPress={remove} /></Screen>;
}
