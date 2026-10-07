import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { CATALOG, TINTS } from "../../../data/workoutCatalog";
import { loadLabel, WORKOUT_DETAILS } from "../../../data/workoutDetails";
import { useWorkouts } from "../../../data/WorkoutProvider";
import { useSession } from "../../../data/SessionProvider";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { ACCENT } from "../../../components/MovementUI";
import { FooterLinks, StatRow, Tags } from "../../../components/WorkoutDetailUI";
import { DARK_TEXT } from "../../../components/WorkoutUI";

export default function WorkoutDetails() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const { isFavorite, toggleFavorite } = useWorkouts();
  const { startSession } = useSession();
  const styles = createStyles(theme);

  const workout = CATALOG.find(item => item.id === params?.workoutId);
  const detail = workout ? WORKOUT_DETAILS[workout.id] : undefined;
  const equipment: string[] = params?.equipment ?? workout?.equipment ?? [];
  const weight: number = params?.weight ?? 8;

  if (!workout) {
    return (
      <SafeAreaView style={styles.screen}>
        <OnboardingHeader title="Workout details" onBack={() => navigation.goBack()} />
        <Text style={styles.empty}>This workout could not be found.</Text>
      </SafeAreaView>
    );
  }

  const moves = detail?.moves ?? [];
  const common = { workoutId: workout.id, equipment, weight };
  const start = () => {
    if (!detail || moves.length === 0) return;
    startSession({
      workoutId: workout.id,
      title: workout.title,
      minutes: workout.minutes,
      estCalories: detail.calories,
      moves: moves.map(move => ({ name: move.name, sets: move.sets })),
    });
    navigation.navigate(WORKOUT_ROUTES.ACTIVE);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <OnboardingHeader title="Workout details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTag}>{workout.type.toUpperCase()} · FOCUS PROGRAM</Text>
            <Text style={styles.heroTitle}>Burn. Build. Repeat.</Text>
            {detail ? <Text style={styles.heroSub}>We'll coach: {detail.coach}</Text> : null}
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="barbell" size={40} color={DARK_TEXT} />
          </View>
        </View>

        <Text style={styles.title}>{workout.title}</Text>
        {detail ? <Text style={styles.blurb}>{detail.blurb}</Text> : null}

        <View style={styles.statWrap}>
          <StatRow stats={[
            { value: `${workout.minutes} min`, label: "Duration" },
            { value: String(moves.length), label: "Exercises" },
            { value: detail ? String(detail.calories) : "-", label: "Est. cal" },
          ]} />
        </View>

        <View style={styles.tagsWrap}>
          <Tags items={[workout.level, ...equipment.slice(0, 2), workout.muscle]} />
        </View>

        <Pressable
          onPress={() => navigation.navigate(WORKOUT_ROUTES.EQUIPMENT, common)}
          style={styles.equipLink}
          accessibilityRole="button"
        >
          <Ionicons name="options-outline" size={14} color={ACCENT.purple} />
          <Text style={styles.equipText}>Change equipment</Text>
        </Pressable>

        <View style={styles.rowBetween}>
          <Text style={styles.heading}>Your circuit</Text>
          <Text style={styles.count}>{moves.length} moves</Text>
        </View>

        {moves.length === 0 ? (
          <Text style={styles.empty}>Exercise details for this workout are coming soon.</Text>
        ) : moves.map(move => (
          <Pressable
            key={move.id}
            onPress={() => navigation.navigate(WORKOUT_ROUTES.EXERCISE, { ...common, moveId: move.id })}
            style={[styles.move, { backgroundColor: TINTS.sage }]}
            accessibilityRole="button"
          >
            <View style={styles.moveCopy}>
              <Text style={styles.moveName}>{move.name}</Text>
              <Text style={styles.moveMeta}>
                {move.reps} reps · {loadLabel(move, equipment, weight)} · {move.restSec} sec rest
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={DARK_TEXT} />
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <PrimaryButton label="Start workout" onPress={start} disabled={moves.length === 0} />
        <FooterLinks
          left={{
            label: isFavorite(workout.id) ? "Saved" : "Save workout",
            onPress: () => toggleFavorite(workout.id),
          }}
          right={{
            label: "Add to schedule",
            onPress: () => navigation.navigate(WORKOUT_ROUTES.SCHEDULE),
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    scroll: { paddingBottom: 16 },
    empty: { color: theme.colors.muted, fontSize: 13, marginTop: 14, fontFamily: theme.typography.fontFamily },
    hero: { flexDirection: "row", alignItems: "center", backgroundColor: "#D4EBC0", borderRadius: 18, padding: 18, marginTop: 6 },
    heroCopy: { flex: 1 },
    heroTag: { color: "rgba(27,31,26,0.6)", fontSize: 9, letterSpacing: 0.6, fontFamily: theme.typography.fontFamilyBold },
    heroTitle: { color: DARK_TEXT, fontSize: 24, lineHeight: 28, marginTop: 6, fontFamily: theme.typography.fontFamilyBold },
    heroSub: { color: "rgba(27,31,26,0.7)", fontSize: 11, marginTop: 4, fontFamily: theme.typography.fontFamily },
    heroIcon: { width: 70, height: 70, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.55)", alignItems: "center", justifyContent: "center" },
    title: { color: theme.colors.text, fontSize: 22, lineHeight: 27, marginTop: 16, fontFamily: theme.typography.fontFamilyBold },
    blurb: { color: theme.colors.muted, fontSize: 12, lineHeight: 17, marginTop: 6, fontFamily: theme.typography.fontFamily },
    statWrap: { marginTop: 14 },
    tagsWrap: { marginTop: 12 },
    equipLink: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
    equipText: { color: ACCENT.purple, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 10 },
    heading: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    count: { color: ACCENT.purple, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
    move: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, padding: 12, marginBottom: 8 },
    moveCopy: { flex: 1 },
    moveName: { color: DARK_TEXT, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    moveMeta: { color: "rgba(27,31,26,0.65)", fontSize: 11, marginTop: 2, fontFamily: theme.typography.fontFamily },
    bottom: { paddingBottom: 16, paddingTop: 8 },
  });
