import { Category, Status } from "../types/models";
export const statuses: Status[] = [
  "Submitted",
  "Assigned",
  "In Progress",
  "Resolved",
];
export const areas = [
  "Colombo 01",
  "Colombo 02",
  "Colombo 03",
  "Bambalapitiya",
  "Wellawatte",
  "Dehiwala",
  "Mount Lavinia",
  "Other",
];
export const authorities = [
  "Colombo Municipal Council",
  "Dehiwala–Mount Lavinia MC",
  "Sri Jayawardenepura Kotte MC",
  "Kolonnawa Urban Council",
  "Moratuwa Municipal Council",
  "Other",
];
export const categories: Category[] = [
  {
    id: "water",
    name: "Water Complaint",
    icon: "💧",
    color: "#eaf3ff",
    description:
      "Report water-related issues such as no water supply, water leakage, contaminated water, low water pressure or other water problems.",
    types: [
      "No Water Supply",
      "Water Leakage",
      "Contaminated Water",
      "Low Water Pressure",
      "Other",
    ],
    priority: "High",
  },
  {
    id: "road",
    name: "Road Damage",
    icon: "🚧",
    color: "#fff4e7",
    description:
      "Help keep our roads safe. Report potholes, broken pavement, damaged manholes and drainage issues.",
    types: [
      "Potholes",
      "Broken Pavement",
      "Damaged Manhole",
      "Drainage Issue",
      "Other",
    ],
    priority: "Medium",
  },
  {
    id: "garbage",
    name: "Cleanliness",
    icon: "🗑️",
    color: "#eaf8f2",
    description:
      "Report uncollected garbage, overflowing bins, illegal dumping or areas that need cleaning.",
    types: [
      "Uncollected Garbage",
      "Overflowing Bins",
      "Illegal Dumping",
      "Cleaning Required",
      "Other",
    ],
    priority: "Medium",
  },
  {
    id: "light",
    name: "Street Light",
    icon: "💡",
    color: "#fff8df",
    description:
      "Report street lights that are not working, flickering lights or damaged poles.",
    types: [
      "Light Not Working",
      "Flickering Light",
      "Damaged Pole",
      "New Light Request",
      "Other",
    ],
    priority: "Medium",
  },
  {
    id: "environment",
    name: "Environment",
    icon: "🌳",
    color: "#eef6e7",
    description:
      "Care for shared green spaces. Report park maintenance, damaged facilities, vegetation or pollution.",
    types: [
      "Park Maintenance",
      "Damaged Facilities",
      "Overgrown Vegetation",
      "Environmental Pollution",
      "Other",
    ],
    priority: "Medium",
  },
  {
    id: "other",
    name: "Other",
    icon: "❔",
    color: "#f2edff",
    description:
      "Report other public facility, noise, animal-related or general civic concerns.",
    types: [
      "Public Facility Issue",
      "Noise Complaint",
      "Animal-Related Issue",
      "General Complaint",
      "Other",
    ],
    priority: "Low",
  },
];
export const issueTitle = (id: string) =>
  ({
    water: "Water Complaint",
    road: "Road Complaint",
    garbage: "Garbage Complaint",
    light: "Street Light Complaint",
    environment: "Park & Environment Complaint",
    other: "Other",
  })[id] || "Report Issue";
