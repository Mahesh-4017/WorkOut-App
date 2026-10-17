import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

import { useTheme } from "../../theme/ThemeProvider";
import { useNavigation } from "@react-navigation/native";
import { WORKOUT_ROUTES } from "../../navigation/workoutRoutes";
import { useSchedule } from "../../data/ScheduleProvider";
import Ionicons from "@react-native-vector-icons/ionicons";
import { weekdayName } from "../../utils/scheduleReminders";
import { addDaysToDateKey, indiaDateKey, indiaLongDateLabel, indiaWeekday } from "../../utils/indiaTime";

/* =========================================================
   Responsive Helpers
========================================================= */

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const rw = (value: number) =>
  responsiveWidth((value / BASE_WIDTH) * 100);

const rh = (value: number) =>
  responsiveHeight((value / BASE_HEIGHT) * 100);

const rf = (value: number) =>
  responsiveFontSize((value / BASE_HEIGHT) * 100);

/* =========================================================
   Types
========================================================= */

type Workout = {
  id: string;
  date: string;
  label: string;
  name: string;
  muscles: string;
  exercises: number;
  duration: string;
  time: string;
  repeatDays: number[];
  reminderEnabled: boolean;
  kind: "workout" | "day";
  icon: React.ComponentProps<typeof Ionicons>["name"];
  exerciseId?: string;
};

const dateAtOffset = (days: number) => addDaysToDateKey(indiaDateKey(), days);
const formatScheduleTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return time;
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

/* =========================================================
   Calendar Screen
========================================================= */

