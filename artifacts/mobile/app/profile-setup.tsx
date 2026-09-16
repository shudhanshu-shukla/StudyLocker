import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BOARDS, EXAM_CATEGORIES, ExamCategory, ExamOption } from "@/constants/examOptions";
import { useStudy } from "@/context/StudyContext";
import { useColors } from "@/hooks/useColors";

type Step = "name" | "category" | "exam" | "class_board";

const CAT_EMOJI: Record<string, string> = {
  school: "📚", engineering: "⚙️", medical: "🏥", civil_services: "🏛️",
  ssc_railway: "🚂", banking: "🏦", management: "💼", law: "⚖️",
  design: "🎨", postgrad: "🎓", ca_finance: "📈", cuet: "🌐", other: "📖",
};

export default function ProfileSetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUserProfile } = useStudy();

  const [step, setStep] = useState<Step>("name");
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamOption | null>(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const needsClass = selectedExam?.classes && selectedExam.classes.length > 0;
  const needsBoard = selectedCategory?.id === "school";

  function goBack() {
    if (step === "name") router.replace("/login");
    else if (step === "category") setStep("name");
    else if (step === "exam") setStep("category");
    else if (step === "class_board") setStep("exam");
  }

  function handleNameNext() {
    if (!firstName.trim()) { setError("Please enter your first name."); return; }
    setError("");
    setStep("category");
  }

  function handleCategorySelect(cat: ExamCategory) {
    Haptics.selectionAsync();
    setSelectedCategory(cat);
    setSelectedExam(null);
    setSelectedClass("");
    setSelectedBoard("");
    setStep("exam");
  }

  function handleExamSelect(exam: ExamOption) {
    Haptics.selectionAsync();
    setSelectedExam(exam);
    if (exam.classes?.length || selectedCategory?.id === "school") {
      setStep("class_board");
    } else {
      handleFinish(exam, "", "");
    }
  }

  async function handleFinish(exam?: ExamOption, cls?: string, board?: string) {
    const finalExam = exam ?? selectedExam;
    const finalClass = cls ?? selectedClass;
    const finalBoard = board ?? selectedBoard;
    if (!finalExam) { setError("Please select an exam."); return; }
    setSaving(true);
    try {
      await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        examCategoryId: selectedCategory?.id ?? "",
        examCategoryLabel: selectedCategory?.label ?? "",
        examId: finalExam.id,
        examName: finalExam.name,
        boardName: finalBoard || undefined,
        className: finalClass || undefined,
        setupComplete: true,
      });
      router.replace("/welcome");
    } catch {
      setError("Could not save profile. Please try again.");
      setSaving(false);
    }
  }

  const STEP_LABELS: Record<Step, string> = {
    name: "Your Name",
    category: "What are you studying for?",
    exam: selectedCategory?.label ?? "Select Exam",
    class_board: "Almost done!",
  };
  const STEPS: Step[] = ["name", "category", "exam", "class_board"];
  const stepIdx = STEPS.indexOf(step);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={goBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>
            Step {stepIdx + 1} of {needsClass || needsBoard ? 4 : 3}
          </Text>
          <Image
            source={require("../assets/studylocker-new.png")}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{STEP_LABELS[step]}</Text>
        <View style={styles.progress}>
          {STEPS.slice(0, needsClass || needsBoard ? 4 : 3).map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                { backgroundColor: i <= stepIdx ? colors.primary : colors.border },
                i <= stepIdx && { flex: 2 },
              ]}
            />
          ))}
        </View>
      </View>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: colors.destructive + "18", marginHorizontal: 20, marginTop: 12 }]}>
          <Text style={{ color: colors.destructive, fontSize: 13, fontFamily: "Inter_400Regular" }}>{error}</Text>
        </View>
      ) : null}

      {step === "name" && (
        <View style={[styles.nameStep, { paddingBottom: insets.bottom + 24 }]}>
          <View style={{ gap: 14 }}>
            <View>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>First Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="e.g. Arjun"
                placeholderTextColor={colors.mutedForeground}
                autoFocus
                autoCorrect={false}
              />
            </View>
            <View>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Last Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="e.g. Sharma (optional)"
                placeholderTextColor={colors.mutedForeground}
                autoCorrect={false}
              />
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.nextBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
            onPress={handleNameNext}
          >
            <Text style={styles.nextBtnText}>Continue →</Text>
          </Pressable>
        </View>
      )}

      {step === "category" && (
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {EXAM_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [
                styles.catCard,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => handleCategorySelect(cat)}
            >
              <View style={[styles.catIcon, { backgroundColor: colors.primary + "22" }]}>
                <Text style={styles.catEmoji}>{CAT_EMOJI[cat.id] ?? "📖"}</Text>
              </View>
              <Text style={[styles.catLabel, { color: colors.foreground }]}>{cat.label}</Text>
              <Text style={[styles.chevron, { color: colors.mutedForeground }]}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {step === "exam" && selectedCategory && (
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 8, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {selectedCategory.exams.map((exam) => (
            <Pressable
              key={exam.id}
              style={({ pressed }) => [
                styles.examCard,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => handleExamSelect(exam)}
            >
              <Text style={[styles.examName, { color: colors.foreground }]}>{exam.name}</Text>
              <Text style={[styles.chevron, { color: colors.mutedForeground }]}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {step === "class_board" && selectedExam && (
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
        >
          {needsClass && (
            <View style={{ gap: 10 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Select Your Class</Text>
              <View style={styles.pillRow}>
                {(selectedExam.classes ?? []).map((cls) => (
                  <Pressable
                    key={cls}
                    style={[
                      styles.pill,
                      { borderColor: selectedClass === cls ? colors.primary : colors.border, backgroundColor: selectedClass === cls ? colors.primary : colors.card },
                    ]}
                    onPress={() => { setSelectedClass(cls); Haptics.selectionAsync(); }}
                  >
                    <Text style={[styles.pillText, { color: selectedClass === cls ? "#fff" : colors.foreground }]}>{cls}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {needsBoard && (
            <View style={{ gap: 10 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Select Your Board</Text>
              <View style={{ gap: 6 }}>
                {BOARDS.map((b) => (
                  <Pressable
                    key={b}
                    style={[
                      styles.boardRow,
                      { borderColor: selectedBoard === b ? colors.primary : colors.border, backgroundColor: selectedBoard === b ? colors.primary + "18" : colors.card },
                    ]}
                    onPress={() => { setSelectedBoard(b); Haptics.selectionAsync(); }}
                  >
                    {selectedBoard === b && <Text style={[styles.checkMark, { color: colors.primary }]}>✓</Text>}
                    <Text style={[styles.boardText, { color: colors.foreground }]}>{b}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.nextBtn,
              { backgroundColor: colors.primary, opacity: pressed || saving ? 0.8 : 1 },
              (!selectedClass && needsClass) || (!selectedBoard && needsBoard) ? { opacity: 0.4 } : {},
            ]}
            onPress={() => handleFinish()}
            disabled={saving || (!selectedClass && !!needsClass) || (!selectedBoard && !!needsBoard)}
          >
            <Text style={styles.nextBtnText}>{saving ? "Saving…" : "Let's Study! 🎯"}</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#2563EB" },
  backArrow: { fontSize: 22, color: "#fff", lineHeight: 26, fontWeight: "600" as const },
  brandLogo: { width: 40, height: 40, borderRadius: 11 },
  stepLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  title: { fontSize: 24, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  progress: { flexDirection: "row", gap: 6, marginTop: 4 },
  progressDot: { height: 4, flex: 1, borderRadius: 2 },
  nameStep: { flex: 1, justifyContent: "space-between", padding: 20 },
  inputLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 6 },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontFamily: "Inter_400Regular" },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, paddingVertical: 15 },
  nextBtnText: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", color: "#fff" },
  catCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, borderWidth: 1, padding: 16 },
  catIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  catEmoji: { fontSize: 22 },
  catLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  chevron: { fontSize: 22, fontWeight: "300" as const },
  checkMark: { fontSize: 15, fontWeight: "700" as const },
  examCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 14, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 16 },
  examName: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 17, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 50, borderWidth: 1.5 },
  pillText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  boardRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  boardText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  errorBox: { borderRadius: 12, padding: 12 },
});
