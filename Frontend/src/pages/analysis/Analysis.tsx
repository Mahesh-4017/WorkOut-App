import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";
import {
  responsiveFontSize,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useTheme } from "../../theme/ThemeProvider";
import { useUser } from "../../data/UserProvider";
import { exercises } from "../../data/exercises";
import { PROGRESS_ROUTES } from "../../navigation/progressRoutes";

type Range = "Week" | "Month" | "3 Months" | "Year";

const ranges: Range[] = ["Week", "Month", "3 Months", "Year"];
const RANGE_DAYS: Record<Range, number> = { Week: 7, Month: 30, "3 Months": 90, Year: 365 };

export default function Analysis() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { history } = useUser();
  const [selectedRange, setSelectedRange] = useState<Range>("Month");
  const filteredHistory = useMemo(() => {
    const cutoff = Date.now() - RANGE_DAYS[selectedRange] * 24 * 60 * 60 * 1000;
    return history.filter(item => new Date(item.completedAt).getTime() >= cutoff);
  }, [history, selectedRange]);
  const frequency = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return { day: date.toLocaleDateString(undefined, { weekday: "short" }), value: filteredHistory.filter(item => item.completedAt.slice(0, 10) === key).length };
  }), [filteredHistory]);
  const maxFrequency = Math.max(1, ...frequency.map(item => item.value));
  const muscleGroups = useMemo(() => {
    const counts = filteredHistory.reduce<Record<string, number>>((result, item) => {
      const exercise = exercises.find(value => value.id === item.exerciseId);
      if (exercise) result[exercise.muscle] = (result[exercise.muscle] || 0) + 1;
      return result;
    }, {});
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0) || 1;
    const colors = [theme.colors.primary, theme.colors.success, theme.colors.warning, theme.colors.icon, theme.colors.primaryDark];
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, count], index) => ({ label, percent: Math.round((count / total) * 100), color: colors[index % colors.length] }));
  }, [filteredHistory, theme.colors]);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.statCards}>
          {[ ["Completed", filteredHistory.length.toString(), "checkmark-circle-outline"], ["This week", history.filter(item => Date.now() - new Date(item.completedAt).getTime() <= 7 * 24 * 60 * 60 * 1000).length.toString(), "calendar-outline"], ["Streak", filteredHistory.length ? "Active" : "Start", "flame-outline"] ].map(([label, value, icon]) => (
            <View key={label} style={styles.statCard}>
              <Ionicons name={icon as React.ComponentProps<typeof Ionicons>["name"]} size={18} color={theme.colors.icon} />
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <Pressable
          onPress={() => navigation.navigate(PROGRESS_ROUTES.OVERVIEW)}
          style={styles.progressLink}
          accessibilityRole="button"
        >
          <Ionicons name="trending-up-outline" size={18} color={theme.colors.onPrimary} />
          <Text style={styles.progressLinkText}>Open detailed progress reports</Text>
          <Ionicons name="chevron-forward" size={17} color={theme.colors.onPrimary} />
        </Pressable>
        {/* Range tabs */}
        <View style={styles.rangeTabs}>
          {ranges.map((range) => {
            const active = range === selectedRange;
            return (
              <Pressable
                key={range}
                onPress={() => setSelectedRange(range)}
                style={[styles.rangeTab, active && styles.rangeTabActive]}
              >
                <Text style={[styles.rangeText, active && styles.rangeTextActive]}>
                  {range}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Workout Frequency */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            Workout Frequency
          </Text>

          <View style={styles.frequencyBars}>
            {frequency.map((item) => (
              <View key={item.day} style={styles.frequencyColumn}>
                <View style={[styles.frequencyBar, StyleSheet.create({ barSize: { height: Math.max(6, (item.value / maxFrequency) * 96), opacity: item.value === maxFrequency ? 1 : 0.55 } }).barSize]} />
                <Text style={styles.frequencyLabel}>
                  {item.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Muscle Groups */}
        <View style={styles.chartCardSpaced}>
          <Text style={styles.chartTitle}>
            Muscle Groups
          </Text>

          <View style={styles.muscleGroupsRow}>
            {muscleGroups.length ? <MuscleDonut segments={muscleGroups} trackColor={theme.colors.border} centerLabelColor={theme.colors.text} totalValue={filteredHistory.length.toString()} /> : <View style={styles.emptyDonut}><Ionicons name="barbell-outline" size={28} color={theme.colors.muted} /></View>}

            <View style={styles.legendList}>
              {muscleGroups.length ? muscleGroups.map((group) => (
                <View
                  key={group.label}
                  style={styles.legendItem}
                >
                  <View style={styles.legendLabelRow}>
                    <View style={[styles.legendMarker, StyleSheet.create({ markerColor: { backgroundColor: group.color } }).markerColor]} />
                    <Text style={styles.legendLabel}>
                      {group.label}
                    </Text>
                  </View>
                  <Text style={styles.legendPercent}>
                    {group.percent}%
                  </Text>
                </View>
              )) : <Text style={styles.emptyText}>Complete exercises to see your training balance.</Text>}
            </View>
          </View>
        </View>

        {/* Activity summary */}
        <Text style={styles.activityTitle}>
          Activity summary
        </Text>

        <View style={styles.activityCards}>
          {[{ exercise: "Exercises completed", value: `${filteredHistory.length}`, icon: "checkmark-circle-outline" as const }, { exercise: "Training balance", value: muscleGroups.length ? `${muscleGroups[0].label} focus` : "Not started", icon: "analytics-outline" as const }].map((best) => (
            <View
              key={best.exercise}
              style={styles.activityCard}
            >
              <Ionicons
                name={best.icon}
                size={20}
                color={theme.colors.icon}
              />
              <Text style={styles.activityLabel}>
                {best.exercise}
              </Text>
              <Text style={styles.activityValue}>
                {best.value}
              </Text>
              <Text style={styles.activityCaption}>
                {selectedRange} overview
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  progressLink: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: theme.colors.primary, borderRadius: 12, padding: 13, marginBottom: 12 },
  progressLinkText: { flex: 1, color: theme.colors.onPrimary, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  content: { paddingHorizontal: responsiveWidth(5), paddingTop: 6, paddingBottom: 78 },
  statCards: { flexDirection: "row", gap: 10, marginTop: 8 },
  statCard: { flex: 1, padding: 13, borderRadius: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  statValue: { marginTop: 8, fontSize: responsiveFontSize(1.8), fontWeight: "900", color: theme.colors.text },
  statLabel: { marginTop: 2, fontSize: responsiveFontSize(1.15), color: theme.colors.textSecondary },
  rangeTabs: { flexDirection: "row", marginTop: 18, padding: 4, borderRadius: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  rangeTab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rangeTabActive: { backgroundColor: theme.colors.primary },
  rangeText: { fontSize: responsiveFontSize(1.35), fontWeight: "700", color: theme.colors.text, opacity: 0.7 },
  rangeTextActive: { color: theme.colors.onPrimary, opacity: 1 },
  chartCard: { marginTop: 24, padding: 18, borderRadius: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  chartCardSpaced: { marginTop: 20, padding: 18, borderRadius: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  chartTitle: { fontSize: responsiveFontSize(1.9), fontWeight: "800", color: theme.colors.text, marginBottom: 18 },
  frequencyBars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 120 },
  frequencyColumn: { alignItems: "center", flex: 1 },
  frequencyBar: { width: 14, borderRadius: 7, backgroundColor: theme.colors.primary },
  frequencyLabel: { marginTop: 8, fontSize: responsiveFontSize(1.25), color: theme.colors.textSecondary },
  muscleGroupsRow: { flexDirection: "row", alignItems: "center" },
  emptyDonut: { width: 130, height: 130, borderRadius: 65, borderWidth: 16, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center" },
  legendList: { flex: 1, marginLeft: 20 },
  legendItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  legendLabelRow: { flexDirection: "row", alignItems: "center" },
  legendMarker: { width: 9, height: 9, borderRadius: 5, marginRight: 8 },
  legendLabel: { fontSize: responsiveFontSize(1.45), color: theme.colors.text, opacity: 0.8 },
  legendPercent: { fontSize: responsiveFontSize(1.45), fontWeight: "700", color: theme.colors.text },
  emptyText: { color: theme.colors.textSecondary },
  activityTitle: { marginTop: 26, marginBottom: 14, fontSize: responsiveFontSize(2.1), fontWeight: "800", color: theme.colors.text },
  activityCards: { flexDirection: "row", gap: 12 },
  activityCard: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  activityLabel: { marginTop: 12, fontSize: responsiveFontSize(1.5), color: theme.colors.text, opacity: 0.7 },
  activityValue: { marginTop: 2, fontSize: responsiveFontSize(2.1), fontWeight: "800", color: theme.colors.text },
  activityCaption: { marginTop: 2, fontSize: responsiveFontSize(1.2), color: theme.colors.textSecondary, opacity: 0.7 },
});

function MuscleDonut({
  segments,
  trackColor,
  centerLabelColor,
  totalValue,
}: {
  segments: { label: string; percent: number; color: string }[];
  trackColor: string;
  centerLabelColor: string;
  totalValue: string;
}) {
  const size = 130;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const styles = StyleSheet.create({
    wrapper: { width: size, height: size },
    center: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
    caption: { fontSize: responsiveFontSize(1.05), color: centerLabelColor, opacity: 0.55 },
    value: { fontSize: responsiveFontSize(1.7), fontWeight: "800", color: centerLabelColor },
  });

  let cumulativePercent = 0;

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((segment) => {
          const segmentLength = (segment.percent / 100) * circumference;
          // Negative offset advances the dash start clockwise around the circle
          // by however much of the circle prior segments already used.
          const dashOffset = -(cumulativePercent / 100) * circumference;
          cumulativePercent += segment.percent;

          return (
            <Circle
              key={segment.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              fill="none"
              // Rotate so segments start at 12 o'clock instead of 3 o'clock
              rotation={-90}
              origin={`${size / 2}, ${size / 2}`}
            />
          );
        })}
      </Svg>

      <View style={styles.center}>
        <Text style={styles.caption}>
          Completed
        </Text>
        <Text style={styles.value}>
          {totalValue}
        </Text>
      </View>
    </View>
  );
}