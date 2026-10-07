import React, { useMemo, useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";

import { useTheme } from "../../../theme/ThemeProvider";
import { useSession } from "../../../data/SessionProvider";
import { PrimaryButton } from "../../../components/OnboardingUI";
import {
  ProgressBarChart,
  ProgressCard,
  ProgressChips,
  ProgressScreen,
  ProgressSectionTitle,
  ProgressStatRow,
} from "../../../components/WorkoutProgressUI";
import { rangeStart } from "./types";

const RANGES = ["Week", "Month", "Year"];

export default function WeightProgressScreen() {
  const { theme } = useTheme();
  const { weightEntries, goals, addWeight } = useSession();
  const [range, setRange] = useState("Month");
  const [weight, setWeight] = useState("");
  const filtered = useMemo(
    () => weightEntries
      .filter(entry => new Date(entry.recordedAt).getTime() >= rangeStart(range as "Week" | "Month" | "Year"))
      .slice()
      .reverse(),
    [weightEntries, range],
  );
  const submitWeight = async () => {
    const value = Number(weight);
    if (!Number.isFinite(value) || value < 20 || value > 500) {
      Alert.alert("Invalid weight", "Enter a weight between 20 and 500 kg.");
      return;
    }
    try {
      await addWeight(value);
      setWeight("");
      Alert.alert("Weight saved", "Your check-in was saved to your account.");
    } catch (error) {
      Alert.alert("Unable to save weight", error instanceof Error ? error.message : "Please try again.");
    }
  };

  return (
    <ProgressScreen title="Weight progress">
      <ProgressChips options={RANGES} value={range} onChange={setRange} />
      <ProgressCard>
        <ProgressSectionTitle>Weight tracking</ProgressSectionTitle>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="Weight in kg"
            placeholderTextColor={theme.colors.muted}
            style={{ flex: 1, color: theme.colors.text, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }}
          />
          <PrimaryButton label="Save" onPress={submitWeight} />
        </View>
        {goals?.targetWeightKg ? (
          <ProgressStatRow label="Target weight" value={`${goals.targetWeightKg} kg`} />
        ) : null}
      </ProgressCard>
      <ProgressCard>
        <ProgressSectionTitle>{range} trend</ProgressSectionTitle>
        {filtered.length ? (
          <ProgressBarChart values={filtered.map(entry => entry.weightKg)} labels={filtered.map(entry => new Date(entry.recordedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" }))} />
        ) : (
          <Text style={{ color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily }}>
            No weight check-ins recorded in this range.
          </Text>
        )}
      </ProgressCard>
      <ProgressCard>
        <ProgressSectionTitle>Recent check-ins</ProgressSectionTitle>
        {filtered.slice().reverse().slice(0, 10).map(entry => (
          <ProgressStatRow
            key={entry.id}
            label={new Date(entry.recordedAt).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}
            value={`${entry.weightKg} kg`}
          />
        ))}
      </ProgressCard>
    </ProgressScreen>
  );
}
