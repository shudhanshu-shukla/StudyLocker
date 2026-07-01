import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TodoItem, useStudy } from "@/context/StudyContext";
import { useColors } from "@/hooks/useColors";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function TodoRow({
  item,
  onToggle,
  onEdit,
  onDelete,
  onTransfer,
  isOverdue,
}: {
  item: TodoItem;
  onToggle: () => void;
  onEdit: (text: string) => void;
  onDelete: () => void;
  onTransfer: () => void;
  isOverdue: boolean;
}) {
  const colors = useColors();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.text);
  const inputRef = useRef<TextInput>(null);

  function commitEdit() {
    if (draft.trim().length === 0) return;
    onEdit(draft.trim());
    setEditing(false);
  }

  function startEdit() {
    setDraft(item.text);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: item.carriedOver ? colors.accent + "66" : colors.border }]}>
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle(); }}
        style={[styles.checkbox, {
          borderColor: item.completed ? colors.primary : colors.border,
          backgroundColor: item.completed ? colors.primary : "transparent",
        }]}
      >
        {item.completed && <Feather name="check" size={12} color={colors.primaryForeground} />}
      </Pressable>

      <View style={{ flex: 1 }}>
        {editing ? (
          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={setDraft}
            onBlur={commitEdit}
            onSubmitEditing={commitEdit}
            style={[styles.editInput, { color: colors.foreground, borderBottomColor: colors.primary }]}
            autoFocus
            returnKeyType="done"
          />
        ) : (
          <>
            <Text
              style={[
                styles.todoText,
                { color: item.completed ? colors.mutedForeground : colors.foreground },
                item.completed && styles.strikethrough,
              ]}
              numberOfLines={3}
            >
              {item.text}
            </Text>
            {item.carriedOver && !item.completed && (
              <Text style={[styles.carriedBadge, { color: colors.accent }]}>↩ carried over</Text>
            )}
          </>
        )}
      </View>

      <View style={styles.actions}>
        {!editing && !item.completed && (
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); startEdit(); }}
            style={[styles.actionBtn, { backgroundColor: colors.surface }]}
            hitSlop={8}
          >
            <Feather name="edit-2" size={13} color={colors.mutedForeground} />
          </Pressable>
        )}
        {!item.completed && isOverdue && (
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onTransfer(); }}
            style={[styles.actionBtn, { backgroundColor: colors.accent + "22" }]}
            hitSlop={8}
          >
            <Feather name="arrow-right-circle" size={13} color={colors.accent} />
          </Pressable>
        )}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onDelete(); }}
          style={[styles.actionBtn, { backgroundColor: colors.destructive + "18" }]}
          hitSlop={8}
        >
          <Feather name="trash-2" size={13} color={colors.destructive} />
        </Pressable>
      </View>
    </View>
  );
}

export default function TodoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { todos, addTodo, toggleTodo, editTodo, deleteTodo, transferTomorrow } = useStudy();
  const [newText, setNewText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const today = todayStr();

  const todayTodos = todos.filter((t) => t.date === today);
  const overdueTodos = todos.filter((t) => t.date < today && !t.completed);
  const tomorrowTodos = todos.filter((t) => t.date > today);

  const todayDone = todayTodos.filter((t) => t.completed).length;
  const todayTotal = todayTodos.length;

  function handleAdd() {
    if (newText.trim().length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addTodo(newText.trim());
    setNewText("");
    inputRef.current?.clear();
  }

  function handleDelete(id: string) {
    if (Platform.OS === "web") {
      deleteTodo(id);
    } else {
      Alert.alert("Delete Task", "Remove this task?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteTodo(id) },
      ]);
    }
  }

  function handleTransfer(id: string) {
    transferTomorrow(id);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 100, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>To-Do List</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{formatDateLabel(today)}</Text>
          </View>
          {todayTotal > 0 && (
            <View style={[styles.progressBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.progressText, { color: todayDone === todayTotal ? colors.primary : colors.foreground }]}>
                {todayDone}/{todayTotal}
              </Text>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>done</Text>
            </View>
          )}
        </View>

        {todayTotal > 0 && (
          <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${todayTotal === 0 ? 0 : Math.round((todayDone / todayTotal) * 100)}%` as any,
                },
              ]}
            />
          </View>
        )}

        <View style={[styles.addRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            ref={inputRef}
            value={newText}
            onChangeText={setNewText}
            placeholder="Add a task for today..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.addInput, { color: colors.foreground }]}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            blurOnSubmit={false}
          />
          <Pressable
            onPress={handleAdd}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: newText.trim() ? colors.primary : colors.surface, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="plus" size={18} color={newText.trim() ? colors.primaryForeground : colors.mutedForeground} />
          </Pressable>
        </View>

        {overdueTodos.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View style={styles.sectionHeader}>
              <Feather name="alert-circle" size={13} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>From Previous Days</Text>
              <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>{overdueTodos.length}</Text>
            </View>
            <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
              Tap <Feather name="arrow-right-circle" size={11} color={colors.mutedForeground} /> to move a task to tomorrow
            </Text>
            {overdueTodos.map((item) => (
              <TodoRow
                key={item.id}
                item={item}
                onToggle={() => toggleTodo(item.id)}
                onEdit={(text) => editTodo(item.id, text)}
                onDelete={() => handleDelete(item.id)}
                onTransfer={() => handleTransfer(item.id)}
                isOverdue={true}
              />
            ))}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Feather name="sun" size={13} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Today</Text>
          {todayTotal > 0 && <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>{todayTotal}</Text>}
        </View>

        {todayTodos.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="check-square" size={40} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No tasks for today</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>Add a task above to get started</Text>
          </View>
        ) : (
          todayTodos.map((item) => (
            <TodoRow
              key={item.id}
              item={item}
              onToggle={() => toggleTodo(item.id)}
              onEdit={(text) => editTodo(item.id, text)}
              onDelete={() => handleDelete(item.id)}
              onTransfer={() => handleTransfer(item.id)}
              isOverdue={false}
            />
          ))
        )}

        {tomorrowTodos.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <View style={styles.sectionHeader}>
              <Feather name="calendar" size={13} color={colors.mutedForeground} />
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Scheduled for Tomorrow</Text>
              <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>{tomorrowTodos.length}</Text>
            </View>
            {tomorrowTodos.map((item) => (
              <View key={item.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.7 }]}>
                <View style={[styles.checkbox, { borderColor: colors.border }]} />
                <Text style={[styles.todoText, { color: colors.mutedForeground, flex: 1 }]} numberOfLines={2}>{item.text}</Text>
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={[styles.actionBtn, { backgroundColor: colors.destructive + "18" }]}
                  hitSlop={8}
                >
                  <Feather name="trash-2" size={13} color={colors.destructive} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 3 },
  progressBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1, alignItems: "center" },
  progressText: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  progressLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  progressBar: { height: 4, borderRadius: 2, marginBottom: 20, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  addRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  addInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", paddingHorizontal: 6, paddingVertical: 6 },
  addBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  sectionCount: { fontSize: 12, fontFamily: "Inter_400Regular", marginLeft: 2 },
  sectionHint: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 10, marginLeft: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  todoText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 21 },
  strikethrough: { textDecorationLine: "line-through" as const },
  carriedBadge: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 3 },
  editInput: { fontSize: 15, fontFamily: "Inter_400Regular", borderBottomWidth: 1.5, paddingVertical: 2 },
  actions: { flexDirection: "row", gap: 6, flexShrink: 0 },
  actionBtn: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
});
