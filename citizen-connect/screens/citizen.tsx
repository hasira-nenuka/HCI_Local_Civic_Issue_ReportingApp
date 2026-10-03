import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
import { Complaint } from "../types/models";
import { dateLabel, visibleComplaints, canManage } from "../utils/complaints";
import { theme } from "../constants/theme";
export function ComplaintCard({
  complaint,
  onPress,
}: {
  complaint: Complaint;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress}>
      <View style={s.between}>
        <View style={{ flex: 1 }}>
          <Text style={s.bold}>{complaint.category}</Text>
          <Hint>
            #{complaint.reference}
            {"\n"}
            {dateLabel(complaint.createdAt)}
          </Hint>
        </View>
        <Badge status={complaint.status} />
      </View>
    </Card>
  );
}
export function HomeScreen() {
  const { user, data } = useApp();
  const nav = useRouter();
  return (
    <Screen>
      <Title>Hello, {user!.name.split(" ")[0]} 👋</Title>
      <Hint>Together for a cleaner & safer community.</Hint>
      <Card
        onPress={() => nav.navigate("/Category")}
        style={{
          backgroundColor: theme.blue,
          borderColor: theme.blue,
          marginTop: 16,
          paddingVertical: 25,
        }}
      >
        <View style={s.between}>
          <View>
            <Text style={{ ...s.bold, color: "white", fontSize: 18 }}>
              Report an Issue
            </Text>
            <Text style={{ color: "#d9e8ff", fontSize: 11, marginTop: 8 }}>
              Share your concern with the right authority.
            </Text>
          </View>
          <Ionicons name="add-circle" size={38} color="white" />
        </View>
      </Card>
      <Row
        title="My Reports"
        subtitle="View and track submitted reports."
        onPress={() => nav.navigate("/Main/My Reports")}
        icon="📋"
      />
      <Row
        title="Notifications"
        subtitle="Check latest status updates."
        onPress={() => nav.navigate("/Notifications")}
        icon="🔔"
      />
      <Text style={s.section}>Quick Categories</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {data.categories.slice(0, 3).map((c) => (
          <Pressable
            accessibilityRole="button"
            key={c.id}
            style={{
              backgroundColor: c.color,
              borderRadius: 13,
              flex: 1,
              padding: 15,
              alignItems: "center",
            }}
            onPress={() =>
              nav.navigate({
                pathname: "/CategoryInfo",
                params: { categoryId: c.id },
              })
            }
          >
            <Text style={{ fontSize: 34 }}>{c.icon}</Text>
            <Text
              style={{
                fontSize: 10,
                color: theme.ink,
                marginTop: 9,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {c.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <Hint>Choose a category to learn what you can report.</Hint>
    </Screen>
  );
}
export function CategoryScreen() {
  const { data } = useApp();
  const nav = useRouter();
  return (
    <Screen>
      <Text style={s.bold}>Select a category</Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 22,
        }}
      >
        {data.categories.map((c) => (
          <Pressable
            accessibilityRole="button"
            key={c.id}
            onPress={() =>
              nav.navigate({
                pathname: "/ReportWizard",
                params: { categoryId: c.id },
              })
            }
            style={{
              width: "30%",
              minHeight: 117,
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
            }}
          >
            <Text style={{ fontSize: 39, marginBottom: 10 }}>{c.icon}</Text>
            <Text
              style={{
                fontSize: 11,
                color: theme.ink,
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              {c.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
export function CategoryInfoScreen() {
  const { categoryId } = useLocalSearchParams<RootParams["CategoryInfo"]>();
  const { data } = useApp();
  const nav = useRouter();
  const c = data.categories.find((c) => c.id === categoryId);
  if (!c)
    return (
      <Screen>
        <Hint>This category is no longer available.</Hint>
      </Screen>
    );
  return (
    <Screen>
      <View style={{ alignItems: "center", marginTop: 30, marginBottom: 22 }}>
        <Text style={{ fontSize: 80 }}>{c.icon}</Text>
        <Title>{c.name}</Title>
      </View>
      <Hint>{c.description}</Hint>
      <Card style={{ backgroundColor: "#eaf2ff", marginTop: 65 }}>
        <Text style={{ ...s.bold, color: theme.blue }}>Tip</Text>
        <Hint>
          Add a clear photo and confirm the exact location for faster
          processing.
        </Hint>
      </Card>
      <Button
        title="Continue"
        onPress={() =>
          nav.navigate({ pathname: "/ReportWizard", params: { categoryId } })
        }
      />
    </Screen>
  );
}
export function ReportsScreen() {
  const { data, user } = useApp();
  const nav = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const complaints = visibleComplaints(data, user!).filter(
    (c) =>
      (filter === "All" || c.status === filter) &&
      `${c.reference} ${c.category} ${c.description} ${c.area}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <Screen>
      <Search
        value={search}
        onChangeText={setSearch}
        placeholder="Search reports..."
      />
      <Chips
        items={
          user!.role === "citizen"
            ? ["All", "In Progress", "Resolved", "Submitted"]
            : ["All", "Submitted", "Assigned", "In Progress", "Resolved"]
        }
        value={filter}
        onChange={setFilter}
      />
      {complaints.map((c) => (
        <ComplaintCard
          key={c.id}
          complaint={c}
          onPress={() =>
            nav.navigate({ pathname: "/Details", params: { id: c.id } })
          }
        />
      ))}
      {!complaints.length && (
        <Card>
          <Hint>No reports match your search.</Hint>
        </Card>
      )}
    </Screen>
  );
}
export function ConfirmationScreen() {
  const { id } = useLocalSearchParams<RootParams["Confirmation"]>();
  const { data } = useApp();
  const nav = useRouter();
  const c = data.complaints.find((c) => c.id === id);
  return (
    <Screen>
      <View style={{ alignItems: "center", marginTop: 45, marginBottom: 28 }}>
        <Text style={{ fontSize: 65, marginBottom: 18 }}>🎉</Text>
        <Title>Report Submitted!</Title>
        <Hint>Your complaint has been successfully submitted.</Hint>
      </View>
      <Card style={{ alignItems: "center", paddingVertical: 26 }}>
        <Hint>Complaint ID</Hint>
        <Text style={{ color: theme.blue, fontWeight: "700", fontSize: 21 }}>
          #{c?.reference}
        </Text>
      </Card>
      <Button
        title="Track My Report"
        onPress={() => nav.replace({ pathname: "/Track", params: { id } })}
      />
      <Button
        title="Back to Home"
        secondary
        onPress={() => nav.dismissTo("/Main/Home")}
      />
    </Screen>
  );
}
export function DetailsScreen() {
  const { id } = useLocalSearchParams<RootParams["Details"]>();
  const app = useApp();
  const nav = useRouter();
  const c = visibleComplaints(app.data, app.user!).find((c) => c.id === id);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  if (!c)
    return (
      <Screen>
        <Hint>Report not found or unavailable for your account.</Hint>
      </Screen>
    );
  async function remove() {
    try {
      await app.deleteReport(id);
      nav.back();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Screen>
      <ComplaintCard
        complaint={c}
        onPress={() => nav.navigate({ pathname: "/Track", params: { id } })}
      />
      {[
        ["Submitted", dateLabel(c.createdAt)],
        ["Location", c.address],
        ["Area", c.area],
        ["Authority", c.localAuthority],
        ["Division", c.division],
        ["Category", c.category],
        ["Type", c.issueType],
        ["Priority", c.priority],
        ["Description", c.description],
      ].map(([key, val]) => (
        <View
          key={key}
          style={{ flexDirection: "row", gap: 20, marginVertical: 10 }}
        >
          <Text style={{ ...s.hint, width: 80 }}>{key}</Text>
          <Text style={{ ...s.text, flex: 1, lineHeight: 21 }}>{val}</Text>
        </View>
      ))}
      {c.imageUrl && (
        <Image
          source={{ uri: c.imageUrl }}
          accessibilityLabel="Complaint photo"
          style={{
            width: "100%",
            height: 190,
            borderRadius: 12,
            marginVertical: 16,
          }}
        />
      )}
      <Button
        title="Track Complaint"
        onPress={() => nav.navigate({ pathname: "/Track", params: { id } })}
      />
      <Button
        title="View Location"
        secondary
        onPress={() =>
          import("react-native").then(({ Linking }) =>
            Linking.openURL(
              `https://www.openstreetmap.org/?mlat=${c.latitude}&mlon=${c.longitude}#map=17/${c.latitude}/${c.longitude}`,
            ),
          )
        }
      />
      {canManage(app.user!) && c.status !== "Resolved" && (
        <Button
          title="Assign details"
          onPress={() => nav.navigate({ pathname: "/Assign", params: { id } })}
        />
      )}
      {app.user!.id === c.citizenId && c.status === "Submitted" && (
        <>
          <Button
            title="Edit Report"
            secondary
            onPress={() =>
              nav.navigate({ pathname: "/EditReport", params: { id } })
            }
          />
          <Button
            title={confirm ? "Confirm deletion" : "Delete Report"}
            danger
            onPress={() => (confirm ? remove() : setConfirm(true))}
            disabled={app.busy}
          />
          {confirm && (
            <Button
              title="Keep report"
              secondary
              onPress={() => setConfirm(false)}
            />
          )}
        </>
      )}
      <ErrorText message={error} />
    </Screen>
  );
}
export function EditReportScreen() {
  const { id } = useLocalSearchParams<RootParams["EditReport"]>();
  const app = useApp();
  const nav = useRouter();
  const c = app.data.complaints.find((c) => c.id === id);
  const [description, setDescription] = useState(c?.description || "");
  const [error, setError] = useState("");
  return (
    <Screen>
      <Hint>You can edit a report until an officer has been assigned.</Hint>
      <Field
        label="Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />
      <ErrorText message={error} />
      <Button
        title="Save Changes"
        busy={app.busy}
        onPress={async () => {
          try {
            await app.editReport(id, description);
            nav.back();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
    </Screen>
  );
}
