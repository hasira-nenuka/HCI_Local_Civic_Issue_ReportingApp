import { AppData, User, Complaint } from "../types/models";
import { categories } from "../constants/catalog";
const users: User[] = [
  {
    id: "citizen-demo",
    name: "Sujani Perera",
    email: "citizen@demo.lk",
    phone: "071 234 5678",
    role: "citizen",
    area: "Colombo 03",
    division: "Division 03",
    province: "Western Province",
    active: true,
  },
  {
    id: "officer-demo",
    name: "Dilini Perera",
    email: "officer@demo.lk",
    phone: "011 234 5678",
    role: "officer",
    area: "Colombo 03",
    division: "Division 03",
    province: "Western Province",
    active: true,
  },
  {
    id: "gn-demo",
    name: "Saman Kumara",
    email: "gn@demo.lk",
    phone: "071 345 6789",
    role: "gn",
    area: "Colombo 03",
    division: "Division 03",
    province: "Western Province",
    active: true,
  },
  {
    id: "admin-demo",
    name: "Nimal Perera",
    email: "admin@demo.lk",
    phone: "071 456 7890",
    role: "admin",
    area: "Colombo 03",
    division: "Division 03",
    province: "Western Province",
    active: true,
  },
];
export function makeSeed(): AppData {
  const complaints: Complaint[] = ["water", "garbage", "road", "light"].map(
    (id, i) => {
      const category = categories.find((c) => c.id === id)!;
      const status = i % 2 ? "Resolved" : "In Progress";
      const createdAt = `2026-09-${String(12 - i * 2).padStart(2, "0")}T05:00:00.000Z`;
      return {
        id: `sample-${i}`,
        reference: ["WC0012", "GC0009", "RD0007", "SL0005"][i],
        citizenId: "citizen-demo",
        categoryId: id,
        category: category.name,
        issueType: category.types[1],
        description: [
          "Water leaking in front of my house.",
          "The bins near the junction are overflowing.",
          "Large pothole near the junction.",
          "The street light keeps flickering.",
        ][i],
        area: "Colombo 03",
        division: "Division 03",
        localAuthority: "Colombo Municipal Council",
        address: "Temple Road, Colombo 03",
        latitude: 6.9002,
        longitude: 79.8538,
        priority: category.priority,
        status,
        assignedOfficerId: "officer-demo",
        createdAt,
        updatedAt: createdAt,
        history: [
          { status: "Submitted", at: createdAt },
          { status: "Assigned", at: createdAt },
          { status: "In Progress", at: createdAt },
          ...(status === "Resolved"
            ? [{ status: "Resolved" as const, at: createdAt }]
            : []),
        ],
      };
    },
  );
  return {
    users,
    complaints,
    categories: categories.map((c) => ({ ...c, types: [...c.types] })),
    notifications: [
      {
        id: "notification-demo",
        userId: "citizen-demo",
        complaintId: "sample-0",
        title: "Status updated",
        body: "#WC0012 is now In Progress.",
        createdAt: "2026-09-13T04:10:00.000Z",
        read: false,
      },
    ],
    contacts: [
      {
        id: "roads",
        name: "Roads",
        phone: "071 234 5678",
        email: "roads@example.lk",
      },
      {
        id: "waste",
        name: "Garbage",
        phone: "071 345 6789",
        email: "waste@example.lk",
      },
      {
        id: "water",
        name: "Water",
        phone: "011 234 5678",
        email: "water@example.lk",
      },
      {
        id: "light",
        name: "Street Light",
        phone: "011 555 2211",
        email: "light@example.lk",
      },
      {
        id: "environment",
        name: "Environment",
        phone: "011 490 1100",
        email: "environment@example.lk",
      },
    ],
  };
}
