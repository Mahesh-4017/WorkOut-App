import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { addDays, CLASSES, fromKey, instructorName, INSTRUCTORS, toKey } from "../../../data/classSchedule";
import { useSchedule } from "../../../data/ScheduleProvider";
import { OnboardingHeader } from "../../../components/OnboardingUI";
import { ACCENT } from "../../../components/MovementUI";
import { DARK_TEXT } from "../../../components/WorkoutUI";

export default function DateClasses() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const { dates } = useSchedule();
  const styles = createStyles(theme);
  const instructorId: string | undefined = params?.instructorId;
  const [date, setDate] = useState<string>(params?.date ?? toKey(new Date()));

  const strip = useMemo(() => {
    const base = fromKey(date);
    return Array.from({ length: 7 }, (_, index) => addDays(base, index - 3));
  }, [date]);

  const classes = instructorId
    ? CLASSES.filter(session => session.instructorId === instructorId)
    : CLASSES;
  const heading = instructorId
    ? `Classes with ${INSTRUCTORS.find(instructor => instructor.id === instructorId)?.name ?? "Instructor"}`
    : "Choose a class";
  const monthLabel = fromKey(date).toLocaleDateString(undefined, { day: "numeric", month: "long" });

  return (
    <SafeAreaView style={styles.screen}>
      <OnboardingHeader title="Date Classes" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{heading}</Text>
          {!instructorId ? <Text style={styles.month}>{monthLabel}</Text> : null}
        </View>

        {!instructorId ? (
          <View style={styles.strip}>
            {strip.map(day => {
              const key = toKey(day);
              const selected = key === date;
              const hasClasses = dates.has(key);
              return (
                <Pressable
                  key={key}
                  onPress={() => setDate(key)}
                  style={[styles.dayBox, hasClasses && styles.dayHas, selected && styles.daySelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={day.toDateString()}
                >
                  <Text style={styles.dayNum}>{day.getDate()}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {classes.length === 0 ? <Text style={styles.empty}>No classes found.</Text> : null}
        {classes.map(session => (
          <Pressable
            key={session.id}
            onPress={() => navigation.navigate(WORKOUT_ROUTES.CLASS_DETAILS, {
              classId: session.id,
              date,
            })}
            style={styles.classRow}
            accessibilityRole="button"
          >
            <View style={styles.minutes}>
              <Text style={styles.minNum}>{session.minutes}</Text>
              <Text style={styles.minLabel}>MINUTES</Text>
            </View>
            <View style={[styles.card, { backgroundColor: session.tint }]}>
              <View style={[
                styles.tag,
                { backgroundColor: session.tagColor === "orange" ? ACCENT.orange : theme.colors.primary },
              ]}>
                <Text style={styles.tagText}>{session.tag}</Text>
              </View>
              <Text style={styles.classTitle}>{session.title}</Text>
              <Text style={styles.classMeta}>
                {session.time} · {instructorName(session.instructorId)}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    scroll: { paddingBottom: 24 },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6 },
    title: { flex: 1, color: theme.colors.text, fontSize: 18, lineHeight: 23, fontFamily: theme.typography.fontFamilyBold },
    month: { color: theme.colors.muted, fontSize: 11, marginLeft: 10, marginTop: 4, fontFamily: theme.typography.fontFamilyMedium },
    strip: { flexDirection: "row", gap: 6, backgroundColor: "#E3EDE0", borderRadius: 14, padding: 8, marginVertical: 14 },
    dayBox: { flex: 1, aspectRatio: 1, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.6)", alignItems: "center", justifyContent: "center" },
    dayHas: { backgroundColor: theme.colors.primary },
    daySelected: { backgroundColor: ACCENT.orange },
    dayNum: { color: DARK_TEXT, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    empty: { color: theme.colors.muted, fontSize: 12, marginTop: 14, fontFamily: theme.typography.fontFamily },
    classRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
    minutes: { width: 52, alignItems: "center" },
    minNum: { color: theme.colors.text, fontSize: 24, fontFamily: theme.typography.fontFamilyBold },
    minLabel: { color: theme.colors.muted, fontSize: 8, letterSpacing: 0.6, fontFamily: theme.typography.fontFamilyMedium },
    card: { flex: 1, borderRadius: 12, padding: 12 },
    tag: { alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, marginBottom: 6 },
    tagText: { color: DARK_TEXT, fontSize: 8, letterSpacing: 0.4, fontFamily: theme.typography.fontFamilyBold },
    classTitle: { color: DARK_TEXT, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    classMeta: { color: "rgba(27,31,26,0.65)", fontSize: 11, marginTop: 3, fontFamily: theme.typography.fontFamily },
  });
