import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { TINTS } from "../../../data/workoutCatalog";
import { HistoryEntry, useSession } from "../../../data/SessionProvider";
import BottomTabBar from "../../../components/BottomTabBar";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { StatRow } from "../../../components/WorkoutDetailUI";
import { DARK_TEXT } from "../../../components/WorkoutUI";

type Range = "week" | "month" | "all";
const TABS: { id: Range; label: string }[] = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
];
export default function WorkoutHistory() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { history, refreshProgress, error, loading } = useSession();
  const styles = createStyles(theme);
  const [range, setRange] = useState<Range>("week");

  useFocusEffect(
    React.useCallback(() => {
      refreshProgress().catch(loadError => {
        console.error("Unable to refresh workout history.", loadError);
      });
    }, [refreshProgress]),
  );

  const shown = useMemo(() => {
    const now = new Date();
    const cutoff = range === "week"
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).getTime()
      : range === "month"
        ? new Date(now.getFullYear(), now.getMonth(), 1).getTime()
        : 0;
    return history.filter(entry => new Date(entry.startedAt).getTime() >= cutoff);
  }, [history, range]);

  const minutes = Math.round(shown.reduce((total, entry) => total + entry.seconds, 0) / 60);
  const calories = shown.reduce((total, entry) => total + entry.calories, 0);
  const meta = (entry: HistoryEntry) =>
    `${new Date(entry.startedAt).toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    })} · ${Math.max(1, Math.round(entry.seconds / 60))} min · ${entry.calories} cal`;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <OnboardingHeader title="Workout history" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {error ? (
          <Pressable
            onPress={() => refreshProgress().catch(loadError => console.error("Unable to refresh workout history.", loadError))}
            accessibilityRole="button"
            style={styles.errorBox}
          >
            <Text style={styles.errorText}>{error}{loading ? "" : " Tap to retry."}</Text>
          </Pressable>
        ) : null}
        <View style={styles.tabs}>
          {TABS.map(tab => {
            const selected = tab.id === range;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setRange(tab.id)}
                style={[styles.tab, selected && styles.tabSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.stats}>
          <StatRow stats={[
            { value: String(shown.length), label: "Sessions" },
            { value: String(minutes), label: "Minutes" },
            { value: calories.toLocaleString(), label: "Calories" },
          ]} />
        </View>

        <Text style={styles.heading}>Completed sessions</Text>
        {shown.length === 0 ? (
          <Text style={styles.muted}>No sessions yet. Finish a workout and it will show up here.</Text>
        ) : shown.map((entry, index) => {
          const tintIndex = index % 4;
          const rowStyle = [
            styles.rowPlain,
            styles.rowPeach,
            styles.rowLavender,
            styles.rowMint,
          ][tintIndex];
          const isTinted = tintIndex !== 0;
          const textStyle = isTinted ? styles.tintedText : styles.plainText;
          const metaStyle = isTinted ? styles.tintedMeta : styles.plainMeta;
          return (
            <Pressable
              key={entry.id}
              onPress={() => navigation.navigate(WORKOUT_ROUTES.DETAILS, { workoutId: entry.workoutId })}
              style={[styles.row, rowStyle]}
              accessibilityRole="button"
            >
              <View style={styles.rowCopy}>
                <Text numberOfLines={1} style={[styles.rowTitle, textStyle]}>
                  {entry.title}
                </Text>
                <Text style={[styles.rowMeta, metaStyle]}>
                  {meta(entry)}
                </Text>
              </View>
              {entry.rating ? (
                <View style={styles.rating}>
                  <Ionicons name="star" size={12} color={theme.colors.primaryDark} />
                  <Text style={[styles.ratingText, textStyle]}>{entry.rating}</Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={16} color={isTinted ? DARK_TEXT : theme.colors.text} />
            </Pressable>
          );
        })}

        <View style={styles.scheduleButton}>
          <PrimaryButton
            label="View workout schedule"
            onPress={() => navigation.navigate(WORKOUT_ROUTES.SCHEDULE)}
          />
        </View>
      </ScrollView>
      <BottomTabBar activeTab="calendar" />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: 18 },
    scroll: { paddingHorizontal: 18, paddingBottom: 120 },
    errorBox: { backgroundColor: theme.colors.surfaceAlt ?? theme.colors.card, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.danger, padding: 12, marginBottom: 10 },
    errorText: { color: theme.colors.danger, fontSize: 12, fontFamily: theme.typography.fontFamily },
    tabs: { flexDirection: "row", backgroundColor: theme.colors.surfaceAlt ?? theme.colors.border, borderRadius: 12, padding: 4, marginTop: 4 },
    tab: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 9 },
    tabSelected: { backgroundColor: theme.colors.surface },
    tabText: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
    tabTextSelected: { color: theme.colors.text, fontFamily: theme.typography.fontFamilyBold },
    stats: { marginTop: 14 },
    heading: { color: theme.colors.text, fontSize: 14, marginTop: 20, marginBottom: 10, fontFamily: theme.typography.fontFamilyBold },
    muted: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily },
    row: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, padding: 12, marginBottom: 8 },
    rowPlain: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
    rowPeach: { backgroundColor: TINTS.peach },
    rowLavender: { backgroundColor: TINTS.lavender },
    rowMint: { backgroundColor: TINTS.mint },
    rowCopy: { flex: 1 },
    rowTitle: { fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    rowMeta: { fontSize: 11, marginTop: 2, fontFamily: theme.typography.fontFamily },
    plainText: { color: theme.colors.text },
    tintedText: { color: DARK_TEXT },
    plainMeta: { color: theme.colors.muted },
    tintedMeta: { color: "rgba(27,31,26,0.65)" },
    rating: { flexDirection: "row", alignItems: "center", gap: 3 },
    ratingText: { fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    scheduleButton: { marginTop: 14 },
  });
