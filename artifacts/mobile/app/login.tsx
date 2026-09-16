import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={require("../assets/studylocker-new.png")}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>

        {/* Form */}
        <View style={styles.form}>
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
              autoCorrect={false}
              autoCapitalize="words"
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
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleStart}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.startBtn,
              { backgroundColor: colors.primary },
              !canSubmit && styles.startBtnDisabled,
              pressed && canSubmit && styles.startBtnPressed,
            ]}
            onPress={handleStart}
            disabled={!canSubmit}
          >
            <Text style={styles.startBtnText}>Get Started →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24, gap: 32 },
  logoWrap: { alignItems: "center" },
  logoImg: { width: 220, height: 220, borderRadius: 40 },
  form: { gap: 14 },
  heading: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  error: { fontSize: 13, fontFamily: "Inter_400Regular" },
  inputs: { gap: 10 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  startBtn: { borderRadius: 16, paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  startBtnDisabled: { opacity: 0.4 },
  startBtnPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  startBtnText: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