export default function CalendarScreen({ selectedDate: initialDate }: { selectedDate?: string } = {}) {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { scheduled, dayPlans, loading, error, refresh, remove, removeDayPlan } = useSchedule();

  const styles = createStyles(theme);

  const [selectedDate, setSelectedDate] = useState(
    initialDate ?? dateAtOffset(0)
  );

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh]),
  );

  /* =========================================================
     Selected Workout
  ========================================================= */

  const workouts = useMemo(() => scheduled.map(plan => ({
    id: plan.id,
    date: plan.date,
    label: new Date(`${plan.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
    name: plan.title,
    muscles: [plan.bodyPart, plan.category].filter(Boolean).join(" • ") || "Workout",
    exercises: 1,
    duration: `${plan.durationMinutes} min`,
    time: plan.time,
    repeatDays: plan.repeatDays || [],
    reminderEnabled: plan.reminderEnabled,
    kind: "workout" as const,
    icon: "barbell-outline" as const,
    exerciseId: plan.exerciseId,
  })), [scheduled]);

  const personalPlans = useMemo(() => dayPlans.flatMap(plan => {
    const repeatsOnSelectedDate = selectedDate >= plan.date
      && plan.repeatDays?.includes(indiaWeekday(selectedDate));
    if (plan.repeatDays?.length ? !repeatsOnSelectedDate : plan.date !== selectedDate) return [];
    return [{
      id: plan.id,
      date: selectedDate,
      label: indiaLongDateLabel(selectedDate),
      name: plan.title,
      muscles: plan.description || "Personal day plan",
      exercises: 0,
      duration: "",
      time: plan.time,
      repeatDays: plan.repeatDays || [],
      reminderEnabled: plan.reminderEnabled,
      kind: "day" as const,
      icon: "calendar-outline" as const,
    }];
  }), [dayPlans, selectedDate]);

  const selectedWorkouts = useMemo(
    () => workouts.filter(workout => workout.date === selectedDate),
    [selectedDate, workouts],
  );
  const selectedAgenda = useMemo(
    () => [...selectedWorkouts, ...personalPlans].sort((a, b) => a.time.localeCompare(b.time)),
    [personalPlans, selectedWorkouts],
  );
  const weekDates = useMemo(() => {
    const weekStart = addDaysToDateKey(selectedDate, -((indiaWeekday(selectedDate) + 6) % 7));
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDaysToDateKey(weekStart, index);
      const [year, month, day] = date.split("-").map(Number);
      const weekday = new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString(undefined, {
        weekday: "short",
        timeZone: "UTC",
      });
      const hasPlan = scheduled.some(item => item.date === date)
        || dayPlans.some(plan => plan.repeatDays.length
          ? date >= plan.date && plan.repeatDays.includes(indiaWeekday(date))
          : plan.date === date);
      return { date, weekday, day: Number(date.slice(-2)), hasPlan };
    });
  }, [dayPlans, scheduled, selectedDate]);

  /* =========================================================
     Render
  ========================================================= */

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.weekCard}>
            <View style={styles.weekHeader}>
              <Pressable
                onPress={() => setSelectedDate(addDaysToDateKey(selectedDate, -7))}
                style={styles.weekArrow}
                accessibilityRole="button"
                accessibilityLabel="Previous week"
              >
                <Ionicons name="chevron-back" size={16} color={theme.colors.muted} />
              </Pressable>
              <View style={styles.weekHeaderCopy}>
                <Text style={styles.weekTitle}>SELECT A DAY</Text>
                <Text style={styles.weekMonth}>
                  {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedDate(addDaysToDateKey(selectedDate, 7))}
                style={styles.weekArrow}
                accessibilityRole="button"
                accessibilityLabel="Next week"
              >
                <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
              </Pressable>
            </View>
            <View style={styles.weekRow}>
              {weekDates.map(item => {
                const active = item.date === selectedDate;
                return (
                  <Pressable
                    key={item.date}
                    onPress={() => setSelectedDate(item.date)}
                    style={styles.weekDateButton}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.weekday}, ${item.day}${item.hasPlan ? ", plans scheduled" : ""}`}
                    accessibilityState={{ selected: active }}
                  >
                    <View style={[styles.weekDateCircle, active && styles.weekDateCircleActive]}>
                      <Text style={[styles.weekdayText, active && styles.weekdayTextActive]}>{item.weekday}</Text>
                      <Text style={[styles.weekDateText, active && styles.weekDateTextActive]}>{item.day}</Text>
                      <View style={[styles.planDot, item.hasPlan && styles.planDotActive, active && item.hasPlan && styles.planDotSelected]} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.dayOverview}>
            <View style={styles.dayHeadingRow}>
              <View style={styles.dayHeadingCopy}>
                <View style={styles.dayEyebrowRow}>
                  <View style={styles.dayStatusDot} />
                  <Text style={styles.dayEyebrow}>{selectedDate === dateAtOffset(0) ? "TODAY" : "YOUR SELECTED DAY"}</Text>
                </View>
                <Text style={styles.dayDate}>{indiaLongDateLabel(selectedDate).split(", ").slice(1).join(", ")}</Text>
                <Text style={styles.dayWeekday}>{indiaLongDateLabel(selectedDate).split(",")[0]}</Text>
              </View>
              <View style={styles.dayCountBadge}>
                <Text style={styles.dayCount}>{loading ? "—" : selectedAgenda.length}</Text>
                <Text style={styles.dayCountLabel}>{selectedAgenda.length === 1 ? "PLAN" : "PLANS"}</Text>
              </View>
            </View>
            <View style={styles.dayOverviewFooter}>
              <Ionicons name="time-outline" size={14} color={theme.colors.onPrimary} />
              <Text style={styles.daySummary}>
                {loading ? "Syncing your schedule" : selectedAgenda.length
                  ? `${selectedAgenda.length} ${selectedAgenda.length === 1 ? "activity" : "activities"} planned`
                  : "A fresh day. Make it count."}
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.agendaHeading}>
              <Text style={styles.sectionTitle}>Your day</Text>
              <Text style={styles.agendaSubtitle}>Everything planned for this date</Text>
            </View>
            <Pressable
              hitSlop={10}
              onPress={() => navigation.navigate(WORKOUT_ROUTES.SCHEDULE, { selectedDate })}
              accessibilityRole="button"
            >
              <Text style={styles.viewAll}>Manage</Text>
            </Pressable>
          </View>

          {loading ? <Text style={styles.workoutMuscles}>Loading your synced schedule…</Text> : null}
          {error ? (
            <Pressable onPress={refresh} style={styles.workoutCard}>
              <Text style={styles.workoutMuscles}>{error} · Tap to retry</Text>
            </Pressable>
          ) : null}
          {!loading && selectedAgenda.length === 0 ? (
            <EmptyWorkoutCard
              styles={styles}
            />
          ) : null}
          {selectedAgenda.map(item => (
            <WorkoutCard
              key={`${item.kind}-${item.id}-${item.date}`}
              workout={item}
              styles={styles}
              onRemove={() => item.kind === "workout" ? remove(item.id) : removeDayPlan(item.id)}
              onPress={() => item.kind === "day"
                ? navigation.navigate(WORKOUT_ROUTES.PLANNER, { mode: "day", date: item.date })
                : item.exerciseId
                  ? navigation.navigate(WORKOUT_ROUTES.LIBRARY_EXERCISE, { exerciseId: item.exerciseId })
                  : navigation.navigate(WORKOUT_ROUTES.SCHEDULE, { selectedDate: item.date })}
            />
          ))}

          <View style={styles.addPlanRow}>
            <Pressable
              onPress={() => navigation.navigate(WORKOUT_ROUTES.SCHEDULE, { selectedDate })}
              style={styles.addPlanButton}
              accessibilityRole="button"
            >
              <Ionicons name="barbell-outline" size={16} color={theme.colors.primaryDark} />
              <Text style={styles.addPlanButtonText}>Add workout</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate(WORKOUT_ROUTES.PLANNER, { mode: "day", date: selectedDate })}
              style={styles.addPlanButton}
              accessibilityRole="button"
            >
              <Ionicons name="add-circle-outline" size={17} color={theme.colors.primaryDark} />
              <Text style={styles.addPlanButtonText}>Add day plan</Text>
            </Pressable>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* =========================================================
   Workout Card
========================================================= */

function WorkoutCard({
  workout,
  onPress,
  onRemove,
  styles,
}: {
  workout: Workout;
  onPress: () => void;
  onRemove?: () => void;
  styles: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.workoutCard}
      accessibilityRole="button"
      accessibilityLabel={`${workout.name}, ${formatScheduleTime(workout.time)} IST`}
    >
      <View style={styles.timeColumn}>
        <Text style={styles.cardTime}>{formatScheduleTime(workout.time)}</Text>
        <Text style={styles.timezone}>IST</Text>
      </View>

      <View style={styles.timeline}>
        <View style={[styles.timelineDot, workout.kind === "day" && styles.timelineDotPersonal]} />
      </View>

      <View style={styles.workoutContent}>
        <View style={styles.workoutTypeRow}>
          <View style={[
            styles.workoutTypeBadge,
            workout.kind === "day" && styles.personalTypeBadge,
          ]}>
            <Ionicons
              name={workout.icon}
              size={12}
              color={workout.kind === "day" ? styles.colors.accent : styles.colors.primaryDark}
            />
            <Text style={[
              styles.workoutLabel,
              workout.kind === "day" && styles.personalTypeText,
            ]}>
              {workout.kind === "day" ? "PERSONAL PLAN" : "WORKOUT"}
            </Text>
          </View>
          {workout.reminderEnabled ? (
            <Ionicons name="notifications-outline" size={14} color={styles.colors.muted} />
          ) : null}
        </View>

        <Text style={styles.workoutName} numberOfLines={1}>{workout.name}</Text>
        <Text style={styles.workoutMuscles} numberOfLines={2}>{workout.muscles}</Text>
        <Text style={styles.cardDetails}>
          {workout.kind === "workout"
            ? `${workout.duration} · ${workout.exercises} exercise`
            : workout.repeatDays.length
              ? `Repeats ${workout.repeatDays.map(weekdayName).join(", ")}`
              : "One-time plan"}
        </Text>
      </View>

      <View style={styles.arrowContainer}>
        {onRemove ? (
          <Pressable
            onPress={event => { event.stopPropagation(); onRemove(); }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${workout.name}`}
          >
            <Ionicons name="trash-outline" size={17} color={styles.colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

/* =========================================================
   Empty Workout Card
========================================================= */

function EmptyWorkoutCard({
  styles,
}: {
  styles: any;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons name="sparkles-outline" size={20} color={styles.colors.primaryDark} />
      </View>
      <View style={styles.emptyContent}>
        <Text style={styles.emptyTitle}>Nothing planned yet</Text>
        <Text style={styles.emptyText}>Add a workout or a personal plan to shape your day.</Text>
      </View>
    </View>
  );
}

/* =========================================================
   Styles
========================================================= */

const createStyles = (theme: any) =>
  StyleSheet.create({

    colors: theme.colors,

    container: {
      flex: 1,
      backgroundColor:
        theme.colors.background,
    },

    safeArea: {
      flex: 1,
      
    },

    content: {
      paddingHorizontal:
        rw(18),

      paddingBottom:
        rh(78),
    },

    bottomSpacer: {
      height: rh(30),
    },

    weekCard: {
      paddingHorizontal: rw(10),
      paddingVertical: rh(10),
      borderRadius: rw(19),
      backgroundColor: theme.colors.surface,
    },

    weekHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: rh(8),
    },

    weekArrow: {
      width: rw(28),
      height: rw(28),
      borderRadius: rw(9),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.card,
    },

    weekHeaderCopy: {
      flex: 1,
      alignItems: "center",
    },

    weekTitle: {
      color: theme.colors.text,
      fontSize: rf(8),
      fontWeight: "800",
      letterSpacing: 1,
    },

    weekMonth: {
      color: theme.colors.muted,
      fontSize: rf(9),
      fontWeight: "600",
    },

    weekRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    weekDateButton: {
      flex: 1,
      alignItems: "center",
      gap: 0,
    },

    weekdayText: {
      color: theme.colors.muted,
      fontSize: rf(8),
      fontWeight: "700",
      textTransform: "uppercase",
    },

    weekdayTextActive: {
      color: theme.colors.onPrimary,
    },

    weekDateCircle: {
      width: rw(38),
      height: rw(54),
      borderRadius: rw(14),
      gap: rh(2),
      alignItems: "center",
      justifyContent: "center",
    },

    weekDateCircleActive: {
      backgroundColor: theme.colors.primary,
    },

    weekDateText: {
      color: theme.colors.text,
      fontSize: rf(11),
      fontWeight: "700",
    },

    weekDateTextActive: {
      color: theme.colors.onPrimary,
    },

    planDot: {
      width: rw(4),
      height: rw(4),
      borderRadius: rw(2),
      backgroundColor: "transparent",
    },

    planDotActive: {
      backgroundColor: theme.colors.primary,
    },

    planDotSelected: {
      backgroundColor: theme.colors.onPrimary,
    },

    /*
    |--------------------------------------------------------------------------
    | Section Header
    |--------------------------------------------------------------------------
    */

    sectionHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginTop:
        rh(19),

      marginBottom:
        rh(11),
    },

    agendaHeading: {
      flex: 1,
    },

    agendaSubtitle: {
      marginTop: rh(3),
      color: theme.colors.muted,
      fontSize: rf(9),
    },

    sectionTitle: {
      fontSize:
        rf(16),

      fontWeight:
        "800",

      color:
        theme.colors.text,
    },

    viewAll: {
      fontSize:
        rf(10),

      fontWeight:
        "700",

      color:
        theme.colors.primaryDark,
    },

    /*
    |--------------------------------------------------------------------------
    | Workout Card
    |--------------------------------------------------------------------------
    */

    workoutCard: {
      minHeight: rh(98),
      backgroundColor: theme.colors.card,
      borderRadius: rw(16),
      paddingHorizontal: rw(12),
      paddingVertical: rh(12),
      flexDirection: "row",
      alignItems: "center",
      marginBottom: rh(9),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    timeColumn: {
      width: rw(61),
      alignItems: "center",
      justifyContent: "center",
    },

    cardTime: {
      color: theme.colors.text,
      fontSize: rf(10),
      fontWeight: "800",
    },

    timezone: {
      marginTop: rh(2),
      color: theme.colors.muted,
      fontSize: rf(7),
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    timeline: {
      width: rw(19),
      alignSelf: "stretch",
      alignItems: "center",
      justifyContent: "center",
    },

    timelineDot: {
      width: rw(9),
      height: rw(9),
      borderRadius: rw(5),
      backgroundColor: theme.colors.primary,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },

    timelineDotPersonal: {
      backgroundColor: theme.colors.accent,
    },

    workoutContent: {
      flex: 1,
      paddingLeft: rw(11),
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.border,
    },

    workoutTypeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: rh(4),
    },

    workoutTypeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: rw(4),
      paddingHorizontal: rw(6),
      paddingVertical: rh(3),
      borderRadius: rw(6),
      backgroundColor: theme.colors.surface,
    },

    personalTypeBadge: {
      backgroundColor: theme.colors.panel,
    },

    workoutLabel: {
      color: theme.colors.primaryDark,
      fontSize: rf(7),
      fontWeight: "800",
      letterSpacing: 0.6,
    },

    personalTypeText: {
      color: theme.colors.accent,
    },

    workoutName: {
      color: theme.colors.text,
      fontSize: rf(12),
      fontWeight: "800",
      marginBottom: rh(2),
    },

    workoutMuscles: {
      color: theme.colors.textSecondary,
      fontSize: rf(9),
      marginBottom: rh(4),
    },

    cardDetails: {
      color: theme.colors.muted,
      fontSize: rf(8),
      fontWeight: "600",
    },

    /*
    |--------------------------------------------------------------------------
    | Workout Meta
    |--------------------------------------------------------------------------
    */

    dayOverview: {
      marginTop: rh(14),
      padding: rw(17),
      borderRadius: rw(20),
      backgroundColor: theme.colors.primaryDark,
    },

    dayEyebrow: {
      color: theme.colors.onPrimary,
      opacity: 0.75,
      fontSize: rf(9),
      fontWeight: "800",
      letterSpacing: 1.2,
    },

    dayEyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rw(6),
      marginBottom: rh(4),
    },

    dayStatusDot: {
      width: rw(6),
      height: rw(6),
      borderRadius: rw(3),
      backgroundColor: theme.colors.onPrimary,
    },

    dayHeadingRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: rw(10),
    },

    dayHeadingCopy: {
      flex: 1,
    },

    dayDate: {
      color: theme.colors.onPrimary,
      fontSize: rf(22),
      fontWeight: "800",
    },

    dayWeekday: {
      color: theme.colors.onPrimary,
      opacity: 0.75,
      fontSize: rf(10),
      marginTop: rh(2),
      fontWeight: "600",
    },

    daySummary: {
      color: theme.colors.onPrimary,
      opacity: 0.82,
      fontSize: rf(9),
      fontWeight: "600",
    },

    dayCountBadge: {
      minWidth: rw(57),
      height: rw(57),
      borderRadius: rw(17),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.14)",
    },

    dayCount: {
      color: theme.colors.onPrimary,
      fontSize: rf(19),
      fontWeight: "800",
    },

    dayCountLabel: {
      color: theme.colors.onPrimary,
      opacity: 0.75,
      fontSize: rf(7),
      fontWeight: "800",
      letterSpacing: 0.8,
    },

    dayOverviewFooter: {
      flexDirection: "row",
      alignItems: "center",
      gap: rw(6),
      marginTop: rh(13),
      paddingTop: rh(10),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(255,255,255,0.28)",
    },

    addPlanRow: {
      flexDirection: "row",
      gap: rw(9),
      marginTop: rh(5),
      marginBottom: rh(10),
    },

    addPlanButton: {
      flex: 1,
      minHeight: rh(45),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: rw(6),
      paddingHorizontal: rw(8),
      borderRadius: rw(13),
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    addPlanButtonText: {
      color: theme.colors.primaryDark,
      fontSize: rf(9),
      fontWeight: "800",
    },

    arrowContainer: {
      marginLeft:
        rw(6),
    },

    /*
    |--------------------------------------------------------------------------
    | Empty Workout
    |--------------------------------------------------------------------------
    */

    emptyCard: {
      minHeight:
        rh(85),

      borderRadius:
        rw(17),

      backgroundColor:
        theme.colors.card,

      borderWidth:
        1,

      borderColor:
        theme.colors.border,

      padding:
        rw(13),

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    emptyIcon: {
      width:
        rw(48),

      height:
        rh(48),

      borderRadius:
        rw(14),

      backgroundColor:
        theme.colors.surface,

      borderWidth:
        1,

      borderColor:
        theme.colors.border,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        rw(12),
    },

    emptyContent: {
      flex: 1,
    },

    emptyTitle: {
      fontSize:
        rf(12),

      fontWeight:
        "800",

      color:
        theme.colors.text,
    },

    emptyText: {
      fontSize:
        rf(9),

      color:
        theme.colors.textSecondary,

      marginTop:
        rh(3),
    },

  });