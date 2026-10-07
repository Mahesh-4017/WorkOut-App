import React from "react";
import { Text, View } from "react-native";

import { useSession } from "../../../data/SessionProvider";
import { useTheme } from "../../../theme/ThemeProvider";
import { TINTS } from "../../../data/workoutCatalog";
import { PrimaryButton } from "../../../components/OnboardingUI";
import {
  ProgressCard,
  ProgressScreen,
  ProgressSectionTitle,
  ProgressStatRow,
  ProgressStatTile,
} from "../../../components/WorkoutProgressUI";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { useNavigation } from "@react-navigation/native";

export default function PersonalRecordsScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { history } = useSession();
  const longest = history.reduce((best, entry) => entry.seconds > (best?.seconds ?? 0) ? entry : best, undefined as typeof history[number] | undefined);
  const mostCalories = history.reduce((best, entry) => entry.calories > (best?.calories ?? 0) ? entry : best, undefined as typeof history[number] | undefined);
  const mostSets = history.reduce((best, entry) => entry.setsDone > (best?.setsDone ?? 0) ? entry : best, undefined as typeof history[number] | undefined);

  return (
    <ProgressScreen
      title="Personal records"
      footer={<PrimaryButton label="View workout history" onPress={() => navigation.navigate(WORKOUT_ROUTES.HISTORY)} />}
    >
      {longest ? (
        <ProgressCard tint={TINTS.lavender}>
          <ProgressSectionTitle>Latest training best</ProgressSectionTitle>
          <Text style={{ color: theme.colors.text, fontSize: 19, fontFamily: theme.typography.fontFamilyBold }}>{longest.title}</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <ProgressStatTile value={`${Math.round(longest.seconds / 60)} min`} label="Longest session" />
            <ProgressStatTile value={`${longest.calories} kcal`} label="Calories in session" />
          </View>
        </ProgressCard>
      ) : (
        <ProgressCard>
          <ProgressSectionTitle>Your records</ProgressSectionTitle>
          <Text style={{ color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily }}>Complete a workout to start building your records.</Text>
        </ProgressCard>
      )}
      <ProgressCard>
        <ProgressSectionTitle>Your session bests</ProgressSectionTitle>
        <ProgressStatRow label="Longest workout" value={longest ? `${Math.round(longest.seconds / 60)} min` : "—"} tint={TINTS.mint} />
        <ProgressStatRow label="Most calories in a session" value={mostCalories ? `${mostCalories.calories} kcal` : "—"} tint={TINTS.peach} />
        <ProgressStatRow label="Most sets completed" value={mostSets ? String(mostSets.setsDone) : "—"} tint={TINTS.lavender} />
      </ProgressCard>
      <Text style={{ color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily }}>
        Strength records by lift are not available because individual lift weights are not saved in session history.
      </Text>
    </ProgressScreen>
  );
}
