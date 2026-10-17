import React, { useMemo, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import DatePicker from "react-native-date-picker";
import NotificationSounds, { playSampleSound, stopSampleSound, Sound } from "react-native-notification-sounds";

import { OnboardingHeader } from "../../../components/OnboardingUI";
import { useSchedule } from "../../../data/ScheduleProvider";
import { addDays, toKey } from "../../../data/classSchedule";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { useTheme } from "../../../theme/ThemeProvider";
import { weekdayName } from "../../../utils/scheduleReminders";
import {
  addDaysToDateKey,
  indiaDateKey,
  indiaDateLabel,
  indiaDateTime,
  indiaDayOfMonth,
  indiaTimeFromDate,
  indiaWeekday,
  indiaWeekdayLabel,
  indiaTimestamp,
  INDIA_TIMEZONE_OFFSET_MINUTES,
} from "../../../utils/indiaTime";

type PlannerMode = "workout" | "day";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WorkoutPlanner() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { scheduled, dayPlans, loading, error, addDayPlan, remove, removeDayPlan, refresh } = useSchedule();
  const [mode, setMode] = useState<PlannerMode>(route.params?.mode === "day" ? "day" : "workout");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(route.params?.date ?? indiaDateKey());
  const [time, setTime] = useState("18:00");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => indiaDateTime(indiaDateKey(), "18:00"));
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [loadingSounds, setLoadingSounds] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  useFocusEffect(React.useCallback(() => {
    refresh();
  }, [refresh]));

  React.useEffect(() => {
    if (route.params?.mode === "day" || route.params?.mode === "workout") setMode(route.params.mode);
    if (route.params?.date) setDate(route.params.date);
  }, [route.params?.date, route.params?.mode]);

  const todayIndiaKey = indiaDateKey();
  const nextDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDaysToDateKey(todayIndiaKey, index)),
    [todayIndiaKey],
  );
  const todayKey = toKey(new Date());
  const weekEnd = toKey(addDays(new Date(), 6));
  const upcomingWorkouts = scheduled.filter(item => item.date >= todayKey && item.date <= weekEnd);
  const workoutPlanGroups = useMemo(() => {
    const groups = new Map<string, typeof upcomingWorkouts>();
    for (const workout of upcomingWorkouts) {
      const key = workout.date;
      const group = groups.get(key);
      if (group) group.push(workout);
      else groups.set(key, [workout]);
    }
    return Array.from(groups.values()).map(group => group.sort((a, b) => a.time.localeCompare(b.time)));
  }, [upcomingWorkouts]);
  const upcomingDayPlans = useMemo(() => {
    const plans: (typeof dayPlans[number] & { scheduleLabel: string; nextDate: string })[] = [];
    for (const plan of dayPlans) {
      const nextDate = nextDates.find(key => plan.repeatDays.length
        ? key >= plan.date && plan.repeatDays.includes(indiaWeekday(key))
        : key === plan.date);
      if (!nextDate) continue;
      const scheduleLabel = plan.repeatDays.length === 7
        ? "Every day"
        : plan.repeatDays.length
          ? `Every ${plan.repeatDays.map(weekdayName).join(", ")}`
          : indiaDateLabel(plan.date, todayIndiaKey);
      plans.push({ ...plan, nextDate, scheduleLabel: scheduleLabel ?? "" });
    }
    return plans.sort((a, b) => `${a.nextDate}${a.time}`.localeCompare(`${b.nextDate}${b.time}`));
  }, [dayPlans, nextDates, todayIndiaKey]);
  const visibleWorkoutGroups = showAllUpcoming ? workoutPlanGroups : workoutPlanGroups.slice(0, 3);
  const visibleDayPlans = showAllUpcoming ? upcomingDayPlans : upcomingDayPlans.slice(0, 3);

  const openTimePicker = () => {
    const [hour, minute] = time.split(":").map(Number);
    const initialDate = indiaDateTime(todayIndiaKey, `${String(hour || 0).padStart(2, "0")}:${String(minute || 0).padStart(2, "0")}`);
    setPickerDate(initialDate);
    setShowTimePicker(true);
  };

  const loadNotificationSounds = async () => {
    setLoadingSounds(true);
    setMessage("");
    try {
      const available = await NotificationSounds.getNotifications("notification");
      if (!available.length) {
        setMessage("No notification sounds are available on this device.");
        return;
      }
      setSounds(available);
      setShowSoundPicker(true);
    } catch (soundError) {
      setMessage(soundError instanceof Error ? soundError.message : "Unable to load notification sounds.");
    } finally {
      setLoadingSounds(false);
    }
  };

  const saveDayPlan = async () => {
    if (!title.trim()) {
      setMessage("Add a short title so you remember what this plan is for.");
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      setMessage("Enter a time in 24-hour format, for example 18:00.");
      return;
    }
    if (reminderEnabled && !repeatDays.length && date === todayIndiaKey && indiaTimestamp(date, time) <= Date.now()) {
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
        reminderSoundUrl: reminderEnabled ? selectedSound?.url : undefined,
        reminderSoundTitle: reminderEnabled ? selectedSound?.title : undefined,
      });
      if (saved) {
        setTitle("");
        setDescription("");
        setRepeatDays([]);
        setReminderEnabled(false);
        setSelectedSound(null);
        setMessage("Your plan is saved.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <OnboardingHeader title={mode === "day" ? "Personal day plan" : "Plan your day"} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {mode === "day" ? (
          <View style={styles.dayHero}>
            <View style={styles.dayHeroTop}>
              <View style={styles.dayHeroIcon}>
                <Ionicons name="sunny-outline" size={21} color={theme.colors.onPrimary} />
              </View>
              <View style={styles.dayHeroDate}>
                <Ionicons name="calendar-outline" size={13} color={theme.colors.primary} />
                <Text style={styles.dayHeroDateText}>{indiaDateLabel(date, todayIndiaKey)}</Text>
              </View>
            </View>
            <Text style={styles.dayHeroTitle}>Make space for what matters.</Text>
            <Text style={styles.dayHeroText}>Add a personal plan and choose when you’d like to be reminded.</Text>
          </View>
        ) : (
          <Text style={styles.intro}>Make space for movement and everything else that matters.</Text>
        )}
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
            {workoutPlanGroups.length === 0 ? (
              <Text style={styles.empty}>No workouts planned for the next 7 days.</Text>
            ) : visibleWorkoutGroups.map(days => {
              const item = days[0];
              const workoutNames = [...new Set(days.map(workout => (workout.bodyPart || workout.title).trim()))];
              const times = [...new Set(days.map(workout => workout.time))];
              const planIds = [...new Set(days.map(workout => workout.id))];
              const workoutName = workoutNames.join(", ");
              const dateLabel = item.date === todayKey
                ? "Today"
                : new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
              return (
                <View key={item.date} style={styles.planCard}>
                  <View style={[styles.planIcon, styles.orangeSurface]}>
                    <Ionicons name="barbell-outline" size={19} color={theme.colors.primary} />
                  </View>
                  <View style={styles.planCopy}>
                    <Text style={styles.planTitle}>{workoutName}</Text>
                    <Text style={styles.planMeta}>{dateLabel} · {times.join(", ")}</Text>
                    <Text style={styles.planNote}>
                      {days.length} workout{days.length === 1 ? "" : "s"} planned
                      {days.some(workout => workout.reminderEnabled) ? " · Reminder on" : ""}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => planIds.forEach(id => { remove(id); })}
                    hitSlop={9}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove all ${workoutName} workouts from schedule`}
                  >
                    <Ionicons name="trash-outline" size={17} color={theme.colors.muted} />
                  </Pressable>
                </View>
              );
            })}
            {workoutPlanGroups.length > 3 ? (
              <Pressable
                onPress={() => setShowAllUpcoming(value => !value)}
                style={styles.showMoreButton}
                accessibilityRole="button"
              >
                <Text style={styles.link}>
                  {showAllUpcoming ? "Show fewer workouts" : `Show all ${workoutPlanGroups.length} workout plans`}
                </Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.formCard}>
              <View style={styles.formHeading}>
                <View style={styles.formHeadingIcon}>
                  <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.formHeadingCopy}>
                  <Text style={styles.formTitle}>Create a personal plan</Text>
                  <Text style={styles.formHelp}>A small plan can make your day feel more intentional.</Text>
                </View>
              </View>

              <Text style={styles.label}>WHAT DO YOU WANT TO DO?</Text>
              <View style={styles.fieldShell}>
                <Ionicons name="bookmark-outline" size={17} color={theme.colors.muted} />
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  style={styles.titleInput}
                  placeholder="e.g. Read for 20 minutes"
                  placeholderTextColor={theme.colors.muted}
                  maxLength={160}
                  accessibilityLabel="Plan title"
                />
              </View>
              <Text style={[styles.label, styles.labelGap]}>ADD A NOTE <Text style={styles.optionalLabel}>OPTIONAL</Text></Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                style={styles.noteInput}
                placeholder="Anything you’d like to remember?"
                placeholderTextColor={theme.colors.muted}
                maxLength={500}
                multiline
                textAlignVertical="top"
                accessibilityLabel="Plan description"
              />

              <View style={styles.sectionLabelRow}>
                <Text style={[styles.label, styles.labelGap]}>PICK A DAY</Text>
                <Text style={styles.selectionHint}>Next 7 days</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateOptions}>
                {nextDates.map((day, index) => {
                  const key = day;
                  const selected = key === date;
                  return (
                    <Pressable key={key} onPress={() => setDate(key)} style={[styles.dateButton, selected && styles.dateButtonActive]} accessibilityRole="button" accessibilityState={{ selected }}>
                      <Text style={[styles.dateWeekday, selected && styles.dateTextActive]}>{index === 0 ? "Today" : index === 1 ? "Tomorrow" : indiaWeekdayLabel(day)}</Text>
                      <Text style={[styles.dateNumber, selected && styles.dateTextActive]}>{indiaDayOfMonth(day)}</Text>
                      {selected ? <View style={styles.selectedDateDot} /> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={[styles.label, styles.labelGap]}>CHOOSE A TIME · IST</Text>
              <View style={styles.timeCard}>
                <View style={styles.timeIcon}>
                  <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.timeCopy}>
                  <Text style={styles.timeCaption}>REMIND ME AT</Text>
                  <Text style={styles.timeHint}>Tap to choose a time</Text>
                </View>
                <Pressable onPress={openTimePicker} style={styles.timeInput} accessibilityRole="button" accessibilityLabel={`Choose time, currently ${time}`}>
                  <Text style={styles.timeInputText}>{time}</Text>
                  <Ionicons name="chevron-down" size={14} color={theme.colors.primary} />
                </Pressable>
              </View>

              <Text style={[styles.label, styles.labelGap]}>REPEAT ON</Text>
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
              <Text style={styles.repeatHint}>Leave all days unselected for a one-time plan.</Text>

              <Pressable
                onPress={() => setReminderEnabled(value => !value)}
                style={[styles.reminderRow, reminderEnabled && styles.reminderRowActive]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: reminderEnabled }}
              >
                <View style={styles.reminderIcon}>
                  <Ionicons name="notifications-outline" size={17} color={theme.colors.primary} />
                </View>
                <View style={styles.reminderCopy}>
                  <Text style={styles.reminderTitle}>Phone reminder</Text>
                  <Text style={styles.reminderHelp}>Notify me at {time || "your chosen time"} IST</Text>
                </View>
                <Ionicons name={reminderEnabled ? "checkmark-circle" : "ellipse-outline"} size={21} color={theme.colors.primary} />
              </Pressable>
              {reminderEnabled && Platform.OS === "android" ? (
                <Pressable
                  onPress={loadNotificationSounds}
                  disabled={loadingSounds}
                  style={styles.soundButton}
                  accessibilityRole="button"
                >
                  <Ionicons name="musical-notes-outline" size={17} color={theme.colors.primary} />
                  <Text style={styles.soundButtonText}>
                    {loadingSounds ? "Loading ringtones…" : selectedSound ? selectedSound.title : "Choose a notification ringtone"}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={theme.colors.muted} />
                </Pressable>
              ) : null}
              {reminderEnabled && Platform.OS !== "android" ? (
                <Text style={styles.repeatHint}>Your phone’s default notification sound will be used.</Text>
              ) : null}

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
            ) : visibleDayPlans.map(item => (
              <View key={item.id} style={styles.planCard}>
                <View style={[styles.planIcon, styles.orangeSurface]}>
                  <Ionicons name="calendar-outline" size={19} color={theme.colors.primary} />
                </View>
                <View style={styles.planCopy}>
                  <Text style={styles.planTitle}>{item.title}</Text>
                  {item.description ? <Text numberOfLines={2} style={styles.planNote}>{item.description}</Text> : null}
                  <Text style={styles.planMeta}>{item.scheduleLabel}</Text>
                  {item.reminderEnabled ? <Text style={styles.planNote}>Reminder on</Text> : null}
                </View>
                <Pressable onPress={() => removeDayPlan(item.id)} hitSlop={9} accessibilityRole="button" accessibilityLabel={`Remove ${item.title} from your day plan`}>
                  <Ionicons name="trash-outline" size={17} color={theme.colors.muted} />
                </Pressable>
              </View>
            ))}
            {upcomingDayPlans.length > 3 ? (
              <Pressable
                onPress={() => setShowAllUpcoming(value => !value)}
                style={styles.showMoreButton}
                accessibilityRole="button"
              >
                <Text style={styles.link}>
                  {showAllUpcoming ? "Show fewer plans" : `Show all ${upcomingDayPlans.length} plans`}
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>
      <DatePicker
        modal
        open={showTimePicker}
        date={pickerDate}
        mode="time"
        minuteInterval={5}
        is24hourSource="device"
        timeZoneOffsetInMinutes={INDIA_TIMEZONE_OFFSET_MINUTES}
        theme={theme.dark ? "dark" : "light"}
        onConfirm={picked => {
          setShowTimePicker(false);
          setTime(indiaTimeFromDate(picked));
        }}
        onCancel={() => setShowTimePicker(false)}
        confirmText="Set time"
        cancelText="Cancel"
      />
      <Modal
        visible={showSoundPicker}
        transparent
        animationType="fade"
        onRequestClose={() => { stopSampleSound(); setShowSoundPicker(false); }}
      >
        <View style={styles.soundBackdrop}>
          <View style={styles.soundModal}>
            <View style={styles.soundModalHeader}>
              <View style={styles.formHeadingCopy}>
                <Text style={styles.formTitle}>Choose a ringtone</Text>
                <Text style={styles.formHelp}>Preview a sound, then select it for this reminder.</Text>
              </View>
              <Pressable onPress={() => { stopSampleSound(); setShowSoundPicker(false); }} accessibilityLabel="Close ringtone picker">
                <Ionicons name="close" size={23} color={theme.colors.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.soundList}>
              <Pressable
                onPress={() => { stopSampleSound(); setSelectedSound(null); }}
                style={[styles.soundItem, !selectedSound && styles.soundItemSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected: !selectedSound }}
              >
                <Ionicons
                  name={!selectedSound ? "checkmark-circle" : "volume-high-outline"}
                  size={21}
                  color={theme.colors.primary}
                />
                <Text style={styles.soundButtonText}>Use default ringtone</Text>
              </Pressable>
              {sounds.map(sound => (
                <Pressable
                  key={sound.soundID}
                  onPress={() => {
                    try {
                      playSampleSound(sound);
                      setSelectedSound(sound);
                    } catch (soundError) {
                      setMessage(soundError instanceof Error ? soundError.message : "Unable to preview this ringtone.");
                    }
                  }}
                  style={[styles.soundItem, selectedSound?.soundID === sound.soundID && styles.soundItemSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedSound?.soundID === sound.soundID }}
                >
                  <Ionicons
                    name={selectedSound?.soundID === sound.soundID ? "checkmark-circle" : "play-circle-outline"}
                    size={21}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.soundButtonText}>{sound.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              onPress={() => { stopSampleSound(); setShowSoundPicker(false); }}
              style={styles.primaryButton}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>{selectedSound ? `Use ${selectedSound.title}` : "Use default ringtone"}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
  content: { paddingBottom: 32 },
  intro: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4, marginBottom: 15, fontFamily: theme.typography.fontFamily },
  dayHero: { padding: 17, marginTop: 5, marginBottom: 13, borderRadius: 19, backgroundColor: theme.colors.panelWarm, borderWidth: 1, borderColor: theme.colors.border },
  dayHeroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dayHeroIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: theme.colors.primary },
  dayHeroDate: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, backgroundColor: theme.colors.card },
  dayHeroDateText: { color: theme.colors.primary, fontSize: 10, fontFamily: theme.typography.fontFamilyBold },
  dayHeroTitle: { color: theme.colors.text, fontSize: 21, lineHeight: 26, marginTop: 14, fontFamily: theme.typography.fontFamilyBold },
  dayHeroText: { color: theme.colors.muted, fontSize: 11, lineHeight: 17, marginTop: 5, fontFamily: theme.typography.fontFamily },
  fullScheduleButton: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  fullScheduleText: { color: theme.colors.primary, fontSize: 11, fontFamily: theme.typography.fontFamilyBold },
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
  showMoreButton: { minHeight: 38, alignItems: "center", justifyContent: "center", marginBottom: 8, borderRadius: 10, backgroundColor: theme.colors.card },
  empty: { color: theme.colors.muted, fontSize: 11, lineHeight: 17, paddingVertical: 9, fontFamily: theme.typography.fontFamily },
  planCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 11, marginBottom: 8, borderRadius: 14, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  planIcon: { width: 39, height: 39, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  orangeSurface: { backgroundColor: theme.colors.panelWarm },
  planCopy: { flex: 1 },
  planTitle: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  planMeta: { color: theme.colors.primary, fontSize: 10, marginTop: 3, fontFamily: theme.typography.fontFamilyMedium },
  planNote: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3, fontFamily: theme.typography.fontFamily },
  formCard: { padding: 15, marginTop: 0, borderRadius: 19, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  formHeading: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 19 },
  formHeadingIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: theme.colors.panelWarm },
  formHeadingCopy: { flex: 1 },
  formTitle: { color: theme.colors.text, fontSize: 15, fontFamily: theme.typography.fontFamilyBold },
  formHelp: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 2, fontFamily: theme.typography.fontFamily },
  label: { color: theme.colors.muted, fontSize: 9, letterSpacing: 0.8, marginBottom: 7, fontFamily: theme.typography.fontFamilyBold },
  optionalLabel: { color: theme.colors.primary, fontSize: 8, fontFamily: theme.typography.fontFamilyMedium },
  labelGap: { marginTop: 17 },
  fieldShell: { minHeight: 47, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  titleInput: { flex: 1, minHeight: 46, color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamily },
  noteInput: { minHeight: 72, paddingHorizontal: 12, paddingTop: 11, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 11, fontFamily: theme.typography.fontFamily },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectionHint: { color: theme.colors.muted, fontSize: 9, marginTop: 17, marginBottom: 7, fontFamily: theme.typography.fontFamily },
  dateOptions: { gap: 7, paddingVertical: 2, paddingRight: 3 },
  dateButton: { width: 57, minHeight: 68, alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: 13, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  dateButtonActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  dateWeekday: { color: theme.colors.muted, fontSize: 9, fontFamily: theme.typography.fontFamilyMedium },
  dateNumber: { color: theme.colors.text, fontSize: 15, marginTop: 4, fontFamily: theme.typography.fontFamilyBold },
  selectedDateDot: { width: 4, height: 4, borderRadius: 2, marginTop: 4, backgroundColor: theme.colors.onPrimary },
  dateTextActive: { color: theme.colors.onPrimary },
  timeCard: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 11, paddingVertical: 9, borderRadius: 13, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  timeIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: theme.colors.panelWarm },
  timeCopy: { flex: 1 },
  timeCaption: { color: theme.colors.text, fontSize: 10, letterSpacing: 0.6, fontFamily: theme.typography.fontFamilyBold },
  timeHint: { color: theme.colors.muted, fontSize: 9, marginTop: 3, fontFamily: theme.typography.fontFamily },
  timeInput: { minWidth: 83, height: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 8, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  timeInputText: { color: theme.colors.primary, fontSize: 15, fontFamily: theme.typography.fontFamilyBold },
  weekdays: { flexDirection: "row", justifyContent: "space-between", gap: 5 },
  weekdayButton: { flex: 1, minHeight: 37, alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: 11, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  weekdayButtonActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  weekdayText: { color: theme.colors.text, fontSize: 9, fontFamily: theme.typography.fontFamilyMedium },
  repeatHint: { color: theme.colors.muted, fontSize: 9, marginTop: 6, fontFamily: theme.typography.fontFamily },
  reminderRow: { flexDirection: "row", alignItems: "center", gap: 9, padding: 10, marginTop: 17, borderRadius: 13, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  reminderRowActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.panelWarm },
  reminderIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: theme.colors.card },
  reminderCopy: { flex: 1 },
  reminderTitle: { color: theme.colors.text, fontSize: 11, fontFamily: theme.typography.fontFamilyBold },
  reminderHelp: { color: theme.colors.muted, fontSize: 9, marginTop: 2, fontFamily: theme.typography.fontFamily },
  soundButton: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 11, marginTop: 7, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  soundButtonText: { flex: 1, color: theme.colors.text, fontSize: 10, fontFamily: theme.typography.fontFamilyMedium },
  soundBackdrop: { flex: 1, justifyContent: "center", padding: 22, backgroundColor: "rgba(0,0,0,0.48)" },
  soundModal: { maxHeight: "75%", padding: 16, borderRadius: 18, backgroundColor: theme.colors.card },
  soundModalHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  soundList: { maxHeight: 340 },
  soundItem: { minHeight: 45, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, marginBottom: 6, borderRadius: 11, backgroundColor: theme.colors.surface },
  soundItemSelected: { borderWidth: 1, borderColor: theme.colors.primary, backgroundColor: theme.colors.panelWarm },
  message: { color: theme.colors.primary, fontSize: 11, marginTop: 10, fontFamily: theme.typography.fontFamilyMedium },
  error: { color: theme.colors.error ?? "#B42318", fontSize: 11, lineHeight: 16, marginTop: 10, fontFamily: theme.typography.fontFamilyMedium },
  disabled: { opacity: 0.6 },
});
