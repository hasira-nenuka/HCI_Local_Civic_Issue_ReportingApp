import type {
  AppData,
  User,
  Category,
  Complaint,
  AppNotification,
  Role,
  Status,
} from "../types/models";

export const SAMPLE_DATASET = "cc-showcase-v1";
export const serviceDefinitions: Category[] = [
  {
    id: "water",
    name: "Water Complaints",
    icon: "water",
    artwork: "water",
    color: "#e7f0ff",
    priority: "High",
    description:
      "Report water leaks, interrupted supply, low pressure and concerns about water quality. Include a nearby landmark and explain when the issue began.",
    types: [
      "No Water Supply",
      "Water Leakage",
      "Contaminated Water",
      "Low Water Pressure",
      "Other",
    ],
  },
  {
    id: "road",
    name: "Road Damage",
    icon: "road",
    artwork: "road",
    color: "#fff0d7",
    priority: "High",
    description:
      "Help make local roads safer. Report potholes, damaged pavement, broken manhole covers and blocked roadside drainage.",
    types: [
      "Potholes",
      "Broken Pavement",
      "Damaged Manhole",
      "Drainage Issue",
      "Other",
    ],
  },
  {
    id: "garbage",
    name: "Garbage & Cleanliness",
    icon: "garbage",
    artwork: "garbage",
    color: "#def5ed",
    priority: "Medium",
    description:
      "Keep shared spaces clean. Report missed collections, overflowing bins, illegal dumping and public areas needing cleaning.",
    types: [
      "Uncollected Garbage",
      "Overflowing Bins",
      "Illegal Dumping",
      "Cleaning Required",
      "Other",
    ],
  },
  {
    id: "light",
    name: "Street Light",
    icon: "light",
    artwork: "light",
    color: "#eee7ff",
    priority: "Medium",
    description:
      "Report street lights that are dark, flickering or damaged. Describe the nearest junction or building to help the maintenance team locate the light.",
    types: [
      "Light Not Working",
      "Flickering Light",
      "Damaged Pole",
      "New Light Request",
      "Other",
    ],
  },
  {
    id: "environment",
    name: "Park & Environment",
    icon: "environment",
    artwork: "environment",
    color: "#e4f4df",
    priority: "Medium",
    description:
      "Care for neighborhood parks and green spaces. Report damaged benches, overgrown paths, fallen branches and pollution in public areas.",
    types: [
      "Park Maintenance",
      "Damaged Facilities",
      "Overgrown Vegetation",
      "Environmental Pollution",
      "Other",
    ],
  },
  {
    id: "other",
    name: "Other Community Issues",
    icon: "other",
    artwork: "other",
    color: "#f3eaff",
    priority: "Low",
    description:
      "Report other civic concerns, including public facilities, noise and animal-related issues. Describe the problem so it can reach the appropriate team.",
    types: [
      "Public Facility Issue",
      "Noise Complaint",
      "Animal-Related Issue",
      "General Complaint",
      "Other",
    ],
  },
];
const citizenNames = [
  ["Kavindu Perera", "කවිඳු පෙරේරා"],
  ["Nethmi Fernando", "නෙත්මි ප්‍රනාන්දු"],
  ["Tharushi Jayasinghe", "තරුෂි ජයසිංහ"],
  ["Dilshan Weerasinghe", "දිල්ශාන් වීරසිංහ"],
  ["Sanduni Wickramasinghe", "සඳුනි වික්‍රමසිංහ"],
  ["Isuru Bandara", "ඉසුරු බණ්ඩාර"],
  ["Hiruni Senanayake", "හිරුණි සේනානායක"],
  ["Pasindu Dissanayake", "පසිඳු දිසානායක"],
  ["Chamodi Gunawardena", "චමෝදි ගුණවර්ධන"],
  ["Lahiru Silva", "ලහිරු සිල්වා"],
  ["Sachini Amarasinghe", "සචිනි අමරසිංහ"],
  ["Dulanjana Rajapaksha", "දුලංජන රාජපක්ෂ"],
  ["Piumi Herath", "පියුමි හේරත්"],
  ["Ravindu Ekanayake", "රවිඳු ඒකනායක"],
  ["Dinithi Kumari", "දිනිති කුමාරි"],
];
const officerNames = [
  ["Nimal Rathnayake", "නිමල් රත්නායක"],
  ["Dilini Perera", "දිලිනි පෙරේරා"],
  ["Kasun Wijesinghe", "කසුන් විජේසිංහ"],
  ["Ishara Madushani", "ඉෂාරා මධුෂානි"],
  ["Gayan Sampath", "ගයාන් සම්පත්"],
  ["Oshadi Lakmali", "ඕෂධී ලක්මාලි"],
  ["Pradeep Kumara", "ප්‍රදීප් කුමාර"],
  ["Shanika Sewwandi", "ශානිකා සෙව්වන්දි"],
];
const gnNames = [
  ["Saman Kumara", "සමන් කුමාර"],
  ["Anura Silva", "අනුර සිල්වා"],
  ["Malini Perera", "මාලිනී පෙරේරා"],
  ["Sunil Jayawardena", "සුනිල් ජයවර්ධන"],
  ["Deepani Herath", "දීපානි හේරත්"],
  ["Ruwan Bandara", "රුවන් බණ්ඩාර"],
];
const areas = [
  "Colombo 01",
  "Colombo 02",
  "Colombo 03",
  "Bambalapitiya",
  "Wellawatte",
  "Dehiwala",
];
const streets = [
  "Temple Road",
  "Station Road",
  "School Lane",
  "Lake Road",
  "Market Road",
  "Community Park Road",
];
const roles: [Role, string[][]][] = [
  ["citizen", citizenNames],
  ["officer", officerNames],
  ["gn", gnNames],
];
const maleIndexes: Record<string, number[]> = {
  citizen: [0, 3, 5, 7, 9, 11, 13],
  officer: [0, 2, 4, 6],
  gn: [0, 1, 3, 5],
};
const categorySchedule = [22, 20, 18, 14, 10, 6].flatMap((count, index) =>
  Array<number>(count).fill(index),
);
const stories: Record<string, string[]> = {
  water: [
    "Water supply has stopped along the residential lane since the morning.",
    "A leaking public water pipe is collecting water beside the footpath.",
    "Residents noticed discolored water after supply resumed.",
    "Water pressure is too low to reach the upper floors.",
  ],
  road: [
    "A large pothole near the junction is forcing vehicles into the opposite lane.",
    "Broken pavement is making the walkway difficult for older residents.",
    "A damaged manhole cover beside the crossing needs attention.",
    "Roadside drainage is blocked and rainwater is collecting near the bus stop.",
  ],
  garbage: [
    "Household waste has not been collected at the usual collection point.",
    "Public bins beside the junction are overflowing onto the footpath.",
    "Waste has been dumped on the vacant public strip beside the road.",
    "Litter around the market entrance needs a scheduled cleaning visit.",
  ],
  light: [
    "The street light near the crossing has not worked for several nights.",
    "A street light flickers repeatedly and leaves the footpath dark.",
    "A damaged lighting pole near the road edge needs inspection.",
    "Residents request a light for the dark stretch beside the community hall.",
  ],
  environment: [
    "The neighborhood park needs routine path and garden maintenance.",
    "A damaged park bench has loose boards and cannot be used safely.",
    "Overgrown branches are obstructing the public walking path.",
    "Waste near the canal is affecting the shared green space.",
  ],
  other: [
    "The drinking-water point at the community hall needs maintenance.",
    "Repeated excessive evening noise is disturbing nearby households.",
    "Residents request help coordinating an animal-related public-space concern.",
    "A public notice board is damaged and important notices cannot be displayed.",
  ],
};
const statusCycle: Status[] = [
  "Submitted",
  "Assigned",
  "In Progress",
  "Resolved",
  "Resolved",
  "In Progress",
];
const prefix: Record<string, string> = {
  water: "WC",
  road: "RD",
  garbage: "GC",
  light: "SL",
  environment: "PE",
  other: "OT",
};
export interface SampleOptions {
  now?: Date;
  demo?: boolean;
  adminIds?: string[];
  categories?: Category[];
}

