import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../theme/ThemeProvider";
import MovementDashboard from "./home/Home";
import ActivityOverview from "./activity/Activity";
import HealthTrends from "./progress/Progress";
import RunningMap from "./map/RunningMap";

type RunningTab = "dashboard" | "map" | "activity" | "trends";
type TabItem = {
  key: RunningTab;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  activeIcon: React.ComponentProps<typeof Ionicons>["name"];
};

const TABS: TabItem[] = [
  { key: "dashboard", label: "Run", icon: "walk-outline", activeIcon: "walk" },
  { key: "map", label: "Map", icon: "map-outline", activeIcon: "map" },
  { key: "activity", label: "Activity", icon: "calendar-outline", activeIcon: "calendar" },
  { key: "trends", label: "Trends", icon: "stats-chart-outline", activeIcon: "stats-chart" },
];

export default function RunningTabs() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [activeTab, setActiveTab] = useState<RunningTab>("dashboard");
  const [mapMounted, setMapMounted] = useState(false);
  const openMap = () => {
    setMapMounted(true);
    setActiveTab("map");
  };

  const screen = activeTab === "activity"
    ? <ActivityOverview />
    : activeTab === "trends"
      ? <HealthTrends />
      : activeTab === "map"
        ? null
        : <MovementDashboard
          onViewAll={() => setActiveTab("activity")}
          onOpenMap={openMap}
        />;

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        {screen}
        {mapMounted ? (
          <View style={[styles.mapScreen, activeTab !== "map" && styles.hiddenScreen]}>
            <RunningMap />
          </View>
        ) : null}
      </View>
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {TABS.map(tab => {
          const selected = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                if (tab.key === "map") openMap();
                else setActiveTab(tab.key);
              }}
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
    mapScreen: { ...StyleSheet.absoluteFill },
    hiddenScreen: { display: "none" },
    bar: {
      flexDirection: "row",
      paddingTop: 8,
      paddingHorizontal: 12,
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