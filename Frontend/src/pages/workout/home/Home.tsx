import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import BottomTabBar from "../../../components/BottomTabBar";
import { ScreenHeader } from "../../../components/MovementUI";
import { useSchedule } from "../../../data/ScheduleProvider";
import { addDays, CLASSES, toKey } from "../../../data/classSchedule";
import { ROUTES } from "../../../navigation/routes";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { useTheme } from "../../../theme/ThemeProvider";
import { returnToMainHome } from "../../../navigation/workoutNavigation";
import { indiaDateKey, indiaWeekday } from "../../../utils/indiaTime";

export default function WorkoutHub() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { scheduled, dayPlans, loading, error, refresh } = useSchedule();
  const styles = createStyles(theme);
  const orange = theme.colors.primary;
  const orangeSurface = theme.colors.panelWarm;
  const orangeText = theme.colors.primaryDark;

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const today = new Date();
  const todayKey = toKey(today);
  const todayIndiaKey = indiaDateKey();
  const weekEnd = toKey(addDays(today, 6));
  const todayWorkouts = scheduled
    .filter(item => item.date === todayKey)
    .sort((a, b) => a.time.localeCompare(b.time));
  const todayPersonalPlans = dayPlans
    .filter(plan => plan.date <= todayIndiaKey && (plan.repeatDays.length === 0
      ? plan.date === todayIndiaKey
      : plan.repeatDays.includes(indiaWeekday(todayIndiaKey))))
    .sort((a, b) => a.time.localeCompare(b.time));
  const upcoming = scheduled
    .filter(item => item.date > todayKey && item.date <= weekEnd)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const visibleUpcoming = upcoming.slice(0, 3);

  const dateLabel = (dateKey: string, time: string) => {
    if (dateKey === todayKey) return `Today · ${time}`;
    const date = new Date(`${dateKey}T00:00:00`);
    return `${date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} · ${time}`;
  };

  const openWorkout = (item: (typeof upcoming)[number]) => {
    if (item.exerciseId) {
      navigation.navigate(WORKOUT_ROUTES.LIBRARY_EXERCISE, { exerciseId: item.exerciseId });
      return;
    }
    const classSession = CLASSES.find(entry => entry.id === item.classId);
    if (classSession) {
      navigation.navigate(WORKOUT_ROUTES.CLASS_DETAILS, { classId: classSession.id, date: item.date });
      return;
    }
    if (item.bodyPart) {
      navigation.navigate(WORKOUT_ROUTES.SEARCH, { bodyPart: item.bodyPart, title: item.bodyPart });
      return;
    }
    navigation.navigate(WORKOUT_ROUTES.SCHEDULE);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Workout"
          onBack={() => returnToMainHome(navigation)}
          onBell={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
          onProfile={() => navigation.navigate(ROUTES.PROFILE)}
        />

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: orange }]}>YOUR NEXT SESSION</Text>
            <Text style={styles.heroTitle}>Make time to move.</Text>
            <Text style={styles.heroText}>Start a workout or keep your week on track.</Text>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="barbell" size={27} color={theme.dark ? "#2B1A08" : "#FFFFFF"} />
          </View>
          <Pressable
            onPress={() => navigation.navigate(WORKOUT_ROUTES.EXPLORE)}
            style={[styles.startButton, { backgroundColor: orange }]}
            accessibilityRole="button"
          >
            <Text style={styles.startButtonText}>Start a workout</Text>
            <Ionicons name="arrow-forward" size={16} color={theme.dark ? "#2B1A08" : "#FFFFFF"} />
          </Pressable>
        </View>

        <View style={styles.todaySection}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Today’s workout</Text>
              <Text style={styles.sectionSubtitle}>Your plan for today.</Text>
            </View>
            <Ionicons name="sunny-outline" size={20} color={orange} />
          </View>
          {loading ? (
            <Text style={styles.message}>Loading today’s workout…</Text>
          ) : !error && todayWorkouts.length ? todayWorkouts.map(item => (
            <Pressable
              key={`${item.id}-${item.date}`}
              onPress={() => openWorkout(item)}
              style={styles.todayCard}
              accessibilityRole="button"
              accessibilityLabel={`Open today’s ${item.bodyPart || item.title} workout`}
            >
              <View style={[styles.todayIcon, { backgroundColor: orangeSurface }]}>
                <Ionicons name="fitness-outline" size={19} color={orange} />
              </View>
              <View style={styles.workoutCopy}>
                <Text style={styles.todayTitle}>{item.bodyPart || item.title}</Text>
                <Text style={styles.todayMeta}>{item.time} · {item.durationMinutes} min</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={theme.colors.muted} />
            </Pressable>
          )) : !error ? (
            <View style={styles.todayEmpty}>
              <Text style={styles.todayEmptyText}>No workout planned for today.</Text>
              <Pressable
                onPress={() => navigation.navigate(WORKOUT_ROUTES.SCHEDULE, { selectedDate: todayKey })}
                accessibilityRole="button"
              >
                <Text style={[styles.viewAll, { color: orange }]}>Plan one</Text>
              </Pressable>
            </View>
          ) : null}
          {!loading && !error ? (
            <View style={styles.personalPlans}>
              <View style={styles.personalPlansHeading}>
                <View style={styles.personalPlansIcon}>
                  <Ionicons name="sunny-outline" size={15} color={orange} />
                </View>
                <Text style={styles.personalPlansTitle}>Personal plans</Text>
                <Pressable
                  onPress={() => navigation.navigate(WORKOUT_ROUTES.PLANNER, { mode: "day", date: todayIndiaKey })}
                  accessibilityRole="button"
                >
                  <Text style={[styles.viewAll, { color: orange }]}>
                    {todayPersonalPlans.length ? "View all" : "Add plan"}
                  </Text>
                </Pressable>
              </View>
              {todayPersonalPlans.length ? todayPersonalPlans.slice(0, 2).map(plan => (
                <Pressable
                  key={plan.id}
                  onPress={() => navigation.navigate(WORKOUT_ROUTES.PLANNER, { mode: "day", date: todayIndiaKey })}
                  style={styles.personalPlanRow}
                  accessibilityRole="button"
                  accessibilityLabel={`Open personal plan ${plan.title} at ${plan.time} India time`}
                >
                  <Text numberOfLines={1} style={styles.personalPlanName}>{plan.title}</Text>
                  <Text style={styles.personalPlanTime}>{plan.time} IST</Text>
                </Pressable>
              )) : (
                <Text style={styles.personalPlanEmpty}>Add a personal reminder alongside your workout.</Text>
              )}
            </View>
          ) : null}
        </View>

        <View style={styles.sectionHeading}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>Coming up</Text>
            <Text style={styles.sectionSubtitle}>Your planned workouts for the next 6 days.</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate(WORKOUT_ROUTES.SCHEDULE)}
            accessibilityRole="button"
            accessibilityLabel="View full workout schedule"
          >
            <Text style={[styles.viewAll, { color: orange }]}>View schedule</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => navigation.navigate(WORKOUT_ROUTES.SCHEDULE)}
          style={styles.plannerShortcut}
          accessibilityRole="button"
        >
          <Ionicons name="calendar-outline" size={17} color={orange} />
          <Text style={[styles.plannerShortcutText, { color: orange }]}>Plan your day</Text>
          <Ionicons name="arrow-forward" size={15} color={orange} />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate(WORKOUT_ROUTES.PLANNER, { mode: "day", date: todayIndiaKey })}
          style={styles.plannerShortcut}
          accessibilityRole="button"
          accessibilityLabel="Open full day schedule"
        >
          <Ionicons name="calendar-clear-outline" size={17} color={orange} />
          <Text style={[styles.plannerShortcutText, { color: orange }]}>Full day schedule</Text>
          <Ionicons name="arrow-forward" size={15} color={orange} />
        </Pressable>

        {loading ? <Text style={styles.message}>Loading your schedule…</Text> : null}
        {!loading && error ? (
          <Pressable onPress={refresh} style={styles.messageCard} accessibilityRole="button">
            <Text style={styles.messageText}>{error}</Text>
            <Text style={[styles.retry, { color: orange }]}>Tap to retry</Text>
          </Pressable>
        ) : null}
        {!loading && !error && upcoming.length === 0 && todayWorkouts.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={[styles.emptyIcon, { backgroundColor: orangeSurface }]}>
              <Ionicons name="calendar-outline" size={21} color={orange} />
            </View>
            <Text style={styles.emptyTitle}>Nothing planned yet</Text>
            <Text style={styles.emptyText}>Add a workout to your schedule and it will appear here.</Text>
            <Pressable
              onPress={() => navigation.navigate(WORKOUT_ROUTES.SCHEDULE)}
              style={styles.scheduleButton}
              accessibilityRole="button"
            >
              <Text style={[styles.scheduleButtonText, { color: orange }]}>Plan a workout</Text>
              <Ionicons name="arrow-forward" size={15} color={orange} />
            </Pressable>
          </View>
        ) : null}
        {!loading && !error && upcoming.length === 0 && todayWorkouts.length > 0 ? (
          <Text style={styles.message}>No more workouts planned this week.</Text>
        ) : null}

        {visibleUpcoming.map(item => {
          const classSession = CLASSES.find(entry => entry.id === item.classId);
          return (
            <Pressable
              key={`${item.id}-${item.date}`}
              onPress={() => openWorkout(item)}
              style={styles.workoutCard}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.title}, ${dateLabel(item.date, item.time)}`}
            >
              <View style={[styles.workoutIcon, { backgroundColor: orangeSurface }]}>
                <Ionicons name="fitness-outline" size={20} color={orange} />
              </View>
              <View style={styles.workoutCopy}>
                <Text numberOfLines={1} style={styles.workoutTitle}>
                  {item.title || classSession?.title || "Workout"}
                </Text>
                <Text style={[styles.workoutMeta, { color: orangeText }]}>{dateLabel(item.date, item.time)}</Text>
                <Text style={styles.duration}>{item.durationMinutes} min · {item.bodyPart || classSession?.tag || "Workout"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={theme.colors.muted} />
            </Pressable>
          );
        })}
        {!loading && !error && upcoming.length > visibleUpcoming.length ? (
          <Pressable
            onPress={() => navigation.navigate(WORKOUT_ROUTES.SCHEDULE)}
            style={styles.scheduleButton}
            accessibilityRole="button"
            accessibilityLabel={`View all ${upcoming.length} upcoming workouts`}
          >
            <Text style={[styles.scheduleButtonText, { color: orange }]}>
              View all {upcoming.length} upcoming workouts
            </Text>
            <Ionicons name="arrow-forward" size={15} color={orange} />
          </Pressable>
        ) : null}
      </ScrollView>
      <BottomTabBar activeTab="workout" variant="workout" workoutActiveTab="hub" />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingHorizontal: 18, paddingBottom: 120 },
    hero: {
      marginTop: 11,
      padding: 18,
      borderRadius: 20,
      backgroundColor: theme.colors.panelWarm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    heroCopy: { paddingRight: 55 },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 9,
      letterSpacing: 1.1,
      fontFamily: theme.typography.fontFamilyBold,
    },
    heroTitle: {
      color: theme.colors.text,
      fontSize: 22,
      lineHeight: 27,
      marginTop: 7,
      fontFamily: theme.typography.fontFamilyBold,
    },
    heroText: {
      color: theme.colors.muted,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 5,
      fontFamily: theme.typography.fontFamily,
    },
    heroIcon: {
      position: "absolute",
      right: 17,
      top: 18,
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
    },
    startButton: {
      minHeight: 43,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 16,
      borderRadius: 13,
      backgroundColor: theme.colors.primary,
    },
    startButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 12,
      fontFamily: theme.typography.fontFamilyBold,
    },
    sectionHeading: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      marginTop: 25,
      marginBottom: 12,
    },
    sectionCopy: { flex: 1 },
    todaySection: { marginTop: 18 },
    todayCard: {
      minHeight: 62,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 10,
      marginBottom: 7,
      borderRadius: 13,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    todayIcon: { width: 37, height: 37, alignItems: "center", justifyContent: "center", borderRadius: 11 },
    todayTitle: { color: theme.colors.text, fontSize: 12, textTransform: "capitalize", fontFamily: theme.typography.fontFamilyBold },
    todayMeta: { color: theme.colors.muted, fontSize: 10, marginTop: 3, fontFamily: theme.typography.fontFamily },
    todayEmpty: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, borderRadius: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
    todayEmptyText: { color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamily },
    personalPlans: { padding: 11, marginTop: 10, borderRadius: 13, backgroundColor: theme.colors.panelWarm, borderWidth: 1, borderColor: theme.colors.border },
    personalPlansHeading: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 5 },
    personalPlansIcon: { width: 27, height: 27, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: theme.colors.card },
    personalPlansTitle: { flex: 1, color: theme.colors.text, fontSize: 11, fontFamily: theme.typography.fontFamilyBold },
    personalPlanRow: { minHeight: 31, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingLeft: 35 },
    personalPlanName: { flex: 1, color: theme.colors.text, fontSize: 10, fontFamily: theme.typography.fontFamilyMedium },
    personalPlanTime: { color: theme.colors.primary, fontSize: 10, fontFamily: theme.typography.fontFamilyBold },
    personalPlanEmpty: { color: theme.colors.muted, fontSize: 9, lineHeight: 14, paddingLeft: 35, paddingTop: 2, fontFamily: theme.typography.fontFamily },
    sectionTitle: { color: theme.colors.text, fontSize: 17, fontFamily: theme.typography.fontFamilyBold },
    sectionSubtitle: { color: theme.colors.muted, fontSize: 10, marginTop: 4, fontFamily: theme.typography.fontFamily },
    viewAll: { color: theme.colors.primary, fontSize: 10, fontFamily: theme.typography.fontFamilyBold },
    message: { color: theme.colors.muted, fontSize: 12, paddingVertical: 16, fontFamily: theme.typography.fontFamily },
    messageCard: { padding: 14, borderRadius: 14, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
    messageText: { color: theme.colors.text, fontSize: 11, lineHeight: 16, fontFamily: theme.typography.fontFamily },
    retry: { color: theme.colors.primary, fontSize: 11, marginTop: 8, fontFamily: theme.typography.fontFamilyBold },
    emptyCard: {
      alignItems: "center",
      paddingHorizontal: 22,
      paddingVertical: 23,
      borderRadius: 18,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emptyIcon: { width: 43, height: 43, alignItems: "center", justifyContent: "center", borderRadius: 14 },
    emptyTitle: { color: theme.colors.text, fontSize: 14, marginTop: 11, fontFamily: theme.typography.fontFamilyBold },
    emptyText: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 5, fontFamily: theme.typography.fontFamily },
    scheduleButton: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14 },
    scheduleButtonText: { color: theme.colors.primary, fontSize: 11, fontFamily: theme.typography.fontFamilyBold },
    plannerShortcut: {
      minHeight: 43,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      marginTop: 9,
      borderRadius: 12,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    plannerShortcutText: { flex: 1, fontSize: 11, fontFamily: theme.typography.fontFamilyBold },
    workoutCard: {
      minHeight: 78,
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      padding: 12,
      marginBottom: 9,
      borderRadius: 15,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    workoutIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 13 },
    workoutCopy: { flex: 1 },
    workoutTitle: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    workoutMeta: { color: theme.colors.primaryDark, fontSize: 10, marginTop: 4, fontFamily: theme.typography.fontFamilyMedium },
    duration: { color: theme.colors.muted, fontSize: 9, marginTop: 3, fontFamily: theme.typography.fontFamily },
  });
