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
  useUIStyles,
} from "../components/ui";
import { useApp } from "../hooks/AppContext";
import { RootParams } from "../navigation/types";
import { Complaint } from "../types/models";
import { dateLabel, visibleComplaints, canManage } from "../utils/complaints";
import { CommunityArtwork, CategoryArtwork } from "../components/Artwork";
import { AdminHero } from "../components/AdminDesign";
import { useTheme } from "../hooks/AppearanceContext";
import {
  CitizenHero,
  CitizenMetrics,
  CitizenSection,
} from "../components/CitizenDesign";
import { unreadCount } from "../utils/notifications";
export function ComplaintCard({
  complaint,
  onPress,
}: {
  complaint: Complaint;
  onPress: () => void;
}) {
  const s = useUIStyles();
  const { data } = useApp();
  const category = data.categories.find(
    (c) => c.id === complaint.categoryId,
  ) || { id: complaint.categoryId, name: complaint.category, icon: "other" };
  return (
    <Card onPress={onPress}>
      <View style={s.between}>
        <CategoryArtwork category={category} size={44} />
        <View style={{ flex: 1 }}>
          <Text style={s.bold}>{complaint.category}</Text>
          <Hint>
            #{complaint.reference}
            {complaint.sampleDataset ? " | Sample" : ""}
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
  const theme = useTheme();
  const s = useUIStyles();
  const { user, data } = useApp();
  const nav = useRouter();
  const reports = visibleComplaints(data, user!);
  const unread = unreadCount(data.notifications, user!.id);
  return (
    <Screen>
      <CitizenHero
        title={`Hello, ${user!.name.split(" ")[0]}`}
        subtitle="Small actions. Better neighborhoods. Let's make a difference together."
      />
      <CitizenMetrics
        items={[
          { label: "My reports", value: reports.length, tone: "blue" },
          {
            label: "Open reports",
            value: reports.filter((c) => c.status !== "Resolved").length,
            tone: "amber",
          },
          {
            label: "Resolved",
            value: reports.filter((c) => c.status === "Resolved").length,
            tone: "mint",
          },
        ]}
      />
      <Card
        onPress={() => nav.navigate("/Category")}
        style={{
          backgroundColor: theme.primary,
          borderColor: theme.blue,
          marginTop: 16,
          paddingVertical: 25,
        }}
      >
        <View style={s.between}>
          <View style={{ flex: 1 }}>
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
        subtitle={
          unread
            ? `${unread} unread updates about your reports`
            : "You're all caught up. View your report updates."
        }
        onPress={() => nav.navigate("/Notifications")}
        icon="🔔"
      />
      <CitizenSection
        title="Explore services"
        caption="Choose a service to learn more before reporting."
      />
      <View style={{ flexDirection: "row", gap: 10 }}>
        {data.categories.slice(0, 3).map((c) => (
          <Pressable
            accessibilityRole="button"
            key={c.id}
            style={{
              backgroundColor: theme.dark ? theme.surface : c.color,
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
            <CategoryArtwork category={c} size={64} />
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
  const theme = useTheme();
  const s = useUIStyles();
  const { data } = useApp();
  const nav = useRouter();
  return (
    <Screen>
      <CitizenHero
        title="What needs attention?"
        subtitle="Choose the service that best matches your issue. We'll guide you from here."
        eyebrow="REPORT AN ISSUE"
        art={false}
      />
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
              width: "47%",
              minHeight: 145,
              backgroundColor: theme.dark ? theme.surface : c.color,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
            }}
          >
            <CategoryArtwork category={c} size={74} />
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
  const theme = useTheme();
  const s = useUIStyles();
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
        <CategoryArtwork category={c} size={180} animated />
        <Title>{c.name}</Title>
      </View>
      <Hint>{c.description}</Hint>
      <Card style={{ backgroundColor: theme.softBlue, marginTop: 28 }}>
        <Text style={{ ...s.bold, color: theme.blue }}>Tip</Text>
        <Hint>
          Include a clear description and an address or nearby landmark. Photos
          and GPS coordinates are optional.
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
  const s = useUIStyles();
  const { data, user } = useApp();
  const nav = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const complaints = visibleComplaints(data, user!)
    .filter(
      (c) =>
        (filter === "All" || c.status === filter) &&
        `${c.reference} ${c.category} ${c.description} ${c.area}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <Screen>
      {user!.role === "citizen" && (
        <CitizenHero
          title="Your voice, in action"
          subtitle="Every report counts. Follow your community's progress here."
          eyebrow="MY REPORTS"
          art={false}
        />
      )}
      {user!.role !== "citizen" && (
        <AdminHero
          title="Every issue, in focus"
          subtitle="Search reports and filter by status to find the next action."
          eyebrow="COMPLAINTS WORKSPACE"
        />
      )}
      <Search
        value={search}
        onChangeText={setSearch}
        placeholder="Search reports..."
      />
      <Chips
        items={
          user!.role === "citizen"
            ? ["All", "Submitted", "Assigned", "In Progress", "Resolved"]
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
        <Card style={{ alignItems: "center", paddingVertical: 24 }}>
          <CommunityArtwork size={140} />
          <Text style={{ ...s.bold, marginTop: 16 }}>
            Your community journey starts here
          </Text>
          <Hint>No reports match your search.</Hint>
        </Card>
      )}
    </Screen>
  );
}
export function ConfirmationScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<RootParams["Confirmation"]>();
  const { data } = useApp();
  const nav = useRouter();
  const c = data.complaints.find((c) => c.id === id);
  return (
    <Screen>
      <View style={{ alignItems: "center", marginTop: 45, marginBottom: 28 }}>
        <CommunityArtwork variant="submitted" size={190} animated />
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
  const s = useUIStyles();
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
      {app.user!.role === "citizen" && (
        <CitizenHero
          title="Your report details"
          subtitle="Everything you shared, with the latest status in one place."
          eyebrow="REPORT OVERVIEW"
          art={false}
        />
      )}
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
      {typeof c.latitude === "number" && typeof c.longitude === "number" && (
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
      )}
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
      <CitizenHero
        title="Add the details that matter"
        subtitle="Keep your description clear so your service team can help."
        eyebrow="EDIT REPORT"
        art={false}
      />
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
