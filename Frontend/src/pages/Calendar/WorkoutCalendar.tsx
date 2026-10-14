import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
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

const dateAtOffset = (days: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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
      && plan.repeatDays?.includes(new Date(`${selectedDate}T12:00:00`).getDay());
    if (plan.repeatDays?.length ? !repeatsOnSelectedDate : plan.date !== selectedDate) return [];
    return [{
      id: plan.id,
      date: selectedDate,
      label: new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
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

  const upcomingPersonalPlans = useMemo(() => dayPlans.flatMap(plan => {
    const lastDay = new Date(`${selectedDate}T12:00:00`);
    lastDay.setDate(lastDay.getDate() + 30);
    const firstDay = new Date(`${selectedDate}T12:00:00`);
    const occurrences: Workout[] = [];
    for (const day = new Date(firstDay); day <= lastDay; day.setDate(day.getDate() + 1)) {
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      const isDue = plan.repeatDays?.length
        ? key >= plan.date && plan.repeatDays.includes(day.getDay())
        : key === plan.date;
      if (isDue && key !== selectedDate) {
        occurrences.push({
          id: plan.id,
          date: key,
          label: day.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
          name: plan.title,
          muscles: plan.description || "Personal day plan",
          exercises: 0,
          duration: "",
          time: plan.time,
          repeatDays: plan.repeatDays || [],
          reminderEnabled: plan.reminderEnabled,
          kind: "day",
          icon: "calendar-outline",
        });
      }
    }
    return occurrences;
  }), [dayPlans, selectedDate]);

  const selectedWorkouts = useMemo(
    () => workouts.filter(workout => workout.date === selectedDate),
    [selectedDate, workouts],
  );

  /* =========================================================
     Calendar Marked Dates
  ========================================================= */

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    /*
     * Add workout dots
     */
    [...workouts, ...dayPlans.map(plan => ({
      date: plan.date,
      repeatDays: plan.repeatDays || [],
    }))].forEach((workout) => {
      marks[workout.date] = {
        marked: true,
        dotColor: theme.colors.primary,
      };
      workout.repeatDays.forEach(day => {
        const start = new Date(`${workout.date}T12:00:00`);
        const end = new Date();
        end.setDate(end.getDate() + 365);
        for (let occurrence = new Date(start); occurrence <= end; occurrence.setDate(occurrence.getDate() + 1)) {
          if (occurrence.getDay() === day) {
            const key = dateAtOffset(Math.round((occurrence.getTime() - new Date(`${dateAtOffset(0)}T12:00:00`).getTime()) / 86400000));
            marks[key] = { ...(marks[key] || {}), marked: true, dotColor: theme.colors.primary };
          }
        }
      });
    });

    /*
     * Selected date
     */
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),

      selected: true,

      selectedColor:
        theme.colors.primary,

      selectedTextColor:
        theme.colors.onPrimary,

      marked: !!workouts.find(
        (workout) =>
          workout.date === selectedDate
      ) || personalPlans.length > 0,

      dotColor:
        theme.colors.onPrimary,
    };

    return marks;
  }, [
    selectedDate,
    workouts,
    dayPlans,
    personalPlans.length,
    theme.colors,
  ]);

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

          {/* =================================================
              Calendar
          ================================================= */}

          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => {
                setSelectedDate(
                  day.dateString
                );
              }}
              markedDates={markedDates}
              enableSwipeMonths={true}
              hideExtraDays={false}
              firstDay={1}
              showWeekNumbers={false}
              hideArrows={false}
              disableMonthChange={false}
              theme={{
                /*
                 * Background
                 */
                backgroundColor:
                  theme.colors.card,

                calendarBackground:
                  theme.colors.card,

                /*
                 * Header
                 */
                textSectionTitleColor:
                  theme.colors.muted,

                monthTextColor:
                  theme.colors.text,

                arrowColor:
                  theme.colors.text,

                /*
                 * Dates
                 */
                dayTextColor:
                  theme.colors.text,

                textDisabledColor:
                  theme.colors.muted,

                /*
                 * Selected
                 */
                selectedDayBackgroundColor:
                  theme.colors.primary,

                selectedDayTextColor:
                  theme.colors.onPrimary,

                /*
                 * Today
                 */
                todayTextColor:
                  theme.colors.primaryDark,

                /*
                 * Workout dots
                 */
                dotColor:
                  theme.colors.primary,

                selectedDotColor:
                  theme.colors.onPrimary,

                /*
                 * Fonts
                 */
                textDayFontSize:
                  rf(11),

                textMonthFontSize:
                  rf(14),

                textDayHeaderFontSize:
                  rf(9),

                textDayFontWeight:
                  "600",

                textMonthFontWeight:
                  "800",

                textDayHeaderFontWeight:
                  "600",
              }}
            />
          </View>

          {/* =================================================
              Workouts Header
          ================================================= */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Workouts
            </Text>

            <Pressable hitSlop={10} onPress={() => navigation.navigate(WORKOUT_ROUTES.SCHEDULE)}>
              <Text style={styles.viewAll}>
                View All
              </Text>
            </Pressable>
          </View>

          {/* =================================================
              Selected Workout
          ================================================= */}

          <Pressable
            onPress={() => navigation.navigate(WORKOUT_ROUTES.SCHEDULE, { selectedDate })}
            style={styles.planShortcut}
            accessibilityRole="button"
          >
            <Ionicons name="add-circle-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.planShortcutText}>Plan for {selectedDate === dateAtOffset(0) ? "today" : new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { weekday: "long" })}</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
          </Pressable>
          {loading ? <Text style={styles.workoutMuscles}>Loading your synced schedule…</Text> : null}
          {error ? (
            <Pressable onPress={refresh} style={styles.workoutCard}>
              <Text style={styles.workoutMuscles}>{error} · Tap to retry</Text>
            </Pressable>
          ) : null}
          {!loading && selectedWorkouts.length === 0 ? (
            <EmptyWorkoutCard
              styles={styles}
              onPress={() => navigation.navigate(WORKOUT_ROUTES.SCHEDULE, { selectedDate })}
            />
          ) : null}
          {selectedWorkouts.map(workout => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              selected
              styles={styles}
              onRemove={() => remove(workout.id)}
              onPress={() => workout.exerciseId
                ? navigation.navigate(WORKOUT_ROUTES.LIBRARY_EXERCISE, { exerciseId: workout.exerciseId })
                : navigation.navigate(WORKOUT_ROUTES.SCHEDULE)}
            />
          ))}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal plans</Text>
            <Pressable
              hitSlop={10}
              onPress={() => navigation.navigate(WORKOUT_ROUTES.PLANNER, { mode: "day", date: selectedDate })}
              accessibilityRole="button"
            >
              <Text style={styles.viewAll}>+ Add plan</Text>
            </Pressable>
          </View>
          {!loading && personalPlans.length === 0 ? (
            <EmptyWorkoutCard
              styles={styles}
              personal
              onPress={() => navigation.navigate(WORKOUT_ROUTES.PLANNER, { mode: "day", date: selectedDate })}
            />
          ) : null}
          {personalPlans.map(plan => (
            <WorkoutCard
              key={`${plan.id}-${plan.date}`}
              workout={plan}
              selected
              styles={styles}
              onRemove={() => removeDayPlan(plan.id)}
              onPress={() => navigation.navigate(WORKOUT_ROUTES.PLANNER, { mode: "day", date: plan.date })}
            />
          ))}

          {/* =================================================
              Upcoming
          ================================================= */}

          <Text style={styles.upcomingTitle}>
            Upcoming
          </Text>

          {[...workouts, ...upcomingPersonalPlans]
            .filter(workout => workout.date >= selectedDate)
            .filter(workout => workout.date !== selectedDate)
            .map((workout) => (
              <WorkoutCard
                key={`${workout.kind}-${workout.id}-${workout.date}`}
                workout={workout}
                selected={false}
                styles={styles}
                onPress={() => {
                  setSelectedDate(workout.date);
                }}
              />
            ))}

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
  selected,
  onPress,
  onRemove,
  styles,
}: {
  workout: Workout;
  selected: boolean;
  onPress: () => void;
  onRemove?: () => void;
  styles: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.workoutCard,

        selected &&
          styles.selectedWorkoutCard,
      ]}
    >
      {/* Workout Icon */}

      <View
        style={[
          styles.workoutIcon,

          {
            backgroundColor: selected
              ? styles.colors.primary
              : styles.colors.surface,
          },
        ]}
      >
        <Ionicons name={workout.icon} size={22} color={selected ? styles.colors.onPrimary : styles.colors.icon} />
      </View>

      {/* Workout Content */}

      <View style={styles.workoutContent}>
        <Text style={styles.workoutLabel}>
          {workout.label}
        </Text>

        <Text style={styles.workoutName}>
          {workout.name}
        </Text>

        <Text
          style={styles.workoutMuscles}
          numberOfLines={1}
        >
          {workout.muscles}
        </Text>

        {/* Meta */}

        <View style={styles.workoutMeta}>
          <Text style={styles.metaText}>
            {workout.kind === "workout"
              ? `${workout.exercises} exercise${workout.exercises === 1 ? "" : "s"} · ${workout.duration}`
              : `${workout.time}${workout.repeatDays.length ? ` · Every ${workout.repeatDays.map(weekdayName).join(", ")}` : ""}${workout.reminderEnabled ? " · Reminder on" : ""}`}
          </Text>
        </View>
      </View>

      {/* Arrow */}

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
        <Ionicons name="chevron-forward" size={19} color={styles.colors.icon} />
      </View>
    </Pressable>
  );
}

