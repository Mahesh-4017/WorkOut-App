import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";

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

export default function WorkoutStatisticsScreen() {
  const navigation = useNavigation<any>();
  const { history } = useSession();
  const days = lastSevenDays(history);
  const week = days.flatMap(day => day.items);
  const weekMinutes = Math.round(week.reduce((total, entry) => total + entry.seconds, 0) / 60);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const month = history.filter(entry => new Date(entry.startedAt).getTime() >= monthStart);
  const monthMinutes = Math.round(month.reduce((total, entry) => total + entry.seconds, 0) / 60);

  return (
    <ProgressScreen
      title="Workout statistics"
      footer={<PrimaryButton label="View workout history" onPress={() => navigation.navigate(WORKOUT_ROUTES.HISTORY)} />}
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        <ProgressStatTile value={`${weekMinutes} min`} label="This week" tint={TINTS.mint} />
        <ProgressStatTile value={`${monthMinutes} min`} label="This month" tint={TINTS.peach} />
      </View>
      <ProgressCard>
        <ProgressSectionTitle>Weekly training time</ProgressSectionTitle>
        <ProgressBarChart values={days.map(day => Math.round(day.items.reduce((total, entry) => total + entry.seconds, 0) / 60))} labels={days.map(day => day.label)} />
      </ProgressCard>
      <ProgressCard>
        <ProgressSectionTitle>Training totals</ProgressSectionTitle>
        <ProgressStatRow label="Sessions this week" value={String(week.length)} />
        <ProgressStatRow label="Sessions this month" value={String(month.length)} />
        <ProgressStatRow label="Calories this month" value={month.reduce((total, entry) => total + entry.calories, 0).toLocaleString()} />
      </ProgressCard>
      <ProgressCard>
        <ProgressSectionTitle link="See records" onLinkPress={() => navigation.navigate(PROGRESS_ROUTES.PERSONAL_RECORDS)}>
          Personal records
        </ProgressSectionTitle>
        <ProgressStatRow label="Longest recorded session" value={history.length ? `${Math.round(Math.max(...history.map(entry => entry.seconds)) / 60)} min` : "—"} />
      </ProgressCard>
    </ProgressScreen>
  );
}
