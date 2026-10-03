import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { client, apiUrl, setToken } from '../api/client';
import { demoProfile, seedReports, seedNotifications } from '../data/seed';

const Context = createContext(null);
const storageKey = 'citizen-connect-demo-v1';
// Native JWTs use the OS secure store. Web sessions are kept only in memory.
const saveToken = async token => {
  if (Platform.OS === 'web') return;
  if (token) await SecureStore.setItemAsync('citizen-token', token);
  else await SecureStore.deleteItemAsync('citizen-token');
};
export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(demoProfile);
  const [reports, setReports] = useState(seedReports);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [draft, setDraft] = useState({});
  const [storageError, setStorageError] = useState('');
  useEffect(() => {
    (async () => {
      try {
        if (!apiUrl) {
          const saved = await AsyncStorage.getItem(storageKey);
          if (saved) {
            const data = JSON.parse(saved);
            if (!data.profile?.name || !Array.isArray(data.reports) || !Array.isArray(data.notifications)) throw new Error('Invalid saved demo data');
            setProfile(data.profile); setReports(data.reports); setNotifications(data.notifications);
          }
        } else if (Platform.OS !== 'web') {
          const token = await SecureStore.getItemAsync('citizen-token');
          if (token) {
            setToken(token);
            try { const { data } = await client.get('/api/auth/me'); setProfile(data.user || data); setSession({ role: data.user?.role || data.role || 'citizen' }); }
            catch { setToken(null); await saveToken(null); }
          }
        }
      } catch { setStorageError('Saved data could not be loaded. This session is using the starter data.'); }
      finally { setReady(true); }
    })();
  }, []);
  useEffect(() => {
    if (ready && !apiUrl) AsyncStorage.setItem(storageKey, JSON.stringify({ profile, reports, notifications })).catch(() => setStorageError('Changes could not be saved on this device. Keep the app open and try again.'));
  }, [ready, profile, reports, notifications]);
  async function login(email, password, role) {
    if (apiUrl) {
      const { data } = await client.post('/api/auth/login', { email, password, role });
      if ((data.user?.role || 'citizen') !== role) throw new Error('Please choose the login button for your account role.');
      setToken(data.token); await saveToken(data.token); setProfile(data.user);
    } else if (email.toLowerCase() !== 'citizen@demo.lk' || password !== 'Citizen123') {
      throw new Error('Demo login: citizen@demo.lk / Citizen123. Connect a server for personal accounts.');
    }
    setSession({ role });
  }
  async function register(values) {
    if (!apiUrl) throw new Error('Account registration requires a connected backend. Use the demo login to explore the screens.');
    await client.post('/api/auth/register', values);
  }
  async function logout() { await saveToken(null); setToken(null); setSession(null); setDraft({}); }
  async function refresh() {
    if (!apiUrl) return;
    const [r, n] = await Promise.all([client.get('/api/reports'), client.get('/api/notifications')]);
    setReports(r.data.reports || r.data); setNotifications(n.data.notifications || n.data);
  }
  async function submitReport(location) {
    let report;
    if (apiUrl) {
      const form = new FormData();
      for (const key of ['category', 'subtype', 'area', 'authority', 'description']) form.append(key, draft[key]);
      form.append('location', JSON.stringify(location));
      if (draft.photo) {
        if (Platform.OS === 'web') form.append('photo', await (await fetch(draft.photo.uri)).blob(), draft.photo.fileName || 'report.jpg');
        else form.append('photo', { uri: draft.photo.uri, name: draft.photo.fileName || 'report.jpg', type: draft.photo.mimeType || 'image/jpeg' });
      }
      const { data } = await client.post('/api/reports', form); report = data.report || data;
    } else {
      const prefixes = { water: 'WC', road: 'RD', garbage: 'GC', streetlight: 'SL', environment: 'EN', other: 'OT' };
      const createdAt = new Date().toISOString();
      report = { ...draft, id: `${prefixes[draft.category]}${Date.now().toString().slice(-8)}`, location, status: 'Submitted', createdAt, timeline: [{ status: 'Submitted', at: createdAt }] };
      setNotifications(items => [{ id: `n${Date.now()}`, title: 'Report submitted', message: `#${report.id} has been submitted.`, reportId: report.id, tint: 'blueTint', read: false, createdAt }, ...items]);
    }
    setReports(items => [report, ...items]); setDraft({}); return report;
  }
  async function updateProfile(values) {
    if (apiUrl) { const { data } = await client.put('/api/auth/me', values); setProfile(data.user || data); }
    else setProfile(values);
  }
  async function changePassword(values) {
    if (!apiUrl) throw new Error('Password changes require a connected backend. The shared demo credentials cannot be changed.');
    await client.put('/api/auth/password', values);
  }
  async function updateReport(id, changes) {
    if (apiUrl) await client.put(`/api/reports/${id}`, changes);
    setReports(items => items.map(item => item.id === id ? { ...item, ...changes } : item));
  }
  async function deleteReport(id) {
    if (apiUrl) await client.delete(`/api/reports/${id}`);
    setReports(items => items.filter(item => item.id !== id));
  }
  async function notificationAction(id, remove = false) {
    if (apiUrl) {
      if (remove) await client.delete(`/api/notifications/${id}`);
      else await client.put(`/api/notifications/${id}/read`);
    }
    setNotifications(items => remove ? items.filter(item => item.id !== id) : items.map(item => item.id === id ? { ...item, read: true } : item));
  }
  return <Context.Provider value={{ ready, session, profile, reports, notifications, draft, setDraft, storageError, login, register, logout, refresh, submitReport, updateProfile, changePassword, updateReport, deleteReport, notificationAction, demo: !apiUrl }}>{children}</Context.Provider>;
}
export const useApp = () => useContext(Context);
