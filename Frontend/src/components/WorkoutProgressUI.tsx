import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle, StyleProp, LayoutChangeEvent } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path } from "react-native-svg";

import { useTheme } from "../theme/ThemeProvider";
import { OnboardingHeader } from "./OnboardingUI";
import { useSession } from "../data/SessionProvider";

export function ProgressScreen({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { error, loading, refreshProgress } = useSession();
  const styles = createStyles(theme);
  useFocusEffect(
    React.useCallback(() => {
      refreshProgress().catch(loadError => {
        console.error("Unable to refresh progress data.", loadError);
      });
    }, [refreshProgress]),
  );
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <OnboardingHeader title={title} onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {error ? (
          <Pressable
            onPress={() => refreshProgress().catch(loadError => console.error("Unable to refresh progress data.", loadError))}
            style={styles.errorBox}
            accessibilityRole="button"
          >
            <Text style={styles.errorText}>{error} {loading ? "" : "Tap to retry."}</Text>
          </Pressable>
        ) : null}
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function ProgressCard({
  children,
  tint,
  style,
}: {
  children: React.ReactNode;
  tint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return <View style={[styles.card, { backgroundColor: tint ?? theme.colors.card }, style]}>{children}</View>;
}

export function ProgressSectionTitle({
  children,
  link,
  onLinkPress,
}: {
  children: React.ReactNode;
  link?: string;
  onLinkPress?: () => void;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.between}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {link ? (
        <Pressable onPress={onLinkPress} accessibilityRole="button">
          <Text style={styles.link}>{link}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ProgressStatTile({
  value,
  label,
  tint,
  style,
}: {
  value: string;
  label: string;
  tint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <ProgressCard tint={tint} style={[styles.statTile, style]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.caption}>{label}</Text>
    </ProgressCard>
  );
}

export function ProgressStatRow({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint?: string;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={[styles.statRow, tint ? { backgroundColor: tint } : null]}>
      <Text style={styles.body}>{label}</Text>
      <Text style={styles.bodyStrong}>{value}</Text>
    </View>
  );
}

export function ProgressDivider() {
  const { theme } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border }} />;
}

export function ProgressBar({
  percent,
  color,
  track,
}: {
  percent: number;
  color?: string;
  track?: string;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={[styles.progressTrack, track ? { backgroundColor: track } : null]}>
      <View style={[
        styles.progressFill,
        { width: `${Math.max(0, Math.min(100, percent))}%`, backgroundColor: color ?? theme.colors.primary },
      ]} />
    </View>
  );
}

export function ProgressChips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.chips}>
      {options.map(option => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.chip, selected && styles.chipSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProgressBarChart({
  values,
  labels,
  highlight,
  color,
  height = 100,
}: {
  values: number[];
  labels?: string[];
  highlight?: number;
  color?: string;
  height?: number;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const maximum = Math.max(1, ...values);
  return (
    <View>
      <View style={[styles.chartBars, { height }]}>
        {values.map((value, index) => (
          <View
            key={labels?.[index] ?? index}
            style={[
              styles.chartBar,
              {
                height: Math.max(4, (value / maximum) * height),
                backgroundColor: highlight === undefined || highlight === index
                  ? color ?? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
          />
        ))}
      </View>
      {labels ? (
        <View style={styles.chartLabels}>
          {labels.map((label, index) => (
            <Text key={`${label}-${index}`} style={styles.chartLabel}>{label}</Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function ProgressLineChart({
  values,
  height = 120,
  goalLine,
}: {
  values: number[];
  height?: number;
  goalLine?: number;
}) {
  const { theme } = useTheme();
  const [width, setWidth] = useState(0);
  const pad = 8;
  const points = values.length ? values : [0];
  const all = goalLine !== undefined ? [...points, goalLine] : points;
  const minimum = Math.min(...all);
  const maximum = Math.max(...all);
  const x = (index: number) => pad + (index * Math.max(width - pad * 2, 0)) / Math.max(points.length - 1, 1);
  const y = (value: number) => pad + (1 - (value - minimum) / Math.max(maximum - minimum, 1)) * (height - pad * 2);
  const path = points.map((value, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(value)}`).join(" ");
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          {goalLine !== undefined ? (
            <Line
              x1={pad}
              x2={width - pad}
              y1={y(goalLine)}
              y2={y(goalLine)}
              stroke={theme.colors.muted}
              strokeDasharray="4 4"
            />
          ) : null}
          <Path d={path} stroke={theme.colors.primary} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Circle cx={x(points.length - 1)} cy={y(points[points.length - 1])} r={5} fill={theme.colors.primary} />
        </Svg>
      ) : null}
    </View>
  );
}

export function ProgressMetricRow({
  icon,
  label,
  value,
  tint,
}: {
  icon: string;
  label: string;
  value: string;
  tint: string;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <ProgressCard tint={tint} style={styles.metricRow}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.bodyStrong}>{value}</Text>
    </ProgressCard>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: 18 },
    content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 24, gap: 12 },
    footer: { padding: 18, gap: 8 },
    errorBox: { backgroundColor: theme.colors.surfaceAlt ?? theme.colors.card, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: theme.colors.danger },
    errorText: { color: theme.colors.danger, fontSize: 12, fontFamily: theme.typography.fontFamily },
    card: { borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.colors.border, gap: 10 },
    between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
    sectionTitle: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    link: { color: theme.colors.primaryDark, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    statTile: { flex: 1, paddingVertical: 12, gap: 3 },
    statValue: { color: theme.colors.text, fontSize: 20, fontFamily: theme.typography.fontFamilyBold },
    caption: { color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily },
    statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 4 },
    body: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamily },
    bodyStrong: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    progressTrack: { height: 8, borderRadius: 99, backgroundColor: theme.colors.border, overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: 99 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
    chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 99, borderWidth: 1, borderColor: theme.colors.border },
    chipSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    chipText: { color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
    chipTextSelected: { color: theme.colors.onPrimary, fontFamily: theme.typography.fontFamilyBold },
    chartBars: { flexDirection: "row", alignItems: "flex-end", gap: 7 },
    chartBar: { flex: 1, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
    chartLabels: { flexDirection: "row", gap: 7, marginTop: 6 },
    chartLabel: { flex: 1, textAlign: "center", color: theme.colors.muted, fontSize: 9, fontFamily: theme.typography.fontFamily },
    metricRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    metricIcon: { fontSize: 22 },
    metricLabel: { flex: 1, color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamily },
  });
