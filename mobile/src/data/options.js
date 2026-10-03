export const categories = [
  { id: 'water', title: 'Water Complaint', short: 'Water', icon: 'water', tint: 'waterTint', prefix: 'WC', types: ['No Water Supply', 'Water Leakage', 'Contaminated Water', 'Low Water Pressure', 'Other'] },
  { id: 'road', title: 'Road Complaint', short: 'Roads', icon: 'construct', tint: 'roadTint', prefix: 'RD', types: ['Potholes', 'Broken Pavement', 'Damaged Manhole', 'Drainage Issue', 'Other'] },
  { id: 'garbage', title: 'Garbage / Cleanliness', short: 'Cleanliness', icon: 'trash', tint: 'greenTint', prefix: 'GC', types: ['Uncollected Garbage', 'Overflowing Bins', 'Illegal Dumping', 'Cleaning Required', 'Other'] },
  { id: 'streetlight', title: 'Street Light Complaint', short: 'Street Light', icon: 'bulb', tint: 'orangeTint', prefix: 'SL', types: ['Light Not Working', 'Flickering Light', 'Damaged Pole', 'New Light Request', 'Other'] },
  { id: 'environment', title: 'Park & Environment', short: 'Environment', icon: 'leaf', tint: 'greenTint', prefix: 'EN', types: ['Park Maintenance', 'Damaged Facilities', 'Overgrown Vegetation', 'Environmental Pollution', 'Other'] },
  { id: 'other', title: 'Other', short: 'Other', icon: 'help-circle', tint: 'purpleTint', prefix: 'OT', types: ['Public Facility Issue', 'Noise Complaint', 'Animal-Related Issue', 'General Complaint', 'Other'] }
];
export const areas = ['Colombo 01', 'Colombo 02', 'Colombo 03', 'Bambalapitiya', 'Wellawatte', 'Dehiwala', 'Mount Lavinia', 'Other'];
export const authorities = ['Colombo Municipal Council', 'Dehiwala–Mount Lavinia MC', 'Sri Jayawardenepura Kotte MC', 'Kolonnawa Urban Council', 'Moratuwa Municipal Council', 'Other'];
export const statuses = ['Submitted', 'Received', 'Under Review', 'In Progress', 'Resolved'];
