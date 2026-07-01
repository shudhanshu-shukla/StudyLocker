import { Feather } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStudy } from "@/context/StudyContext";
import { useColors } from "@/hooks/useColors";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const IS_CONFIGURED = !!GOOGLE_CLIENT_ID;

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { loginWithGoogle } = useStudy();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pass a non-empty fallback so the hook doesn't throw when unconfigured.
  // We gate promptAsync() on IS_CONFIGURED below.
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID || "not-configured",
  });

  useEffect(() => {
    if (response?.type === "success" && response.authentication?.accessToken) {
      handleGoogleSuccess(response.authentication.accessToken);
    } else if (response?.type === "error") {
      setError("Sign-in failed. Please try again.");
      setLoading(false);
    }
  }, [response]);

  async function handleGoogleSuccess(accessToken: string) {
    try {
      setLoading(true);
      const profileRes = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await profileRes.json();
      await loginWithGoogle({
        googleId: profile.id,
        email: profile.email,
        firstName: profile.given_name ?? profile.name ?? "",
        lastName: profile.family_name ?? "",
        avatarUrl: profile.picture ?? "",
      });
    } catch {
      setError("Could not fetch your profile. Try again.");
      setLoading(false);
    }
  }

  async function handleSignIn() {
    if (!IS_CONFIGURED) {
      setError("Google Sign-In is not yet configured. See setup instructions below.");
      return;
    }
    setError("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await promptAsync();
    if (response?.type !== "success") setLoading(false);
  }

  const topPad = Platform.OS === "web" ? 0 : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: topPad }}>
      <View style={styles.top}>
        <View style={[styles.logoBox, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
          <Feather name="shield" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.appName, { color: colors.foreground }]}>StudyLock</Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>Your personal focus companion</Text>
      </View>

      <View style={styles.mid}>
        <Text style={[styles.headline, { color: colors.foreground }]}>Stay focused.</Text>
        <Text style={[styles.headline, { color: colors.primary }]}>Achieve more.</Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>
          Sign in with your Google account to save your progress, sessions, and study data across any device.
        </Text>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 32 }]}>
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "44" }]}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.googleBtn,
            { backgroundColor: "#fff", opacity: pressed || loading ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
          onPress={handleSignIn}
          disabled={loading || !request}
        >
          {loading ? (
            <ActivityIndicator color="#444" size="small" />
          ) : (
            <>
              <View style={styles.googleIconBox}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Sign in with Google</Text>
            </>
          )}
        </Pressable>

        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          By signing in, you agree to use this app for personal study purposes.
        </Text>

        <View style={styles.features}>
          {[
            { icon: "lock", text: "Block distracting apps & notifications" },
            { icon: "bar-chart-2", text: "Track sessions, streaks & progress" },
            { icon: "check-square", text: "Manage your daily study to-do list" },
          ].map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <Feather name={f.icon as any} size={14} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{f.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  logoBox: { width: 96, height: 96, borderRadius: 28, alignItems: "center", justifyContent: "center", borderWidth: 2, marginBottom: 8 },
  appName: { fontSize: 34, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  tagline: { fontSize: 15, fontFamily: "Inter_400Regular" },
  mid: { paddingHorizontal: 28, gap: 8, marginBottom: 28 },
  headline: { fontSize: 30, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -0.5, lineHeight: 38 },
  desc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, marginTop: 4 },
  bottom: { paddingHorizontal: 24, gap: 14 },
  errorBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  errorText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  googleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, borderRadius: 16, paddingVertical: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  googleIconBox: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  googleIconText: { fontSize: 18, fontWeight: "700" as const, color: "#4285F4", fontFamily: "Inter_700Bold" },
  googleBtnText: { fontSize: 16, fontWeight: "600" as const, color: "#333", fontFamily: "Inter_600SemiBold" },
  note: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
  features: { gap: 10, marginTop: 4 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
