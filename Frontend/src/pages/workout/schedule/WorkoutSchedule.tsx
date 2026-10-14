import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { OnboardingHeader } from "../../../components/OnboardingUI";
import { addDays, toKey } from "../../../data/classSchedule";
import { useSchedule } from "../../../data/ScheduleProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { useTheme } from "../../../theme/ThemeProvider";
import { weekdayName } from "../../../utils/scheduleReminders";

function formatDate(date: string) {
  const value = new Date(`${date}T12:00:00`);
  if (date === toKey(new Date())) return "Today";
  if (date === toKey(addDays(new Date(), 1))) return "Tomorrow";
  return value.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function WorkoutSchedule() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const { scheduled, remove, error, loading, refresh } = useSchedule();
  const styles = createStyles(theme);
  const today = toKey(new Date());
  const nextWeek = toKey(addDays(new Date(), 6));
  const upcoming = useMemo(
    () => scheduled.filter(item => item.date >= today && item.date <= nextWeek),
    [scheduled, today, nextWeek],
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <OnboardingHeader title="Plan your day" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="calendar-outline" size={23} color={theme.colors.onPrimary} />
          </View>
          <Text style={styles.title}>Your workout schedule</Text>
          <Text style={styles.subtitle}>
            Choose a body part, pick when to work on it, and set a reminder if you need one.
          </Text>
          <Pressable
            onPress={() => navigation.navigate(WORKOUT_ROUTES.DATE_CLASSES, { date: route.params?.selectedDate })}
            style={styles.primaryButton}
            accessibilityRole="button"
          >
            <Ionicons name="add" size={19} color={theme.colors.onPrimary} />
            <Text style={styles.primaryButtonText}>Plan a workout</Text>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.onPrimary} />
          </Pressable>
        </View>

        {error ? (
          <Pressable onPress={refresh} style={styles.errorCard} accessibilityRole="button">
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>Tap to retry schedule sync</Text>
          </Pressable>
        ) : null}

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Coming up</Text>
            <Text style={styles.sectionSubtitle}>Your workouts for the next 7 days.</Text>
          </View>
          <Text style={styles.count}>{upcoming.length}</Text>
        </View>

        {loading ? <Text style={styles.empty}>Loading your saved workouts…</Text> : null}
        {!loading && upcoming.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="barbell-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.emptyTitle}>Nothing planned yet</Text>
            <Text style={styles.empty}>Your saved workout plans will appear here.</Text>
          </View>
        ) : upcoming.map(item => (
          <View key={`${item.id}-${item.date}`} style={styles.workoutCard}>
            <View style={styles.workoutIcon}>
              <Ionicons name="barbell-outline" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.workoutCopy}>
              <Text style={styles.workoutTitle}>{item.title}</Text>
              <Text style={styles.workoutMeta}>
                {formatDate(item.date)} · {item.time} · {item.durationMinutes} min
              </Text>
              <Text style={styles.workoutMeta}>
                {item.bodyPart || item.category || "Workout"}
                {item.repeatDates?.length
                  ? " · Selected dates"
                  : item.repeatDays?.length
                    ? ` · Every ${item.repeatDays.map(weekdayName).join(", ")}`
                    : ""}
                {item.reminderEnabled ? ` · Reminder ${item.reminderTime || item.time}` : ""}
              </Text>
            </View>
            <Pressable
              onPress={() => remove(item.id)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.title} from your schedule`}
            >
              <Ionicons name="trash-outline" size={17} color={theme.colors.muted} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
  content: { paddingBottom: 28 },
  introCard: { marginTop: 8, padding: 18, borderRadius: 19, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  introIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: theme.colors.primary },
  title: { color: theme.colors.text, fontSize: 22, marginTop: 16, fontFamily: theme.typography.fontFamilyBold },
  subtitle: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6, fontFamily: theme.typography.fontFamily },
  primaryButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 17, borderRadius: 13, backgroundColor: theme.colors.primary },
  primaryButtonText: { color: theme.colors.onPrimary, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
  errorCard: { marginTop: 13, padding: 13, borderRadius: 12, backgroundColor: theme.colors.panelWarm },
  errorText: { color: theme.colors.danger, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  errorHint: { color: theme.colors.muted, fontSize: 10, marginTop: 4, fontFamily: theme.typography.fontFamily },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 25, marginBottom: 11 },
  sectionTitle: { color: theme.colors.text, fontSize: 17, fontFamily: theme.typography.fontFamilyBold },
  sectionSubtitle: { color: theme.colors.muted, fontSize: 11, marginTop: 3, fontFamily: theme.typography.fontFamily },
  count: { minWidth: 30, height: 30, textAlign: "center", textAlignVertical: "center", borderRadius: 15, overflow: "hidden", color: theme.colors.primaryDark, backgroundColor: theme.colors.card, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  emptyCard: { alignItems: "center", gap: 7, padding: 22, borderRadius: 15, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  emptyTitle: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
  empty: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, textAlign: "center", fontFamily: theme.typography.fontFamily },
  workoutCard: { flexDirection: "row", alignItems: "center", gap: 11, padding: 12, marginBottom: 9, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  workoutIcon: { width: 39, height: 39, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: theme.colors.card },
  workoutCopy: { flex: 1, gap: 3 },
  workoutTitle: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
  workoutMeta: { color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamily },
});
