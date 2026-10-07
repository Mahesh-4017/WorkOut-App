import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { saveOnboarding } from "../../utils/onboarding";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../api/user";
import { ROUTES } from "../../navigation/routes";
import { useTheme } from "../../theme/ThemeProvider";
import { OnboardingHeader, PrimaryButton, ProgressBar, Segmented, StepFooter } from "./Onboardingui";

const GOALS = [
  { label: "Build strength", value: "build_strength" },
  { label: "Improve fitness", value: "improve_fitness" },
  { label: "Lose weight", value: "lose_weight" },
  { label: "Improve mobility", value: "improve_mobility" },
  { label: "Stay active", value: "stay_active" },
];

export default function Goal() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = createStyles(theme);

  const [goal, setGoal] = useState("build_strength");
  const [activity, setActivity] = useState<"low" | "moderate" | "high">("moderate");
  const [workout, setWorkout] = useState<"home" | "gym" | "outdoors">("home");
  const [experience, setExperience] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  const onNext = async () => {
    const data = { goal, activityLevel: activity, workoutPreference: workout, experienceLevel: experience };
    await saveOnboarding(data);
    if (user) {
      await updateUserProfile(data);
      navigation.reset({ index: 0, routes: [{ name: ROUTES.PERMISSIONS }] });
    } else {
      await AsyncStorage.setItem("onboardingDone", "true");
      navigation.navigate(ROUTES.REGISTER);
    }
  };

  const group = (label: string, children: React.ReactNode) => (
    <View style={s.group}>
      <Text style={s.groupLabel}>{label}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={s.screen}>
      <OnboardingHeader title="Fitness goals" onBack={() => navigation.goBack()} />
      <ProgressBar progress={1} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>What's your main goal?</Text>
        <Text style={s.subtitle}>Choose the focus that feels right for you.</Text>

        <View style={s.list}>
          {GOALS.map((g, i) => {
            const selected = g.value === goal;
            return (
              <Pressable
                key={g.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setGoal(g.value)}
                style={[s.option, i > 0 && s.optionDivider, selected && s.optionSelected]}
              >
                <Text style={[s.optionText, selected && s.optionTextSelected]}>{g.label}</Text>
                <View style={[s.radio, selected && s.radioSelected]}>
                  {selected ? <Text style={s.check}>✓</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {group(
          "Activity level",
          <Segmented
            value={activity}
            onChange={setActivity}
            options={[
              { label: "Low", value: "low" },
              { label: "Moderate", value: "moderate" },
              { label: "High", value: "high" },
            ]}
          />,
        )}
        {group(
          "Workout preference",
          <Segmented
            value={workout}
            onChange={setWorkout}
            options={[
              { label: "Home", value: "home" },
              { label: "Gym", value: "gym" },
              { label: "Outdoors", value: "outdoors" },
            ]}
          />,
        )}
        {group(
          "Experience level",
          <Segmented
            value={experience}
            onChange={setExperience}
            options={[
              { label: "Beginner", value: "beginner" },
              { label: "Intermediate", value: "intermediate" },
              { label: "Advanced", value: "advanced" },
            ]}
          />,
        )}
      </ScrollView>

      <View style={s.bottom}>
        <PrimaryButton label="Build my plan" onPress={onNext} />
        <StepFooter text="Step 2 of 2 · Change these anytime" />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 20 },
    scroll: { paddingTop: 22, paddingBottom: 16 },
    title: { color: theme.colors.text, fontSize: 24, lineHeight: 30, fontFamily: theme.typography.fontFamilyBold },
    subtitle: { color: theme.colors.muted, fontSize: 13, marginTop: 4, marginBottom: 14, fontFamily: theme.typography.fontFamily },
    list: { borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, overflow: "hidden" },
    option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
    optionDivider: { borderTopWidth: 1, borderTopColor: theme.colors.border },
    optionSelected: { backgroundColor: theme.colors.surfaceAlt ?? theme.colors.background },
    optionText: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamily },
    optionTextSelected: { fontFamily: theme.typography.fontFamilyBold },
    radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: theme.colors.muted, alignItems: "center", justifyContent: "center" },
    radioSelected: { borderColor: theme.colors.primaryDark },
    check: { color: theme.colors.primaryDark, fontSize: 11, fontWeight: "700" },
    group: { marginTop: 16 },
    groupLabel: { color: theme.colors.text, fontSize: 13, marginBottom: 6, fontFamily: theme.typography.fontFamilyBold },
    bottom: { paddingBottom: 16, paddingTop: 8 },
  });