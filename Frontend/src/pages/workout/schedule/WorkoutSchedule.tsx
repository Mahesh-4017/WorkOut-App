import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { addDays, CLASSES, fromKey, toKey } from "../../../data/classSchedule";
import { useSchedule } from "../../../data/ScheduleProvider";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { ACCENT } from "../../../components/MovementUI";
import { DARK_TEXT } from "../../../components/WorkoutUI";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WorkoutSchedule() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { scheduled, dates, remove, error, loading, refresh } = useSchedule();
  const styles = createStyles(theme);
  const todayKey = toKey(new Date());
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const cells = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const leadingDays = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const calendar: (number | null)[] = [
      ...Array.from({ length: leadingDays }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
    while (calendar.length % 7) calendar.push(null);
    return Array.from({ length: calendar.length / 7 }, (_, index) =>
      calendar.slice(index * 7, index * 7 + 7),
    );
  }, [month]);

  const shiftMonth = (amount: number) =>
    setMonth(current => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  const openDate = (date: string) =>
    navigation.navigate(WORKOUT_ROUTES.DATE_CLASSES, { date });

  const weekEnd = toKey(addDays(new Date(), 6));
  const week = scheduled
    .filter(item => item.date >= todayKey && item.date <= weekEnd)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const dateLabel = (key: string, time: string) => {
    const date = fromKey(key);
    return `${key === todayKey ? "Today" : date.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    })} · ${time}`;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <OnboardingHeader
        title="Workout Schedule"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Plan your workouts ahead</Text>
          <View style={styles.monthRow}>
            <Pressable onPress={() => shiftMonth(-1)} hitSlop={10} accessibilityLabel="Previous month">
              <Ionicons name="chevron-back" size={16} color={DARK_TEXT} />
            </Pressable>
            <Text style={styles.month}>
              {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </Text>
            <Pressable onPress={() => shiftMonth(1)} hitSlop={10} accessibilityLabel="Next month">
              <Ionicons name="chevron-forward" size={16} color={DARK_TEXT} />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map(day => <Text key={day} style={styles.weekday}>{day}</Text>)}
          </View>

          {cells.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.weekRow}>
              {row.map((day, columnIndex) => {
                if (!day) return <View key={columnIndex} style={styles.cell} />;
                const key = toKey(new Date(month.getFullYear(), month.getMonth(), day));
                const isToday = key === todayKey;
                const hasClasses = dates.has(key);
                return (
                  <View key={columnIndex} style={styles.cell}>
                    <Pressable
                      onPress={() => openDate(key)}
                      style={[styles.day, hasClasses && styles.dayHas, isToday && styles.dayToday]}
                      accessibilityRole="button"
                      accessibilityLabel={`${key}${hasClasses ? ", has classes" : ""}`}
                    >
                      <Text style={[styles.dayText, (hasClasses || isToday) && styles.dayTextEmphasis]}>
                        {day}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ))}

          <View style={styles.legend}>
            <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
            <Text style={styles.legendText}>Scheduled</Text>
            <View style={[styles.dot, { backgroundColor: ACCENT.orange }]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>

        {error ? (
          <Pressable onPress={() => refresh()} style={styles.item} accessibilityRole="button">
            <Text style={styles.itemTitle}>{error}</Text>
            <Text style={styles.itemMeta}>Tap to retry schedule sync</Text>
          </Pressable>
        ) : null}
        {loading ? <Text style={styles.empty}>Loading your synced schedule…</Text> : null}

        <View style={styles.rowBetween}>
          <Text style={styles.heading}>Weekly schedule</Text>
          <Text style={styles.count}>{week.length} workout{week.length === 1 ? "" : "s"}</Text>
        </View>

        {week.length === 0 ? (
          <Text style={styles.empty}>No workouts scheduled this week. Tap a date or add a schedule.</Text>
        ) : week.map(item => {
          const classSession = CLASSES.find(entry => entry.id === item.classId);
          return (
            <Pressable
              key={item.id}
              onPress={() => item.exerciseId
                ? navigation.navigate(WORKOUT_ROUTES.LIBRARY_EXERCISE, { exerciseId: item.exerciseId })
                : classSession && navigation.navigate(WORKOUT_ROUTES.CLASS_DETAILS, {
                    classId: classSession.id,
                    date: item.date,
                  })}
              style={styles.item}
              accessibilityRole="button"
            >
              <View style={styles.itemIcon}>
                <Ionicons name="barbell-outline" size={16} color={DARK_TEXT} />
              </View>
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle}>{item.title || classSession?.title || "Workout"}</Text>
                <Text style={styles.itemMeta}>{dateLabel(item.date, item.time)}</Text>
              </View>
              <Pressable
                onPress={() => remove(item.id)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.title || classSession?.title || "workout"}`}
              >
                <Ionicons name="trash-outline" size={17} color={theme.colors.muted} />
              </Pressable>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.bottom}>
        <PrimaryButton label="+  Add schedule" onPress={() => openDate(todayKey)} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    scroll: { paddingBottom: 16 },
    card: { backgroundColor: "#FFF0D9", borderRadius: 18, padding: 14, marginTop: 6 },
    cardTitle: { color: "#8A4B08", fontSize: 20, lineHeight: 24, maxWidth: 260, fontFamily: theme.typography.fontFamilyBold },
    monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 8 },
    month: { color: DARK_TEXT, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    weekRow: { flexDirection: "row" },
    weekday: { flex: 1, textAlign: "center", color: "rgba(27,31,26,0.55)", fontSize: 10, marginBottom: 4, fontFamily: theme.typography.fontFamilyMedium },
    cell: { flex: 1, aspectRatio: 1, padding: 2 },
    day: { flex: 1, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.55)" },
    dayHas: { backgroundColor: theme.colors.primary },
    dayToday: { backgroundColor: ACCENT.orange },
    dayText: { color: "rgba(27,31,26,0.75)", fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
    dayTextEmphasis: { color: DARK_TEXT, fontFamily: theme.typography.fontFamilyBold },
    legend: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { color: "rgba(27,31,26,0.65)", fontSize: 10, marginRight: 8, fontFamily: theme.typography.fontFamily },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 10 },
    heading: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    count: { color: ACCENT.purple, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
    empty: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily },
    item: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme.colors.card, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
    itemIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
    itemCopy: { flex: 1 },
    itemTitle: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    itemMeta: { color: theme.colors.muted, fontSize: 11, marginTop: 2, fontFamily: theme.typography.fontFamily },
    bottom: { paddingBottom: 16, paddingTop: 8 },
  });
