import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { loadLabel, WORKOUT_DETAILS } from "../../../data/workoutDetails";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { FooterLinks, NoteCard } from "../../../components/WorkoutDetailUI";

export default function ExerciseInstructions() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const move = WORKOUT_DETAILS[params?.workoutId]?.moves.find(item => item.id === params?.moveId);
  if (!move) {
    return (
      <SafeAreaView style={styles.screen}>
        <OnboardingHeader title="Exercise instructions" onBack={() => navigation.goBack()} />
        <Text style={styles.sub}>Instructions not found.</Text>
      </SafeAreaView>
    );
  }

  const load = loadLabel(move, params?.equipment ?? [], params?.weight ?? 8);

  return (
    <SafeAreaView style={styles.screen}>
      <OnboardingHeader title="Exercise instructions" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{move.name}</Text>
        <Text style={styles.sub}>
          {move.sets} sets × {move.reps} reps · {load} · {move.restSec} sec rest
        </Text>

        {move.steps.map((step, index) => (
          <View key={step.title} style={styles.step}>
            <View style={styles.number}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepBody}>{step.body}</Text>
            </View>
          </View>
        ))}

        <View style={styles.note}>
          <NoteCard title={move.stepNote.title} body={move.stepNote.body} />
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <PrimaryButton
          label="Watch form video"
          onPress={() => navigation.navigate(WORKOUT_ROUTES.VIDEO, params)}
        />
        <FooterLinks
          left={{ label: "Back to exercise", onPress: () => navigation.goBack() }}
          right={{ label: move.name, onPress: () => navigation.goBack() }}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    scroll: { paddingBottom: 16 },
    title: { color: theme.colors.text, fontSize: 22, marginTop: 8, fontFamily: theme.typography.fontFamilyBold },
    sub: { color: theme.colors.muted, fontSize: 12, marginTop: 4, marginBottom: 14, fontFamily: theme.typography.fontFamily },
    step: { flexDirection: "row", gap: 12, backgroundColor: theme.colors.card, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
    number: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center", marginTop: 1 },
    numberText: { color: theme.colors.onPrimary, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    stepCopy: { flex: 1 },
    stepTitle: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    stepBody: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 2, fontFamily: theme.typography.fontFamily },
    note: { marginTop: 6 },
    bottom: { paddingBottom: 16, paddingTop: 8 },
  });
