import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import BottomTabBar from "../../../components/BottomTabBar";
import { ScreenHeader } from "../../../components/MovementUI";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { ROUTES } from "../../../navigation/routes";
import { useTheme } from "../../../theme/ThemeProvider";
import { returnToMainHome } from "../../../navigation/workoutNavigation";

const WORKOUT_LINKS = [
  {
    title: "Explore workouts",
    description: "Find exercises by body part and category.",
    icon: "search-outline" as const,
    route: WORKOUT_ROUTES.EXPLORE,
  },
  {
    title: "Workout collections",
    description: "Browse the complete exercise library.",
    icon: "layers-outline" as const,
    route: WORKOUT_ROUTES.COLLECTIONS,
  },
  {
    title: "Saved workouts",
    description: "Quickly return to exercises you saved.",
    icon: "heart-outline" as const,
    route: WORKOUT_ROUTES.FAVORITES,
  },
];

export default function WorkoutWelcome() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Workout"
          onBack={() => returnToMainHome(navigation)}
          onBell={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
          onProfile={() => navigation.navigate(ROUTES.PROFILE)}
        />

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="barbell" size={25} color={theme.colors.primary} />
          </View>
          <Text style={styles.eyebrow}>YOUR WORKOUT SPACE</Text>
          <Text style={styles.title}>Move at your pace.</Text>
          <Text style={styles.description}>
            Choose a place to start, explore new exercises, or pick up where you left off with saved workouts.
          </Text>
          <Pressable
            onPress={() => navigation.navigate(WORKOUT_ROUTES.EXPLORE)}
            style={styles.primaryButton}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Start exploring</Text>
            <Ionicons name="arrow-forward" size={17} color={theme.colors.onPrimary} />
          </Pressable>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Where would you like to go?</Text>
          <Text style={styles.sectionSubtitle}>Your workout library, all in one place.</Text>
        </View>

        <View style={styles.links}>
          {WORKOUT_LINKS.map(link => (
            <Pressable
              key={link.route}
              onPress={() => navigation.navigate(link.route)}
              style={styles.linkCard}
              accessibilityRole="button"
              accessibilityLabel={`${link.title}. ${link.description}`}
            >
              <View style={styles.linkIcon}>
                <Ionicons name={link.icon} size={21} color={theme.colors.primary} />
              </View>
              <View style={styles.linkCopy}>
                <Text style={styles.linkTitle}>{link.title}</Text>
                <Text style={styles.linkDescription}>{link.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <BottomTabBar activeTab="workout" variant="workout" workoutActiveTab="welcome" />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingHorizontal: 18, paddingBottom: 118 },
    hero: {
      marginTop: 12,
      padding: 21,
      borderRadius: 22,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    heroIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
    },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 10,
      letterSpacing: 1.3,
      marginTop: 19,
      fontFamily: theme.typography.fontFamilyBold,
    },
    title: {
      color: theme.colors.text,
      fontSize: 27,
      lineHeight: 33,
      marginTop: 7,
      fontFamily: theme.typography.fontFamilyBold,
    },
    description: {
      color: theme.colors.muted,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 8,
      fontFamily: theme.typography.fontFamily,
    },
    primaryButton: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      marginTop: 20,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
    },
    primaryButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 13,
      fontFamily: theme.typography.fontFamilyBold,
    },
    sectionHeading: { marginTop: 26, marginBottom: 13 },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 17,
      fontFamily: theme.typography.fontFamilyBold,
    },
    sectionSubtitle: {
      color: theme.colors.muted,
      fontSize: 11,
      marginTop: 4,
      fontFamily: theme.typography.fontFamily,
    },
    links: { gap: 10 },
    linkCard: {
      minHeight: 80,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 13,
      borderRadius: 16,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    linkIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
    },
    linkCopy: { flex: 1 },
    linkTitle: {
      color: theme.colors.text,
      fontSize: 13,
      fontFamily: theme.typography.fontFamilyBold,
    },
    linkDescription: {
      color: theme.colors.muted,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 4,
      fontFamily: theme.typography.fontFamily,
    },
  });
