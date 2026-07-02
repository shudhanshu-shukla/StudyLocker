import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo } from "react";
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

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
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

interface MotivationMessage {
  headline: string;
  sub: string;
  icon: string;
  accent: "green" | "orange" | "blue" | "purple";
}

function getPersonalizedMessage(
  streak: number,
  todayMinutes: number,
  totalSessions: number,
  todaySessionCount: number,
  name: string,
): MotivationMessage {
  const firstName = name.split(" ")[0];
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = dayNames[day];
  const isNewUser = totalSessions === 0;
  const studiedToday = todaySessionCount > 0;
  const timeOfDay = getTimeOfDay();

  if (isNewUser) {
    return {
      headline: `Welcome, ${firstName}! 🎉`,
      sub: "Your focus journey starts today. Set up your first session below.",
      icon: "star",
      accent: "green",
    };
  }

  if (streak >= 30) {
    return {
      headline: `🔥 ${firstName}, ${streak}-day streak!`,
      sub: "You've built an incredible habit. Keep this momentum going — you're elite.",
      icon: "zap",
      accent: "orange",
    };
  }

  if (streak >= 7) {
    return {
      headline: `${streak} days straight, ${firstName}. Remarkable.`,
      sub: "One week of consistency is worth more than a month of motivation. Stay locked in.",
      icon: "award",
      accent: "orange",
    };
  }

  if (studiedToday && todayMinutes >= 60) {
    return {
      headline: `${formatMinutes(todayMinutes)} of focus today, ${firstName}!`,
      sub: "You're already winning the day. One more session puts you ahead of 99% of students.",
      icon: "trending-up",
      accent: "green",
    };
  }

  if (studiedToday && todayMinutes > 0) {
    return {
      headline: `Great start, ${firstName}!`,
      sub: `${formatMinutes(todayMinutes)} down. Keep the momentum — another session and the day is yours.`,
      icon: "check-circle",
      accent: "green",
    };
  }

  if (timeOfDay === "evening" || timeOfDay === "night") {
    return {
      headline: `${firstName}, the day isn't over yet.`,
      sub: "Even one 25-minute session tonight compounds into big results over time. Start now.",
      icon: "moon",
      accent: "purple",
    };
  }

  if (timeOfDay === "morning" && streak > 0) {
    return {
      headline: `Good morning, ${firstName}! ${streak}-day streak to protect.`,
      sub: "You've built something real. Start a session before anything steals your focus.",
      icon: "sunrise",
      accent: "orange",
    };
  }

  if (timeOfDay === "morning") {
    return {
      headline: `Good morning, ${firstName}!`,
      sub: "Your brain is sharpest right now. Lock in before the day gets loud.",
      icon: "sun",
      accent: "orange",
    };
  }

  if (isWeekend) {
    return {
      headline: `${firstName}, ${dayName} focus session?`,
      sub: "While others rest, you're building skills they'll envy on Monday.",
      icon: "shield",
      accent: "blue",
    };
  }

  if (day === 1) {
    return {
      headline: `New week, ${firstName}. New level.`,
      sub: "Monday focus sets the tone for everything that follows. Make it count.",
      icon: "calendar",
      accent: "blue",
    };
  }

  if (day === 5) {
    return {
      headline: `Finish strong, ${firstName}.`,
      sub: "Friday winners push hardest when others are already switched off. Be that person.",
      icon: "flag",
      accent: "green",
    };
  }

  if (streak === 0) {
    return {
      headline: `Today is day one again, ${firstName}.`,
      sub: "Every streak starts with a single session. This is yours. Go.",
      icon: "refresh-cw",
      accent: "blue",
    };
  }

  const midweekMessages: MotivationMessage[] = [
    {
      headline: "Quiet focus beats loud effort.",
      sub: "Close the noise, open the books. Your future self is watching.",
      icon: "headphones",
      accent: "blue",
    },
    {
      headline: "The gap between you and your goal?",
      sub: "It's exactly the number of sessions you haven't started yet. Let's close it.",
      icon: "target",
      accent: "purple",
    },
    {
      headline: "Consistency is your unfair advantage.",
      sub: "You don't need motivation — you have a system. Activate it now.",
      icon: "activity",
      accent: "green",
    },
  ];

  return midweekMessages[new Date().getDate() % midweekMessages.length];
}

const ACCENT_COLORS = {
  green: { bg: "#4CAF7918", border: "#4CAF7944", text: "#4CAF79", icon: "#4CAF79" },
  orange: { bg: "#F5A62318", border: "#F5A62344", text: "#F5A623", icon: "#F5A623" },
  blue: { bg: "#4A9EFF18", border: "#4A9EFF44", text: "#4A9EFF", icon: "#4A9EFF" },
  purple: { bg: "#A78BFA18", border: "#A78BFA44", text: "#A78BFA", icon: "#A78BFA" },
};

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { todayStudyMinutes, streak, sessions, studentName, studyCoins } = useStudy();
  const recentSessions = sessions.slice(0, 3);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const todaySessionCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions.filter((s) => s.completed && s.startTime >= today.getTime()).length;
  }, [sessions]);

  const motivation = useMemo(
    () => getPersonalizedMessage(streak, todayStudyMinutes, sessions.filter((s) => s.completed).length, todaySessionCount, studentName),
    [streak, todayStudyMinutes, sessions, todaySessionCount, studentName]
  );

  const ac = ACCENT_COLORS[motivation.accent];

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
          <Text style={[styles.title, { color: colors.foreground }]}>{studentName.split(" ")[0] || "StudyLock"}</Text>
        </View>
        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="zap" size={14} color={colors.accent} />
            <Text style={[styles.badgeText, { color: colors.foreground }]}>{streak}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "#F5A62318", borderColor: "#F5A62344" }]}>
            <Text style={styles.coinBadgeEmoji}>🪙</Text>
            <Text style={[styles.badgeText, { color: "#F5A623" }]}>{studyCoins}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.motivationCard, { backgroundColor: ac.bg, borderColor: ac.border }]}>
        <View style={[styles.motivationIconBox, { backgroundColor: ac.bg }]}>
          <Feather name={motivation.icon as any} size={20} color={ac.icon} />
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={[styles.motivationHeadline, { color: colors.foreground }]}>{motivation.headline}</Text>
          <Text style={[styles.motivationSub, { color: colors.mutedForeground }]}>{motivation.sub}</Text>
        </View>
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
        <View style={[styles.statCard, { backgroundColor: "#F5A62318", borderColor: "#F5A62344" }]}>
          <Text style={{ fontSize: 20 }}>🪙</Text>
          <Text style={[styles.statValue, { color: "#F5A623" }]}>{studyCoins}</Text>
          <Text style={[styles.statLabel, { color: "#F5A62399" }]}>Coins</Text>
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

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular" },
  title: { fontSize: 28, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  badgesRow: { flexDirection: "row", gap: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  coinBadgeEmoji: { fontSize: 13 },
  motivationCard: { borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1.5, flexDirection: "row", gap: 14, alignItems: "flex-start" },
  motivationIconBox: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  motivationHeadline: { fontSize: 15, fontWeight: "700" as const, fontFamily: "Inter_700Bold", lineHeight: 22 },
  motivationSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
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
});
