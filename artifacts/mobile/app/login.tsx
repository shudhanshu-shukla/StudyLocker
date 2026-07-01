import * as Google from "expo-auth-session/providers/google";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
      setError("Google Sign-In is not yet configured.\nAdd EXPO_PUBLIC_GOOGLE_CLIENT_ID to secrets.");
      return;
    }
    setError("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await promptAsync();
    if (response?.type !== "success") setLoading(false);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Logo */}
      <View style={styles.center}>
        <Image
          source={require("../assets/logo.jpg")}
          style={styles.logoImg}
          resizeMode="contain"
        />
      </View>

      {/* Bottom actions */}
      <View style={styles.bottom}>
        {error ? (
          <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.googleBtn,
            { opacity: pressed || loading ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
          onPress={handleSignIn}
          disabled={loading || !request}
        >
          {loading ? (
            <ActivityIndicator color="#333" size="small" />
          ) : (
            <>
              <Text style={styles.gLetter}>G</Text>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </Pressable>

        <Text style={[styles.privacy, { color: colors.mutedForeground }]}>
          Your study data is saved to your account
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "space-between", paddingHorizontal: 28 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  logoImg: { width: 260, height: 260, borderRadius: 48 },
  bottom: { paddingBottom: 12, gap: 12 },
  error: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  googleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#ffffff", borderRadius: 16, paddingVertical: 15,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  gLetter: { fontSize: 18, fontWeight: "700" as const, color: "#4285F4", fontFamily: "Inter_700Bold" },
  googleBtnText: { fontSize: 16, fontWeight: "600" as const, color: "#222", fontFamily: "Inter_600SemiBold" },
  privacy: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
});
