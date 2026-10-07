import React, { useMemo, useState } from "react";
import { View } from "react-native";

import { useSession } from "../../../data/SessionProvider";
import { TINTS } from "../../../data/workoutCatalog";
import {
  ProgressBarChart,
  ProgressCard,
  ProgressChips,
  ProgressScreen,
  ProgressSectionTitle,
  ProgressStatRow,
  ProgressStatTile,
} from "../../../components/WorkoutProgressUI";
import { lastSevenDays, rangeStart } from "./types";

const RANGES = ["Week", "Month", "Year"] as const;
type Range = typeof RANGES[number];

export default function CaloriesProgressScreen() {
  const { history, goals } = useSession();
  const [range, setRange] = useState<Range>("Week");
  const filtered = useMemo(
    () => history.filter(entry => new Date(entry.startedAt).getTime() >= rangeStart(range)),
    [history, range],
  );
  const calories = filtered.reduce((total, entry) => total + entry.calories, 0);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const buckets = useMemo(() => {
    const [year, month, day] = todayKey.split("-").map(Number);
    if (range === "Week") {
      return lastSevenDays(history, new Date(year, month - 1, day)).map(item => ({
        label: item.label,
        calories: item.items.reduce((total, entry) => total + entry.calories, 0),
      }));
    }
    if (range === "Month") {
      const weeks = Math.ceil(new Date(year, month, 0).getDate() / 7);
      return Array.from({ length: weeks }, (_, index) => ({
        label: `W${index + 1}`,
        calories: filtered
          .filter(entry => Math.floor((new Date(entry.startedAt).getDate() - 1) / 7) === index)
          .reduce((total, entry) => total + entry.calories, 0),
      }));
    }
    return Array.from({ length: 12 }, (_, index) => ({
      label: new Date(year, index, 1).toLocaleDateString(undefined, { month: "short" }),
      calories: filtered
        .filter(entry => new Date(entry.startedAt).getMonth() === index)
        .reduce((total, entry) => total + entry.calories, 0),
    }));
  }, [history, filtered, range, todayKey]);
  const todayCalories = history
    .filter(entry => {
      const date = new Date(entry.startedAt);
      return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
    })
    .reduce((total, entry) => total + entry.calories, 0);
  return (
    <ProgressScreen title="Calories progress">
      <ProgressChips options={[...RANGES]} value={range} onChange={value => setRange(value as Range)} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <ProgressStatTile value={todayCalories.toLocaleString()} label="Calories today" tint={TINTS.peach} />
        <ProgressStatTile value={goals?.dailyCalories?.toLocaleString() ?? "Not set"} label="Daily goal" tint={TINTS.mint} />
      </View>
      <ProgressCard>
        <ProgressSectionTitle>Calories from workouts</ProgressSectionTitle>
        <ProgressBarChart values={buckets.map(bucket => bucket.calories)} labels={buckets.map(bucket => bucket.label)} highlight={range === "Week" ? 6 : undefined} />
        <ProgressStatRow label={`${range} total`} value={`${calories.toLocaleString()} kcal · ${filtered.length} sessions`} />
      </ProgressCard>
      <ProgressCard>
        <ProgressStatRow label="Tracked calories" value={calories.toLocaleString()} />
        <ProgressStatRow label="Average per session" value={filtered.length ? `${Math.round(calories / filtered.length)} kcal` : "—"} />
      </ProgressCard>
    </ProgressScreen>
  );
}
