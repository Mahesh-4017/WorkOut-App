import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import NotificationSounds, { playSampleSound, stopSampleSound, Sound } from "react-native-notification-sounds";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ExerciseBodyPart, getExerciseBodyParts } from "../../../api/exercises";
import { useSchedule } from "../../../data/ScheduleProvider";
import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { OnboardingHeader } from "../../../components/OnboardingUI";
import { toKey } from "../../../data/classSchedule";
import { indiaDateKey, indiaTimestamp } from "../../../utils/indiaTime";

type RepeatMode = "once" | "daily" | "weekly" | "dates";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const REMINDER_SOUND_KEY = "@workout/preferred-reminder-sound";

function dateValue(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function shortDate(key: string) {
  return dateValue(key).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function getMonthWeeks(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const count = new Date(year, monthIndex + 1, 0).getDate();
  const days: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: count }, (_, index) => toKey(new Date(year, monthIndex, index + 1))),
  ];
  while (days.length % 7) days.push(null);
  return Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7));
}

export default function DateClasses() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { addBodyPartPlan, error: scheduleError } = useSchedule();
  const [date, setDate] = useState<string>(() => params?.date >= indiaDateKey() ? params.date : indiaDateKey());
  const [bodyParts, setBodyParts] = useState<ExerciseBodyPart[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState<ExerciseBodyPart | null>(null);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("once");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [repeatDates, setRepeatDates] = useState<string[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const [year, month] = (params?.date >= indiaDateKey() ? params.date : indiaDateKey()).split("-").map(Number);
    return new Date(year, month - 1, 1);
  });
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [showDateCalendar, setShowDateCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerHour, setPickerHour] = useState(18);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [draftSound, setDraftSound] = useState<Sound | null>(null);
  const [soundPreferenceLoaded, setSoundPreferenceLoaded] = useState(false);
  const [loadingSounds, setLoadingSounds] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = indiaDateKey();

  const calendarWeeks = useMemo(() => getMonthWeeks(calendarMonth), [calendarMonth]);
  const startDate = repeatMode === "dates" ? repeatDates[0] || date : date;

  useEffect(() => {
    if (params?.date && params.date >= indiaDateKey()) setDate(params.date);
  }, [params?.date]);

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBodyParts(await getExerciseBodyParts());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load workout body parts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(REMINDER_SOUND_KEY)
      .then(value => {
        if (!active || !value) return;
        const saved = JSON.parse(value) as Partial<Sound>;
        if (typeof saved.soundID === "string" && typeof saved.url === "string" && typeof saved.title === "string") {
          setSelectedSound({ soundID: saved.soundID, url: saved.url, title: saved.title });
        }
      })
      .catch(loadError => {
        if (active) setError(loadError instanceof Error ? `Unable to load your saved notification sound: ${loadError.message}` : "Unable to load your saved notification sound.");
      })
      .finally(() => {
        if (active) setSoundPreferenceLoaded(true);
      });
    return () => { active = false; };
  }, []);

  const changeRepeatMode = (mode: RepeatMode) => {
    setRepeatMode(mode);
    setRepeatDays(mode === "daily" ? [0, 1, 2, 3, 4, 5, 6] : []);
    if (mode !== "dates") setRepeatDates([]);
    setError(null);
  };

  const toggleRepeatDay = (weekday: number) => {
    setRepeatDays(current => current.includes(weekday)
      ? current.filter(day => day !== weekday)
      : [...current, weekday].sort((a, b) => a - b));
  };

  const toggleRepeatDate = (key: string) => {
    if (repeatMode === "once") {
      setDate(key);
      setError(null);
      return;
    }
    if (!repeatDates.includes(key) && repeatDates.length >= 30) {
      setError("You can select up to 30 specific dates.");
      return;
    }
    setRepeatDates(current => current.includes(key)
      ? current.filter(value => value !== key)
      : [...current, key].sort());
    setError(null);
  };

  const openDateCalendar = () => {
    const selected = repeatMode === "dates" ? repeatDates[0] : date;
    const selectedValue = dateValue(selected || today);
    setCalendarMonth(new Date(selectedValue.getFullYear(), selectedValue.getMonth(), 1));
    setShowDateCalendar(true);
  };

  const openTimePicker = () => {
    const selected = reminderTime;
    const [hour, minute] = selected.split(":").map(Number);
    setPickerHour(hour);
    setPickerMinute(minute);
    setShowTimePicker(true);
  };

  const saveSelectedTime = () => {
    const selected = `${String(pickerHour).padStart(2, "0")}:${String(pickerMinute).padStart(2, "0")}`;
    setReminderTime(selected);
    setShowTimePicker(false);
  };

  const loadNotificationSounds = async () => {
    if (Platform.OS !== "android") {
      setError("Custom reminder sounds are currently supported on Android only.");
      return;
    }
    setLoadingSounds(true);
    setError(null);
    try {
      const available = await NotificationSounds.getNotifications("notification");
      if (!available.length) {
        setError("No system notification sounds were returned by this device.");
        return;
      }
      setSounds(available);
      setDraftSound(selectedSound);
      setShowSoundPicker(true);
    } catch (soundError) {
      setError(soundError instanceof Error
        ? `Unable to load notification sound previews: ${soundError.message}`
        : "Unable to load notification sound previews.");
    } finally {
      setLoadingSounds(false);
    }
  };

  const savePreferredSound = async () => {
    if (!draftSound) return;
    try {
      await AsyncStorage.setItem(REMINDER_SOUND_KEY, JSON.stringify(draftSound));
      setSelectedSound(draftSound);
      stopSampleSound();
      setShowSoundPicker(false);
      setError(null);
    } catch (soundError) {
      setError(soundError instanceof Error
        ? `Unable to save your notification sound preference: ${soundError.message}`
        : "Unable to save your notification sound preference.");
    }
  };

  const scheduleSelected = async () => {
    if (!selectedBodyPart) {
      setError("Choose a body part before saving your plan.");
      return;
    }
    if (repeatMode === "weekly" && !repeatDays.length) {
      setError("Choose at least one weekday for your weekly workout.");
      return;
    }
    if (repeatMode === "dates" && !repeatDates.length) {
      setError("Choose at least one date for your workout.");
      return;
    }
    if (reminderEnabled) {
      const reminderDates = repeatMode === "dates" ? repeatDates : [date];
      const hasFutureSelectedReminder = reminderDates.some(reminderDate =>
        indiaTimestamp(reminderDate, reminderTime) > Date.now(),
      );
      if ((repeatMode === "once" || repeatMode === "dates") && !hasFutureSelectedReminder) {
        setError("Choose a future reminder time for your workout.");
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      const saved = await addBodyPartPlan(
        selectedBodyPart.name,
        startDate,
        reminderTime,
        30,
        repeatDays,
        reminderEnabled,
        repeatDates,
        reminderTime,
        selectedSound?.url,
        selectedSound?.title,
      );
      if (saved) navigation.navigate(WORKOUT_ROUTES.SEARCH, {
        bodyPart: selectedBodyPart.name,
        title: selectedBodyPart.name,
      });
    } finally {
      setSaving(false);
    }
  };

  const repeatSummary = repeatMode === "daily"
    ? "Every day"
    : repeatMode === "weekly" && repeatDays.length
      ? `Every ${repeatDays.map(day => WEEKDAYS[day]).join(", ")}`
      : repeatMode === "dates" && repeatDates.length
        ? `${repeatDates.length} selected date${repeatDates.length === 1 ? "" : "s"}`
        : `One time · ${shortDate(date)}`;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <OnboardingHeader title="Plan a workout" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Choose a body part and we’ll save the plan to that workout page.</Text>

        <Text style={styles.sectionTitle}>1. Choose a body part</Text>
        {loading ? <Text style={styles.note}>Loading workout body parts…</Text> : null}
        {!loading && bodyParts.length === 0 ? <Text style={styles.note}>No published workout body parts are available yet.</Text> : null}
        <View style={styles.bodyPartList}>
          {bodyParts.map(part => {
            const selected = selectedBodyPart?.name === part.name;
            return (
              <Pressable
                key={part.name}
                onPress={() => setSelectedBodyPart(part)}
                style={[styles.bodyPartCard, selected && styles.exerciseSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={part.name}
              >
                <Text numberOfLines={1} style={styles.bodyPartTitle}>{part.name}</Text>
                {selected ? <Ionicons name="checkmark-circle" size={17} color={theme.colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>2. Choose when</Text>
        <Text style={styles.label}>Repeat</Text>
        <View style={styles.repeatModes}>
          {([
            ["once", "One time"],
            ["daily", "Every day"],
            ["weekly", "Weekly"],
            ["dates", "Choose dates"],
          ] as const).map(([value, label]) => (
            <Pressable
              key={value}
              onPress={() => changeRepeatMode(value)}
              style={[styles.repeatMode, repeatMode === value && styles.repeatModeSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected: repeatMode === value }}
            >
              <Text style={[styles.repeatModeText, repeatMode === value && styles.repeatModeTextSelected]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {repeatMode === "weekly" ? (
          <>
            <Text style={styles.label}>Choose the weekdays</Text>
            <View style={styles.weekdays}>
              {WEEKDAYS.map((day, index) => {
                const selected = repeatDays.includes(index);
                return (
                  <Pressable
                    key={`weekday-${index}`}
                    onPress={() => toggleRepeatDay(index)}
                    style={[styles.weekdayButton, selected && styles.repeatModeSelected]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${selected ? "Remove" : "Repeat"} on ${day}`}
                  >
                    <Text style={[styles.weekdayText, selected && styles.repeatModeTextSelected]}>{day}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {repeatMode === "once" ? (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Workout date</Text>
            <Pressable onPress={openDateCalendar} style={styles.pickerButton} accessibilityRole="button">
              <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.pickerButtonText}>{shortDate(date)}</Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.muted} />
            </Pressable>
          </View>
        ) : null}

        {repeatMode === "dates" ? (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Specific workout dates (up to 30)</Text>
            <Pressable onPress={openDateCalendar} style={styles.pickerButton} accessibilityRole="button">
              <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.pickerButtonText}>
                {repeatDates.length ? `${repeatDates.length} date${repeatDates.length === 1 ? "" : "s"} selected` : "Select dates"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
            </Pressable>
            {repeatDates.length ? (
              <Text style={styles.note}>{repeatDates.map(shortDate).join(" · ")}</Text>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.summary}>{repeatSummary}</Text>

        <Text style={styles.sectionTitle}>3. Reminder</Text>
        <Pressable
          onPress={() => setReminderEnabled(value => !value)}
          style={styles.reminderToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: reminderEnabled }}
        >
          <Ionicons name={reminderEnabled ? "checkbox" : "square-outline"} size={21} color={theme.colors.primary} />
          <View style={styles.reminderCopy}>
            <Text style={styles.reminderTitle}>Remind me about this workout</Text>
            <Text style={styles.note}>A notification will repeat on your selected day or date.</Text>
          </View>
        </Pressable>
        {reminderEnabled ? (
          <View style={styles.reminderOptions}>
            <Text style={styles.label}>Reminder time · IST</Text>
            <Pressable onPress={openTimePicker} style={styles.pickerButton} accessibilityRole="button">
              <Ionicons name="notifications-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.pickerButtonText}>{reminderTime}</Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.muted} />
            </Pressable>
            {Platform.OS === "android" ? (
              <>
                {selectedSound ? (
                  <View style={styles.soundPreference}>
                    <Text numberOfLines={1} style={styles.soundPreferenceTitle}>{selectedSound.title}</Text>
                    <Pressable
                      onPress={() => {
                        try {
                          playSampleSound(selectedSound);
                        } catch (soundError) {
                          setError(soundError instanceof Error ? soundError.message : "Unable to preview this sound.");
                        }
                      }}
                      style={styles.soundActionButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Preview ${selectedSound.title}`}
                    >
                      <Ionicons name="play" size={15} color={theme.colors.primary} />
                      <Text style={styles.soundActionText}>Preview</Text>
                    </Pressable>
                    <Pressable
                      onPress={loadNotificationSounds}
                      style={styles.soundActionButton}
                      disabled={loadingSounds}
                      accessibilityRole="button"
                      accessibilityLabel="Edit notification sound"
                    >
                      <Ionicons name="create-outline" size={15} color={theme.colors.primary} />
                      <Text style={styles.soundActionText}>{loadingSounds ? "Loading…" : "Edit"}</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={loadNotificationSounds}
                    style={styles.soundButton}
                    disabled={loadingSounds || !soundPreferenceLoaded}
                    accessibilityRole="button"
                  >
                    <Ionicons name="volume-high-outline" size={17} color={theme.colors.primary} />
                    <Text style={styles.soundButtonText}>
                      {loadingSounds ? "Loading sounds…" : "Choose & preview notification sound"}
                    </Text>
                  </Pressable>
                )}
                <Text style={styles.note}>
                  {selectedSound ? "This sound will be used for new workout reminders. Edit it any time." : "Choose a sound to preview and use it for this and future workout reminders."}
                </Text>
              </>
            ) : (
              <Text style={styles.note}>Reminders use your device’s default notification sound on this platform.</Text>
            )}
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {scheduleError ? <Text style={styles.errorText}>{scheduleError}</Text> : null}
        <Pressable onPress={() => scheduleSelected()} disabled={saving || loading || !soundPreferenceLoaded} style={[styles.saveButton, (saving || loading || !soundPreferenceLoaded) && styles.disabled]} accessibilityRole="button">
          <Text style={styles.saveText}>{saving ? "Saving to your account…" : "Save my workout plan"}</Text>
          <Ionicons name="checkmark" size={18} color={theme.colors.onPrimary} />
        </Pressable>
        <Text style={styles.note}>Your plan is saved to your WorkOut account so it can sync across devices.</Text>
      </ScrollView>

      <Modal visible={showDateCalendar} transparent animationType="fade" onRequestClose={() => setShowDateCalendar(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{repeatMode === "once" ? "Choose workout date" : "Choose workout dates"}</Text>
                <Text style={styles.modalSubtitle}>
                  {repeatMode === "once" ? "Select one date" : `${repeatDates.length} of 30 selected`}
                </Text>
              </View>
              <Pressable onPress={() => setShowDateCalendar(false)} accessibilityRole="button" accessibilityLabel="Close calendar">
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>
            <View style={styles.monthHeader}>
              <Pressable onPress={() => setCalendarMonth(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))} accessibilityLabel="Previous month">
                <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
              </Pressable>
              <Text style={styles.monthTitle}>{calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</Text>
              <Pressable onPress={() => setCalendarMonth(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))} accessibilityLabel="Next month">
                <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
              </Pressable>
            </View>
            <View style={styles.calendarGrid}>
              {WEEKDAYS.map((day, index) => <Text key={`calendar-day-${index}`} style={styles.calendarWeekday}>{day}</Text>)}
              {calendarWeeks.flatMap((week, weekIndex) => week.map((key, dayIndex) => {
                if (!key) return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.calendarCell} />;
                const selected = repeatMode === "once" ? date === key : repeatDates.includes(key);
                const disabled = key < today;
                return (
                  <Pressable
                    key={key}
                    disabled={disabled}
                    onPress={() => toggleRepeatDate(key)}
                    style={[styles.calendarCell, selected && styles.calendarCellSelected, disabled && styles.calendarCellDisabled]}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled }}
                    accessibilityLabel={`${shortDate(key)}${selected ? ", selected" : ""}`}
                  >
                    <Text style={[styles.calendarDateText, selected && styles.calendarDateTextSelected, disabled && styles.calendarDateTextDisabled]}>
                      {dateValue(key).getDate()}
                    </Text>
                  </Pressable>
                );
              }))}
            </View>
            <Pressable onPress={() => setShowDateCalendar(false)} style={styles.modalDone} accessibilityRole="button">
              <Text style={styles.saveText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.timeModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Reminder time · IST</Text>
                <Text style={styles.modalSubtitle}>Choose a time using 24-hour India Standard Time.</Text>
              </View>
              <Pressable onPress={() => setShowTimePicker(false)} accessibilityRole="button" accessibilityLabel="Close time selector">
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>
            <Text style={styles.selectedTime}>
              {String(pickerHour).padStart(2, "0")}:{String(pickerMinute).padStart(2, "0")}
            </Text>
            <View style={styles.timeColumns}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnTitle}>Hour</Text>
                <ScrollView contentContainerStyle={styles.timeValues}>
                  {Array.from({ length: 24 }, (_, hour) => (
                    <Pressable
                      key={`hour-${hour}`}
                      onPress={() => setPickerHour(hour)}
                      style={[styles.timeValue, pickerHour === hour && styles.timeValueSelected]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: pickerHour === hour }}
                    >
                      <Text style={[styles.timeValueText, pickerHour === hour && styles.timeValueTextSelected]}>
                        {String(hour).padStart(2, "0")}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnTitle}>Minute</Text>
                <ScrollView contentContainerStyle={styles.timeValues}>
                  {Array.from({ length: 12 }, (_, index) => index * 5).map(minute => (
                    <Pressable
                      key={`minute-${minute}`}
                      onPress={() => setPickerMinute(minute)}
                      style={[styles.timeValue, pickerMinute === minute && styles.timeValueSelected]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: pickerMinute === minute }}
                    >
                      <Text style={[styles.timeValueText, pickerMinute === minute && styles.timeValueTextSelected]}>
                        {String(minute).padStart(2, "0")}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
            <Pressable onPress={saveSelectedTime} style={styles.modalDone} accessibilityRole="button">
              <Text style={styles.saveText}>Set time</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showSoundPicker} transparent animationType="fade" onRequestClose={() => { stopSampleSound(); setShowSoundPicker(false); }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.soundModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Notification sound preview</Text>
                <Text style={styles.modalSubtitle}>Tap a system sound to preview it.</Text>
              </View>
              <Pressable onPress={() => { stopSampleSound(); setShowSoundPicker(false); }} accessibilityLabel="Close sound previews">
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.soundList}>
              {sounds.map(sound => (
                <Pressable
                  key={sound.soundID}
                  onPress={() => {
                    try {
                      playSampleSound(sound);
                      setDraftSound(sound);
                    } catch (soundError) {
                      setError(soundError instanceof Error ? soundError.message : "Unable to preview this sound.");
                    }
                  }}
                  style={[styles.soundItem, draftSound?.soundID === sound.soundID && styles.soundItemSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: draftSound?.soundID === sound.soundID }}
                >
                  <Ionicons
                    name={draftSound?.soundID === sound.soundID ? "checkmark-circle" : "play-circle-outline"}
                    size={22}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.soundTitle}>{sound.title}</Text>
                  <Text style={styles.soundAction}>{draftSound?.soundID === sound.soundID ? "Selected" : "Preview & select"}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              onPress={savePreferredSound}
              disabled={!draftSound}
              style={[styles.modalDone, !draftSound && styles.disabled]}
              accessibilityRole="button"
            >
              <Text style={styles.saveText}>{draftSound ? `Use ${draftSound.title}` : "Preview and select a sound"}</Text>
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
  intro: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 10, fontFamily: theme.typography.fontFamily },
  sectionTitle: { color: theme.colors.text, fontSize: 15, marginTop: 18, marginBottom: 9, fontFamily: theme.typography.fontFamilyBold },
  bodyPartList: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 9 },
  bodyPartCard: { width: "48%", minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 11, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  exerciseSelected: { borderColor: theme.colors.primary, borderWidth: 2 },
  bodyPartTitle: { flex: 1, color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  label: { color: theme.colors.text, fontSize: 11, marginBottom: 7, fontFamily: theme.typography.fontFamilyBold },
  repeatModes: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  repeatMode: { minHeight: 36, alignItems: "center", justifyContent: "center", paddingHorizontal: 11, borderRadius: 11, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  repeatModeSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  repeatModeText: { color: theme.colors.text, fontSize: 10, fontFamily: theme.typography.fontFamilyMedium },
  repeatModeTextSelected: { color: theme.colors.onPrimary },
  weekdays: { flexDirection: "row", justifyContent: "space-between", gap: 5 },
  weekdayButton: { flex: 1, minHeight: 37, alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  weekdayText: { color: theme.colors.text, fontSize: 9, fontFamily: theme.typography.fontFamilyMedium },
  inputGroup: { flex: 1, minWidth: 0, marginTop: 13 },
  pickerButton: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 11, borderRadius: 11, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  pickerButtonText: { flex: 1, color: theme.colors.text, fontSize: 12, fontVariant: ["tabular-nums"], fontFamily: theme.typography.fontFamilyBold },
  summary: { color: theme.colors.primaryDark, fontSize: 11, marginTop: 10, fontFamily: theme.typography.fontFamilyBold },
  reminderToggle: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  reminderCopy: { flex: 1, gap: 3 },
  reminderTitle: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  reminderOptions: { marginTop: 12, padding: 12, borderRadius: 13, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  soundPreference: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 9, marginTop: 9, paddingHorizontal: 10, borderRadius: 10, backgroundColor: theme.colors.card },
  soundPreferenceTitle: { flex: 1, color: theme.colors.primaryDark, fontSize: 11, fontFamily: theme.typography.fontFamilyBold },
  soundButton: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 8, marginTop: 9 },
  soundButtonText: { color: theme.colors.primaryDark, fontSize: 11, fontFamily: theme.typography.fontFamilyBold },
  soundActionButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 8 },
  soundActionText: { color: theme.colors.primary, fontSize: 10, fontFamily: theme.typography.fontFamilyBold },
  note: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 5, fontFamily: theme.typography.fontFamily },
  errorText: { color: theme.colors.danger, fontSize: 11, lineHeight: 16, marginTop: 10, fontFamily: theme.typography.fontFamilyMedium },
  saveButton: { minHeight: 49, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 18, borderRadius: 13, backgroundColor: theme.colors.primary },
  disabled: { opacity: 0.6 },
  saveText: { color: theme.colors.onPrimary, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
  modalBackdrop: { flex: 1, justifyContent: "center", padding: 18, backgroundColor: theme.colors.overlay },
  calendarModal: { padding: 16, borderRadius: 18, backgroundColor: theme.colors.surface },
  timeModal: { maxHeight: "86%", padding: 16, borderRadius: 18, backgroundColor: theme.colors.surface },
  soundModal: { maxHeight: "82%", padding: 16, borderRadius: 18, backgroundColor: theme.colors.surface },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  modalTitle: { color: theme.colors.text, fontSize: 16, fontFamily: theme.typography.fontFamilyBold },
  modalSubtitle: { color: theme.colors.muted, fontSize: 10, marginTop: 3, fontFamily: theme.typography.fontFamily },
  monthHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 15 },
  monthTitle: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
  selectedTime: { color: theme.colors.primary, fontSize: 32, textAlign: "center", marginVertical: 12, fontVariant: ["tabular-nums"], fontFamily: theme.typography.fontFamilyBold },
  timeColumns: { flexDirection: "row", justifyContent: "center", gap: 18, height: 220 },
  timeColumn: { flex: 1, maxWidth: 120, alignItems: "center" },
  timeColumnTitle: { color: theme.colors.muted, fontSize: 10, marginBottom: 7, fontFamily: theme.typography.fontFamilyBold },
  timeValues: { width: "100%", alignItems: "center", gap: 5, paddingBottom: 4 },
  timeValue: { minWidth: 58, minHeight: 34, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: theme.colors.card },
  timeValueSelected: { backgroundColor: theme.colors.primary },
  timeValueText: { color: theme.colors.text, fontSize: 12, fontVariant: ["tabular-nums"], fontFamily: theme.typography.fontFamilyMedium },
  timeValueTextSelected: { color: theme.colors.onPrimary, fontFamily: theme.typography.fontFamilyBold },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  calendarWeekday: { width: `${100 / 7}%`, paddingVertical: 8, color: theme.colors.muted, textAlign: "center", fontSize: 9, fontFamily: theme.typography.fontFamilyBold },
  calendarCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  calendarCellSelected: { backgroundColor: theme.colors.primary },
  calendarCellDisabled: { opacity: 0.35 },
  calendarDateText: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
  calendarDateTextSelected: { color: theme.colors.onPrimary, fontFamily: theme.typography.fontFamilyBold },
  calendarDateTextDisabled: { color: theme.colors.muted },
  modalDone: { minHeight: 43, alignItems: "center", justifyContent: "center", marginTop: 12, borderRadius: 11, backgroundColor: theme.colors.primary },
  soundList: { marginVertical: 12 },
  soundItem: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 11, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  soundItemSelected: { backgroundColor: theme.colors.card },
  soundTitle: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
  soundAction: { color: theme.colors.primaryDark, fontSize: 9, fontFamily: theme.typography.fontFamilyBold },
});
