import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStudy } from "@/context/StudyContext";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

const EXAM_MESSAGES: Record<string, { emoji: string; title: string; body: string; tag: string }> = {
  jee_main:    { emoji: "⚙️", title: "Future IITian!", body: "Millions dream of IIT. You've taken the first step — turning that dream into a plan. Every minute of focus brings you closer to that campus gate.", tag: "JEE Main" },
  jee_adv:    { emoji: "🏆", title: "Elite Ahead!", body: "JEE Advanced is the toughest door in India. You already have what it takes — grit, ambition, and now a tool that locks out distractions.", tag: "JEE Advanced" },
  neet:       { emoji: "🏥", title: "Future Doctor!", body: "Every great doctor started exactly where you are today — with a choice to study when it mattered. This app is your silent study partner.", tag: "NEET" },
  bitsat:     { emoji: "🚀", title: "BITS Bound!", body: "BITS Pilani accepts only the sharpest minds. Deep focus, consistent revision, and zero distractions — that's your formula.", tag: "BITSAT" },
  upsc_cse:   { emoji: "🏛️", title: "Future IAS!", body: "The Civil Services exam shapes India. Your journey to serve millions starts with disciplined, distraction-free study — one session at a time.", tag: "UPSC CSE" },
  upsc_ias:   { emoji: "🏛️", title: "Future IAS!", body: "The Civil Services exam shapes India. Your journey to serve millions starts with disciplined, distraction-free study — one session at a time.", tag: "UPSC IAS" },
  cat:        { emoji: "📈", title: "IIM Bound!", body: "CAT toppers aren't born, they're built through consistent, smart preparation. Lock in your focus and let your scores speak.", tag: "CAT" },
  ssc_cgl:    { emoji: "🚂", title: "Government Awaits!", body: "Lakhs compete for SSC CGL. The ones who win are the ones who stayed focused every single day. You're already one step ahead.", tag: "SSC CGL" },
  gate:       { emoji: "🎓", title: "GATE Cracker!", body: "GATE opens doors to PSUs and top IITs for M.Tech. Precision preparation beats last-minute panic — every time.", tag: "GATE" },
  clat:       { emoji: "⚖️", title: "Future Lawyer!", body: "India's best law schools are waiting. A sharp mind, deep reading, and laser-focused preparation will take you there.", tag: "CLAT" },
  nda:        { emoji: "🛡️", title: "Future Officer!", body: "Serving the nation in uniform is an honour earned by the focused few. Your dedication today will be your rank tomorrow.", tag: "NDA" },
  banking:    { emoji: "🏦", title: "Banker in the Making!", body: "Banking exams reward consistency above everything. Set a schedule, stick to it, and let StudyLock keep you on track.", tag: "Banking" },
  cuet:       { emoji: "🌐", title: "Top College Ahead!", body: "CUET opens the gates of India's finest central universities. A focused preparation plan is your ticket in.", tag: "CUET" },
};

const DEFAULT_MSG = { emoji: "🎯", title: "Your Journey Begins!", body: "Every great achievement starts with a single focused hour. StudyLock is here to help you make every minute count.", tag: "Study" };

const NUM_STARS = 18;

function Star({ delay, color }: { delay: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  const x = useRef(Math.random() * width).current;
  const size = useRef(6 + Math.random() * 10).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 900 + Math.random() * 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900 + Math.random() * 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const top = useRef(Math.random() * height * 0.7).current;
  return (
    <Animated.View
      style={{
        position: "absolute", left: x, top,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color,
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.8] }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] }) }],
      }}
    />
  );
}

export default function WelcomeScreen() {
  const { user } = useStudy();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const msg = (user?.examId && EXAM_MESSAGES[user.examId]) ?? DEFAULT_MSG;

  const scale = useRef(new Animated.Value(0.4)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const btnScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(slideUp, { toValue: 0, duration: 500, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      ]),
      Animated.spring(btnScale, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const starColors = ["#4CAF79", "#F5A623", "#60A5FA", "#F472B6", "#A78BFA"];

  return (
    <LinearGradient
      colors={["#0B1221", "#0D1B2A", "#112240"]}
      style={{ flex: 1 }}
    >
      {Array.from({ length: NUM_STARS }).map((_, i) => (
        <Star key={i} delay={i * 120} color={starColors[i % starColors.length]} />
      ))}

      <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
        <Animated.View style={{ opacity: fade, transform: [{ scale }], alignItems: "center" }}>
          <View style={styles.emojiCircle}>
            <Text style={styles.emoji}>{msg.emoji}</Text>
          </View>
          <View style={styles.tagPill}>
            <Text style={styles.tagText}>{msg.tag}</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.textBlock,
            { opacity: fade, transform: [{ translateY: slideUp }] },
          ]}
        >
          <Text style={styles.greeting}>
            {user?.firstName ? `Hey ${user.firstName},` : "Hey there,"}
          </Text>
          <Text style={styles.title}>{msg.title}</Text>
          <Text style={styles.body}>{msg.body}</Text>

          <View style={styles.pillsRow}>
            {["Focus Sessions", "App Blocking", "Study Coins", "Daily Stats"].map((f) => (
              <View key={f} style={styles.featurePill}>
                <Text style={styles.featurePillText}>{f}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: btnScale }], width: "100%" }}>
          <Pressable
            style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.replace("/")}
          >
            <LinearGradient
              colors={["#4CAF79", "#2E7D50"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGrad}
            >
              <Text style={styles.btnText}>Start My Journey 🚀</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },
  emojiCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(76,175,121,0.15)",
    borderWidth: 2,
    borderColor: "rgba(76,175,121,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emoji: { fontSize: 52 },
  tagPill: {
    backgroundColor: "rgba(76,175,121,0.18)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(76,175,121,0.35)",
  },
  tagText: { color: "#4CAF79", fontSize: 13, fontWeight: "600" as const },
  textBlock: { alignItems: "center", gap: 10, flex: 1, justifyContent: "center", paddingVertical: 28 },
  greeting: { fontSize: 18, color: "rgba(255,255,255,0.6)", fontWeight: "400" as const },
  title: { fontSize: 32, color: "#fff", fontWeight: "800" as const, textAlign: "center", letterSpacing: -0.5 },
  body: { fontSize: 15, color: "rgba(255,255,255,0.72)", textAlign: "center", lineHeight: 24, marginTop: 4 },
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 16 },
  featurePill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  featurePillText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "500" as const },
  btn: { width: "100%", borderRadius: 18, overflow: "hidden" as const },
  btnGrad: { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "700" as const, letterSpacing: 0.2 },
});
