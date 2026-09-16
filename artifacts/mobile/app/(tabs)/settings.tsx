import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
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

function Row({
  icon, label, sublabel, onPress, danger, rightText,
}: {
  icon: string; label: string; sublabel?: string;
  onPress?: () => void; danger?: boolean; rightText?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed && onPress ? 0.7 : 1 },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? "#FF444420" : colors.primary + "18" }]}>
        <Text style={styles.rowEmoji}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: danger ? "#FF4444" : colors.foreground }]}>{label}</Text>
        {sublabel ? <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{sublabel}</Text> : null}
      </View>
      {rightText
        ? <Text style={[styles.rowRight, { color: colors.mutedForeground }]}>{rightText}</Text>
        : onPress
          ? <Text style={[styles.rowChevron, { color: colors.mutedForeground }]}>›</Text>
          : null}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title}</Text>
      <View style={[styles.sectionCard, { borderColor: colors.border }]}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const { user, logout, studyCoins, sessions } = useStudy();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const [loggingOut, setLoggingOut] = useState(false);

  const totalMinutes = Math.floor(
    sessions.filter((s) => s.completed).reduce((acc, s) => acc + s.duration, 0) / 60
  );

  function handleLogout() {
    if (Platform.OS === "web") {
      logout();
      router.replace("/login");
      return;
    }
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out? Your study data will be cleared.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            setLoggingOut(true);
            logout();
            router.replace("/login");
          },
        },
      ]
    );
  }

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "S";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 20, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
          <Image
            source={require("../../assets/studylocker-new.png")}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 6, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#1A2E45", "#112240"]}
          style={[styles.profileCard, { borderColor: colors.border }]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.profileExam}>{user?.examName ?? "—"}</Text>
            {user?.className ? (
              <Text style={styles.profileMeta}>Class {user.className}{user.boardName ? ` · ${user.boardName}` : ""}</Text>
            ) : null}
          </View>
          <View style={styles.coinsBadge}>
            <Text style={styles.coinsEmoji}>🪙</Text>
            <Text style={styles.coinsNum}>{studyCoins}</Text>
          </View>
        </LinearGradient>

        <View style={[styles.statsRow, { marginTop: 4 }]}>
          {[
            { label: "Sessions", val: sessions.filter((s) => s.completed).length.toString() },
            { label: "Minutes", val: totalMinutes.toString() },
            { label: "Coins", val: studyCoins.toString() },
          ].map((s) => (
            <View key={s.label} style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statVal, { color: colors.foreground }]}>{s.val}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Section title="PROFILE">
          <Row
            icon="📚"
            label="Exam"
            sublabel={user?.examCategoryLabel}
            rightText={user?.examName ?? "—"}
          />
          {user?.className ? (
            <Row icon="🏫" label="Class" rightText={`Class ${user.className}`} />
          ) : null}
          {user?.boardName ? (
            <Row icon="📋" label="Board" rightText={user.boardName} />
          ) : null}
        </Section>

        <Section title="APP">
          <Row icon="🎯" label="Focus Sessions" sublabel="Start, pause and track sessions" onPress={() => router.push("/")} />
          <Row icon="🛡️" label="App Blocking" sublabel="Manage allowed apps" onPress={() => router.push("/apps" as any)} />
          <Row icon="📊" label="Your Stats" sublabel="View streaks and history" onPress={() => router.push("/stats" as any)} />
        </Section>

        <Section title="ABOUT">
          <Row icon="ℹ️" label="StudyLock" sublabel="Lock Distractions. Unlock Success." rightText="v1.0" />
        </Section>

        <Section title="ACCOUNT">
          <Row
            icon="🚪"
            label={loggingOut ? "Logging out…" : "Log Out"}
            sublabel="Clear all data and return to login"
            onPress={handleLogout}
            danger
          />
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.5 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandLogo: { width: 40, height: 40, borderRadius: 11 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 8,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#4CAF7930",
    borderWidth: 2,
    borderColor: "#4CAF79",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "700" as const, color: "#4CAF79" },
  profileName: { fontSize: 17, fontWeight: "700" as const, color: "#fff" },
  profileExam: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  profileMeta: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 1 },
  coinsBadge: { alignItems: "center", gap: 2 },
  coinsEmoji: { fontSize: 22 },
  coinsNum: { fontSize: 14, fontWeight: "700" as const, color: "#F5A623" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  statBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
    gap: 3,
  },
  statVal: { fontSize: 20, fontWeight: "700" as const },
  statLabel: { fontSize: 12 },
  section: { gap: 6, marginTop: 10 },
  sectionTitle: { fontSize: 12, fontWeight: "600" as const, letterSpacing: 0.8, marginLeft: 4 },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" as const },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowEmoji: { fontSize: 18 },
  rowLabel: { fontSize: 15, fontWeight: "500" as const },
  rowSub: { fontSize: 12, marginTop: 1 },
  rowRight: { fontSize: 13 },
  rowChevron: { fontSize: 20, fontWeight: "300" as const },
});
