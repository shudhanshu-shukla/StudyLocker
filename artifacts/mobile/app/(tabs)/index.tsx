import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
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

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Focus is the bridge between goals and accomplishment.",
  "Small steps every day lead to big results.",
  "Your future self will thank you for studying today.",
  "Discipline is choosing what you want most over what you want now.",
];

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { todayStudyMinutes, streak, sessions } = useStudy();
  const quote = QUOTES[new Date().getDay() % QUOTES.length];
  const recentSessions = sessions.slice(0, 3);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleStart() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/setup");
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 100, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good {getTimeOfDay()},</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>StudyLock</Text>
        </View>
        <View style={[styles.streakBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="zap" size={16} color={colors.accent} />
          <Text style={[styles.streakText, { color: colors.foreground }]}>{streak}</Text>
        </View>
      </View>

      <View style={[styles.quoteCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="bookmark" size={14} color={colors.primary} />
        <Text style={[styles.quoteText, { color: colors.mutedForeground }]}>{quote}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="clock" size={20} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.foreground }]}>{formatMinutes(todayStudyMinutes)}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Today</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="zap" size={20} color={colors.accent} />
          <Text style={[styles.statValue, { color: colors.foreground }]}>{streak}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Day streak</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="check-circle" size={20} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.foreground }]}>{sessions.filter((s) => s.completed).length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Sessions</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.startBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        onPress={handleStart}
      >
        <Feather name="shield" size={22} color={colors.primaryForeground} />
        <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>Start Study Session</Text>
      </Pressable>

      {recentSessions.length > 0 && (
        <View style={{ marginTop: 28 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Sessions</Text>
          {recentSessions.map((s) => (
            <View key={s.id} style={[styles.sessionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.sessionIcon, { backgroundColor: s.completed ? colors.primary + "22" : colors.destructive + "22" }]}>
                <Feather name={s.completed ? "check" : "x"} size={14} color={s.completed ? colors.primary : colors.destructive} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sessionType, { color: colors.foreground }]}>{labelForType(s.type)}</Text>
                <Text style={[styles.sessionDate, { color: colors.mutedForeground }]}>{formatDate(s.startTime)}</Text>
              </View>
              <Text style={[styles.sessionDur, { color: colors.primary }]}>{formatMinutes(s.duration)}</Text>
            </View>
          ))}
        </View>
      )}

      {recentSessions.length === 0 && (
        <View style={styles.emptyState}>
          <Feather name="book-open" size={40} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No sessions yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>Start your first session to begin tracking your focus</Text>
        </View>
      )}
    </ScrollView>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function labelForType(type: string) {
  if (type === "deep") return "Deep Work";
  if (type === "pomodoro") return "Pomodoro";
  return "Light Study";
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular" },
  title: { fontSize: 28, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  streakText: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  quoteCard: { borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  quoteText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, fontStyle: "italic" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center", gap: 6, borderWidth: 1 },
  statValue: { fontSize: 20, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  startBtn: { borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  startBtnText: { fontSize: 17, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 17, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  sessionRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  sessionIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sessionType: { fontSize: 14, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  sessionDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  sessionDur: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 260, lineHeight: 20 },
  success: {},
});
