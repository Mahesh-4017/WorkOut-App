import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppHeader from "../components/AppHeader";
import BottomTabBar from "../components/BottomTabBar";
import HomeScreen from "../pages/home/Home";
import AnalysisScreen from "../pages/analysis/Analysis";
import CalendarScreen from "../pages/Calendar/WorkoutCalendar";
import ProfileScreen from "../pages/profile/Profile";
import ExploreWorkouts from "../pages/workout/Explore/Explore";
import { useTheme } from "../theme/ThemeProvider";

export type MainTabName = "home" | "workout" | "calendar" | "analysis" | "profile";

export default function MainTabs({ route }: { route?: { params?: { tab?: MainTabName; selectedDate?: string } } }) {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    content: { flex: 1 },
  });
  const initialTab = route?.params?.tab ?? "home";
  const [activeTab, setActiveTab] = useState<MainTabName>(initialTab);

  useEffect(() => {
    if (route?.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route?.params?.tab]);

  const renderHeader = () => {
    switch (activeTab) {
      case "calendar":
        return (
          <AppHeader
            title="Calendar"
            description="Manage your workouts"
            showBack={false}
          />
        );
      case "analysis":
        return (
          <AppHeader
            title="Analysis"
            description="Track your progress"
            showBack={false}
          />
        );
      case "profile":
        return null;
      case "workout":
        return null;
      case "home":
      default:
        return null;
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "calendar":
        return <CalendarScreen selectedDate={route?.params?.selectedDate} />;
      case "analysis":
        return <AnalysisScreen />;
      case "workout":
        return <ExploreWorkouts showBottomTabBar={false} onBack={() => setActiveTab("home")} />;
      case "profile":
        return <ProfileScreen />;
      case "home":
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.screen}>
      {renderHeader()}
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <BottomTabBar
        activeTab={activeTab}
        variant={activeTab === "workout" ? "workout" : "main"}
        workoutActiveTab="explore"
        onTabPress={setActiveTab}
      />
    </View>
  );
}
