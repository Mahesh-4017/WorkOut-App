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
  const { scheduled, loading, error, refresh } = useSchedule();

  const styles = createStyles(theme);

  const [selectedDate, setSelectedDate] = useState(
    initialDate ?? dateAtOffset(0)
  );

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

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
    icon: "barbell-outline" as const,
    exerciseId: plan.exerciseId,
  })), [scheduled]);

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
    workouts.forEach((workout) => {
      marks[workout.date] = {
        marked: true,
        dotColor: theme.colors.primary,
      };
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
      ),

      dotColor:
        theme.colors.onPrimary,
    };

    return marks;
  }, [
    selectedDate,
    workouts,
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

          {loading ? <Text style={styles.workoutMuscles}>Loading your synced schedule…</Text> : null}
          {error ? (
            <Pressable onPress={() => void refresh()} style={styles.workoutCard}>
              <Text style={styles.workoutMuscles}>{error} · Tap to retry</Text>
            </Pressable>
          ) : null}
          {!loading && selectedWorkouts.length === 0 ? <EmptyWorkoutCard styles={styles} /> : null}
          {selectedWorkouts.map(workout => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              selected
              styles={styles}
              onPress={() => workout.exerciseId
                ? navigation.navigate(WORKOUT_ROUTES.LIBRARY_EXERCISE, { exerciseId: workout.exerciseId })
                : navigation.navigate(WORKOUT_ROUTES.SCHEDULE)}
            />
          ))}

          {/* =================================================
              Upcoming
          ================================================= */}

          <Text style={styles.upcomingTitle}>
            Upcoming
          </Text>

          {workouts
            .filter(workout => workout.date >= selectedDate)
            .filter(workout => workout.date !== selectedDate)
            .map((workout) => (
              <WorkoutCard
                key={workout.id}
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
  styles,
}: {
  workout: Workout;
  selected: boolean;
  onPress: () => void;
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
            {workout.exercises} exercises
          </Text>

          <View style={styles.metaDot} />

          <Text style={styles.metaText}>
            {workout.duration}
          </Text>
        </View>
      </View>

      {/* Arrow */}

      <View style={styles.arrowContainer}>
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
}: {
  styles: any;
}) {
  return (
    <View style={styles.emptyCard}>
      {/* Icon */}

      <View style={styles.emptyIcon}>
        <Ionicons name="add" size={22} color={styles.colors.icon} />
      </View>

      {/* Content */}

      <View style={styles.emptyContent}>
        <Text style={styles.emptyTitle}>
          No workout planned
        </Text>

        <Text style={styles.emptyText}>
          Add a workout for this day
        </Text>
      </View>

      {/* Add */}

      <Pressable
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>
          Add
        </Text>
      </Pressable>
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