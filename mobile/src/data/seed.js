import { categories, statuses } from './options';
export const demoProfile = { name: 'Nethmini', email: 'nethmini@gmail.com', mobile: '0712345678' };
export const seedReports = categories.map((category, index) => ({
  id: `${category.prefix}${String(12 - index).padStart(4, '0')}`, category: category.id, subtype: category.types[1],
  area: 'Colombo 03', authority: 'Colombo Municipal Council', description: 'Please inspect and repair this issue near the junction.',
  status: statuses[[3, 2, 4, 4, 1, 0][index]], createdAt: `2026-09-${String(12 - index).padStart(2, '0')}T05:00:00.000Z`,
  location: { latitude: 6.9147, longitude: 79.8515, address: 'Colombo 03, Sri Lanka' },
  timeline: statuses.slice(0, [4, 3, 5, 5, 2, 1][index]).map((status, step) => ({ status, at: new Date(Date.UTC(2026, 8, 12 - index, 5 + step)).toISOString() }))
}));
export const seedNotifications = [
  { id: 'n1', title: 'Status updated', message: '#WC0012 is now In Progress.', reportId: 'WC0012', tint: 'blueTint' },
  { id: 'n2', title: 'Complaint assigned', message: '#RD0011 has been assigned to an officer.', reportId: 'RD0011', tint: 'orangeTint' },
  { id: 'n3', title: 'Complaint resolved', message: '#SL0009 has been resolved.', reportId: 'SL0009', tint: 'greenTint' },
  { id: 'n4', title: 'Reminder', message: 'Check the progress of #EN0008.', reportId: 'EN0008', tint: 'purpleTint' }
].map((item, index) => ({ ...item, read: false, createdAt: new Date(Date.UTC(2026, 8, 12 - index, 6)).toISOString() }));
