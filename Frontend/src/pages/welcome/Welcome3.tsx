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

const WATER_PROGRESS = 1.8 / 2.5; // 72%

const FuelProgressScreen = () => {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Velocity Health</Text>
        </View>

        {/* Hero panel */}
        <View style={styles.panel}>
          {/* Icon circles */}
          <View style={styles.iconRow}>
            <View style={[styles.iconCircle, styles.foodCircle]}>
              <Text style={styles.icon}>🥗</Text>
            </View>
            <View style={[styles.iconCircle, styles.waterCircle]}>
              <Text style={styles.icon}>🥛</Text>
            </View>
          </View>

          {/* Summary card */}
          <View style={styles.card}>
            <View style={styles.statsStrip}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>1,680</Text>
                <Text style={styles.statLabel}>Food logged</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>1.8 L</Text>
                <Text style={styles.statLabel}>Water / 2.5 L</Text>
              </View>
            </View>

            <Text style={styles.cardNote}>
              A little more water, a little more energy.
            </Text>

            <View style={styles.progressBackground}>
              <View
                style={[styles.progress, { width: `${WATER_PROGRESS * 100}%` }]}
              />
            </View>
          </View>

          <Text style={styles.caption}>Scan a meal or log it yourself.</Text>
        </View>

        {/* Text */}
        <View style={styles.content}>
          <Text style={styles.title}>Fuel your progress</Text>
          <Text style={styles.description}>
            Keep a simple food diary and stay hydrated. Build habits that
            support your next workout.
          </Text>

          <View style={styles.pagination}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.activeDot]} />
          </View>
        </View>

        {/* Bottom button */}
        <View style={styles.bottom}>
          <PrimaryButton
            title="Get Started"
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
            description="Food, water and movement. In balance."
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default FuelProgressScreen;

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
      backgroundColor: theme.colors.panelWarm,
      borderRadius: 22,
      paddingHorizontal: responsiveWidth(4),
      paddingTop: responsiveHeight(2.5),
      paddingBottom: responsiveHeight(2),
      marginTop: 6,
    },
    iconRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: responsiveWidth(5),
      marginBottom: responsiveHeight(2),
    },
    iconCircle: {
      width: responsiveWidth(18),
      height: responsiveWidth(18),
      borderRadius: responsiveWidth(9),
      alignItems: "center",
      justifyContent: "center",
    },
    foodCircle: {
      backgroundColor: theme.colors.statsBackground,
    },
    waterCircle: {
      backgroundColor: theme.colors.panel,
    },
    icon: {
      fontSize: responsiveFontSize(3.6),
    },

    /* Card */
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: responsiveWidth(3),
    },
    statsStrip: {
      flexDirection: "row",
      backgroundColor: theme.colors.statsBackground,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: responsiveWidth(3),
    },
    stat: {
      flex: 1,
    },
    statNumber: {
      color: theme.colors.text,
      fontSize: responsiveFontSize(2),
      fontWeight: "800",
    },
    statLabel: {
      color: theme.colors.textSecondary,
      fontSize: responsiveFontSize(1.2),
      marginTop: 2,
    },
    cardNote: {
      color: theme.colors.textSecondary,
      fontSize: responsiveFontSize(1.3),
      marginTop: 10,
      marginBottom: 8,
    },
    progressBackground: {
      height: 7,
      borderRadius: 4,
      overflow: "hidden",
      backgroundColor: theme.colors.border,
    },
    progress: {
      height: "100%",
      borderRadius: 4,
      backgroundColor: theme.colors.accent,
    },
    caption: {
      color: theme.colors.textSecondary,
      fontSize: responsiveFontSize(1.2),
      textAlign: "center",
      marginTop: responsiveHeight(2),
    },

    /* Text content */
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: responsiveWidth(1),
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