/* =========================================================
   Empty Workout Card
========================================================= */

function EmptyWorkoutCard({
  styles,
  onPress,
  personal = false,
}: {
  styles: any;
  onPress: () => void;
  personal?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.emptyCard} accessibilityRole="button">
      {/* Icon */}

      <View style={styles.emptyIcon}>
        <Ionicons name="add" size={22} color={styles.colors.icon} />
      </View>

      {/* Content */}

      <View style={styles.emptyContent}>
        <Text style={styles.emptyTitle}>
          {personal ? "No personal plans" : "No workout planned"}
        </Text>

        <Text style={styles.emptyText}>
          {personal ? "Add a reminder, activity, or note for this day" : "Add a workout for this day"}
        </Text>
      </View>

      {/* Add */}

      <View style={styles.addButton}>
        <Text style={styles.addButtonText}>
          Add
        </Text>
      </View>
    </Pressable>
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

    /*
    |--------------------------------------------------------------------------
    | Header
    |--------------------------------------------------------------------------
    */
    calendarButton: {
      width:
        rw(42),

      height:
        rh(42),

      borderRadius:
        rw(13),

      backgroundColor:
        theme.colors.card,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        theme.colors.border,
    },

    calendarIcon: {
      fontSize:
        rf(17),

      color:
        theme.colors.icon,
    },

    /*
    |--------------------------------------------------------------------------
    | Calendar
    |--------------------------------------------------------------------------
    */

    calendarContainer: {
      backgroundColor:
        theme.colors.card,

      borderRadius:
        rw(20),

      padding:
        rw(5),

      borderWidth:
        1,

      borderColor:
        theme.colors.border,

      overflow:
        "hidden",
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
        rh(24),

      marginBottom:
        rh(11),
    },

    sectionTitle: {
      fontSize:
        rf(16),

      fontWeight:
        "800",

      color:
        theme.colors.text,
    },

    planShortcut: {
      minHeight: rh(43),
      flexDirection: "row",
      alignItems: "center",
      gap: rw(8),
      paddingHorizontal: rw(12),
      marginTop: rh(10),
      borderRadius: rw(12),
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    planShortcutText: {
      flex: 1,
      color: theme.colors.text,
      fontSize: rf(10),
      fontWeight: "700",
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
      minHeight:
        rh(92),

      backgroundColor:
        theme.colors.card,

      borderRadius:
        rw(17),

      padding:
        rw(12),

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        rh(10),

      borderWidth:
        1,

      borderColor:
        theme.colors.border,
    },

    selectedWorkoutCard: {
      borderColor:
        theme.colors.primary,

      backgroundColor:
        theme.colors.surface,
    },

    workoutIcon: {
      width:
        rw(52),

      height:
        rh(52),

      borderRadius:
        rw(15),

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        rw(12),
    },

    workoutEmoji: {
      fontSize:
        rf(21),
    },

    workoutContent: {
      flex: 1,
    },

    workoutLabel: {
      fontSize:
        rf(8),

      fontWeight:
        "700",

      color:
        theme.colors.muted,

      textTransform:
        "uppercase",

      letterSpacing:
        0.5,

      marginBottom:
        rh(2),
    },

    workoutName: {
      fontSize:
        rf(13),

      fontWeight:
        "800",

      color:
        theme.colors.text,

      marginBottom:
        rh(3),
    },

    workoutMuscles: {
      fontSize:
        rf(9),

      color:
        theme.colors.textSecondary,

      marginBottom:
        rh(6),
    },

    /*
    |--------------------------------------------------------------------------
    | Workout Meta
    |--------------------------------------------------------------------------
    */

    workoutMeta: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    metaText: {
      fontSize:
        rf(8),

      color:
        theme.colors.muted,

      fontWeight:
        "600",
    },

    metaDot: {
      width:
        rw(3),

      height:
        rh(3),

      borderRadius:
        rw(2),

      backgroundColor:
        theme.colors.muted,

      marginHorizontal:
        rw(6),
    },

    /*
    |--------------------------------------------------------------------------
    | Arrow
    |--------------------------------------------------------------------------
    */

    arrowContainer: {
      marginLeft:
        rw(6),
    },

    cardArrow: {
      fontSize:
        rf(24),

      color:
        theme.colors.muted,
    },

    /*
    |--------------------------------------------------------------------------
    | Upcoming
    |--------------------------------------------------------------------------
    */

    upcomingTitle: {
      fontSize:
        rf(16),

      fontWeight:
        "800",

      color:
        theme.colors.text,

      marginTop:
        rh(14),

      marginBottom:
        rh(11),
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

    emptyPlus: {
      fontSize:
        rf(23),

      fontWeight:
        "500",

      color:
        theme.colors.primaryDark,
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

    addButton: {
      paddingHorizontal:
        rw(15),

      height:
        rh(34),

      borderRadius:
        rw(10),

      backgroundColor:
        theme.colors.primary,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    addButtonText: {
      color:
        theme.colors.onPrimary,

      fontSize:
        rf(10),

      fontWeight:
        "800",
    },
  });