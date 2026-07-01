import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStudy } from "@/context/StudyContext";
import { useColors } from "@/hooks/useColors";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function formatMinutes(minutes: number): string {
  if (minutes === 0) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function getDayLabels(): string[] {
  const today = new Date().getDay();
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const result: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const idx = ((today - i) + 7) % 7;
    result.push(days[idx]);
  }
  return result;
}

export default function StatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessions, weeklyMinutes, streak, todayStudyMinutes } = useStudy();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const maxMinutes = Math.max(...weeklyMinutes, 60);
  const totalMinutes = sessions.filter((s) => s.completed).reduce((sum, s) => sum + s.duration, 0);
  const completedSessions = sessions.filter((s) => s.completed).length;
  const dayLabels = getDayLabels();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 100, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Statistics</Text>

      <View style={styles.bigStatsRow}>
        <View style={[styles.bigStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.bigStatValue, { color: colors.primary }]}>{formatMinutes(totalMinutes)}</Text>
          <Text style={[styles.bigStatLabel, { color: colors.mutedForeground }]}>Total Focus Time</Text>
        </View>
        <View style={[styles.bigStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.bigStatValue, { color: colors.accent }]}>{streak}</Text>
          <Text style={[styles.bigStatLabel, { color: colors.mutedForeground }]}>Day Streak</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="check-circle" size={18} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.foreground }]}>{completedSessions}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Completed</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="clock" size={18} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.foreground }]}>{formatMinutes(todayStudyMinutes)}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Today</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="trending-up" size={18} color={colors.accent} />
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {completedSessions > 0 ? formatMinutes(Math.round(totalMinutes / completedSessions)) : "—"}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Avg Session</Text>
        </View>
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>This Week</Text>
        <View style={styles.chart}>
          {weeklyMinutes.map((min, i) => {
            const heightRatio = min / maxMinutes;
            const barHeight = Math.max(4, Math.round(heightRatio * 100));
            const isToday = i === 6;
            return (
              <View key={i} style={styles.barCol}>
                <Text style={[styles.barValue, { color: colors.mutedForeground }]}>{min > 0 ? formatMinutes(min) : ""}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: isToday ? colors.primary : colors.primary + "55",
                        borderRadius: 4,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.dayLabel, { color: isToday ? colors.primary : colors.mutedForeground, fontWeight: isToday ? "700" as const : "400" as const }]}>
                  {dayLabels[i]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {sessions.length > 0 && (
        <View style={{ marginTop: 4 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 12 }]}>All Sessions</Text>
          {sessions.map((s) => (
            <View key={s.id} style={[styles.sessionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.sessionDot, { backgroundColor: s.completed ? colors.primary : colors.destructive }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.sessionType, { color: colors.foreground }]}>{labelForType(s.type)}</Text>
                <Text style={[styles.sessionDate, { color: colors.mutedForeground }]}>{formatDate(s.startTime)}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.sessionDur, { color: colors.primary }]}>{formatMinutes(s.duration)}</Text>
                <Text style={[styles.sessionStatus, { color: s.completed ? colors.success : colors.destructive }]}>
                  {s.completed ? "Completed" : "Ended early"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {sessions.length === 0 && (
        <View style={styles.emptyState}>
          <Feather name="bar-chart-2" size={44} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No data yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>Complete sessions to see your stats here</Text>
        </View>
      )}
    </ScrollView>
  );
}

function labelForType(type: string) {
  if (type === "deep") return "Deep Work";
  if (type === "pomodoro") return "Pomodoro";
  return "Light Study";
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 20 },
  bigStatsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  bigStat: { flex: 1, borderRadius: 16, padding: 18, borderWidth: 1, alignItems: "center", gap: 4 },
  bigStatValue: { fontSize: 28, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  bigStatLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center", gap: 5, borderWidth: 1 },
  statValue: { fontSize: 17, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  chartCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", marginBottom: 16 },
  chart: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 140 },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  barValue: { fontSize: 9, fontFamily: "Inter_400Regular" },
  barTrack: { flex: 1, justifyContent: "flex-end", width: "70%" },
  bar: { width: "100%" },
  dayLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sessionRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  sessionDot: { width: 8, height: 8, borderRadius: 4 },
  sessionType: { fontSize: 14, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  sessionDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  sessionDur: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  sessionStatus: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 260, lineHeight: 20 },
  success: {},
});
