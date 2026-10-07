import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../theme/ThemeProvider";
import FoodDiary from "./home/Home";
import CalorieBreakdown from "./daily-caleroies/Caleroies";
import WaterTracker from "./water-tracker/Tracker";

type FoodTab = "diary" | "calories" | "water";
type RouteParams = { params?: { tab?: FoodTab } };
type TabItem = {
  key: FoodTab;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  activeIcon: React.ComponentProps<typeof Ionicons>["name"];
};

const TABS: TabItem[] = [
  { key: "diary", label: "Diary", icon: "restaurant-outline", activeIcon: "restaurant" },
  { key: "calories", label: "Calories", icon: "flame-outline", activeIcon: "flame" },
  { key: "water", label: "Water", icon: "water-outline", activeIcon: "water" },
];

export default function FoodTabs({ route }: { route?: RouteParams }) {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [activeTab, setActiveTab] = useState<FoodTab>(route?.params?.tab ?? "diary");

  useEffect(() => {
    if (route?.params?.tab) setActiveTab(route.params.tab);
  }, [route?.params?.tab]);

  const selectTab = (tab: FoodTab) => {
    setActiveTab(tab);
    navigation.setParams({ tab });
  };

  const content = activeTab === "calories"
    ? <CalorieBreakdown />
    : activeTab === "water"
      ? <WaterTracker />
      : <FoodDiary />;

  return (
    <View style={styles.screen}>
      <View style={styles.content}>{content}</View>
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {TABS.map(tab => {
          const selected = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => selectTab(tab.key)}
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
    iconWrap: { width: 46, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    iconWrapSelected: { backgroundColor: theme.colors.primary },
    label: { marginTop: 3, color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamilyMedium },
    labelSelected: { color: theme.colors.text, fontFamily: theme.typography.fontFamilyBold },
  });