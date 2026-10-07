import React, { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";

import { useTheme } from "../../../theme/ThemeProvider";
import { useSession } from "../../../data/SessionProvider";
import { TINTS } from "../../../data/workoutCatalog";
import { PrimaryButton } from "../../../components/OnboardingUI";
import {
  ProgressBar,
  ProgressCard,
  ProgressLineChart,
  ProgressScreen,
  ProgressSectionTitle,
  ProgressStatTile,
} from "../../../components/WorkoutProgressUI";
import { lastSevenDays } from "./types";

export default function GoalProgressScreen() {
  const { theme } = useTheme();
  const { history, goals, weightEntries, saveGoals } = useSession();
  const days = lastSevenDays(history);
  const sessions = days.reduce((count, day) => count + day.items.length, 0);
  const weeklyTarget = goals?.weeklySessions;
  const percent = weeklyTarget ? Math.min(100, Math.round((sessions / weeklyTarget) * 100)) : 0;
  const [weeklySessions, setWeeklySessions] = useState(goals?.weeklySessions?.toString() ?? "");
  const [targetWeight, setTargetWeight] = useState(goals?.targetWeightKg?.toString() ?? "");
  const [dailySteps, setDailySteps] = useState(goals?.dailySteps?.toString() ?? "");
  const [dailyCalories, setDailyCalories] = useState(goals?.dailyCalories?.toString() ?? "");

  React.useEffect(() => {
    setWeeklySessions(goals?.weeklySessions?.toString() ?? "");
    setTargetWeight(goals?.targetWeightKg?.toString() ?? "");
    setDailySteps(goals?.dailySteps?.toString() ?? "");
    setDailyCalories(goals?.dailyCalories?.toString() ?? "");
  }, [goals]);

  const save = async () => {
    const nextGoals = {
      ...(weeklySessions.trim() ? { weeklySessions: Number(weeklySessions) } : {}),
      ...(targetWeight.trim() ? { targetWeightKg: Number(targetWeight) } : {}),
      ...(dailySteps.trim() ? { dailySteps: Number(dailySteps) } : {}),
      ...(dailyCalories.trim() ? { dailyCalories: Number(dailyCalories) } : {}),
    };
    if (Object.keys(nextGoals).length === 0) {
      Alert.alert("Add a goal", "Enter at least one goal before saving.");
      return;
    }
    if (
      Object.values(nextGoals).some(value => !Number.isFinite(value) || value <= 0) ||
      (nextGoals.weeklySessions !== undefined && (!Number.isInteger(nextGoals.weeklySessions) || nextGoals.weeklySessions > 21)) ||
      (nextGoals.dailySteps !== undefined && (!Number.isInteger(nextGoals.dailySteps) || nextGoals.dailySteps > 100000)) ||
      (nextGoals.dailyCalories !== undefined && (!Number.isInteger(nextGoals.dailyCalories) || nextGoals.dailyCalories > 100000)) ||
      (nextGoals.targetWeightKg !== undefined && (nextGoals.targetWeightKg < 20 || nextGoals.targetWeightKg > 500))
    ) {
      Alert.alert("Invalid goal", "Goals must be positive numbers within the supported ranges.");
      return;
    }
    try {
      await saveGoals(nextGoals);
      Alert.alert("Goals saved", "Your goals were saved to your account.");
    } catch (error) {
      Alert.alert("Unable to save goals", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const currentWeight = weightEntries[0]?.weightKg;
  const startingWeight = weightEntries.length ? weightEntries[weightEntries.length - 1].weightKg : undefined;
  const weightPercent = goals?.targetWeightKg && currentWeight !== undefined && startingWeight !== undefined
    ? startingWeight === goals.targetWeightKg
      ? 100
      : Math.max(0, Math.min(100, Math.round(
          ((startingWeight - currentWeight) / (startingWeight - goals.targetWeightKg)) * 100,
        )))
    : null;

  return (
    <ProgressScreen
      title="Goal progress"
      footer={<PrimaryButton label="Save goals" onPress={save} />}
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        <ProgressStatTile value={`${sessions}`} label="Sessions this week" tint={TINTS.mint} />
        <ProgressStatTile value={weeklyTarget ? String(weeklyTarget) : "Not set"} label="Weekly target" tint={TINTS.peach} />
      </View>
      <ProgressCard>
        <ProgressSectionTitle>Weekly workout goal</ProgressSectionTitle>
        {weeklyTarget ? (
          <>
            <Text style={{ color: theme.colors.text, fontSize: 30, fontFamily: theme.typography.fontFamilyBold }}>{percent}%</Text>
            <ProgressBar percent={percent} />
          </>
        ) : (
          <Text style={{ color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily }}>
            Set a weekly session target below to see your progress.
          </Text>
        )}
        <Text style={{ color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily }}>
          {weeklyTarget ? `${sessions} of ${weeklyTarget} sessions completed this week` : `${sessions} sessions completed this week`}
        </Text>
        <ProgressLineChart values={days.map(day => day.items.length)} height={110} goalLine={1} />
      </ProgressCard>
      <ProgressCard>
        <ProgressSectionTitle>Set your goals</ProgressSectionTitle>
        <GoalInput label="Sessions per week" value={weeklySessions} onChangeText={setWeeklySessions} />
        <GoalInput label="Target weight (kg)" value={targetWeight} onChangeText={setTargetWeight} />
        <GoalInput label="Daily steps" value={dailySteps} onChangeText={setDailySteps} />
        <GoalInput label="Daily calories burned" value={dailyCalories} onChangeText={setDailyCalories} />
        {goals?.targetWeightKg ? (
          <View style={{ gap: 5 }}>
            <Text style={{ color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily }}>
              {currentWeight !== undefined
                ? `Latest weight: ${currentWeight} kg · target: ${goals.targetWeightKg} kg`
                : `Target: ${goals.targetWeightKg} kg · log a weight entry to see progress.`}
            </Text>
            {weightPercent !== null ? <ProgressBar percent={weightPercent} /> : null}
          </View>
        ) : null}
      </ProgressCard>
    </ProgressScreen>
  );
}

function GoalInput({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: 5 }}>
      <Text style={{ color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="Not set"
        placeholderTextColor={theme.colors.muted}
        style={{ color: theme.colors.text, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }}
      />
    </View>
  );
}
