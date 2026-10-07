import React from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { useSession } from "../../../data/SessionProvider";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { StatRow } from "../../../components/WorkoutDetailUI";
import { DARK_TEXT } from "../../../components/WorkoutUI";

export default function WorkoutSummary() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { lastSummary } = useSession();
  const styles = createStyles(theme);

  if (!lastSummary) {
    return (
      <SafeAreaView style={styles.screen}>
        <OnboardingHeader title="Workout summary" onBack={() => navigation.goBack()} />
        <Text style={styles.muted}>No finished workout to show yet.</Text>
      </SafeAreaView>
    );
  }

  const minutes = Math.max(1, Math.round(lastSummary.seconds / 60));
  const finished = lastSummary.movesDone >= lastSummary.movesTotal;
  const date = new Date(lastSummary.startedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const share = () =>
    Share.share({
      message: `I just finished "${lastSummary.title}": ${minutes} min, ${lastSummary.calories} cal burned, ${lastSummary.movesDone}/${lastSummary.movesTotal} exercises.`,
    });
  const stats = [
    { value: `${minutes} min`, label: "Duration" },
    { value: String(lastSummary.calories), label: "Cal burned" },
    ...(lastSummary.distanceKm > 0
      ? [{ value: `${lastSummary.distanceKm} km`, label: "Distance" }]
      : []),
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <OnboardingHeader
        title="Workout summary"
        onBack={() => navigation.navigate(WORKOUT_ROUTES.HISTORY)}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          <View style={styles.trophy}>
            <Ionicons name="trophy-outline" size={32} color={DARK_TEXT} />
          </View>
          <Text style={styles.title}>{finished ? "That's a strong finish!" : "Good effort today!"}</Text>
          <Text style={styles.subtitle}>{lastSummary.title} · {date}</Text>
        </View>

        <View style={styles.stats}>
          <StatRow stats={stats} />
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressText}>
            {lastSummary.movesDone} of {lastSummary.movesTotal} exercises · {lastSummary.setsDone} sets completed
          </Text>
          <View style={styles.track}>
            <View style={[
              styles.fill,
              { width: `${(lastSummary.movesDone / Math.max(lastSummary.movesTotal, 1)) * 100}%` },
            ]} />
          </View>
        </View>

        {lastSummary.record ? (
          <View style={styles.record}>
            <Text style={styles.recordTitle}>New personal record!</Text>
            <Text style={styles.recordText}>{lastSummary.record}.</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottom}>
        <PrimaryButton
          label="Continue to feedback"
          onPress={() => navigation.navigate(WORKOUT_ROUTES.FEEDBACK, { id: lastSummary.id })}
        />
        <Pressable onPress={share} style={styles.shareButton} accessibilityRole="button">
          <Text style={styles.shareText}>Share summary</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    scroll: { paddingBottom: 16 },
    muted: { color: theme.colors.muted, fontSize: 13, marginTop: 10, fontFamily: theme.typography.fontFamily },
    center: { alignItems: "center", marginTop: 14 },
    trophy: { width: 76, height: 76, borderRadius: 38, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
    title: { color: theme.colors.text, fontSize: 24, marginTop: 14, textAlign: "center", fontFamily: theme.typography.fontFamilyBold },
    subtitle: { color: theme.colors.muted, fontSize: 12, marginTop: 4, textAlign: "center", fontFamily: theme.typography.fontFamily },
    stats: { marginTop: 18 },
    progressCard: { backgroundColor: theme.colors.card, borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: theme.colors.border },
    progressText: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
    track: { height: 7, borderRadius: 4, backgroundColor: theme.colors.border, marginTop: 8, overflow: "hidden" },
    fill: { height: "100%", borderRadius: 4, backgroundColor: theme.colors.primary },
    record: { backgroundColor: "#E6DFF6", borderRadius: 12, padding: 14, marginTop: 12 },
    recordTitle: { color: DARK_TEXT, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    recordText: { color: "rgba(27,31,26,0.75)", fontSize: 12, marginTop: 2, fontFamily: theme.typography.fontFamily },
    bottom: { gap: 10, paddingBottom: 16, paddingTop: 8 },
    shareButton: { height: 50, borderRadius: 25, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, alignItems: "center", justifyContent: "center" },
    shareText: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
  });
