import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import * as Location from "expo-location";
import {
  Button,
  Card,
  ErrorText,
  Field,
  Hint,
  Radio,
  Screen,
  Search,
  s,
} from "../components/ui";
import LocationMap from "../components/LocationMap";
import { useApp } from "../hooks/AppContext";
import { RootParams } from "../navigation/types";
import { ComplaintDraft } from "../types/models";
import { areas, authorities, issueTitle } from "../constants/catalog";
import { theme } from "../constants/theme";
import { pickPhoto } from "../services/media";
export function ReportWizardScreen() {
  const { categoryId } = useLocalSearchParams<RootParams["ReportWizard"]>();
  const app = useApp();
  const nav = useRouter();
  const category = app.data.categories.find((c) => c.id === categoryId);
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [locating, setLocating] = useState(false);
  const [draft, setDraft] = useState<ComplaintDraft>({
    categoryId,
    issueType: "",
    area: "",
    localAuthority: "",
    description: "",
    division: app.user!.division,
    address: "",
  });
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const patch = (values: Partial<ComplaintDraft>) =>
    setDraft((d) => ({ ...d, ...values }));
  if (!category)
    return (
      <Screen>
        <Hint>This category is unavailable.</Hint>
      </Screen>
    );
  const titles = [
    `What type of ${categoryId === "other" ? "other" : category.name.replace(" Complaint", "").toLowerCase()} issue is it?`,
    "Select Area",
    "Select Local Authority",
    "Report Issue",
    "Issue Location",
  ];
  const options =
    step === 0 ? category.types : step === 1 ? areas : authorities;
  const value =
    step === 0
      ? draft.issueType
      : step === 1
        ? draft.area
        : draft.localAuthority;
  function next() {
    setError("");
    if (step < 3 && !value) {
      setError("Select an option to continue.");
      return;
    }
    if (step === 3 && draft.description.trim().length < 10) {
      setError("Describe the issue in at least 10 characters.");
      return;
    }
    setSearch("");
    setStep(step + 1);
  }
  async function photo(camera: boolean) {
    setWorking(true);
    setError("");
    try {
      const uri = await pickPhoto(camera);
      if (uri) patch({ imageUrl: uri });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setWorking(false);
    }
  }
  async function gps() {
    setWorking(true);
    setLocating(true);
    setError("");
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted")
        throw new Error(
          "Location permission was denied. Enter coordinates manually.",
        );
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLat(String(result.coords.latitude));
      setLng(String(result.coords.longitude));
      patch({
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      });
      try {
        const addresses = await Location.reverseGeocodeAsync(result.coords);
        if (addresses[0]) {
          const a = addresses[0];
          patch({ address: [a.street, a.city].filter(Boolean).join(", ") });
        }
      } catch {
        /* Manual address remains available on web and offline. */
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLocating(false);
      setWorking(false);
    }
  }
  async function submit() {
    setError("");
    if (!!lat.trim() !== !!lng.trim()) {
      setError("Enter both coordinates, or clear both to report without GPS.");
      return;
    }
    setWorking(true);
    try {
      const id = await app.submit({
        ...draft,
        latitude: lat.trim() ? Number(lat) : undefined,
        longitude: lng.trim() ? Number(lng) : undefined,
      });
      nav.replace({ pathname: "/Confirmation", params: { id } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setWorking(false);
    }
  }
  return (
    <Screen>
      <Hint>
        {issueTitle(categoryId)} · Step {step + 1} of 5
      </Hint>
      <View style={{ flexDirection: "row", gap: 5, marginBottom: 20 }}>
        {titles.map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 5,
              backgroundColor: i <= step ? theme.blue : theme.border,
            }}
          />
        ))}
      </View>
      <Text style={{ ...s.bold, marginBottom: 20 }}>{titles[step]}</Text>
      {step < 3 && (
        <>
          {step > 0 && (
            <Search
              value={search}
              onChangeText={setSearch}
              placeholder={
                step === 1 ? "Search area..." : "Search local authority..."
              }
            />
          )}
          {options
            .filter((o) => o.toLowerCase().includes(search.toLowerCase()))
            .map((o) => (
              <Radio
                key={o}
                label={o}
                selected={value === o}
                onPress={() =>
                  patch(
                    step === 0
                      ? { issueType: o }
                      : step === 1
                        ? { area: o }
                        : { localAuthority: o },
                  )
                }
              />
            ))}
          {value === "Other" && step > 0 && (
            <Hint>
              You can add the exact area or authority in the description.
            </Hint>
          )}
        </>
      )}
      {step === 3 && (
        <>
          <Card style={{ backgroundColor: "#eaf2ff" }}>
            <View style={s.between}>
              <Text style={{ ...s.bold, color: theme.blue }}>
                {draft.issueType}
              </Text>
              <Button title="Change" secondary onPress={() => setStep(0)} />
            </View>
          </Card>
          <Text style={s.label}>Add Photo</Text>
          {draft.imageUrl ? (
            <Image
              accessibilityLabel="Selected complaint photo"
              source={{ uri: draft.imageUrl }}
              style={{ width: "100%", height: 165, borderRadius: 12 }}
            />
          ) : (
            <Card
              style={{
                height: 130,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#edf3fa",
              }}
            >
              <Text style={{ fontSize: 35 }}>📷</Text>
              <Hint>Add a clear photo of the issue</Hint>
            </Card>
          )}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button
                title="Choose Photo"
                secondary
                onPress={() => photo(false)}
                disabled={working}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Take Photo"
                secondary
                onPress={() => photo(true)}
                disabled={working}
              />
            </View>
          </View>
          {draft.imageUrl && (
            <Button
              title="Remove Photo"
              secondary
              onPress={() => patch({ imageUrl: undefined })}
            />
          )}
          <Hint>A photo is recommended. You can continue without one.</Hint>
          <Field
            label="Description"
            multiline
            value={draft.description}
            onChangeText={(description) => patch({ description })}
            placeholder="Explain what happened and include nearby landmarks."
            maxLength={2000}
          />
        </>
      )}
      {step === 4 && (
        <>
          <Button
            title="Use My Current Location (Optional)"
            secondary
            onPress={gps}
            busy={locating}
            disabled={working || app.busy}
          />
          <LocationMap
            latitude={
              lat && Number.isFinite(Number(lat)) && Math.abs(Number(lat)) <= 90
                ? Number(lat)
                : 6.9002
            }
            longitude={
              lng &&
              Number.isFinite(Number(lng)) &&
              Math.abs(Number(lng)) <= 180
                ? Number(lng)
                : 79.8538
            }
            onChange={(latitude, longitude) => {
              setLat(String(latitude));
              setLng(String(longitude));
            }}
          />
          <Hint>
            GPS is optional. Enter an address or landmark below. You can also
            select a map location or enter coordinates.
          </Hint>
          {(lat || lng) && (
            <Button
              title="Clear Coordinates"
              secondary
              onPress={() => {
                setLat("");
                setLng("");
                patch({ latitude: undefined, longitude: undefined });
              }}
            />
          )}
          <Field
            label="Address / Landmark"
            value={draft.address}
            onChangeText={(address) => patch({ address })}
            placeholder="Temple Road, Colombo 03"
          />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field
                label="Latitude (Optional)"
                value={lat}
                onChangeText={setLat}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Longitude (Optional)"
                value={lng}
                onChangeText={setLng}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
          <Field
            label="GN Division"
            value={draft.division}
            onChangeText={(division) => patch({ division })}
          />
          <Card>
            <Text style={s.bold}>Review your report</Text>
            <Hint>
              {category.name} · {draft.issueType}
              {"\n"}
              {draft.area}
              {"\n"}
              {draft.localAuthority}
              {"\n"}
              {draft.description}
            </Hint>
          </Card>
        </>
      )}
      <ErrorText message={error} />
      <Button
        title={step === 4 ? "Submit Report" : "Next"}
        onPress={step === 4 ? submit : next}
        disabled={working}
        busy={step === 4 && working}
      />
      {step > 0 && (
        <Button
          title="Previous Step"
          secondary
          disabled={working || app.busy}
          onPress={() => {
            setStep(step - 1);
            setSearch("");
            setError("");
          }}
        />
      )}
    </Screen>
  );
}
