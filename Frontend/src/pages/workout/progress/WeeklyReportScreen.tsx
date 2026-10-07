import React from "react";
import { Share, Text, View } from "react-native";

import { useTheme } from "../../../theme/ThemeProvider";
import { useSession } from "../../../data/SessionProvider";
import { TINTS } from "../../../data/workoutCatalog";
import { ProgressBarChart, ProgressCard, ProgressScreen, ProgressSectionTitle, ProgressStatRow, ProgressStatTile } from "../../../components/WorkoutProgressUI";
import { lastSevenDays } from "./types";

export default function WeeklyReportScreen() {
  const { theme } = useTheme();
  const { history } = useSession();
  const now = new Date();
  const currentDays = lastSevenDays(history, now);
  const previousDays = lastSevenDays(history, new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7));
  const current = currentDays.flatMap(day => day.items);
  const previous = previousDays.flatMap(day => day.items);
  const minutes = Math.round(current.reduce((total, entry) => total + entry.seconds, 0) / 60);
  const calories = current.reduce((total, entry) => total + entry.calories, 0);
  const previousMinutes = Math.round(previous.reduce((total, entry) => total + entry.seconds, 0) / 60);
  const change = previousMinutes ? Math.round(((minutes - previousMinutes) / previousMinutes) * 100) : null;
  const dateRange = `${currentDays[0].key.slice(5)}–${currentDays[6].key.slice(5)}`;
  const share = () => Share.share({
    message: `My workout week: ${current.length} sessions, ${minutes} active minutes, and ${calories} calories recorded.`,
  });

  return (
    <ProgressScreen title="Weekly report" footer={
      <Text onPress={share} accessibilityRole="button" style={{ textAlign: "center", color: theme.colors.primaryDark, fontSize: 14, fontFamily: theme.typography.fontFamilyBold, padding: 12 }}>
        Share weekly report
      </Text>
    }>
      <Text style={{ color: theme.colors.text, fontSize: 23, fontFamily: theme.typography.fontFamilyBold }}>A week worth celebrating.</Text>
      <Text style={{ color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily }}>{dateRange}</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <ProgressStatTile value={String(current.length)} label="Workout sessions" tint={TINTS.mint} />
        <ProgressStatTile value={`${minutes} min`} label="Active time" tint={TINTS.lavender} />
      </View>
      <ProgressCard>
        <ProgressSectionTitle>Your movement</ProgressSectionTitle>
        <ProgressBarChart values={currentDays.map(day => day.items.reduce((total, entry) => total + entry.seconds, 0) / 60)} labels={currentDays.map(day => day.label)} />
      </ProgressCard>
      <ProgressCard>
        <ProgressStatRow label="Calories recorded" value={calories.toLocaleString()} />
        <ProgressStatRow label="Change in active minutes" value={change === null ? "No previous week" : `${change >= 0 ? "+" : ""}${change}%`} />
        <ProgressStatRow label="Last 7 days" value={`${current.length} sessions`} />
      </ProgressCard>
    </ProgressScreen>
  );
}
