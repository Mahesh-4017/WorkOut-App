import React from "react";
import { Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useTheme } from "../../../theme/ThemeProvider";
import { useSession } from "../../../data/SessionProvider";
import { TINTS } from "../../../data/workoutCatalog";
import { PrimaryButton } from "../../../components/OnboardingUI";
import {
  ProgressBarChart,
  ProgressCard,
  ProgressScreen,
  ProgressSectionTitle,
  ProgressStatRow,
  ProgressStatTile,
} from "../../../components/WorkoutProgressUI";
import { PROGRESS_ROUTES } from "../../../navigation/progressRoutes";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { lastSevenDays } from "./types";

export default function ProgressOverviewScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { history, weightEntries, goals } = useSession();
  const days = lastSevenDays(history);
  const weekHistory = days.flatMap(day => day.items);
  const calories = weekHistory.reduce((total, entry) => total + entry.calories, 0);
  const activeMinutes = Math.round(weekHistory.reduce((total, entry) => total + entry.seconds, 0) / 60);

  return (
    <ProgressScreen
      title="Progress overview"
      footer={<PrimaryButton label="View weekly report" onPress={() => navigation.navigate(PROGRESS_ROUTES.WEEKLY_REPORT)} />}
    >
      <View>
        <Text style={{ color: theme.colors.text, fontSize: 25, fontFamily: theme.typography.fontFamilyBold }}>
          Your effort adds up.
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 11, marginTop: 4, fontFamily: theme.typography.fontFamily }}>
          Based on your completed workout sessions
        </Text>
      </View>
      <ProgressCard>
        <ProgressSectionTitle link="Details" onLinkPress={() => navigation.navigate(PROGRESS_ROUTES.WORKOUT_STATISTICS)}>
          Daily workouts
        </ProgressSectionTitle>
        <ProgressBarChart values={days.map(day => day.items.length)} labels={days.map(day => day.label)} highlight={6} />
        <ProgressStatRow label="Sessions this week" value={String(weekHistory.length)} />
      </ProgressCard>
      <ProgressCard>
        <ProgressSectionTitle link="Details" onLinkPress={() => navigation.navigate(PROGRESS_ROUTES.WEIGHT)}>
          Weight
        </ProgressSectionTitle>
        {weightEntries.length ? (
          <>
            <ProgressStatRow label="Latest check-in" value={`${weightEntries[0].weightKg} kg`} />
            {goals?.targetWeightKg ? <ProgressStatRow label="Target" value={`${goals.targetWeightKg} kg`} /> : null}
          </>
        ) : (
          <Text style={{ color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily }}>
            No weight check-ins recorded yet.
          </Text>
        )}
      </ProgressCard>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <ProgressStatTile value={calories.toLocaleString()} label="Calories burned" tint={TINTS.peach} />
        <ProgressStatTile value={String(activeMinutes)} label="Active minutes" tint={TINTS.mint} />
      </View>
      <ProgressCard>
        <ProgressSectionTitle>Explore your progress</ProgressSectionTitle>
        {[
          ["Goals", PROGRESS_ROUTES.GOAL],
          ["Steps", PROGRESS_ROUTES.STEPS],
          ["Calories", PROGRESS_ROUTES.CALORIES],
          ["Workout statistics", PROGRESS_ROUTES.WORKOUT_STATISTICS],
          ["Personal records", PROGRESS_ROUTES.PERSONAL_RECORDS],
          ["Session adherence", PROGRESS_ROUTES.ADHERENCE],
          ["Overall performance", PROGRESS_ROUTES.OVERALL],
          ["Weekly report", PROGRESS_ROUTES.WEEKLY_REPORT],
          ["Monthly report", PROGRESS_ROUTES.MONTHLY_REPORT],
          ["Workout history", WORKOUT_ROUTES.HISTORY],
        ].map(([label, route]) => (
          <Pressable
            key={route}
            onPress={() => navigation.navigate(route)}
            accessibilityRole="button"
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: theme.colors.surface, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12 }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamily }}>{label}</Text>
            <Text style={{ color: theme.colors.muted, fontSize: 18 }}>›</Text>
          </Pressable>
        ))}
      </ProgressCard>
    </ProgressScreen>
  );
}
