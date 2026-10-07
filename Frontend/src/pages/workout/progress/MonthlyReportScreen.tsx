import React from "react";
import { Share, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useTheme } from "../../../theme/ThemeProvider";
import { useSession } from "../../../data/SessionProvider";
import { TINTS } from "../../../data/workoutCatalog";
import { ProgressBarChart, ProgressCard, ProgressScreen, ProgressSectionTitle, ProgressStatRow, ProgressStatTile } from "../../../components/WorkoutProgressUI";
import { PrimaryButton } from "../../../components/OnboardingUI";
import { PROGRESS_ROUTES } from "../../../navigation/progressRoutes";
import { localDateKey } from "./types";

export default function MonthlyReportScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { history } = useSession();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const current = history.filter(entry => {
    const date = new Date(entry.startedAt);
    return date >= monthStart && date < nextMonth;
  });
  const previous = history.filter(entry => {
    const date = new Date(entry.startedAt);
    return date >= previousMonth && date < monthStart;
  });
  const minutes = Math.round(current.reduce((total, entry) => total + entry.seconds, 0) / 60);
  const monthName = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const weekly = Array.from({ length: 5 }, (_, index) =>
    current.filter(entry => Math.min(4, Math.floor((new Date(entry.startedAt).getDate() - 1) / 7)) === index),
  );
  const share = () => Share.share({
    message: `${monthName}: ${current.length} workout sessions, ${minutes} active minutes, and ${current.reduce((total, entry) => total + entry.calories, 0)} calories recorded.`,
  });

  return (
    <ProgressScreen title="Monthly report" footer={
      <View style={{ gap: 8 }}>
        <Text onPress={share} accessibilityRole="button" style={{ textAlign: "center", color: theme.colors.primaryDark, fontSize: 14, fontFamily: theme.typography.fontFamilyBold, padding: 12 }}>
          Share monthly report
        </Text>
        <PrimaryButton label="Review goals" onPress={() => navigation.navigate(PROGRESS_ROUTES.GOAL)} />
      </View>
    }>
      <Text style={{ color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily }}>{monthName}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 23, fontFamily: theme.typography.fontFamilyBold }}>Your month in motion.</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <ProgressStatTile value={String(current.length)} label="Sessions" tint={TINTS.mint} />
        <ProgressStatTile value={`${minutes} min`} label="Active time" tint={TINTS.lavender} />
      </View>
      <ProgressCard>
        <ProgressSectionTitle>Training by week</ProgressSectionTitle>
        <ProgressBarChart
          values={weekly.map(entries => entries.length)}
          labels={weekly.map((_, index) => `W${index + 1}`)}
          highlight={Math.min(4, Math.floor((now.getDate() - 1) / 7))}
        />
      </ProgressCard>
      <ProgressCard>
        <ProgressStatRow label="Calories" value={current.reduce((total, entry) => total + entry.calories, 0).toLocaleString()} />
        <ProgressStatRow label="Change vs previous month" value={previous.length ? `${current.length - previous.length >= 0 ? "+" : ""}${current.length - previous.length} sessions` : "No previous month data"} />
        <ProgressStatRow label="Recorded through" value={localDateKey(now)} />
      </ProgressCard>
    </ProgressScreen>
  );
}
