import React from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import PrimaryButton from "../../components/PrimaryButton";
import { ROUTES } from "../../navigation/routes";
import { useTheme } from "../../theme/ThemeProvider";

const WEEK = [
  { day: "M", value: 0.42 },
  { day: "T", value: 0.62 },
  { day: "W", value: 0.46 },
  { day: "T", value: 0.78 },
  { day: "F", value: 0.62 },
  { day: "S", value: 0.95 },
  { day: "S", value: 0.82 },
];

const CHART_HEIGHT = responsiveHeight(12);

const TrackProgressScreen = () => {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>WorkOut</Text>
        </View>

        {/* Hero panel */}
        <View style={styles.panel}>
          {/* Chart card */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Your movement this week</Text>

            <View style={styles.chartRow}>
              {WEEK.map((item, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barSlot}>
                    <View
                      style={[
                        styles.bar,
                        { height: CHART_HEIGHT * item.value },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>8,432</Text>
              <Text style={styles.statLabel}>Steps today</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>420</Text>
              <Text style={styles.statLabel}>Active kcal</Text>
            </View>
          </View>
        </View>

        {/* Text */}
        <View style={styles.content}>
          <Text style={styles.title}>Track your progress</Text>
          <Text style={styles.description}>
            See your steps, calories and workouts in one place. Set goals and
            celebrate every milestone.
          </Text>

          <View style={styles.pagination}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.activeDot]} />
          </View>
        </View>

        {/* Bottom button */}
        <View style={styles.bottom}>
          <PrimaryButton
            title="Get Started"
            onPress={() => navigation.navigate(ROUTES.WELCOME_3)}
            description="Small steps. Stronger you."
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TrackProgressScreen;

const createStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: responsiveWidth(5),
    },

    /* Header */
    header: {
      minHeight: 44,
      justifyContent: "center",
    },
    logo: {
      color: theme.colors.text,
      fontSize: responsiveFontSize(1.7),
      fontWeight: "700",
    },

    /* Hero panel */
    panel: {
      backgroundColor: theme.colors.panel,
      borderRadius: 22,
      padding: responsiveWidth(4),
      marginTop: 6,
    },
    chartCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      paddingHorizontal: responsiveWidth(4),
      paddingTop: 14,
      paddingBottom: 12,
    },
    chartTitle: {
      color: theme.colors.text,
      fontSize: responsiveFontSize(1.5),
      fontWeight: "700",
      marginBottom: 14,
    },
    chartRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    barColumn: {
      flex: 1,
      alignItems: "center",
    },
    barSlot: {
      height: CHART_HEIGHT,
      justifyContent: "flex-end",
    },
    bar: {
      width: responsiveWidth(6.5),
      borderTopLeftRadius: 5,
      borderTopRightRadius: 5,
      backgroundColor: theme.colors.accent,
    },
    barLabel: {
      marginTop: 6,
      color: theme.colors.textSecondary,
      fontSize: responsiveFontSize(1.2),
    },

    /* Stats */
    statsCard: {
      flexDirection: "row",
      backgroundColor: theme.colors.statsBackground,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: responsiveWidth(4),
      marginTop: 12,
    },
    stat: {
      flex: 1,
    },
    statNumber: {
      color: theme.colors.text,
      fontSize: responsiveFontSize(2.2),
      fontWeight: "800",
    },
    statLabel: {
      color: theme.colors.textSecondary,
      fontSize: responsiveFontSize(1.3),
      marginTop: 2,
    },

    /* Text content */
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: responsiveWidth(2),
    },
    title: {
      color: theme.colors.text,
      fontSize: responsiveFontSize(3.6),
      fontWeight: "800",
      textAlign: "center",
      letterSpacing: -0.5,
    },
    description: {
      color: theme.colors.textSecondary,
      fontSize: responsiveFontSize(1.6),
      lineHeight: responsiveFontSize(2.4),
      textAlign: "center",
      marginTop: 10,
    },
    pagination: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 18,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.border,
    },
    activeDot: {
      width: 20,
      backgroundColor: theme.colors.primary,
    },

    /* Bottom */
    bottom: {
      paddingBottom: 10,
    },
  });