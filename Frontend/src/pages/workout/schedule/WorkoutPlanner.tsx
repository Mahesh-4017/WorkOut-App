import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { OnboardingHeader } from "../../../components/OnboardingUI";
import { useSchedule } from "../../../data/ScheduleProvider";
import { addDays, toKey } from "../../../data/classSchedule";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { useTheme } from "../../../theme/ThemeProvider";
import { weekdayName } from "../../../utils/scheduleReminders";

type PlannerMode = "workout" | "day";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function nextSevenDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => addDays(today, index));
}

function planDateLabel(date: string) {
  const day = new Date(`${date}T12:00:00`);
  if (date === toKey(new Date())) return "Today";
  const tomorrow = addDays(new Date(), 1);
  if (date === toKey(tomorrow)) return "Tomorrow";
  return day.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export default function WorkoutPlanner() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { scheduled, dayPlans, loading, error, addDayPlan, remove, removeDayPlan, refresh } = useSchedule();
  const [mode, setMode] = useState<PlannerMode>(route.params?.mode === "day" ? "day" : "workout");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(route.params?.date ?? toKey(new Date()));
  const [time, setTime] = useState("18:00");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useFocusEffect(React.useCallback(() => {
    refresh();
  }, [refresh]));

  React.useEffect(() => {
    if (route.params?.mode === "day" || route.params?.mode === "workout") setMode(route.params.mode);
    if (route.params?.date) setDate(route.params.date);
  }, [route.params?.date, route.params?.mode]);

  const nextDates = useMemo(nextSevenDays, []);
  const todayKey = toKey(new Date());
  const weekEnd = toKey(addDays(new Date(), 6));
  const upcomingWorkouts = scheduled.filter(item => item.date >= todayKey && item.date <= weekEnd);
  const upcomingDayPlans = useMemo(() => {
    const instances: { id: string; title: string; description: string; date: string; time: string; repeatDays: number[]; reminderEnabled: boolean }[] = [];
    for (const plan of dayPlans) {
      for (const day of nextDates) {
        const key = toKey(day);
        const isDue = plan.repeatDays.length
          ? key >= plan.date && plan.repeatDays.includes(day.getDay())
          : key === plan.date;
        if (isDue) instances.push({ ...plan, date: key });
      }
    }
    return instances.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [dayPlans, nextDates]);

  const saveDayPlan = async () => {
    if (!title.trim()) {
      setMessage("Add a short title so you remember what this plan is for.");
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      setMessage("Enter a time in 24-hour format, for example 18:00.");
      return;
    }
    if (reminderEnabled && !repeatDays.length && date === todayKey && new Date(`${date}T${time}:00`).getTime() <= Date.now()) {
      setMessage("Choose a future time for today's reminder.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const saved = await addDayPlan({
        title: title.trim(),
        description: description.trim(),
        date,
        time,
        repeatDays,
        reminderEnabled,
      });
      if (saved) {
        setTitle("");
        setDescription("");
        setRepeatDays([]);
        setReminderEnabled(false);
        setMessage("Your plan is saved.");
      }
    } finally {
      setSaving(false);
    }
  };

  const weekdaySummary = (days: number[]) => days.length
    ? `Every ${days.map(weekdayName).join(", ")}`
    : null;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <OnboardingHeader title={mode === "day" ? "Personal day plan" : "Plan your day"} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          {mode === "day"
            ? "Add reminders for personal activities; workout plans are managed in your workout schedule."
            : "Make space for movement and everything else that matters."}
        </Text>
        {route.params?.mode !== "day" ? (
          <View style={styles.modeSwitch}>
            {([
              ["workout", "Workout", "barbell-outline"],
              ["day", "Full day", "calendar-outline"],
            ] as const).map(([value, label, icon]) => {
              const active = mode === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => { setMode(value); setMessage(""); }}
                  style={[styles.modeButton, active && styles.modeButtonActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                >
                  <Ionicons name={icon} size={17} color={active ? theme.colors.onPrimary : theme.colors.muted} />
                  <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {mode === "workout" ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroIcon}><Ionicons name="fitness-outline" size={23} color={theme.colors.onPrimary} /></View>
              <Text style={styles.heroTitle}>Choose an exercise and set your time</Text>
              <Text style={styles.heroText}>Plan it for a specific day or repeat it on the weekdays you choose.</Text>
              <Pressable
                onPress={() => navigation.navigate(WORKOUT_ROUTES.DATE_CLASSES, { date: todayKey })}
                style={styles.primaryButton}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>Plan a workout</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.onPrimary} />
              </Pressable>
            </View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Workout schedule</Text>
              <Pressable onPress={() => navigation.navigate(WORKOUT_ROUTES.SCHEDULE)} accessibilityRole="button">
                <Text style={styles.link}>Calendar</Text>
              </Pressable>
            </View>
            {upcomingWorkouts.length === 0 ? (
              <Text style={styles.empty}>No workouts planned for the next 7 days.</Text>
            ) : upcomingWorkouts.map(item => (
              <View key={`${item.id}-${item.date}`} style={styles.planCard}>
                <View style={[styles.planIcon, styles.orangeSurface]}>
                  <Ionicons name="barbell-outline" size={19} color={theme.colors.primary} />
                </View>
                <View style={styles.planCopy}>
                  <Text style={styles.planTitle}>{item.title}</Text>
                  <Text style={styles.planMeta}>{planDateLabel(item.date)} · {item.time}</Text>
                  <Text style={styles.planNote}>
                    {weekdaySummary(item.repeatDays) ?? `${item.durationMinutes} min · ${item.bodyPart || item.category || "Workout"}`}
                    {item.reminderEnabled ? " · Reminder on" : ""}
                  </Text>
                </View>
                <Pressable onPress={() => remove(item.id)} hitSlop={9} accessibilityRole="button" accessibilityLabel={`Remove ${item.title} from schedule`}>
                  <Ionicons name="trash-outline" size={17} color={theme.colors.muted} />
                </Pressable>
              </View>
            ))}
          </>
        ) : (
          <>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Add something to your day</Text>
              <Text style={styles.formHelp}>Study, errands, a bath, meals, rest, or anything you want to remember.</Text>

              <Text style={styles.label}>What do you want to remember?</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                placeholder="e.g. Study after dinner"
                placeholderTextColor={theme.colors.muted}
                maxLength={160}
                accessibilityLabel="Plan title"
              />
              <Text style={[styles.label, styles.labelGap]}>Add a note (optional)</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                style={[styles.input, styles.descriptionInput]}
                placeholder="Add any details you want to keep in mind"
                placeholderTextColor={theme.colors.muted}
                maxLength={500}
                multiline
                textAlignVertical="top"
                accessibilityLabel="Plan description"
              />

              <Text style={[styles.label, styles.labelGap]}>When?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateOptions}>
                {nextDates.map((day, index) => {
                  const key = toKey(day);
                  const selected = key === date;
                  return (
                    <Pressable key={key} onPress={() => setDate(key)} style={[styles.dateButton, selected && styles.dateButtonActive]} accessibilityRole="button" accessibilityState={{ selected }}>
                      <Text style={[styles.dateWeekday, selected && styles.dateTextActive]}>{index === 0 ? "Today" : index === 1 ? "Tomorrow" : day.toLocaleDateString(undefined, { weekday: "short" })}</Text>
                      <Text style={[styles.dateNumber, selected && styles.dateTextActive]}>{day.getDate()}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={[styles.label, styles.labelGap]}>Time (24-hour format)</Text>
              <TextInput
                value={time}
                onChangeText={setTime}
                style={styles.input}
                placeholder="18:00"
                placeholderTextColor={theme.colors.muted}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                accessibilityLabel="Plan time"
              />

              <Text style={[styles.label, styles.labelGap]}>Repeat weekly (optional)</Text>
              <View style={styles.weekdays}>
                {WEEKDAYS.map((day, index) => {
                  const selected = repeatDays.includes(index);
                  return (
                    <Pressable
                      key={`weekday-${index}`}
                      onPress={() => setRepeatDays(current => selected ? current.filter(value => value !== index) : [...current, index].sort())}
                      style={[styles.weekdayButton, selected && styles.weekdayButtonActive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`${selected ? "Stop repeating on" : "Repeat on"} ${day}`}
                    >
                      <Text style={[styles.weekdayText, selected && styles.dateTextActive]}>{day}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                onPress={() => setReminderEnabled(value => !value)}
                style={styles.reminderRow}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: reminderEnabled }}
              >
                <Ionicons name={reminderEnabled ? "checkbox" : "square-outline"} size={20} color={theme.colors.primary} />
                <View style={styles.reminderCopy}>
                  <Text style={styles.reminderTitle}>Send me a notification</Text>
                  <Text style={styles.reminderHelp}>A device reminder at the time you set.</Text>
                </View>
              </Pressable>

              {message ? <Text style={styles.message}>{message}</Text> : null}
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable onPress={saveDayPlan} disabled={saving} style={[styles.primaryButton, saving && styles.disabled]} accessibilityRole="button">
                <Text style={styles.primaryButtonText}>{saving ? "Saving…" : "Save my day plan"}</Text>
                <Ionicons name="checkmark" size={17} color={theme.colors.onPrimary} />
              </Pressable>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your next 7 days</Text>
              <Text style={styles.planCount}>{upcomingDayPlans.length} plan{upcomingDayPlans.length === 1 ? "" : "s"}</Text>
            </View>
            {loading ? <Text style={styles.empty}>Loading your plans…</Text> : null}
            {upcomingDayPlans.length === 0 ? (
              <Text style={styles.empty}>Your personal plans will show here.</Text>
            ) : upcomingDayPlans.map(item => (
              <View key={`${item.id}-${item.date}`} style={styles.planCard}>
                <View style={[styles.planIcon, styles.orangeSurface]}>
                  <Ionicons name="calendar-outline" size={19} color={theme.colors.primary} />
                </View>
                <View style={styles.planCopy}>
                  <Text style={styles.planTitle}>{item.title}</Text>
                  <Text style={styles.planMeta}>{planDateLabel(item.date)} · {item.time}</Text>
                  {item.description ? <Text numberOfLines={2} style={styles.planNote}>{item.description}</Text> : null}
                  {item.repeatDays.length ? <Text style={styles.planNote}>{weekdaySummary(item.repeatDays)}{item.reminderEnabled ? " · Reminder on" : ""}</Text> : item.reminderEnabled ? <Text style={styles.planNote}>Reminder on</Text> : null}
                </View>
                <Pressable onPress={() => removeDayPlan(item.id)} hitSlop={9} accessibilityRole="button" accessibilityLabel={`Remove ${item.title} from your day plan`}>
                  <Ionicons name="trash-outline" size={17} color={theme.colors.muted} />
                </Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
  content: { paddingBottom: 32 },
  intro: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4, marginBottom: 15, fontFamily: theme.typography.fontFamily },
  modeSwitch: { flexDirection: "row", padding: 4, gap: 5, borderRadius: 14, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  modeButton: { flex: 1, minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 10 },
  modeButtonActive: { backgroundColor: theme.colors.primary },
  modeText: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  modeTextActive: { color: theme.colors.onPrimary },
  heroCard: { padding: 16, marginTop: 14, borderRadius: 17, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  heroIcon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.primary },
  heroTitle: { color: theme.colors.text, fontSize: 17, lineHeight: 22, marginTop: 12, fontFamily: theme.typography.fontFamilyBold },
  heroText: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 5, fontFamily: theme.typography.fontFamily },
  primaryButton: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14, borderRadius: 13, backgroundColor: theme.colors.primary },
  primaryButtonText: { color: theme.colors.onPrimary, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 10 },
  sectionTitle: { color: theme.colors.text, fontSize: 15, fontFamily: theme.typography.fontFamilyBold },
  link: { color: theme.colors.primary, fontSize: 11, fontFamily: theme.typography.fontFamilyBold },
  planCount: { color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamilyMedium },
  empty: { color: theme.colors.muted, fontSize: 11, lineHeight: 17, paddingVertical: 9, fontFamily: theme.typography.fontFamily },
  planCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 11, marginBottom: 8, borderRadius: 14, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  planIcon: { width: 39, height: 39, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  orangeSurface: { backgroundColor: theme.colors.panelWarm },
  planCopy: { flex: 1 },
  planTitle: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  planMeta: { color: theme.colors.primary, fontSize: 10, marginTop: 3, fontFamily: theme.typography.fontFamilyMedium },
  planNote: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3, fontFamily: theme.typography.fontFamily },
  formCard: { padding: 15, marginTop: 14, borderRadius: 17, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  formTitle: { color: theme.colors.text, fontSize: 17, fontFamily: theme.typography.fontFamilyBold },
  formHelp: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4, marginBottom: 15, fontFamily: theme.typography.fontFamily },
  label: { color: theme.colors.text, fontSize: 11, marginBottom: 6, fontFamily: theme.typography.fontFamilyBold },
  labelGap: { marginTop: 14 },
  input: { minHeight: 43, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamily },
  descriptionInput: { height: 74, paddingTop: 11 },
  dateOptions: { gap: 7, paddingVertical: 2 },
  dateButton: { width: 55, alignItems: "center", paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  dateButtonActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  dateWeekday: { color: theme.colors.muted, fontSize: 9, fontFamily: theme.typography.fontFamilyMedium },
  dateNumber: { color: theme.colors.text, fontSize: 14, marginTop: 3, fontFamily: theme.typography.fontFamilyBold },
  dateTextActive: { color: theme.colors.onPrimary },
  weekdays: { flexDirection: "row", justifyContent: "space-between", gap: 5 },
  weekdayButton: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 9, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  weekdayButtonActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  weekdayText: { color: theme.colors.text, fontSize: 9, fontFamily: theme.typography.fontFamilyMedium },
  reminderRow: { flexDirection: "row", alignItems: "center", gap: 9, padding: 10, marginTop: 14, borderRadius: 10, backgroundColor: theme.colors.surface },
  reminderCopy: { flex: 1 },
  reminderTitle: { color: theme.colors.text, fontSize: 11, fontFamily: theme.typography.fontFamilyBold },
  reminderHelp: { color: theme.colors.muted, fontSize: 9, marginTop: 2, fontFamily: theme.typography.fontFamily },
  message: { color: theme.colors.primary, fontSize: 11, marginTop: 10, fontFamily: theme.typography.fontFamilyMedium },
  error: { color: theme.colors.error ?? "#B42318", fontSize: 11, lineHeight: 16, marginTop: 10, fontFamily: theme.typography.fontFamilyMedium },
  disabled: { opacity: 0.6 },
});
