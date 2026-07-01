import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStudy } from "@/context/StudyContext";
import { useColors } from "@/hooks/useColors";

type SessionType = "deep" | "pomodoro" | "light";

const DURATIONS = [15, 25, 45, 60, 90, 120];

const SESSION_TYPES: { id: SessionType; label: string; desc: string; icon: string }[] = [
  { id: "deep", label: "Deep Work", desc: "Full focus, no interruptions", icon: "zap" },
  { id: "pomodoro", label: "Pomodoro", desc: "25 min work + 5 min break cycles", icon: "clock" },
  { id: "light", label: "Light Study", desc: "Relaxed session with reminders", icon: "sun" },
];

export default function SetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { allowedApps } = useStudy();
  const [duration, setDuration] = useState(25);
  const [sessionType, setSessionType] = useState<SessionType>("deep");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleBegin() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: "/session", params: { duration: String(duration), type: sessionType } });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 24, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.heading, { color: colors.foreground }]}>Setup Session</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DURATION</Text>
        <View style={styles.durationGrid}>
          {DURATIONS.map((d) => (
            <Pressable
              key={d}
              style={({ pressed }) => [
                styles.durationChip,
                {
                  backgroundColor: duration === d ? colors.primary : colors.card,
                  borderColor: duration === d ? colors.primary : colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDuration(d); }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", color: duration === d ? colors.primaryForeground : colors.foreground }}>
                {d < 60 ? `${d}m` : `${d / 60}h`}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>FOCUS MODE</Text>
        {SESSION_TYPES.map((st) => (
          <Pressable
            key={st.id}
            style={({ pressed }) => [
              styles.typeRow,
              {
                backgroundColor: sessionType === st.id ? colors.primary + "18" : colors.card,
                borderColor: sessionType === st.id ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSessionType(st.id); }}
          >
            <View style={[styles.typeIconBox, { backgroundColor: sessionType === st.id ? colors.primary + "33" : colors.surface }]}>
              <Feather name={st.icon as any} size={20} color={sessionType === st.id ? colors.primary : colors.mutedForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.typeLabel, { color: colors.foreground }]}>{st.label}</Text>
              <Text style={[styles.typeDesc, { color: colors.mutedForeground }]}>{st.desc}</Text>
            </View>
            {sessionType === st.id && <Feather name="check-circle" size={18} color={colors.primary} />}
          </Pressable>
        ))}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ALLOWED APPS</Text>
        <View style={[styles.appsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {allowedApps.length === 0 ? (
            <Text style={[styles.noAppsText, { color: colors.mutedForeground }]}>
              No apps selected — only StudyLock will be accessible.
            </Text>
          ) : (
            <>
              <View style={styles.appsRow}>
                {allowedApps.slice(0, 5).map((app) => (
                  <View key={app.id} style={[styles.appChip, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
                    <Feather name={app.iconName as any} size={12} color={colors.primary} />
                    <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.primary }}>{app.name}</Text>
                  </View>
                ))}
                {allowedApps.length > 5 && (
                  <Text style={[{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }]}>+{allowedApps.length - 5} more</Text>
                )}
              </View>
              <Text style={[styles.appsNote, { color: colors.mutedForeground }]}>All other apps will be blocked during this session</Text>
            </>
          )}
        </View>

        <View style={[styles.dndCard, { backgroundColor: colors.accent + "18", borderColor: colors.accent + "44" }]}>
          <Feather name="bell-off" size={16} color={colors.accent} />
          <Text style={[styles.dndText, { color: colors.accent }]}>
            Enable Do Not Disturb in your phone settings for best results
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.beginBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
          onPress={handleBegin}
        >
          <Feather name="shield" size={20} color={colors.primaryForeground} />
          <Text style={[styles.beginBtnText, { color: colors.primaryForeground }]}>Begin Focus Session</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  heading: { fontSize: 18, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 1, marginBottom: 12 },
  durationGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
  durationChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.5, marginBottom: 10 },
  typeIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  typeLabel: { fontSize: 15, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  typeDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  appsCard: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 14 },
  appsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  appChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  noAppsText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  appsNote: { fontSize: 12, fontFamily: "Inter_400Regular" },
  dndCard: { flexDirection: "row", gap: 10, alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 24 },
  dndText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  beginBtn: { borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  beginBtnText: { fontSize: 17, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  surface: {},
});