export function makeSampleData(options: SampleOptions = {}): AppData {
  const now = options.now || new Date();
  if (!Number.isFinite(now.getTime()))
    throw new Error("Invalid sample dataset date.");
  const users: User[] = [];
  for (const [role, names] of roles)
    names.forEach(([name, nameSi], i) =>
      users.push({
        id:
          options.demo && i === 0
            ? `${role}-demo`
            : `sample-v1-${role}-${String(i + 1).padStart(2, "0")}`,
        name,
        nameSi,
        email: `sample.${role}${String(i + 1).padStart(2, "0")}@citizenconnect.example`,
        phone: `000 000 ${String(users.length + 1).padStart(4, "0")}`,
        role,
        area: areas[i % areas.length],
        division: `Division ${String((i % 6) + 1).padStart(2, "0")}`,
        province: "Western Province",
        active:
          role === "citizen" ? i < 13 : role === "officer" ? i < 6 : i < 5,
        avatarKey: `portrait-${maleIndexes[role].includes(i) ? "man" : "woman"}-${i % 3 === 0 ? 2 : 1}`,
        sampleDataset: SAMPLE_DATASET,
      }),
    );
  if (options.demo)
    users.push({
      id: "admin-demo",
      name: "Nimal Perera",
      nameSi: "නිමල් පෙරේරා",
      email: "admin@demo.lk",
      phone: "000 000 0030",
      role: "admin",
      active: true,
      area: "Colombo 03",
      division: "Division 03",
      province: "Western Province",
      avatarKey: "portrait-man-1",
      sampleDataset: SAMPLE_DATASET,
    });
  const citizens = users.filter((u) => u.role === "citizen");
  const officers = users.filter((u) => u.role === "officer" && u.active);
  const categories = (
    options.categories ||
    serviceDefinitions.map((c) => ({ ...c, sampleDataset: SAMPLE_DATASET }))
  ).map((c) => ({ ...c, types: [...c.types] }));
  if (categories.length !== 6 || categories.some((c) => !c.types.length))
    throw new Error("Six valid category definitions are required.");
  const complaints: Complaint[] = [];
  const notifications: AppNotification[] = [];
  const admins = options.demo ? ["admin-demo"] : options.adminIds || [];
  function notify(
    userId: string,
    c: Complaint,
    status: Status,
    at: string,
    tag: string,
  ) {
    notifications.push({
      id: `sample-v1-note-${c.id}-${tag}-${userId}`,
      userId,
      complaintId: c.id,
      title:
        status === "Submitted"
          ? "New report received"
          : status === "Assigned"
            ? "Complaint assigned"
            : status === "Resolved"
              ? "Complaint resolved"
              : "Work in progress",
      body: `Sample activity: #${c.reference} — ${c.category}. Status: ${status}.`,
      createdAt: at,
      read: notifications.length % 3 === 0,
      sampleDataset: SAMPLE_DATASET,
    });
  }
  for (let round = 0; round < 6; round++)
    citizens.forEach((citizen, index) => {
      const n = round * citizens.length + index;
      const categoryIndex = categorySchedule[(n * 37) % 90];
      const definition = serviceDefinitions[categoryIndex];
      const category = categories[categoryIndex];
      const status = statusCycle[(round + (index % 3)) % 6];
      const daysAgo =
        status === "Resolved"
          ? 8 + (n % 20)
          : status === "In Progress"
            ? 3 + (n % 11)
            : status === "Assigned"
              ? 1 + (n % 4)
              : n % 3;
      const created = new Date(
        now.getTime() - (daysAgo * 24 + 1 + (n % 12)) * 3600000,
      );
      const history: Complaint["history"] = [
        {
          status: "Submitted",
          at: created.toISOString(),
          note: "Sample: citizen submitted the report through Citizen Connect.",
        },
      ];
      const officer = officers[n % officers.length];
      if (status !== "Submitted")
        history.push({
          status: "Assigned",
          at: new Date(+created + 4 * 3600000).toISOString(),
          note: `Sample: assigned to ${officer.name} for inspection.`,
        });
      if (status === "In Progress" || status === "Resolved")
        history.push({
          status: "In Progress",
          at: new Date(+created + 12 * 3600000).toISOString(),
          note: "Sample: site inspected; maintenance work scheduled with the relevant department.",
        });
      if (status === "Resolved")
        history.push({
          status: "Resolved",
          at: new Date(+created + 48 * 3600000).toISOString(),
          note: "Sample: maintenance completed and the location checked by the service team.",
        });
      const c: Complaint = {
        id: `sample-v1-report-${String(n + 1).padStart(3, "0")}`,
        reference: `SMP-${prefix[definition.id]}-${String(n + 1).padStart(3, "0")}`,
        citizenId: citizen.id,
        categoryId: category.id,
        category: category.name,
        issueType:
          category.types[(index + round) % Math.min(4, category.types.length)],
        description: `Sample scenario: ${stories[definition.id][(index + round) % 4]} Nearby landmark: the community notice board on ${streets[index % 6]}.`,
        area: citizen.area,
        division: citizen.division,
        localAuthority:
          citizen.area === "Dehiwala"
            ? "Dehiwala–Mount Lavinia MC"
            : "Colombo Municipal Council",
        address: `Sample location: ${streets[index % 6]}, ${citizen.area}`,
        priority: category.priority,
        status,
        createdAt: history[0].at,
        updatedAt: history[history.length - 1].at,
        history,
        sampleDataset: SAMPLE_DATASET,
      };
      if (n % 3 !== 0) {
        c.latitude = 6.89 + (index % 6) * 0.005;
        c.longitude = 79.85 + (index % 5) * 0.005;
      }
      if (status !== "Submitted") {
        c.assignedOfficerId = officer.id;
        c.assignmentNote = `Sample handover: inspect the reported issue, coordinate with ${c.localAuthority}, and update the citizen.`;
      }
      if (status === "Resolved" && n % 2 === 0)
        c.feedback = {
          rating: n % 4 === 0 ? 5 : 4,
          comment:
            n % 4 === 0
              ? "Sample feedback: thank you for completing the repair and keeping us informed."
              : "Sample feedback: the issue is resolved; communication was helpful.",
        };
      complaints.push(c);
      for (const entry of history)
        notify(
          c.citizenId,
          c,
          entry.status,
          entry.at,
          `citizen-${entry.status.replace(/ /g, "-")}`,
        );
      if (c.assignedOfficerId)
        notify(c.assignedOfficerId, c, status, c.updatedAt, "officer");
      for (const gn of users.filter(
        (u) => u.role === "gn" && u.active && u.division === c.division,
      ))
        notify(gn.id, c, status, c.updatedAt, "gn");
      if (n % 3 === 0)
        for (const admin of admins)
          notify(admin, c, status, c.updatedAt, "admin");
    });
  complaints.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const departments = [
    "Road Maintenance",
    "Water Services",
    "Waste Collection",
    "Street Lighting",
    "Parks & Recreation",
    "Environmental Health",
    "Drainage Services",
    "Public Facilities",
    "Community Relations",
    "GN Coordination",
    "Road Safety",
    "Citizen Support",
  ];
  return {
    users,
    categories: categories.map((c) => (c.sampleDataset ? c : { ...c })),
    complaints,
    notifications,
    contacts: departments.map((name, i) => ({
      id: `sample-v1-contact-${i + 1}`,
      name: `${name} (Sample)`,
      phone: `000 000 ${String(100 + i).padStart(4, "0")}`,
      email: `sample.department${i + 1}@citizenconnect.example`,
      sampleDataset: SAMPLE_DATASET,
    })),
  };
}
