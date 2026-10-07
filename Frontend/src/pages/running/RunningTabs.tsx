import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../theme/ThemeProvider";
import MovementDashboard from "./home/Home";
import ActivityOverview from "./activity/Activity";
import HealthTrends from "./progress/Progress";

type RunningTab = "dashboard" | "activity" | "trends";
type TabItem = {
  key: RunningTab;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  activeIcon: React.ComponentProps<typeof Ionicons>["name"];
};

const TABS: TabItem[] = [
  { key: "dashboard", label: "Run", icon: "walk-outline", activeIcon: "walk" },
  { key: "activity", label: "Activity", icon: "calendar-outline", activeIcon: "calendar" },
  { key: "trends", label: "Trends", icon: "stats-chart-outline", activeIcon: "stats-chart" },
];

export default function RunningTabs() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [activeTab, setActiveTab] = useState<RunningTab>("dashboard");

  const screen = activeTab === "activity"
    ? <ActivityOverview />
    : activeTab === "trends"
      ? <HealthTrends />
      : <MovementDashboard onViewAll={() => setActiveTab("activity")} />;

  return (
    <View style={styles.screen}>
      <View style={styles.content}>{screen}</View>
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {TABS.map(tab => {
          const selected = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={tab.label}
              style={styles.tab}
            >
              <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
                <Ionicons
                  name={selected ? tab.activeIcon : tab.icon}
                  size={20}
                  color={selected ? theme.colors.onPrimary : theme.colors.icon}
                />
              </View>
              <Text style={[styles.label, selected && styles.labelSelected]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    content: { flex: 1 },
    bar: {
      flexDirection: "row",
      paddingTop: 8,
      paddingHorizontal: 24,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    tab: { flex: 1, alignItems: "center", minHeight: 48 },
    iconWrap: {
      width: 46,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrapSelected: { backgroundColor: theme.colors.primary },
    label: {
      marginTop: 3,
      color: theme.colors.muted,
      fontSize: 10,
      fontFamily: theme.typography.fontFamilyMedium,
    },
    labelSelected: {
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamilyBold,
    },
  });