import { useTheme } from "../hooks/AppearanceContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import {
  Button,
  Card,
  Chips,
  ErrorText,
  Field,
  Hint,
  Row,
  Screen,
  Title,
  useUIStyles,
} from "../components/ui";
import { useApp } from "../hooks/AppContext";
import { RootParams } from "../navigation/types";
import { AdminHero, StaffAvatar } from "../components/AdminDesign";
import { VisualIcon, CommunityArtwork } from "../components/Artwork";
import { dateLabel } from "../utils/complaints";
import { pickPhoto } from "../services/media";
import { CitizenHero, CitizenSection } from "../components/CitizenDesign";
import { userNotifications, unreadCount } from "../utils/notifications";
export function ProfileScreen() {
  const s = useUIStyles();
  const app = useApp();
  const nav = useRouter();
  const [error, setError] = useState("");
  return (
    <Screen>
      {app.user!.role === "citizen" && (
        <CitizenHero
          title="Your community profile"
          subtitle="Your details, preferences and account essentials."
          eyebrow="MY ACCOUNT"
          art={false}
        />
      )}
      {app.user!.role !== "citizen" && (
        <AdminHero
          title="Your account"
          subtitle="Keep your profile current and manage your sign-in settings."
          eyebrow="PERSONAL WORKSPACE"
          art="team"
        />
      )}
      <View style={{ ...s.inline, marginBottom: 25 }}>
        <StaffAvatar
          name={app.user!.name}
          role={app.user!.role}
          imageUrl={app.user!.imageUrl}
          avatarKey={app.user!.avatarKey}
          size={70}
        />
        <View style={{ flex: 1 }}>
          <Title>{app.user!.name}</Title>
          {app.user!.nameSi && <Hint>{app.user!.nameSi}</Hint>}
          {app.user!.sampleDataset && <Hint>Fictional sample profile</Hint>}
          <Hint>
            {app.user!.phone}
            {"\n"}
            {app.user!.email}
          </Hint>
        </View>
      </View>
      {app.user!.role !== "citizen" && (
        <Card>
          <Hint>
            {app.user!.role === "gn"
              ? "Grama Niladhari"
              : app.user!.role === "admin"
                ? "Administrator"
                : "Pradeshiya Sabha Officer"}
            {"\n"}
            {app.user!.province}
            {"\n"}
            {app.user!.division}
          </Hint>
        </Card>
      )}
      <Row title="Edit Profile" onPress={() => nav.navigate("/EditProfile")} />
      <Row title="Change Password" onPress={() => nav.navigate("/Password")} />
      <Row title="Help & Support" onPress={() => nav.navigate("/Support")} />
      <Row title="About App" onPress={() => nav.navigate("/About")} />
      <ErrorText message={error} />
      <Button
        title="Log Out"
        danger
        onPress={async () => {
          try {
            await app.logout();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
    </Screen>
  );
}
export function EditProfileScreen() {
  const app = useApp();
  const nav = useRouter();
  const [name, setName] = useState(app.user!.name);
  const [phone, setPhone] = useState(app.user!.phone);
  const [image, setImage] = useState(app.user!.imageUrl);
  const [error, setError] = useState("");
  return (
    <Screen>
      {app.user!.role === "citizen" && (
        <CitizenHero
          title="Make it yours"
          subtitle="Keep your contact details up to date."
          eyebrow="EDIT PROFILE"
          art={false}
        />
      )}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <StaffAvatar
          name={app.user!.name}
          role={app.user!.role}
          imageUrl={image}
          avatarKey={app.user!.avatarKey}
          size={85}
        />
        <Button
          title="Change Photo"
          secondary
          onPress={async () => {
            try {
              const uri = await pickPhoto();
              if (uri) setImage(uri);
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        />
      </View>
      <Field label="Full Name" value={name} onChangeText={setName} />
      <Field label="Email" value={app.user!.email} editable={false} />
      <Field
        label="Mobile Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <ErrorText message={error} />
      <Button
        title="Save Changes"
        busy={app.busy}
        onPress={async () => {
          if (!name.trim()) {
            setError("Enter your name.");
            return;
          }
          try {
            await app.saveProfile({
              name: name.trim(),
              phone,
              imageUrl: image,
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
export function PasswordScreen() {
  const app = useApp();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  return (
    <Screen>
      {app.user!.role === "citizen" && (
        <CitizenHero
          title="Keep your account secure"
          subtitle="Choose a unique password you don't use elsewhere."
          eyebrow="ACCOUNT SECURITY"
          art={false}
        />
      )}
      <Hint>
        {app.cloud
          ? "Confirm your current password before choosing a new one."
          : "Password changes require Firebase Authentication. Demo accounts do not store passwords."}
      </Hint>
      {app.cloud && (
        <>
          <Field
            label="Current Password"
            secureTextEntry
            value={current}
            onChangeText={setCurrent}
          />
          <Field
            label="New Password"
            secureTextEntry
            value={next}
            onChangeText={setNext}
          />
          <Field
            label="Confirm New Password"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
          <Button
            title="Update Password"
            onPress={async () => {
              if (next.length < 8 || next !== confirm) {
                setMessage("Use at least 8 characters and matching passwords.");
                return;
              }
              try {
                await app.changePassword(current, next);
                setMessage("Password updated successfully.");
              } catch (e) {
                setMessage((e as Error).message);
              }
            }}
          />
        </>
      )}
      <Hint>{message}</Hint>
    </Screen>
  );
}
export function SupportScreen() {
  const s = useUIStyles();
  const nav = useRouter();
  return (
    <Screen>
      <CitizenHero
        title="How can we help?"
        subtitle="A little guidance for a smoother community reporting experience."
        eyebrow="HELP & SUPPORT"
      />
      <Card>
        <Text style={s.bold}>Reporting an issue</Text>
        <Hint>
          Choose a category and type, select your area and authority, add a
          description and photo, then confirm the location.
        </Hint>
      </Card>
      <Card>
        <Text style={s.bold}>Following up</Text>
        <Hint>
          Open My Reports and select a complaint to see its progress. You can
          edit or delete a report while it is Submitted.
        </Hint>
      </Card>
      <Card>
        <Text style={s.bold}>Location permission</Text>
        <Hint>
          GPS and photos are optional. Enter an address or nearby landmark so
          your service team can find the issue. Coordinates can be added if
          available.
        </Hint>
      </Card>
      <Button
        title="Find Service Contacts"
        onPress={() => nav.navigate("/Contacts")}
      />
    </Screen>
  );
}
export function AboutScreen() {
  return (
    <Screen>
      <View style={{ alignItems: "center", marginVertical: 30 }}>
        <CommunityArtwork size={150} animated />
        <Title>Citizen Connect</Title>
        <Hint>Local Civic-Issue Reporting System · Version 1.0</Hint>
      </View>
      <Card>
        <Hint>
          IT3060 Human–Computer Interaction{"\n"}Group 2026-WE-156{"\n\n"}A
          university mobile application connecting citizens, Pradeshiya Sabha
          officers and Grama Niladharis to improve local civic reporting.
        </Hint>
      </Card>
      <Hint>
        Demo contacts and complaint records are fictional. This application is
        not an official government service.
      </Hint>
    </Screen>
  );
}
export function NotificationsScreen() {
  const theme = useTheme();
  const s = useUIStyles();
  const app = useApp();
  const nav = useRouter();
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [opening, setOpening] = useState(false);
  const all = userNotifications(app.data.notifications, app.user!.id);
  const unread = unreadCount(all, app.user!.id);
  const list = all.filter((n) => filter === "All" || !n.read);
  return (
    <Screen>
      {app.user!.role === "citizen" && (
        <CitizenHero
          title="You're in the loop"
          subtitle="Report confirmations, assignments and progress updates, all in one place."
          eyebrow="NOTIFICATIONS"
          art={false}
        />
      )}
      {app.user!.role !== "citizen" && (
        <AdminHero
          title="Stay in the loop"
          subtitle="Your latest complaint updates, in one place."
          eyebrow="NOTIFICATIONS"
        />
      )}
      <ErrorText message={error} />
      <CitizenSection
        title={unread ? `${unread} unread updates` : "You're all caught up"}
        caption="Latest updates appear first. Open an update to mark it as read."
      />
      <Chips items={["All", "Unread"]} value={filter} onChange={setFilter} />
      {list.map((n) => (
        <Card
          key={n.id}
          style={{
            backgroundColor: n.read ? theme.surface : theme.softBlue,
            borderLeftWidth: n.read ? 1 : 4,
            borderLeftColor: n.read ? theme.border : theme.blue,
          }}
          onPress={async () => {
            if (opening || app.busy) return;
            setOpening(true);
            setError("");
            try {
              if (!n.read) await app.readNotification(n.id);
              nav.navigate({
                pathname: "/NotificationDetail",
                params: { id: n.id },
              });
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setOpening(false);
            }
          }}
        >
          <View style={s.inline}>
            <VisualIcon symbol="notifications" size={25} />
            <View style={{ flex: 1 }}>
              <Text style={s.bold}>{n.title}</Text>
              {!n.read && (
                <Text
                  style={{
                    color: theme.blue,
                    fontSize: 11,
                    fontWeight: "700",
                    marginTop: 4,
                  }}
                >
                  New update
                </Text>
              )}
              <Hint>
                {n.body}
                {"\n"}
                {dateLabel(n.createdAt)}
              </Hint>
            </View>
          </View>
        </Card>
      ))}
      {!list.length && (
        <Card>
          <Hint>
            {filter === "Unread"
              ? "No unread updates. You are all caught up."
              : "No updates yet. Submit a report and its updates will appear here."}
          </Hint>
        </Card>
      )}
    </Screen>
  );
}
export function NotificationDetailScreen() {
  const s = useUIStyles();
  const { id } = useLocalSearchParams<RootParams["NotificationDetail"]>();
  const app = useApp();
  const nav = useRouter();
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const n = app.data.notifications.find(
    (n) => n.id === id && n.userId === app.user!.id,
  );
  useEffect(() => {
    if (n && !n.read)
      void app
        .readNotification(n.id)
        .catch((e) => setError((e as Error).message));
    // Mark direct links as read too; retry is available by reopening the update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n?.id]);
  if (!n)
    return (
      <Screen>
        <Hint>Notification unavailable.</Hint>
      </Screen>
    );
  return (
    <Screen>
      <CitizenHero
        title={n.title}
        subtitle="An update from your community service team."
        eyebrow="REPORT UPDATE"
        art={false}
      />
      <Card>
        <Text style={s.bold}>Complaint update</Text>
        <Hint>{n.body}</Hint>
        <Hint>{dateLabel(n.createdAt)}</Hint>
      </Card>
      <Button
        title="View Complaint"
        onPress={() =>
          nav.navigate({ pathname: "/Details", params: { id: n.complaintId } })
        }
      />
      <Button
        title={confirmDelete ? "Confirm deletion" : "Delete Notification"}
        danger
        busy={app.busy}
        onPress={async () => {
          if (!confirmDelete) {
            setConfirmDelete(true);
            return;
          }
          try {
            await app.deleteNotification(id);
            nav.back();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
      {confirmDelete && (
        <Button
          title="Keep notification"
          secondary
          disabled={app.busy}
          onPress={() => setConfirmDelete(false)}
        />
      )}
      <ErrorText message={error} />
    </Screen>
  );
}
