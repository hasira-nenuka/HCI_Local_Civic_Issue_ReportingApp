import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CommunityArtwork } from "../components/Artwork";
import {
  Button,
  Card,
  Chips,
  ErrorText,
  Field,
  Hint,
  Screen,
  Title,
  s,
} from "../components/ui";
import { useApp } from "../hooks/AppContext";
import { Role } from "../types/models";
export function LoginScreen() {
  const app = useApp();
  const nav = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<Role>("citizen");
  async function login(demo = false) {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (demo) await app.demoLogin(role);
      else await app.login(email.trim(), password);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen>
      <View style={{ paddingTop: 12, alignItems: "center", marginBottom: 30 }}>
        <CommunityArtwork size={150} />
        <Text style={{ ...s.title, marginTop: 17 }}>Login</Text>
        <Hint>Citizen, officer and administrator sign-in</Hint>
      </View>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.lk"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!show}
        placeholder="Enter your password"
        autoComplete="current-password"
      />
      <Pressable accessibilityRole="button" onPress={() => setShow(!show)}>
        <Hint>{show ? "Hide password" : "Show password"}</Hint>
      </Pressable>
      <ErrorText message={error} />
      {message ? <Hint>{message}</Hint> : null}
      {app.cloud && (
        <Button
          title="Forgot password?"
          secondary
          busy={busy}
          onPress={async () => {
            setError("");
            setMessage("");
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
              setError("Enter your email address first.");
              return;
            }
            setBusy(true);
            try {
              await app.resetPassword(email);
              setMessage(
                "If an account exists, check your inbox for a password reset email.",
              );
            } catch {
              setError(
                "Could not send the reset email. Check your connection and try again.",
              );
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
      <Button title="Login" onPress={() => login()} busy={busy} />
      <Button
        title="Citizen Sign Up"
        secondary
        onPress={() => nav.navigate("/Register")}
      />
      {!app.cloud && (
        <Card style={{ marginTop: 22, backgroundColor: "#eaf2ff" }}>
          <Text style={s.bold}>Explore the local demo</Text>
          <Hint>
            Sample data is saved on this device. Firebase is not connected yet.
          </Hint>
          <Chips
            items={["citizen", "officer", "gn", "admin"]}
            value={role}
            onChange={(v) => setRole(v as Role)}
          />
          <Button
            title={`Continue as ${role === "gn" ? "GN officer" : role}`}
            onPress={() => login(true)}
            busy={busy}
          />
        </Card>
      )}
    </Screen>
  );
}
export function RegisterScreen() {
  const app = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save() {
    setError("");
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter your name and a valid email address.");
      return;
    }
    if (app.cloud && (password.length < 8 || password !== confirm)) {
      setError("Use at least 8 characters and matching passwords.");
      return;
    }
    setBusy(true);
    try {
      await app.register(name, email, phone, password);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen>
      <Title>Create Account</Title>
      <Hint>Create a citizen account to report issues in your community.</Hint>
      <View style={{ height: 18 }} />
      <Field
        label="Full Name"
        value={name}
        onChangeText={setName}
        placeholder="Sujani Perera"
      />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Field
        label="Mobile Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      {app.cloud ? (
        <>
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Field
            label="Confirm Password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />
        </>
      ) : (
        <Hint>
          This creates a local demonstration profile. No password is collected
          or stored.
        </Hint>
      )}
      <ErrorText message={error} />
      <Button
        title={app.cloud ? "Sign Up" : "Create demo profile"}
        onPress={save}
        busy={busy}
      />
    </Screen>
  );
}
