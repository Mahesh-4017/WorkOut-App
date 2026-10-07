import React, { useMemo, useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";

import { useTheme } from "../../../theme/ThemeProvider";
import { useSession } from "../../../data/SessionProvider";
import { TINTS } from "../../../data/workoutCatalog";
import { PrimaryButton } from "../../../components/OnboardingUI";
import {
  ProgressBar,
  ProgressBarChart,
  ProgressCard,
  ProgressChips,
  ProgressScreen,
  ProgressSectionTitle,
  ProgressStatTile,
} from "../../../components/WorkoutProgressUI";

const RANGES = ["Week", "Month", "Year"];

export default function StepsProgressScreen() {
  const { theme } = useTheme();
  const { stepEntries, goals, addSteps } = useSession();
  const [range, setRange] = useState("Week");
  const [steps, setSteps] = useState("");
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayEntry = stepEntries.find(entry => {
    const date = new Date(entry.recordedAt);
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  });
  const buckets = useMemo(() => {
    const [year, month, day] = todayKey.split("-").map(Number);
    const currentDate = new Date(year, month - 1, day);
    if (range === "Week") {
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(year, month - 1, day - (6 - index));
        const value = stepEntries.find(entry => {
          const recorded = new Date(entry.recordedAt);
          return recorded.getFullYear() === date.getFullYear() &&
            recorded.getMonth() === date.getMonth() &&
            recorded.getDate() === date.getDate();
        });
        return { label: date.toLocaleDateString(undefined, { weekday: "narrow" }), steps: value?.steps ?? 0 };
      });
    }
    if (range === "Month") {
      const count = Math.ceil(new Date(year, month, 0).getDate() / 7);
      return Array.from({ length: count }, (_, index) => ({
        label: `W${index + 1}`,
        steps: stepEntries
          .filter(entry => {
            const date = new Date(entry.recordedAt);
            return date.getFullYear() === year && date.getMonth() === month - 1 && Math.floor((date.getDate() - 1) / 7) === index;
          })
          .reduce((total, entry) => total + entry.steps, 0),
      }));
    }
    return Array.from({ length: 12 }, (_, index) => ({
      label: new Date(year, index, 1).toLocaleDateString(undefined, { month: "short" }),
      steps: stepEntries
        .filter(entry => {
          const date = new Date(entry.recordedAt);
          return date.getFullYear() === currentDate.getFullYear() && date.getMonth() === index;
        })
        .reduce((total, entry) => total + entry.steps, 0),
    }));
  }, [stepEntries, range, todayKey]);
  const save = async () => {
    const value = Number(steps);
    if (!Number.isInteger(value) || value < 0 || value > 100000) {
      Alert.alert("Invalid steps", "Enter a whole number from 0 to 100,000.");
      return;
    }
    try {
      await addSteps(value);
      setSteps("");
      Alert.alert("Steps saved", "Your daily step total was saved to your account.");
    } catch (error) {
      Alert.alert("Unable to save steps", error instanceof Error ? error.message : "Please try again.");
    }
  };

  return (
    <ProgressScreen title="Steps progress">
      <ProgressChips options={RANGES} value={range} onChange={setRange} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <ProgressStatTile value={todayEntry?.steps.toLocaleString() ?? "Not logged"} label="Steps today" tint={TINTS.mint} />
        <ProgressStatTile value={goals?.dailySteps?.toLocaleString() ?? "Not set"} label="Daily goal" tint={TINTS.peach} />
      </View>
      <ProgressCard>
        <ProgressSectionTitle>Daily movement</ProgressSectionTitle>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TextInput
            value={steps}
            onChangeText={setSteps}
            keyboardType="number-pad"
            placeholder="Enter today's steps"
            placeholderTextColor={theme.colors.muted}
            style={{ flex: 1, color: theme.colors.text, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }}
          />
          <PrimaryButton label="Save" onPress={save} />
        </View>
        {goals?.dailySteps ? <ProgressBar percent={Math.min(100, ((todayEntry?.steps ?? 0) / goals.dailySteps) * 100)} /> : null}
      </ProgressCard>
      <ProgressCard>
        <ProgressSectionTitle>Steps · {range.toLowerCase()}</ProgressSectionTitle>
        <ProgressBarChart values={buckets.map(bucket => bucket.steps)} labels={buckets.map(bucket => bucket.label)} highlight={range === "Week" ? 6 : undefined} />
        <Text style={{ color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily }}>
          {range === "Week" ? "Daily totals from saved step records." : `${range} totals grouped from saved daily step records.`}
        </Text>
      </ProgressCard>
    </ProgressScreen>
  );
}
