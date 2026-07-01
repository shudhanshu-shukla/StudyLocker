import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TimerRing from "@/components/TimerRing";
import { StudySession, useStudy } from "@/context/StudyContext";
import { useColors } from "@/hooks/useColors";

const MOTIVATIONAL = [
  "Stay locked in. Every minute counts.",
  "The work is the reward.",
  "One focused hour beats ten distracted ones.",
  "You've got this. Keep going.",
  "Protect your time. It's your most valuable asset.",
  "Silence the noise. Find your flow.",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTimeLabel(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${pad(m)}:${pad(s)}`;
}

type SessionType = "deep" | "pomodoro" | "light";

export default function SessionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { duration: durationParam, type: typeParam } = useLocalSearchParams<{ duration: string; type: string }>();
  const { addSession, allowedApps } = useStudy();

  const totalSeconds = (parseInt(durationParam ?? "25", 10)) * 60;
  const sessionType = (typeParam ?? "deep") as SessionType;

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(true);
  const [showApps, setShowApps] = useState(false);
  const runningRef = useRef(true);
  const secondsLeftRef = useRef(totalSeconds);
  const startTimeRef = useRef(Date.now());
  const sessionIdRef = useRef(Date.now().toString() + Math.random().toString(36).substr(2, 9));
  const completedRef = useRef(false);

  const quoteRef = useRef(MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);

  const progress = secondsLeft / totalSeconds;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const session: StudySession = {
      id: sessionIdRef.current,
      duration: parseInt(durationParam ?? "25", 10),
      startTime: startTimeRef.current,
      endTime: Date.now(),
      completed: true,
      type: sessionType,
    };
    addSession(session);
    router.replace({ pathname: "/complete", params: { duration: durationParam, type: typeParam } });
  }, [addSession, durationParam, typeParam, sessionType]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!runningRef.current) return;
      secondsLeftRef.current -= 1;
      setSecondsLeft(secondsLeftRef.current);
      if (secondsLeftRef.current <= 0) {
        clearInterval(id);
        handleComplete();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [handleComplete]);

  function handleEnd() {
    if (Platform.OS === "web") {
      endEarly();
    } else {
      Alert.alert(
        "End Session?",
        "Are you sure you want to end this session early? Your progress will be lost.",
        [
          { text: "Keep Going", style: "cancel" },
          { text: "End Session", style: "destructive", onPress: endEarly },
        ]
      );
    }
  }

  function endEarly() {
    completedRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const elapsedMinutes = Math.round((totalSeconds - secondsLeftRef.current) / 60);
    const session: StudySession = {
      id: sessionIdRef.current,
      duration: elapsedMinutes,
      startTime: startTimeRef.current,
      endTime: Date.now(),
      completed: false,
      type: sessionType,
    };
    if (elapsedMinutes > 0) addSession(session);
    router.replace("/");
  }

  function togglePause() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = !runningRef.current;
    runningRef.current = next;
    setRunning(next);
  }

  const labelForType = (t: SessionType) => {
    if (t === "deep") return "Deep Work";
    if (t === "pomodoro") return "Pomodoro";
    return "Light Study";
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View style={[styles.typeBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="shield" size={12} color={colors.primary} />
          <Text style={[styles.typeText, { color: colors.primary }]}>{labelForType(sessionType)}</Text>
        </View>
        <Pressable onPress={handleEnd} style={({ pressed }) => [styles.endBtn, { borderColor: colors.destructive + "66", opacity: pressed ? 0.7 : 1 }]}>
          <Text style={[styles.endBtnText, { color: colors.destructive }]}>End</Text>
        </Pressable>
      </View>

      <View style={styles.timerSection}>
        <TimerRing
          progress={progress}
          size={270}
          strokeWidth={10}
          timeLabel={formatTimeLabel(secondsLeft)}
          subLabel={running ? "remaining" : "paused"}
        />

        <Text style={[styles.quote, { color: colors.mutedForeground }]}>{quoteRef.current}</Text>

        <View style={styles.btnGroup}>
          <Pressable
            style={({ pressed }) => [styles.stopBtnFull, { backgroundColor: colors.destructive, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            onPress={handleEnd}
          >
            <Feather name="square" size={18} color="#fff" />
            <Text style={[styles.stopBtnText, { color: "#fff" }]}>Stop Session</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.pauseBtn, { backgroundColor: "#F5A623", opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            onPress={togglePause}
          >
            <Feather name={running ? "pause" : "play"} size={18} color="#1A1000" />
            <Text style={[styles.pauseText, { color: "#1A1000" }]}>{running ? "Pause" : "Resume"}</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}>
        {running ? (
          <View style={[styles.blockedBanner, { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "44" }]}>
            <Feather name="bell-off" size={14} color={colors.destructive} />
            <Text style={[styles.blockedText, { color: colors.destructive }]}>Notifications silenced · Other apps blocked</Text>
          </View>
        ) : (
          <View style={[styles.blockedBanner, { backgroundColor: "#F5A62318", borderColor: "#F5A62344" }]}>
            <Feather name="unlock" size={14} color="#F5A623" />
            <Text style={[styles.blockedText, { color: "#F5A623" }]}>Paused — All apps are now accessible</Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.appsToggle, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowApps(!showApps); }}
        >
          <Feather name="shield" size={14} color={colors.mutedForeground} />
          <Text style={[styles.appsToggleText, { color: colors.mutedForeground }]}>
            {allowedApps.length} app{allowedApps.length !== 1 ? "s" : ""} allowed
          </Text>
          <Feather name={showApps ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
        </Pressable>

        {showApps && (
          <View style={styles.appsList}>
            {allowedApps.map((app) => (
              <View key={app.id} style={[styles.appChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name={app.iconName as any} size={12} color={colors.primary} />
                <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.foreground }}>{app.name}</Text>
              </View>
            ))}
            {allowedApps.length === 0 && <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>No apps — full lockdown mode</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 8 },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  typeText: { fontSize: 13, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  endBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  endBtnText: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  timerSection: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24, paddingHorizontal: 20 },
  quote: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 260, lineHeight: 22, fontStyle: "italic" },
  btnGroup: { width: "100%", gap: 12, paddingHorizontal: 24 },
  stopBtnFull: { borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  stopBtnText: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  pauseBtn: { borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  pauseText: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  bottomSection: { paddingHorizontal: 20, gap: 12 },
  blockedBanner: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  blockedText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  appsToggle: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center" },
  appsToggleText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  appsList: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  appChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
});
