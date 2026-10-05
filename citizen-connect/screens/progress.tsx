import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Badge,
  Button,
  Card,
  Chips,
  ErrorText,
  Field,
  Hint,
  Radio,
  Screen,
  s,
} from "../components/ui";
import { useApp } from "../hooks/AppContext";
import { RootParams } from "../navigation/types";
import { canManage, dateLabel, visibleComplaints } from "../utils/complaints";
import { statuses } from "../constants/catalog";
import { theme } from "../constants/theme";
import { Priority, Status } from "../types/models";
export function TrackScreen() {
  const { id } = useLocalSearchParams<RootParams["Track"]>();
  const app = useApp();
  const c = visibleComplaints(app.data, app.user!).find((c) => c.id === id);
  const [status, setStatus] = useState<Status>(c?.status || "Submitted");
  const [priority, setPriority] = useState<Priority>(c?.priority || "Medium");
  const [error, setError] = useState("");
  const [rating, setRating] = useState(String(c?.feedback?.rating || 5));
  const [comment, setComment] = useState(c?.feedback?.comment || "");
  const [saved, setSaved] = useState(false);
  if (!c)
    return (
      <Screen>
        <Hint>Report unavailable.</Hint>
      </Screen>
    );
  return (
    <Screen>
      <Card>
        <View style={s.between}>
          <View>
            <Text style={s.bold}>{c.category}</Text>
            <Hint>#{c.reference}</Hint>
          </View>
          <Badge status={c.status} />
        </View>
      </Card>
      <View style={{ marginTop: 18, marginLeft: 12 }}>
        {statuses.map((item, i) => {
          const entry = c.history.find((h) => h.status === item);
          const complete = !!entry;
          return (
            <View
              key={item}
              style={{ flexDirection: "row", gap: 17, minHeight: 72 }}
            >
              <View style={{ alignItems: "center", width: 24 }}>
                <Ionicons
                  name={complete ? "checkmark-circle" : "ellipse-outline"}
                  size={25}
                  color={complete ? theme.green : theme.muted}
                />
                {i < 3 && (
                  <View
                    style={{ width: 2, flex: 1, backgroundColor: theme.border }}
                  />
                )}
              </View>
              <View>
                <Text style={s.bold}>{item}</Text>
                {entry && (
                  <Hint>
                    {dateLabel(entry.at)} ·{" "}
                    {new Date(entry.at).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Colombo",
                    })}
                  </Hint>
                )}
                {entry?.note && <Hint>{entry.note}</Hint>}
              </View>
            </View>
          );
        })}
      </View>
      {canManage(app.user!) && (
        <Card>
          <Text style={s.bold}>Update progress</Text>
          <Hint>Assign an officer before progressing the complaint.</Hint>
          <Chips
            items={statuses}
            value={status}
            onChange={(v) => setStatus(v as Status)}
          />
          <Text style={s.label}>Priority</Text>
          <Chips
            items={["Low", "Medium", "High"]}
            value={priority}
            onChange={(v) => setPriority(v as Priority)}
          />
          <Button
            title="Save Progress"
            busy={app.busy}
            onPress={async () => {
              try {
                await app.changeStatus(id, status, priority);
                setError("");
                setSaved(true);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          />
        </Card>
      )}
      {c.status === "Resolved" && app.user!.id === c.citizenId && (
        <Card>
          <Text style={s.bold}>Citizen feedback</Text>
          <Hint>How satisfied are you with the resolution?</Hint>
          <Chips
            items={["1", "2", "3", "4", "5"]}
            value={rating}
            onChange={setRating}
          />
          <Field
            label="Comment"
            multiline
            value={comment}
            onChangeText={setComment}
          />
          <Button
            title={c.feedback ? "Update Feedback" : "Submit Feedback"}
            busy={app.busy}
            onPress={async () => {
              try {
                await app.feedback(id, Number(rating), comment);
                setSaved(true);
                setError("");
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          />
        </Card>
      )}
      {c.feedback && app.user!.id !== c.citizenId && (
        <Card>
          <Text style={s.bold}>Citizen feedback: {c.feedback.rating}/5</Text>
          <Hint>{c.feedback.comment}</Hint>
        </Card>
      )}
      {saved && <Hint>Changes saved.</Hint>}
      <ErrorText message={error} />
    </Screen>
  );
}
export function AssignScreen() {
  const { id } = useLocalSearchParams<RootParams["Assign"]>();
  const app = useApp();
  const nav = useRouter();
  const c = app.data.complaints.find((c) => c.id === id);
  const [officer, setOfficer] = useState(c?.assignedOfficerId || "");
  const [division, setDivision] = useState(c?.division || "");
  const [note, setNote] = useState(c?.assignmentNote || "");
  const [error, setError] = useState("");
  if (!canManage(app.user!))
    return (
      <Screen>
        <Hint>Officer or administrator access is required.</Hint>
      </Screen>
    );
  return (
    <Screen>
      <Text style={{ ...s.bold, marginBottom: 20 }}>Assign complaint</Text>
      <Text style={s.label}>Officer name</Text>
      {app.data.users
        .filter((u) => u.role === "officer" && u.active)
        .map((u) => (
          <Radio
            key={u.id}
            label={u.name}
            selected={officer === u.id}
            onPress={() => setOfficer(u.id)}
          />
        ))}
      <Field label="Division" value={division} onChangeText={setDivision} />
      <Field
        label="Note"
        multiline
        value={note}
        onChangeText={setNote}
        placeholder="Add a short note for the assigned officer."
      />
      <ErrorText message={error} />
      <Button
        title="Assign Complaint"
        busy={app.busy}
        onPress={async () => {
          if (!division.trim()) {
            setError("Enter the division.");
            return;
          }
          try {
            await app.assign(id, officer, division.trim(), note);
            nav.replace({ pathname: "/Track", params: { id } });
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
    </Screen>
  );
}
