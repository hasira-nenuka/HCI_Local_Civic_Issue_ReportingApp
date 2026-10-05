import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Linking, Text, View } from "react-native";
import {
  Badge,
  Button,
  Card,
  Chips,
  ErrorText,
  Field,
  Hint,
  Row,
  Screen,
  Search,
  Title,
  s,
} from "../components/ui";
import { useApp } from "../hooks/AppContext";
import { RootParams } from "../navigation/types";
import { Category, Contact, Priority, Role, User } from "../types/models";
import { uid, visibleComplaints } from "../utils/complaints";
import { ComplaintCard } from "./citizen";
import { theme } from "../constants/theme";
export function DashboardScreen() {
  const app = useApp();
  const nav = useRouter();
  const reports = visibleComplaints(app.data, app.user!);
  return (
    <Screen>
      <Title>
        Hello,{" "}
        {app.user!.role === "admin" ? "Admin" : app.user!.name.split(" ")[0]} 👋
      </Title>
      <Hint>
        {app.user!.role === "gn"
          ? `Monitoring ${app.user!.division}`
          : "Here's the latest overview."}
      </Hint>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 16,
        }}
      >
        {[
          ["Total Complaints", reports.length, "📁"],
          ["New", reports.filter((c) => c.status === "Submitted").length, "🟢"],
          [
            "In Progress",
            reports.filter(
              (c) => c.status === "Assigned" || c.status === "In Progress",
            ).length,
            "📊",
          ],
          [
            "Resolved",
            reports.filter((c) => c.status === "Resolved").length,
            "✅",
          ],
        ].map(([label, count, icon]) => (
          <Card key={label} style={{ width: "48%", marginBottom: 0 }}>
            <View style={s.inline}>
              <Text style={{ fontSize: 26 }}>{icon}</Text>
              <View>
                <Text
                  style={{ fontSize: 24, color: theme.blue, fontWeight: "700" }}
                >
                  {count}
                </Text>
                <Text style={{ fontSize: 10, color: theme.muted }}>
                  {label}
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
      <Text style={s.section}>Recent Complaints</Text>
      {reports.slice(0, 3).map((c) => (
        <ComplaintCard
          key={c.id}
          complaint={c}
          onPress={() =>
            nav.navigate({ pathname: "/Details", params: { id: c.id } })
          }
        />
      ))}
      <Text style={s.section}>Complaints by Category</Text>
      <CategoryChart />
    </Screen>
  );
}
function CategoryChart() {
  const app = useApp();
  const reports = visibleComplaints(app.data, app.user!);
  const counts = app.data.categories.map((c) => ({
    ...c,
    count: reports.filter((r) => r.categoryId === c.id).length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));
  return (
    <Card>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-around",
          gap: 8,
          minHeight: 135,
        }}
      >
        {counts.map((c, i) => (
          <View key={c.id} style={{ flex: 1, alignItems: "center", gap: 8 }}>
            <Text style={{ color: theme.muted, fontSize: 11 }}>{c.count}</Text>
            <View
              style={{
                height: Math.max(4, (c.count / max) * 80),
                width: "80%",
                backgroundColor: [
                  theme.blue,
                  "#e79125",
                  theme.green,
                  "#8558df",
                ][i % 4],
                borderRadius: 5,
              }}
            />
            <Text
              style={{ fontSize: 9, color: theme.muted, textAlign: "center" }}
            >
              {c.name.replace(" Complaint", "")}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
export function AnalyticsScreen() {
  const app = useApp();
  const nav = useRouter();
  const reports = visibleComplaints(app.data, app.user!);
  return (
    <Screen>
      <Title>Complaint Progress</Title>
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
  return (
    <Screen>
      {app.user!.role === "admin" && (
        <>
          <Row
            title="Service Categories"
            icon="🗂️"
            onPress={() => nav.navigate("/Categories")}
          />
          <Row
            title="User Management"
            icon="👥"
            onPress={() => nav.navigate({ pathname: "/Users", params: {} })}
          />
          <Row
            title="Officer Management"
            icon="👮"
            onPress={() =>
              nav.navigate({ pathname: "/Users", params: { role: "officer" } })
            }
          />
          <Row
            title="GN Management"
            icon="👤"
            onPress={() =>
              nav.navigate({ pathname: "/Users", params: { role: "gn" } })
            }
          />
        </>
      )}
      <Row
        title="Contact Finder"
        icon="🔎"
        onPress={() => nav.navigate("/Contacts")}
      />
      <Row
        title="My Profile"
        icon="👤"
        onPress={() => nav.navigate("/OfficerProfile")}
      />
      <Row
        title="Help & Support"
        icon="💬"
        onPress={() => nav.navigate("/Support")}
      />
      <Row title="About App" icon="🏛️" onPress={() => nav.navigate("/About")} />
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
      <Row
        title="Add new category"
        subtitle="Set name, issue types and priority"
        icon="➕"
        onPress={() => nav.navigate({ pathname: "/CategoryEdit", params: {} })}
      />
      {app.data.categories.map((c) => (
        <Row
          key={c.id}
          title={c.name}
          subtitle={`${c.types.length} issue types · ${c.priority} priority`}
          icon={c.icon}
          onPress={() =>
            nav.navigate({ pathname: "/CategoryEdit", params: { id: c.id } })
          }
        />
      ))}
    </Screen>
  );
}
export function CategoryEditScreen() {
  const { id } = useLocalSearchParams<RootParams["CategoryEdit"]>();
  const app = useApp();
  const nav = useRouter();
  const existing = app.data.categories.find((c) => c.id === id);
  const [name, setName] = useState(existing?.name || "");
  const [icon, setIcon] = useState(existing?.icon || "📌");
  const [description, setDescription] = useState(existing?.description || "");
  const [types, setTypes] = useState(existing?.types.join("\n") || "");
  const [priority, setPriority] = useState<Priority>(
    existing?.priority || "Medium",
  );
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  return (
    <Screen>
      <Field label="Category Name" value={name} onChangeText={setName} />
      <Field label="Icon (emoji)" value={icon} onChangeText={setIcon} />
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
            id: id || uid(),
            name: name.trim(),
            icon,
            color: existing?.color || "#eaf2ff",
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
        `${u.name} ${u.email} ${u.division}`
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
              <Text style={{ fontSize: 29 }}>👤</Text>
              <View>
                <Text style={s.bold}>{u.name}</Text>
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
                secondary
                onPress={() => open(`tel:${c.phone.replace(/\s/g, "")}`)}
              />
              <Button
                title="Email"
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
