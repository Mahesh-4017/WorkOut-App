import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { ExerciseBodyPart, getAllPublicExercises, getExerciseBodyParts, PublicExercise } from "../../../api/exercises";
import { resolveApiMediaUrl } from "../../../api/client";
import { useSchedule } from "../../../data/ScheduleProvider";
import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { OnboardingHeader } from "../../../components/OnboardingUI";

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const todayKey = () => dateKey(new Date());

export default function DateClasses() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { addExercise, error: scheduleError } = useSchedule();
  const [date, setDate] = useState<string>(() => params?.date >= todayKey() ? params.date : todayKey());
  const [bodyParts, setBodyParts] = useState<ExerciseBodyPart[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [exercises, setExercises] = useState<PublicExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<PublicExercise | null>(null);
  const [time, setTime] = useState("18:00");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dates = useMemo(() => Array.from({ length: 14 }, (_, index) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requested = params?.date ? new Date(`${params.date}T12:00:00`) : today;
    const futureDate = dateKey(requested) > dateKey(today);
    const first = futureDate ? new Date(requested) : today;
    if (futureDate) first.setDate(first.getDate() - 3);
    if (dateKey(first) < dateKey(today)) first.setTime(today.getTime());
    const day = new Date(first);
    day.setDate(day.getDate() + index);
    return day;
  }), [params?.date]);

  useEffect(() => {
    if (params?.date) setDate(params.date >= todayKey() ? params.date : todayKey());
  }, [params?.date]);

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [parts, list] = await Promise.all([
        getExerciseBodyParts(),
        getAllPublicExercises(selectedBodyPart ? { bodyPart: selectedBodyPart } : {}),
      ]);
      setBodyParts(parts);
      setExercises(list);
      setSelectedExercise(current => current && list.some(item => item._id === current._id) ? current : null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load published workouts.");
    } finally {
      setLoading(false);
    }
  }, [selectedBodyPart]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const scheduleSelected = async () => {
    if (!selectedExercise || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      setError("Choose a workout and enter a time in 24-hour format, such as 18:00.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await addExercise(selectedExercise, date, time, duration);
      if (saved) navigation.navigate(WORKOUT_ROUTES.SCHEDULE);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <OnboardingHeader title="Plan a workout" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Choose a day</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
          {dates.map(day => {
            const key = dateKey(day);
            const selected = key === date;
            return (
              <Pressable key={key} onPress={() => setDate(key)} style={[styles.dateCard, selected && styles.dateCardSelected]} accessibilityRole="button" accessibilityState={{ selected }}>
                <Text style={[styles.dateDay, selected && styles.dateSelectedText]}>{day.toLocaleDateString(undefined, { weekday: "short" })}</Text>
                <Text style={[styles.dateNumber, selected && styles.dateSelectedText]}>{day.getDate()}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.heading}>Pick a published workout</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <Pressable onPress={() => setSelectedBodyPart("")} style={[styles.filter, !selectedBodyPart && styles.filterSelected]}>
            <Text style={[styles.filterText, !selectedBodyPart && styles.filterSelectedText]}>All</Text>
          </Pressable>
          {bodyParts.map(part => (
            <Pressable key={part.name} onPress={() => setSelectedBodyPart(part.name)} style={[styles.filter, selectedBodyPart === part.name && styles.filterSelected]}>
              <Text style={[styles.filterText, selectedBodyPart === part.name && styles.filterSelectedText]}>{part.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? <Text style={styles.note}>Loading published workouts…</Text> : null}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => loadLibrary()} accessibilityRole="button"><Text style={styles.retry}>Retry</Text></Pressable>
          </View>
        ) : null}
        {!loading && !error && exercises.length === 0 ? <Text style={styles.note}>No published workouts are available in this category yet.</Text> : null}
        {exercises.map(exercise => {
          const selected = selectedExercise?._id === exercise._id;
          return (
            <Pressable key={exercise._id} onPress={() => setSelectedExercise(exercise)} style={[styles.exerciseCard, selected && styles.exerciseSelected]} accessibilityRole="button" accessibilityState={{ selected }}>
              {exercise.imageUrl ? (
                <Image source={{ uri: resolveApiMediaUrl(exercise.imageUrl) }} style={styles.exerciseImage} />
              ) : (
                <View style={[styles.exerciseImage, styles.imageFallback]}><Ionicons name="barbell-outline" size={22} color={theme.colors.primary} /></View>
              )}
              <View style={styles.exerciseInfo}>
                <Text numberOfLines={1} style={styles.exerciseTitle}>{exercise.title}</Text>
                <Text style={styles.exerciseMeta}>{[exercise.bodyPart, exercise.category, `${exercise.durationMinutes} min`].filter(Boolean).join(" · ")}</Text>
              </View>
              <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} size={22} color={selected ? theme.colors.primary : theme.colors.muted} />
            </Pressable>
          );
        })}

        <View style={styles.details}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start time</Text>
            <TextInput value={time} onChangeText={setTime} style={styles.input} keyboardType="numbers-and-punctuation" maxLength={5} placeholder="18:00" placeholderTextColor={theme.colors.muted} accessibilityLabel="Workout start time" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.durationRow}>
              {[20, 30, 45, 60].map(value => (
                <Pressable key={value} onPress={() => setDuration(value)} style={[styles.durationOption, duration === value && styles.durationSelected]}>
                  <Text style={[styles.durationText, duration === value && styles.durationSelectedText]}>{value}m</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
        {scheduleError ? <Text style={styles.errorText}>{scheduleError}</Text> : null}
        <Pressable onPress={scheduleSelected} disabled={saving} style={[styles.saveButton, saving && styles.disabled]} accessibilityRole="button">
          <Text style={styles.saveText}>{saving ? "Saving…" : "Add to my schedule"}</Text>
        </Pressable>
        <Text style={styles.note}>Schedules expire after their planned day.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
  content: { paddingBottom: 28 },
  heading: { color: theme.colors.text, fontSize: 17, marginTop: 16, marginBottom: 10, fontFamily: theme.typography.fontFamilyBold },
  dateList: { gap: 8, paddingBottom: 4 },
  dateCard: { width: 58, paddingVertical: 10, alignItems: "center", borderRadius: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  dateCardSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  dateDay: { color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
  dateNumber: { color: theme.colors.text, fontSize: 16, marginTop: 4, fontFamily: theme.typography.fontFamilyBold },
  dateSelectedText: { color: theme.colors.onPrimary },
  filters: { gap: 8, paddingBottom: 4 },
  filter: { borderRadius: 18, paddingHorizontal: 13, paddingVertical: 8, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  filterSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
  filterSelectedText: { color: theme.colors.onPrimary },
  exerciseCard: { flexDirection: "row", alignItems: "center", gap: 11, padding: 10, marginTop: 9, borderRadius: 14, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  exerciseSelected: { borderColor: theme.colors.primary, borderWidth: 2 },
  exerciseImage: { width: 54, height: 54, borderRadius: 10, backgroundColor: theme.colors.surface },
  imageFallback: { alignItems: "center", justifyContent: "center" },
  exerciseInfo: { flex: 1 },
  exerciseTitle: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
  exerciseMeta: { color: theme.colors.muted, fontSize: 10, marginTop: 3, fontFamily: theme.typography.fontFamily },
  details: { flexDirection: "row", gap: 14, marginTop: 18 },
  inputGroup: { flex: 1 },
  label: { color: theme.colors.text, fontSize: 12, marginBottom: 7, fontFamily: theme.typography.fontFamilyBold },
  input: { color: theme.colors.text, height: 42, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12, backgroundColor: theme.colors.card },
  durationRow: { flexDirection: "row", gap: 4 },
  durationOption: { flex: 1, alignItems: "center", justifyContent: "center", height: 42, borderRadius: 9, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  durationSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  durationText: { color: theme.colors.text, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
  durationSelectedText: { color: theme.colors.onPrimary },
  saveButton: { alignItems: "center", justifyContent: "center", height: 48, borderRadius: 24, marginTop: 16, backgroundColor: theme.colors.primary },
  disabled: { opacity: 0.6 },
  saveText: { color: theme.colors.onPrimary, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
  note: { color: theme.colors.muted, fontSize: 11, marginTop: 12, fontFamily: theme.typography.fontFamily },
  errorBox: { padding: 12, marginTop: 10, borderRadius: 12, backgroundColor: theme.colors.card },
  errorText: { color: theme.colors.error ?? "#B42318", fontSize: 12, marginTop: 8, fontFamily: theme.typography.fontFamily },
  retry: { color: theme.colors.primary, marginTop: 8, fontFamily: theme.typography.fontFamilyBold },
});
