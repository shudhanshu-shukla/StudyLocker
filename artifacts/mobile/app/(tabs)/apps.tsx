import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AllowedApp, useStudy } from "@/context/StudyContext";
import { useColors } from "@/hooks/useColors";

const AVAILABLE_APPS: AllowedApp[] = [
  { id: "calc", name: "Calculator", iconName: "hash", category: "Tools" },
  { id: "notes", name: "Notes", iconName: "file-text", category: "Productivity" },
  { id: "dict", name: "Dictionary", iconName: "book-open", category: "Education" },
  { id: "timer", name: "Timer", iconName: "clock", category: "Tools" },
  { id: "map", name: "Maps", iconName: "map", category: "Navigation" },
  { id: "cam", name: "Camera", iconName: "camera", category: "Tools" },
  { id: "docs", name: "Documents", iconName: "folder", category: "Productivity" },
  { id: "email", name: "Email", iconName: "mail", category: "Communication" },
  { id: "music", name: "Study Music", iconName: "music", category: "Focus" },
  { id: "browser", name: "Browser", iconName: "globe", category: "Tools" },
  { id: "translate", name: "Translate", iconName: "globe", category: "Education" },
  { id: "drive", name: "Cloud Storage", iconName: "cloud", category: "Productivity" },
  { id: "whiteboard", name: "Whiteboard", iconName: "edit-3", category: "Education" },
  { id: "flashcard", name: "Flashcards", iconName: "layers", category: "Education" },
  { id: "pdf", name: "PDF Reader", iconName: "file", category: "Education" },
];

const CATEGORIES = ["All", "Education", "Productivity", "Tools", "Focus", "Communication", "Navigation"];

export default function AppsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { allowedApps, addAllowedApp, removeAllowedApp } = useStudy();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filteredApps = AVAILABLE_APPS.filter(
    (a) => (selectedCategory === "All" || a.category === selectedCategory) && !allowedApps.find((al) => al.id === a.id)
  );

  function handleAdd(app: AllowedApp) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addAllowedApp(app);
  }

  function handleRemove(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === "web") {
      removeAllowedApp(id);
    } else {
      Alert.alert("Remove App", "Remove this app from your allowed list?", [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => removeAllowedApp(id) },
      ]);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 100, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Allowed Apps</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Only these apps stay accessible during sessions
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setModalVisible(true); }}
          >
            <Feather name="plus" size={20} color={colors.primaryForeground} />
          </Pressable>
        </View>

        <View style={[styles.shieldBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="shield" size={18} color={colors.primary} />
          <Text style={[styles.shieldText, { color: colors.mutedForeground }]}>
            During study mode, all other apps and notifications are blocked. Only your allowed apps remain accessible.
          </Text>
        </View>

        {allowedApps.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="shield-off" size={44} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No apps allowed yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Tap + to add apps you need during study sessions
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.count, { color: colors.mutedForeground }]}>{allowedApps.length} app{allowedApps.length !== 1 ? "s" : ""} allowed</Text>
            {allowedApps.map((app) => (
              <View key={app.id} style={[styles.appRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.appIconBox, { backgroundColor: colors.primary + "22" }]}>
                  <Feather name={app.iconName as any} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.appName, { color: colors.foreground }]}>{app.name}</Text>
                  <Text style={[styles.appCat, { color: colors.mutedForeground }]}>{app.category}</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.removeBtn, { backgroundColor: colors.destructive + "22", opacity: pressed ? 0.6 : 1 }]}
                  onPress={() => handleRemove(app.id)}
                >
                  <Feather name="x" size={14} color={colors.destructive} />
                </Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Apps</Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.catChip, { backgroundColor: selectedCategory === cat ? colors.primary : colors.card, borderColor: colors.border }]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: selectedCategory === cat ? colors.primaryForeground : colors.foreground }}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <FlatList
            data={filteredApps}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>All apps added</Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.appRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
                onPress={() => { handleAdd(item); }}
              >
                <View style={[styles.appIconBox, { backgroundColor: colors.surface }]}>
                  <Feather name={item.iconName as any} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.appName, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.appCat, { color: colors.mutedForeground }]}>{item.category}</Text>
                </View>
                <View style={[styles.addSmallBtn, { backgroundColor: colors.primary + "22" }]}>
                  <Feather name="plus" size={14} color={colors.primary} />
                </View>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4, maxWidth: 240 },
  addBtn: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  shieldBanner: { borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  shieldText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 260, lineHeight: 20 },
  count: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  appRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  appIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  appName: { fontSize: 15, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  appCat: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  removeBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  addSmallBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
});
