import React from "react";
import { Text, View } from "react-native";

import { useTheme } from "../../../theme/ThemeProvider";
import { useSession } from "../../../data/SessionProvider";
import { TINTS } from "../../../data/workoutCatalog";
import {
  ProgressBar,
  ProgressCard,
  ProgressMetricRow,
  ProgressScreen,
  ProgressStatTile,
} from "../../../components/WorkoutProgressUI";

export default function OverallPerformanceScreen() {
  const { theme } = useTheme();
  const { history, goals } = useSession();
  const sessions = history.length;
  const minutes = Math.round(history.reduce((total, entry) => total + entry.seconds, 0) / 60);
  const calories = history.reduce((total, entry) => total + entry.calories, 0);
  const distance = history.reduce((total, entry) => total + entry.distanceKm, 0);
  const sets = history.reduce((total, entry) => total + entry.setsDone, 0);
  const firstSessionTime = history.length
    ? Math.min(...history.map(entry => new Date(entry.startedAt).getTime()))
    : Date.now();
  const elapsedWeeks = Math.max(1, (Date.now() - firstSessionTime) / (7 * 24 * 60 * 60 * 1000));
  const consistency = goals?.weeklySessions
    ? Math.min(100, Math.round((sessions / elapsedWeeks / goals.weeklySessions) * 100))
    : null;

  return (
    <ProgressScreen title="Overall performance">
      <Text style={{ color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily }}>
        Totals from your saved workout sessions.
      </Text>
      <ProgressMetricRow icon="🏋️" label="Completed sessions" value={String(sessions)} tint={TINTS.mint} />
      <ProgressMetricRow icon="⏱️" label="Active training time" value={`${minutes} min`} tint={TINTS.peach} />
      <ProgressMetricRow icon="📍" label="Route distance tracked" value={`${distance.toFixed(2)} km`} tint={TINTS.lavender} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <ProgressStatTile value={calories.toLocaleString()} label="Calories burned" />
        <ProgressStatTile value={String(sets)} label="Sets completed" />
      </View>
      {goals?.weeklySessions && consistency !== null ? <ProgressCard tint={theme.colors.primary}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: theme.colors.onPrimary, fontSize: 13, fontFamily: theme.typography.fontFamilyBold }}>Training consistency</Text>
          <Text style={{ color: theme.colors.onPrimary, fontSize: 16, fontFamily: theme.typography.fontFamilyBold }}>{consistency}%</Text>
        </View>
        <ProgressBar percent={consistency} color={theme.colors.onPrimary} track="rgba(255,255,255,0.35)" />
        <Text style={{ color: theme.colors.onPrimary, fontSize: 10, opacity: 0.8, fontFamily: theme.typography.fontFamily }}>
          Based on your target of {goals.weeklySessions} sessions per week.
        </Text>
      </ProgressCard> : (
        <ProgressCard>
          <Text style={{ color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold }}>Training consistency</Text>
          <Text style={{ color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily }}>
            Set a weekly session target to calculate consistency.
          </Text>
        </ProgressCard>
      )}
    </ProgressScreen>
  );
}
