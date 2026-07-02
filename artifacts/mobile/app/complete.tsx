import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
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
  const coinsEarned = Math.floor(mins);
  const congrats = CONGRATS[Math.floor(Math.random() * CONGRATS.length)];

  const checkScale = useRef(new Animated.Value(0)).current;
  const coinScale = useRef(new Animated.Value(0.6)).current;
  const coinOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 7 }),
      Animated.delay(180),
      Animated.parallel([
        Animated.spring(coinScale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 6 }),
        Animated.timing(coinOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>

      {/* Check circle */}
      <Animated.View style={[styles.circle, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44", transform: [{ scale: checkScale }] }]}>
        <Feather name="check" size={52} color={colors.primary} />
      </Animated.View>

      <Text style={[styles.title, { color: colors.foreground }]}>Session Complete!</Text>
      <Text style={[styles.duration, { color: colors.primary }]}>{formatMinutes(mins)} of focused work</Text>
      <Text style={[styles.congrats, { color: colors.mutedForeground }]}>{congrats}</Text>

      {/* Coins earned banner */}
      <Animated.View style={[styles.coinBanner, { backgroundColor: "#F5A62318", borderColor: "#F5A62366", opacity: coinOpacity, transform: [{ scale: coinScale }] }]}>
        <Text style={styles.coinEmoji}>🪙</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.coinTitle, { color: "#F5A623" }]}>Study Coins Earned!</Text>
          <Text style={[styles.coinSub, { color: colors.mutedForeground }]}>1 coin per minute of focus</Text>
        </View>
        <Text style={[styles.coinAmount, { color: "#F5A623" }]}>+{coinsEarned}</Text>
      </Animated.View>

      {/* Actions */}
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
  circle: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center", borderWidth: 2, marginBottom: 22 },
  title: { fontSize: 28, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 6, textAlign: "center" },
  duration: { fontSize: 20, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  congrats: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 24, maxWidth: 280, marginBottom: 22 },
  coinBanner: { width: "100%", flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 18, borderWidth: 1.5, padding: 16, marginBottom: 28 },
  coinEmoji: { fontSize: 30 },
  coinTitle: { fontSize: 15, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  coinSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  coinAmount: { fontSize: 30, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  actions: { width: "100%", gap: 12 },
  primaryBtn: { borderRadius: 16, padding: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryBtnText: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  secondaryBtn: { borderRadius: 16, padding: 17, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  secondaryBtnText: { fontSize: 16, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
});
