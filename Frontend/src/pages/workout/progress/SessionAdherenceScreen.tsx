import React from "react";
import { Text, View } from "react-native";

import { useSession } from "../../../data/SessionProvider";
import { useTheme } from "../../../theme/ThemeProvider";
import { ProgressBarChart, ProgressCard, ProgressScreen, ProgressSectionTitle, ProgressStatTile } from "../../../components/WorkoutProgressUI";
import { TINTS } from "../../../data/workoutCatalog";
import { lastSevenDays } from "./types";

export default function SessionAdherenceScreen() {
  const { theme } = useTheme();
  const { history, goals } = useSession();
  const weeklyTarget = goals?.weeklySessions;
  const weeks = Array.from({ length: 5 }, (_, index) => {
    const reference = new Date();
    reference.setDate(reference.getDate() - (4 - index) * 7);
    const days = lastSevenDays(history, reference);
    return { label: `W${index + 1}`, sessions: days.reduce((total, day) => total + day.items.length, 0) };
  });
  const planned = weeklyTarget ? weeklyTarget * weeks.length : 0;
  const completed = weeklyTarget
    ? weeks.reduce((total, week) => total + Math.min(week.sessions, weeklyTarget), 0)
    : 0;
  const skipped = Math.max(0, planned - completed);
  const completionRate = planned ? Math.round((completed / planned) * 100) : 0;

  return (
    <ProgressScreen title="Session adherence">
      <Text style={{ color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily }}>
        Tracking compares your saved weekly session target with completed sessions from your account.
      </Text>
      <ProgressCard>
        <ProgressSectionTitle>Weekly target adherence</ProgressSectionTitle>
        {weeklyTarget ? (
          <>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ProgressStatTile value={`${completionRate}%`} label="Completed" tint={TINTS.mint} />
          <ProgressStatTile value={`${planned ? Math.round((skipped / planned) * 100) : 0}%`} label="Target sessions missed" tint={TINTS.peach} />
        </View>
        <Text style={{ color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily }}>
          {`${completed} of ${planned} weekly target sessions completed across the last 5 weeks.`}
        </Text>
          </>
        ) : (
          <Text style={{ color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily }}>
            Set a weekly session goal to track adherence.
          </Text>
        )}
      </ProgressCard>
      <ProgressCard>
        <ProgressSectionTitle>Sessions by week</ProgressSectionTitle>
        <ProgressBarChart values={weeks.map(week => week.sessions)} labels={weeks.map(week => week.label)} />
      </ProgressCard>
    </ProgressScreen>
  );
}
