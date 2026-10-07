import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { loadLabel, WORKOUT_DETAILS } from "../../../data/workoutDetails";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { FooterLinks, NoteCard, StatRow, Tags } from "../../../components/WorkoutDetailUI";

export default function ExerciseDetails() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const detail = WORKOUT_DETAILS[params?.workoutId];
  const move = detail?.moves.find(item => item.id === params?.moveId);
  const equipment: string[] = params?.equipment ?? [];
  const weight: number = params?.weight ?? 8;

  if (!move) {
    return (
      <SafeAreaView style={styles.screen}>
        <OnboardingHeader title="Exercise details" onBack={() => navigation.goBack()} />
        <Text style={styles.muted}>Exercise not found.</Text>
      </SafeAreaView>
    );
  }

  const load = loadLabel(move, equipment, weight);
  const go = (name: string) => navigation.navigate(name, { ...params, moveId: move.id });
  const swap = () => {
    const moves = detail.moves;
    const currentIndex = moves.findIndex(item => item.id === move.id);
    const nextMove = moves[(currentIndex + 1) % moves.length];
    if (nextMove) navigation.setParams({ ...params, moveId: nextMove.id });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <OnboardingHeader title="Exercise details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.media}>
          <Image
            source={move.imageUrl ? { uri: move.imageUrl } : require("../../../assets/workout.png")}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.mediaTag}>
            <Text style={styles.mediaTagText}>{move.name.toUpperCase()} · FORM GUIDE</Text>
          </View>
        </View>

        <Text style={styles.title}>{move.name}</Text>
        <Text style={styles.summary}>{move.summary}</Text>

        <View style={styles.tags}>
          <Tags items={[...move.muscles, move.level]} />
        </View>
        <View style={styles.stats}>
          <StatRow stats={[
            { value: String(move.sets), label: "Sets" },
            { value: String(move.reps), label: "Reps" },
            { value: load, label: "Load" },
          ]} />
        </View>
        <View style={styles.note}>
          <NoteCard title={move.noteTitle} body={move.noteBody} />
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <PrimaryButton label="View instructions" onPress={() => go(WORKOUT_ROUTES.INSTRUCTIONS)} />
        <FooterLinks
          left={{ label: "Watch form video", onPress: () => go(WORKOUT_ROUTES.VIDEO) }}
          right={{ label: "Swap exercise", onPress: swap }}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    scroll: { paddingBottom: 16 },
    muted: { color: theme.colors.muted, fontSize: 13, marginTop: 14, fontFamily: theme.typography.fontFamily },
    media: { height: 170, borderRadius: 16, overflow: "hidden", backgroundColor: theme.colors.border, marginTop: 6 },
    image: { width: "100%", height: "100%" },
    mediaTag: { position: "absolute", top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: "rgba(0,0,0,0.55)" },
    mediaTagText: { color: "#fff", fontSize: 9, letterSpacing: 0.5, fontFamily: theme.typography.fontFamilyBold },
    title: { color: theme.colors.text, fontSize: 22, marginTop: 14, fontFamily: theme.typography.fontFamilyBold },
    summary: { color: theme.colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4, fontFamily: theme.typography.fontFamily },
    tags: { marginTop: 10 },
    stats: { marginTop: 14 },
    note: { marginTop: 14 },
    bottom: { paddingBottom: 16, paddingTop: 8 },
  });
