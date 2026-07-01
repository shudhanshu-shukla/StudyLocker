import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStudy } from "@/context/StudyContext";
import { useColors } from "@/hooks/useColors";

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setStudentName } = useStudy();
  const [name, setName] = useState("");
  const inputRef = useRef<TextInput>(null);

  const canContinue = name.trim().length >= 2;

  function handleContinue() {
    if (!canContinue) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStudentName(name.trim());
    router.replace("/");
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.top}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
            <Feather name="shield" size={44} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>StudyLock</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>Your personal focus companion</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.prompt, { color: colors.foreground }]}>What's your name?</Text>
          <Text style={[styles.promptSub, { color: colors.mutedForeground }]}>
            We'll personalize your daily motivation just for you.
          </Text>

          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: canContinue ? colors.primary : colors.border }]}>
            <Feather name="user" size={18} color={colors.mutedForeground} />
            <TextInput
              ref={inputRef}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              maxLength={30}
            />
            {canContinue && <Feather name="check-circle" size={18} color={colors.primary} />}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.btn,
              {
                backgroundColor: canContinue ? colors.primary : colors.surface,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed && canContinue ? 0.97 : 1 }],
              },
            ]}
            onPress={handleContinue}
            disabled={!canContinue}
          >
            <Text style={[styles.btnText, { color: canContinue ? colors.primaryForeground : colors.mutedForeground }]}>
              Let's go →
            </Text>
          </Pressable>
        </View>

        <View style={styles.features}>
          {[
            { icon: "shield", text: "Block distracting apps during study" },
            { icon: "clock", text: "Track your focus sessions and streaks" },
            { icon: "check-square", text: "Manage your daily study tasks" },
          ].map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary + "18" }]}>
                <Feather name={f.icon as any} size={14} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{f.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, justifyContent: "space-between" },
  top: { alignItems: "center", gap: 12 },
  logoBox: { width: 88, height: 88, borderRadius: 26, alignItems: "center", justifyContent: "center", borderWidth: 2, marginBottom: 4 },
  appName: { fontSize: 32, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  tagline: { fontSize: 15, fontFamily: "Inter_400Regular" },
  form: { gap: 14 },
  prompt: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  promptSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21, marginTop: -6 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5 },
  input: { flex: 1, fontSize: 16, fontFamily: "Inter_400Regular" },
  btn: { borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  features: { gap: 14 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  featureText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
});
