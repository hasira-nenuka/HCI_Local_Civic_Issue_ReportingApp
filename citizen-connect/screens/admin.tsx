import { useTheme } from "../hooks/AppearanceContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import {
  Badge,
  Button,
  Card,
  Chips,
  ErrorText,
  Field,
  Hint,
  Screen,
  Search,
  useUIStyles,
} from "../components/ui";
import { useApp } from "../hooks/AppContext";
import { RootParams } from "../navigation/types";
import { Category, Contact, Priority, Role, User } from "../types/models";
import { uid, visibleComplaints } from "../utils/complaints";
import { ComplaintCard } from "./citizen";
import { CategoryArtwork } from "../components/Artwork";
import {
  AdminHero,
  AdminLink,
  AdminSection,
  AdminStat,
  StaffAvatar,
  adminColors,
  useAdminStyles,
} from "../components/AdminDesign";
import { categories as categoryPresets } from "../constants/catalog";
export function DashboardScreen() {
  const s = useUIStyles();
  const a = useAdminStyles();
  const app = useApp();
  const nav = useRouter();
  const reports = visibleComplaints(app.data, app.user!);
  const resolved = reports.filter((c) => c.status === "Resolved").length;
  const recent = [...reports]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);
  return (
    <Screen>
      <AdminHero
        dark
        eyebrow={
          app.user!.role === "admin" ? "ADMIN WORKSPACE" : "OFFICER WORKSPACE"
        }
        title={`Hello, ${app.user!.name.split(" ")[0]}`}
        subtitle={
          app.user!.role === "gn"
            ? `Your community overview for ${app.user!.division}.`
            : "A clearer picture. A better community."
        }
      />
      {reports.some((c) => c.sampleDataset) && (
        <Hint>
          Includes clearly labeled sample scenarios from a four-week activity
          dataset.
        </Hint>
      )}
      <View style={{ ...a.between, marginBottom: 12 }}>
        <Text style={a.section}>At a glance</Text>
        <Text style={a.caption}>Live complaint totals</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <AdminStat
          label="Total complaints"
          count={reports.length}
          icon="file-tray-full-outline"
          tone="blue"
        />
        <AdminStat
          label="New submissions"
          count={reports.filter((c) => c.status === "Submitted").length}
          icon="sparkles-outline"
          tone="amber"
        />
        <AdminStat
          label="In progress"
          count={
            reports.filter(
              (c) => c.status === "Assigned" || c.status === "In Progress",
            ).length
          }
          icon="time-outline"
          tone="violet"
        />
        <AdminStat
          label="Resolved"
          count={resolved}
          icon="checkmark-done-outline"
          tone="mint"
        />
      </View>
      <Card
        style={{
          marginTop: 14,
          backgroundColor: "#e5f6ef",
          borderColor: "#c9e9da",
        }}
      >
        <View style={a.between}>
          <View style={{ flex: 1 }}>
            <Text style={{ ...s.bold, color: "#146c54" }}>Resolution rate</Text>
            <Text
              style={{
                color: "#28644f",
                fontSize: 12,
                lineHeight: 19,
                marginTop: 4,
              }}
            >
              {resolved} of {reports.length} complaints resolved
            </Text>
          </View>
          <Text style={{ fontSize: 28, color: "#146c54", fontWeight: "800" }}>
            {reports.length ? Math.round((resolved / reports.length) * 100) : 0}
            %
          </Text>
        </View>
        <View
          style={{
            height: 7,
            borderRadius: 5,
            backgroundColor: "#cce9db",
            overflow: "hidden",
            marginTop: 8,
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${reports.length ? (resolved / reports.length) * 100 : 0}%`,
              backgroundColor: "#209c78",
              borderRadius: 5,
            }}
          />
        </View>
      </Card>
      <AdminSection
        title="Quick actions"
        caption="Keep your community moving"
      />
      <AdminLink
        title="Review complaints"
        subtitle="Open reports, assign officers and take action"
        icon="documents-outline"
        onPress={() => nav.navigate("/Main/Complaints")}
      />
      {app.user!.role === "admin" && (
        <AdminLink
          title="Manage your team"
          subtitle="People, roles and account access"
          icon="people-outline"
          tone="violet"
          onPress={() => nav.navigate({ pathname: "/Users", params: {} })}
        />
      )}
      <AdminSection
        title="Recent complaints"
        caption="Most recently submitted"
        action="View all"
        onPress={() => nav.navigate("/Main/Complaints")}
      />
      {recent.map((c) => (
        <ComplaintCard
          key={c.id}
          complaint={c}
          onPress={() =>
            nav.navigate({ pathname: "/Details", params: { id: c.id } })
          }
        />
      ))}
      {!recent.length && (
        <Card>
          <Hint>No complaints yet. New citizen reports will appear here.</Hint>
        </Card>
      )}
      <AdminSection
        title="Service overview"
        caption="Complaint volume by category"
      />
      <CategoryChart />
    </Screen>
  );
}
function CategoryChart() {
  const theme = useTheme();
  const s = useUIStyles();
  const a = useAdminStyles();
  const app = useApp();
  const reports = visibleComplaints(app.data, app.user!);
  const counts = app.data.categories.map((c) => ({
    ...c,
    count: reports.filter((r) => r.categoryId === c.id).length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));
  const colors = ["#1769df", "#b77417", "#188565", "#7450b5"];
  return (
    <Card>
      {counts.map((c, i) => (
        <View
          key={c.id}
          style={{ marginBottom: i === counts.length - 1 ? 0 : 20 }}
        >
          <View style={{ ...a.between, marginBottom: 9 }}>
            <Text style={{ ...s.bold, fontSize: 12, flex: 1 }}>
              {c.name.replace(" Complaint", "")}
            </Text>
            <Text
              style={{
                color: theme.dark ? theme.ink : colors[i % 4],
                fontWeight: "800",
                fontSize: 14,
              }}
            >
              {c.count}
            </Text>
          </View>
          <View
            style={{
              height: 9,
              backgroundColor: theme.border,
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${(c.count / max) * 100}%`,
                height: "100%",
                backgroundColor: colors[i % 4],
                borderRadius: 6,
              }}
            />
          </View>
        </View>
      ))}
      {!counts.length && (
        <Hint>Add service categories to see complaint volumes.</Hint>
      )}
    </Card>
  );
}
export function AnalyticsScreen() {
  const app = useApp();
  const nav = useRouter();
  const reports = visibleComplaints(app.data, app.user!);
  return (
    <Screen>
      <AdminHero
        title="Progress that matters"
        subtitle="Follow the journey from a citizen report to a resolved issue."
        eyebrow="SERVICE PERFORMANCE"
      />
      <Hint>
        Choose a complaint to view its timeline
        {app.user!.role === "gn"
          ? " and coordinate with the assigned officer."
          : " or update its status."}
      </Hint>
      <CategoryChart />
      {reports.map((c) => (
        <ComplaintCard
          key={c.id}
          complaint={c}
          onPress={() =>
            nav.navigate({ pathname: "/Track", params: { id: c.id } })
          }
        />
      ))}
    </Screen>
  );
}
export function SettingsScreen() {
  const app = useApp();
  const nav = useRouter();
  const [restrictedSection, setRestrictedSection] = useState("");
  return (
    <Screen>
      <AdminHero
        title="Your workspace"
        subtitle="Organize services, support your team and manage community resources."
        eyebrow="MANAGEMENT HUB"
        art="team"
      />
      {restrictedSection !== "" && (
        <Card>
          <Text accessibilityRole="alert">
            Administrator access required. Log in with an administrator account
            to access {restrictedSection}. Officer and GN accounts cannot manage
            staff accounts.
          </Text>
          <Button title="OK" onPress={() => setRestrictedSection("")} />
        </Card>
      )}
      {app.user!.role === "admin" && (
        <>
          <AdminSection
            title="People & services"
            caption="Manage the essentials in one place"
          />
          <AdminLink
            title="Service Categories"
            subtitle="Issue types, descriptions and priorities"
            icon="layers-outline"
            tone="amber"
            onPress={() => nav.navigate("/Categories")}
          />
          <AdminLink
            title="User Management"
            subtitle="Citizen profiles and account access"
            icon="people-outline"
            tone="violet"
            onPress={() => nav.navigate({ pathname: "/Users", params: {} })}
          />
          <AdminLink
            title="Officer Management"
            subtitle="Your service delivery team"
            icon="shield-checkmark-outline"
            onPress={() =>
              nav.navigate({ pathname: "/Users", params: { role: "officer" } })
            }
          />
          <AdminLink
            title="GN Management"
            subtitle="Local division coordinators"
            icon="map-outline"
            tone="mint"
            onPress={() =>
              nav.navigate({ pathname: "/Users", params: { role: "gn" } })
            }
          />
        </>
      )}
      {(app.user!.role === "officer" || app.user!.role === "gn") && (
        <>
          <AdminSection
            title="Team management"
            caption="Administrator access required"
          />
          <AdminLink
            title="Officer Management"
            subtitle="Administrator access only"
            icon="shield-checkmark-outline"
            onPress={() => setRestrictedSection("Officer Management")}
          />
          <AdminLink
            title="GN Management"
            subtitle="Administrator access only"
            icon="map-outline"
            tone="mint"
            onPress={() => setRestrictedSection("GN Management")}
          />
        </>
      )}
      <AdminSection title="Resources & account" />
      <AdminLink
        title="Contact Finder"
        subtitle="Reach the right department"
        icon="call-outline"
        tone="mint"
        onPress={() => nav.navigate("/Contacts")}
      />
      <AdminLink
        title="My Profile"
        subtitle="Personal information and sign-in settings"
        icon="person-circle-outline"
        onPress={() => nav.navigate("/OfficerProfile")}
      />
      <AdminLink
        title="Help & Support"
        subtitle="Guidance when you need it"
        icon="chatbubbles-outline"
        tone="violet"
        onPress={() => nav.navigate("/Support")}
      />
      <AdminLink
        title="About App"
        subtitle="Meet Citizen Connect"
        icon="information-circle-outline"
        tone="amber"
        onPress={() => nav.navigate("/About")}
      />
    </Screen>
  );
}
export function CategoriesScreen() {
  const app = useApp();
  const nav = useRouter();
  if (app.user!.role !== "admin")
    return (
      <Screen>
        <Hint>Administrator access is required.</Hint>
      </Screen>
    );
  return (
    <Screen>
      <AdminHero
        title="Community services"
        subtitle="Organize the issues citizens can report and set service priorities."
        eyebrow="SERVICE CATEGORIES"
      />
      <AdminLink
        title="Add new category"
        subtitle="Set name, issue types and priority"
        icon="add-circle-outline"
        onPress={() => nav.navigate({ pathname: "/CategoryEdit", params: {} })}
      />
      {app.data.categories.map((c, index) => (
        <AdminLink
          key={c.id}
          tone={(["blue", "amber", "mint", "violet"] as const)[index % 4]}
          title={c.name}
          leading={<CategoryArtwork category={c} size={58} />}
          subtitle={`${c.types.length} issue types · ${c.priority} priority`}
          icon={
            c.id === "water"
              ? "water-outline"
              : c.id === "road"
                ? "construct-outline"
                : c.id === "garbage"
                  ? "trash-outline"
                  : c.id === "light"
                    ? "bulb-outline"
                    : c.id === "environment"
                      ? "leaf-outline"
                      : "grid-outline"
          }
          onPress={() =>
            nav.navigate({ pathname: "/CategoryEdit", params: { id: c.id } })
          }
        />
      ))}
    </Screen>
  );
}
export function CategoryEditScreen() {
  const theme = useTheme();
  const s = useUIStyles();
  const { id } = useLocalSearchParams<RootParams["CategoryEdit"]>();
  const app = useApp();
  const nav = useRouter();
  const existing = app.data.categories.find((c) => c.id === id);
  const [name, setName] = useState(existing?.name || "");
  const [icon, setIcon] = useState(existing?.icon || "other");
  const [color, setColor] = useState(existing?.color || "#e7f0ff");
  const selectedIcon =
    categoryPresets.find((c) => c.id === icon || c.icon === icon)?.id ||
    "other";
  const [description, setDescription] = useState(existing?.description || "");
  const [types, setTypes] = useState(existing?.types.join("\n") || "");
  const [priority, setPriority] = useState<Priority>(
    existing?.priority || "Medium",
  );
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  return (
    <Screen>
      <AdminHero
        title={id ? "Refine a service" : "Create a service"}
        subtitle="Clear categories help citizens reach the right team."
        eyebrow="CATEGORY DETAILS"
      />
      <Field label="Category Name" value={name} onChangeText={setName} />
      <Text style={s.label}>Category illustration</Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Category illustration"
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {categoryPresets.map((preset) => (
          <Pressable
            key={preset.id}
            accessibilityRole="radio"
            accessibilityLabel={preset.name}
            accessibilityState={{ checked: selectedIcon === preset.id }}
            aria-checked={selectedIcon === preset.id}
            onPress={() => setIcon(preset.id)}
            style={{
              width: "30%",
              flexGrow: 1,
              alignItems: "center",
              gap: 8,
              padding: 12,
              borderRadius: 18,
              borderWidth: 2,
              borderColor: selectedIcon === preset.id ? "#1769df" : "#e0e6ef",
              backgroundColor: theme.surface,
            }}
          >
            <CategoryArtwork category={preset} size={48} />
            <Text
              style={{ fontSize: 11, color: theme.ink, textAlign: "center" }}
            >
              {preset.name.replace(" Complaint", "")}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.label}>Accent color</Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Category accent color"
        style={{
          flexDirection: "row",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        {Object.entries(adminColors).map(([label, value]) => (
          <Pressable
            key={label}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ checked: color === value.background }}
            aria-checked={color === value.background}
            onPress={() => setColor(value.background)}
            style={{
              minHeight: 44,
              padding: 12,
              backgroundColor: value.background,
              borderRadius: 14,
              borderWidth: 2,
              borderColor:
                color === value.background ? value.ink : "transparent",
            }}
          >
            <Text style={{ color: value.ink, fontWeight: "700", fontSize: 12 }}>
              {color === value.background ? "Selected: " : ""}
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Field
        label="Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />
      <Field
        label="Issue Types (one per line)"
        multiline
        value={types}
        onChangeText={setTypes}
      />
      <Text style={s.label}>Priority</Text>
      <Chips
        items={["Low", "Medium", "High"]}
        value={priority}
        onChange={(v) => setPriority(v as Priority)}
      />
      <ErrorText message={error} />
      <Button
        title="Save Category"
        busy={app.busy}
        onPress={async () => {
          const category: Category = {
            ...existing,
            artwork: selectedIcon,
            id: id || uid(),
            name: name.trim(),
            icon,
            color,
            description,
            types: [
              ...new Set(
                types
                  .split("\n")
                  .map((t) => t.trim())
                  .filter(Boolean),
              ),
            ],
            priority,
          };
          try {
            await app.saveCategory(category);
            nav.back();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
      {id && (
        <Button
          title={confirm ? "Confirm deletion" : "Delete Category"}
          danger
          onPress={async () => {
            if (!confirm) {
              setConfirm(true);
              return;
            }
            try {
              await app.deleteCategory(id);
              nav.back();
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        />
      )}
    </Screen>
  );
}
export function UsersScreen() {
  const s = useUIStyles();
  const a = useAdminStyles();
  const { role } = useLocalSearchParams<RootParams["Users"]>();
  const app = useApp();
  const nav = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState(false);
  const people = app.data.users
    .filter(
      (u) =>
        (!role || u.role === role) &&
        `${u.name} ${u.nameSi || ""} ${u.email} ${u.division}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (filter === "All" || (filter === "Active" ? u.active : !u.active)),
    )
    .sort((a, b) => (sort ? a.name.localeCompare(b.name) : 0));
  if (app.user!.role !== "admin")
    return (
      <Screen>
        <Hint>Administrator access is required.</Hint>
      </Screen>
    );
  return (
    <Screen>
      <AdminHero
        title={
          role === "gn"
            ? "Local coordinators"
            : role === "officer"
              ? "Your service team"
              : "People & access"
        }
        subtitle="Find profiles, review roles and manage account access."
        eyebrow="TEAM DIRECTORY"
        art="team"
      />
      <View style={{ ...a.between, marginBottom: 16 }}>
        <Text style={a.section}>
          {people.length} {people.length === 1 ? "person" : "people"}
        </Text>
        <Text style={a.caption}>
          {people.filter((u) => u.active).length} active in this view
        </Text>
      </View>
      <Search
        value={search}
        onChangeText={setSearch}
        placeholder={
          role === "gn" ? "Search GN officers..." : "Search users..."
        }
      />
      <Chips
        items={["All", "Active", "Disabled"]}
        value={filter}
        onChange={setFilter}
      />
      <Button
        title={sort ? "Original Order" : "Sort by Name"}
        secondary
        onPress={() => setSort(!sort)}
      />
      {people.map((u) => (
        <Card
          key={u.id}
          onPress={() =>
            nav.navigate({ pathname: "/UserEdit", params: { id: u.id, role } })
          }
        >
          <View style={s.between}>
            <View style={s.inline}>
              <StaffAvatar
                name={u.name}
                role={u.role}
                imageUrl={u.imageUrl}
                avatarKey={u.avatarKey}
              />
              <View style={{ flex: 1 }}>
                <Text style={s.bold}>{u.name}</Text>
                {u.nameSi && <Hint>{u.nameSi}</Hint>}
                {u.sampleDataset && <Hint>Sample profile</Hint>}
                <Hint>
                  {u.role === "gn"
                    ? "Grama Niladhari"
                    : u.role === "officer"
                      ? "Pradeshiya Sabha Officer"
                      : u.role}
                  {"\n"}
                  {u.division}
                </Hint>
              </View>
            </View>
            <Badge status={u.active ? "Active" : "Disabled"} />
          </View>
        </Card>
      ))}
      {!people.length && <Hint>No matching users.</Hint>}
      <Button
        title={
          role === "gn"
            ? "+ Add GN Officer"
            : role === "officer"
              ? "+ Add Officer"
              : "+ Add User"
        }
        onPress={() =>
          nav.navigate({ pathname: "/UserEdit", params: { role } })
        }
      />
    </Screen>
  );
}
export function UserEditScreen() {
  const s = useUIStyles();
  const { id, role: initialRole } =
    useLocalSearchParams<RootParams["UserEdit"]>();
  const app = useApp();
  const nav = useRouter();
  const existing = app.data.users.find((u) => u.id === id);
  const [name, setName] = useState(existing?.name || "");
  const [email, setEmail] = useState(existing?.email || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [division, setDivision] = useState(existing?.division || "Division 03");
  const [province, setProvince] = useState(
    existing?.province || "Western Province",
  );
  const [role, setRole] = useState<Role>(
    existing?.role || initialRole || "citizen",
  );
  const [active, setActive] = useState(existing?.active ?? true);
  const [error, setError] = useState("");
  return (
    <Screen>
      <AdminHero
        title={id ? "Account details" : "New team member"}
        subtitle="Review profile information, role and account access."
        eyebrow="PEOPLE & ACCESS"
        art="team"
      />
      <Field label="Name" value={name} onChangeText={setName} />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!app.cloud || !id}
      />
      <Field label="Mobile Number" value={phone} onChangeText={setPhone} />
      <Field label="Province" value={province} onChangeText={setProvince} />
      <Field label="Division" value={division} onChangeText={setDivision} />
      <Text style={s.label}>Role</Text>
      <Chips
        items={["citizen", "officer", "gn", "admin"]}
        value={role}
        onChange={(v) => setRole(v as Role)}
      />
      <Text style={s.label}>Account Status</Text>
      <Chips
        items={["Active", "Disabled"]}
        value={active ? "Active" : "Disabled"}
        onChange={(v) => setActive(v === "Active")}
      />
      {app.cloud && !id && (
        <Hint>
          Create the account in Firebase Authentication first, then manage its
          profile here. Client apps cannot securely create privileged accounts.
        </Hint>
      )}
      <ErrorText message={error} />
      <Button
        title="Save User"
        busy={app.busy}
        onPress={async () => {
          if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Enter a name and valid email.");
            return;
          }
          try {
            await app.saveUser({
              ...existing,
              id: id || uid(),
              name: name.trim(),
              email: email.trim(),
              phone,
              province,
              division: division.trim(),
              role,
              active,
              area: existing?.area || "Colombo 03",
            });
            nav.back();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
    </Screen>
  );
}
export function ContactsScreen() {
  const s = useUIStyles();
  const app = useApp();
  const nav = useRouter();
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const open = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      setError("No application is available to open this contact.");
    }
  };
  return (
    <Screen>
      <AdminHero
        title="The right connection"
        subtitle="Contact the departments that keep your community running."
        eyebrow="CONTACT DIRECTORY"
      />
      <Search
        value={search}
        onChangeText={setSearch}
        placeholder="Search department or service..."
      />
      <ErrorText message={error} />
      {app.data.contacts
        .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
        .map((c) => (
          <Card key={c.id}>
            <Text style={s.bold}>{c.name}</Text>
            <Hint>
              {c.phone} · {c.email}
            </Hint>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button
                title="Call"
                disabled={!!c.sampleDataset}
                secondary
                onPress={() => open(`tel:${c.phone.replace(/\s/g, "")}`)}
              />
              <Button
                title="Email"
                disabled={!!c.sampleDataset}
                secondary
                onPress={() => open(`mailto:${c.email}`)}
              />
              {app.user!.role === "admin" && (
                <Button
                  title="Edit"
                  secondary
                  onPress={() =>
                    nav.navigate({
                      pathname: "/ContactEdit",
                      params: { id: c.id },
                    })
                  }
                />
              )}
            </View>
          </Card>
        ))}
      {app.user!.role === "admin" && (
        <Button
          title="Add Contact"
          onPress={() => nav.navigate({ pathname: "/ContactEdit", params: {} })}
        />
      )}
      <Hint>
        Sample contacts are fictional. Replace them with verified authority
        contacts before deployment.
      </Hint>
    </Screen>
  );
}
export function ContactEditScreen() {
  const { id } = useLocalSearchParams<RootParams["ContactEdit"]>();
  const app = useApp();
  const nav = useRouter();
  const c = app.data.contacts.find((c) => c.id === id);
  const [name, setName] = useState(c?.name || "");
  const [phone, setPhone] = useState(c?.phone || "");
  const [email, setEmail] = useState(c?.email || "");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  return (
    <Screen>
      <AdminHero
        title={id ? "Update a contact" : "Add a department"}
        subtitle="Keep official contact information easy to find."
        eyebrow="CONTACT DETAILS"
      />
      <Field label="Department / Service" value={name} onChangeText={setName} />
      <Field
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <ErrorText message={error} />
      <Button
        title="Save Contact"
        busy={app.busy}
        onPress={async () => {
          if (
            !name.trim() ||
            !phone.trim() ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ) {
            setError("Enter a department, phone number and valid email.");
            return;
          }
          try {
            const contact: Contact = {
              ...c,
              id: id || uid(),
              name: name.trim(),
              phone,
              email,
            };
            await app.saveContact(contact);
            nav.back();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
      {id && (
        <Button
          title={confirm ? "Confirm deletion" : "Delete Contact"}
          danger
          onPress={async () => {
            if (!confirm) {
              setConfirm(true);
              return;
            }
            try {
              await app.deleteContact(id);
              nav.back();
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        />
      )}
    </Screen>
  );
}
