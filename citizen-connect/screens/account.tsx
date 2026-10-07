import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import {
  Button,
  Card,
  ErrorText,
  Field,
  Hint,
  Row,
  Screen,
  Title,
  s,
} from "../components/ui";
import { useApp } from "../hooks/AppContext";
import { RootParams } from "../navigation/types";
import { VisualIcon } from "../components/Artwork";
import { dateLabel } from "../utils/complaints";
import { pickPhoto } from "../services/media";
export function ProfileScreen() {
  const app = useApp();
  const nav = useRouter();
  const [error, setError] = useState("");
  return (
    <Screen>
      <View style={{ ...s.inline, marginBottom: 25 }}>
        {app.user!.imageUrl ? (
          <Image
            source={{ uri: app.user!.imageUrl }}
            style={{ width: 70, height: 70, borderRadius: 35 }}
          />
        ) : (
          <VisualIcon symbol="👤" size={52} />
        )}
        <View>
          <Title>{app.user!.name}</Title>
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
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: 85, height: 85, borderRadius: 45 }}
          />
        ) : (
          <VisualIcon symbol="👤" size={60} />
        )}
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
  const nav = useRouter();
  return (
    <Screen>
      <Title>How can we help?</Title>
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
          If GPS is unavailable, enter latitude, longitude and a nearby landmark
          on the confirmation screen.
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
        <VisualIcon symbol="🏛️" size={64} />
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
  const app = useApp();
  const nav = useRouter();
  const [error, setError] = useState("");
  const list = app.data.notifications.filter((n) => n.userId === app.user!.id);
  return (
    <Screen>
      <ErrorText message={error} />
      {list.map((n) => (
        <Card
          key={n.id}
          onPress={async () => {
            try {
              await app.readNotification(n.id);
              nav.navigate({
                pathname: "/NotificationDetail",
                params: { id: n.id },
              });
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <View style={s.inline}>
            <Text style={{ fontSize: 25 }}>{n.read ? "🔔" : "🔵"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.bold}>{n.title}</Text>
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
          <Hint>You have no notifications yet.</Hint>
        </Card>
      )}
    </Screen>
  );
}
export function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<RootParams["NotificationDetail"]>();
  const app = useApp();
  const nav = useRouter();
  const [error, setError] = useState("");
  const n = app.data.notifications.find(
    (n) => n.id === id && n.userId === app.user!.id,
  );
  if (!n)
    return (
      <Screen>
        <Hint>Notification unavailable.</Hint>
      </Screen>
    );
  return (
    <Screen>
      <View style={{ alignItems: "center", marginTop: 20, marginBottom: 30 }}>
        <VisualIcon symbol="🔔" size={60} />
        <Title>{n.title}</Title>
      </View>
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
        title="Delete Notification"
        danger
        onPress={async () => {
          try {
            await app.deleteNotification(id);
            nav.back();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
      <ErrorText message={error} />
    </Screen>
  );
}
