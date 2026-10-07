import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { fmtClock, useSession } from "../../data/SessionProvider";
import { useTheme } from "../../theme/ThemeProvider";
import { PROGRESS_ROUTES } from "../../navigation/progressRoutes";

type Range = "Week" | "Month" | "3 Months" | "Year";
const ranges: Range[] = ["Week", "Month", "3 Months", "Year"];
const RANGE_DAYS: Record<Range, number> = { Week: 7, Month: 30, "3 Months": 90, Year: 365 };
const localDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function Analysis() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { history, loading, error, refreshProgress } = useSession();
  const [selectedRange, setSelectedRange] = useState<Range>("Month");
  const filteredHistory = useMemo(() => {
    const cutoff = Date.now() - RANGE_DAYS[selectedRange] * 24 * 60 * 60 * 1000;
    return history.filter(item => new Date(item.startedAt).getTime() >= cutoff);
  }, [history, selectedRange]);
  const frequency = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = localDateKey(date);
    return {
      day: date.toLocaleDateString(undefined, { weekday: "short" }),
      value: filteredHistory.filter(item => localDateKey(new Date(item.startedAt)) === key).length,
    };
  }), [filteredHistory]);
  const maxFrequency = Math.max(1, ...frequency.map(item => item.value));
  const weeklyCount = history.filter(item => Date.now() - new Date(item.startedAt).getTime() < 7 * 24 * 60 * 60 * 1000).length;
  const totalMinutes = filteredHistory.reduce((total, item) => total + item.seconds, 0) / 60;
  const totalCalories = filteredHistory.reduce((total, item) => total + item.calories, 0);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Your recorded progress</Text>
          <Pressable
            onPress={async () => {
              try {
                await refreshProgress();
              } catch (refreshError) {
                Alert.alert("Unable to refresh progress", refreshError instanceof Error ? refreshError.message : "Please try again.");
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Refresh progress"
          >
            <Ionicons name="refresh-outline" size={20} color={theme.colors.primary} />
          </Pressable>
        </View>
        {loading ? <Text style={styles.message}>Loading account progress…</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.statCards}>
          {[
            ["Sessions", filteredHistory.length.toString(), "checkmark-circle-outline"],
            ["This week", weeklyCount.toString(), "calendar-outline"],
            ["Time", `${Math.floor(totalMinutes)} min`, "time-outline"],
          ].map(([label, value, icon]) => (
            <View key={label} style={styles.statCard}>
              <Ionicons name={icon as React.ComponentProps<typeof Ionicons>["name"]} size={18} color={theme.colors.primary} />
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <Pressable onPress={() => navigation.navigate(PROGRESS_ROUTES.OVERVIEW)} style={styles.progressLink} accessibilityRole="button">
          <Ionicons name="trending-up-outline" size={18} color={theme.colors.onPrimary} />
          <Text style={styles.progressLinkText}>Open detailed progress reports</Text>
          <Ionicons name="chevron-forward" size={17} color={theme.colors.onPrimary} />
        </Pressable>
        <View style={styles.rangeTabs}>
          {ranges.map(range => {
            const active = range === selectedRange;
            return (
              <Pressable key={range} onPress={() => setSelectedRange(range)} style={[styles.rangeTab, active && styles.rangeTabActive]} accessibilityState={{ selected: active }}>
                <Text style={[styles.rangeText, active && styles.rangeTextActive]}>{range}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Saved workout sessions · last 7 days</Text>
          <View style={styles.frequencyBars}>
            {frequency.map(item => (
              <View key={item.day} style={styles.frequencyColumn}>
                <Text style={styles.barValue}>{item.value || ""}</Text>
                <View style={[styles.frequencyBar, { height: Math.max(5, (item.value / maxFrequency) * 80), opacity: item.value ? 1 : 0.2 }]} />
                <Text style={styles.frequencyLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.activityTitle}>Activity summary · {selectedRange.toLowerCase()}</Text>
        <View style={styles.activityCards}>
          {[
            { label: "Saved sessions", value: `${filteredHistory.length}`, icon: "barbell-outline" as const },
            { label: "Workout calories", value: `${totalCalories.toLocaleString()} kcal`, icon: "flame-outline" as const },
          ].map(item => (
            <View key={item.label} style={styles.activityCard}>
              <Ionicons name={item.icon} size={20} color={theme.colors.primary} />
              <Text style={styles.activityLabel}>{item.label}</Text>
              <Text style={styles.activityValue}>{item.value}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.disclaimer}>Analysis uses sessions saved to your account. The app does not infer workout types, body-part focus or a streak from missing data.</Text>
        <Text style={styles.activityTitle}>Recent saved sessions</Text>
        {filteredHistory.length === 0 ? <Text style={styles.message}>No saved workouts in this date range.</Text> : filteredHistory.slice(0, 10).map(session => (
          <View key={session.id} style={styles.sessionRow}>
            <View style={styles.sessionIcon}><Ionicons name="barbell-outline" size={17} color={theme.colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <Text style={styles.sessionMeta}>{new Date(session.startedAt).toLocaleDateString()} · {fmtClock(session.seconds, false)}</Text>
            </View>
            <Text style={styles.sessionCalories}>{session.calories} kcal</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 78 },
  summaryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryTitle: { color: theme.colors.text, fontSize: 18, fontFamily: theme.typography.fontFamilyBold },
  message: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginVertical: 8, fontFamily: theme.typography.fontFamily },
  error: { color: "#B42318", fontSize: 12, marginVertical: 7, fontFamily: theme.typography.fontFamily },
  statCards: { flexDirection: "row", gap: 9, marginTop: 12 },
  statCard: { flex: 1, padding: 12, borderRadius: 13, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  statValue: { marginTop: 8, fontSize: 16, color: theme.colors.text, fontFamily: theme.typography.fontFamilyBold },
  statLabel: { marginTop: 2, fontSize: 10, color: theme.colors.muted, fontFamily: theme.typography.fontFamily },
  progressLink: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: theme.colors.primary, borderRadius: 12, padding: 13, marginTop: 12 },
  progressLinkText: { flex: 1, color: theme.colors.onPrimary, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  rangeTabs: { flexDirection: "row", marginTop: 16, padding: 4, borderRadius: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  rangeTab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rangeTabActive: { backgroundColor: theme.colors.primary },
  rangeText: { fontSize: 10, fontFamily: theme.typography.fontFamilyMedium, color: theme.colors.text },
  rangeTextActive: { color: theme.colors.onPrimary, fontFamily: theme.typography.fontFamilyBold },
  chartCard: { marginTop: 18, padding: 16, borderRadius: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  chartTitle: { fontSize: 13, color: theme.colors.text, marginBottom: 12, fontFamily: theme.typography.fontFamilyBold },
  frequencyBars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 110 },
  frequencyColumn: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  frequencyBar: { width: 13, borderRadius: 7, backgroundColor: theme.colors.primary },
  frequencyLabel: { marginTop: 7, fontSize: 10, color: theme.colors.muted, fontFamily: theme.typography.fontFamily },
  barValue: { color: theme.colors.muted, height: 13, fontSize: 9, fontFamily: theme.typography.fontFamilyMedium },
  activityTitle: { marginTop: 21, marginBottom: 10, fontSize: 15, color: theme.colors.text, fontFamily: theme.typography.fontFamilyBold },
  activityCards: { flexDirection: "row", gap: 10 },
  activityCard: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  activityLabel: { marginTop: 10, fontSize: 10, color: theme.colors.muted, fontFamily: theme.typography.fontFamily },
  activityValue: { marginTop: 4, fontSize: 17, color: theme.colors.text, fontFamily: theme.typography.fontFamilyBold },
  disclaimer: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 12, fontFamily: theme.typography.fontFamily },
  sessionRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 11, marginBottom: 7, borderRadius: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  sessionIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surface },
  sessionTitle: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  sessionMeta: { color: theme.colors.muted, fontSize: 10, marginTop: 3, fontFamily: theme.typography.fontFamily },
  sessionCalories: { color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamilyMedium },
});
