import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStudy } from "@/context/StudyContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { loginWithName } = useStudy();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const lastNameRef = useRef<TextInput>(null);

  function handleStart() {
    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    loginWithName(firstName.trim(), lastName.trim());
    router.replace("/profile-setup");
  }

  const canSubmit = firstName.trim().length > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Logo */}
      <View style={styles.center}>
        <Image
          source={require("../assets/logo.jpg")}
          style={styles.logoImg}
          resizeMode="contain"
        />
      </View>

      {/* Form */}
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>What's your name?</Text>

        {error ? (
          <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
        ) : null}

        <View style={styles.inputs}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
            placeholder="First name"
            placeholderTextColor={colors.mutedForeground}
            value={firstName}
            onChangeText={(t) => { setFirstName(t); if (error) setError(""); }}
            autoFocus
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => lastNameRef.current?.focus()}
          />
          <TextInput
            ref={lastNameRef}
            style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
            placeholder="Last name (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={lastName}
            onChangeText={setLastName}
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleStart}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.startBtn,
            { backgroundColor: colors.primary, opacity: !canSubmit ? 0.4 : pressed ? 0.85 : 1, transform: [{ scale: pressed && canSubmit ? 0.97 : 1 }] },
          ]}
          onPress={handleStart}
          disabled={!canSubmit}
        >
          <Text style={styles.startBtnText}>Get Started →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "space-between", paddingHorizontal: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  logoImg: { width: 240, height: 240, borderRadius: 44 },
  bottom: { gap: 14 },
  heading: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  error: { fontSize: 13, fontFamily: "Inter_400Regular" },
  inputs: { gap: 10 },
  input: {
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, fontFamily: "Inter_400Regular",
  },
  startBtn: { borderRadius: 16, paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  startBtnText: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
