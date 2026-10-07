import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { WORKOUT_DETAILS } from "../../../data/workoutDetails";
import { fmtClock, useElapsed, useSession } from "../../../data/SessionProvider";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { StatRow } from "../../../components/WorkoutDetailUI";
import { DARK_TEXT } from "../../../components/WorkoutUI";

export default function PauseWorkout() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { active, resume, endSession } = useSession();
  const seconds = useElapsed();
  const styles = createStyles(theme);

  if (!active) {
    return (
      <SafeAreaView style={styles.screen}>
        <OnboardingHeader title="Pause workout" onBack={() => navigation.goBack()} />
        <Text style={styles.muted}>No workout in progress.</Text>
      </SafeAreaView>
    );
  }

  const calories = Math.round((active.estCalories / Math.max(active.minutes, 1)) * (seconds / 60));
  const nextIndex = Math.min(active.done, active.moves.length - 1);
  const nextMove = active.moves[nextIndex];
  const details = WORKOUT_DETAILS[active.workoutId]?.moves[nextIndex];

  const onResume = () => {
    resume();
    navigation.navigate(WORKOUT_ROUTES.ACTIVE);
  };
  const onEnd = () =>
    Alert.alert("End workout?", "Your progress so far will be saved to your history.", [
      { text: "Keep going", style: "cancel" },
      {
        text: "End workout",
        style: "destructive",
        onPress: async () => {
          try {
            await endSession();
            navigation.navigate(WORKOUT_ROUTES.SUMMARY);
          } catch (error) {
            Alert.alert("Unable to save workout", error instanceof Error ? error.message : "Please try again.");
          }
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.screen}>
      <OnboardingHeader title="Pause workout" onBack={onResume} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          <View style={styles.icon}>
            <Ionicons name="pause" size={30} color={theme.colors.primaryDark} />
          </View>
          <Text style={styles.label}>WORKOUT PAUSED</Text>
          <Text style={styles.time}>{fmtClock(seconds, false)}</Text>
          <Text style={styles.title}>{active.title}</Text>
        </View>

        <View style={styles.stats}>
          <StatRow stats={[
            { value: `${active.done} / ${active.moves.length}`, label: "Moves" },
            { value: String(calories), label: "Est. cal" },
          ]} />
        </View>

        <View style={styles.next}>
          <Text style={styles.nextLabel}>UP NEXT · MOVE {nextIndex + 1}</Text>
          <Text style={styles.nextName}>{nextMove?.name}</Text>
          {details ? (
            <Text style={styles.nextMeta}>{details.reps} reps · {details.restSec} sec rest</Text>
          ) : null}
        </View>
        <Text style={styles.hint}>Take a breath. Your timer is paused and your progress is kept.</Text>
      </ScrollView>

      <View style={styles.bottom}>
        <PrimaryButton label="Resume workout" onPress={onResume} />
        <Pressable onPress={onEnd} style={styles.endButton} accessibilityRole="button">
          <Text style={styles.endText}>End workout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    scroll: { paddingBottom: 16 },
    muted: { color: theme.colors.muted, fontSize: 13, marginTop: 10, fontFamily: theme.typography.fontFamily },
    center: { alignItems: "center", marginTop: 16 },
    icon: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#E6DFF6", alignItems: "center", justifyContent: "center" },
    label: { color: "#7B4EF0", fontSize: 10, letterSpacing: 0.8, marginTop: 14, fontFamily: theme.typography.fontFamilyBold },
    time: { color: theme.colors.text, fontSize: 52, marginTop: 4, fontFamily: theme.typography.fontFamilyBold },
    title: { color: theme.colors.muted, fontSize: 12, marginTop: 2, textAlign: "center", fontFamily: theme.typography.fontFamily },
    stats: { marginTop: 18 },
    next: { backgroundColor: "#E3EDE0", borderRadius: 12, padding: 14, marginTop: 14 },
    nextLabel: { color: "rgba(27,31,26,0.6)", fontSize: 9, letterSpacing: 0.6, fontFamily: theme.typography.fontFamilyBold },
    nextName: { color: DARK_TEXT, fontSize: 16, marginTop: 4, fontFamily: theme.typography.fontFamilyBold },
    nextMeta: { color: "rgba(27,31,26,0.65)", fontSize: 11, marginTop: 2, fontFamily: theme.typography.fontFamily },
    hint: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 12, fontFamily: theme.typography.fontFamily },
    bottom: { gap: 10, paddingBottom: 16, paddingTop: 8 },
    endButton: { height: 50, borderRadius: 25, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, alignItems: "center", justifyContent: "center" },
    endText: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
  });
