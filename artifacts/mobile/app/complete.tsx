import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const CONGRATS = [
  "Incredible focus! Keep it up.",
  "Session complete! Your future self is grateful.",
  "You crushed it! Consistency is your superpower.",
  "Well done! Another step toward your goals.",
];

export default function CompleteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { duration } = useLocalSearchParams<{ duration: string }>();
  const mins = parseInt(duration ?? "25", 10);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const congrats = CONGRATS[Math.floor(Math.random() * CONGRATS.length)];

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
      <View style={[styles.circle, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
        <Feather name="check" size={52} color={colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>Session Complete!</Text>
      <Text style={[styles.duration, { color: colors.primary }]}>{formatMinutes(mins)} of focused work</Text>
      <Text style={[styles.congrats, { color: colors.mutedForeground }]}>{congrats}</Text>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.replace("/setup"); }}
        >
          <Feather name="refresh-cw" size={16} color={colors.primaryForeground} />
          <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>New Session</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.replace("/"); }}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>Back to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center", borderWidth: 2, marginBottom: 28 },
  title: { fontSize: 28, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 8, textAlign: "center" },
  duration: { fontSize: 20, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  congrats: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 24, maxWidth: 280, marginBottom: 40 },
  actions: { width: "100%", gap: 12 },
  primaryBtn: { borderRadius: 16, padding: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryBtnText: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  secondaryBtn: { borderRadius: 16, padding: 17, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  secondaryBtnText: { fontSize: 16, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
});
