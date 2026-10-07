import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

import { ROUTES } from "../../navigation/routes";
import { useTheme } from "../../theme/ThemeProvider";
import PrimaryButton from "../../components/PrimaryButton";

export default function Welcome() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleNext = () => navigation.navigate(ROUTES.WELCOME_1);
  const handleSkip = () => navigation.navigate(ROUTES.LOGIN);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
      />

      {/* Full-screen background image */}
      <Image
        source={require("../../assets/Welcome.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Dark overlay (top light, bottom stronger for readable text) */}
      <View style={styles.overlay} />
      <View style={styles.overlayBottom} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Workout</Text>

          <TouchableOpacity
            onPress={handleSkip}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Text on top of the image */}
        <View style={styles.content}>
          <Text style={styles.eyebrow}>Welcome to Workout</Text>

          <Text style={styles.title}>{"Every move\ncounts."}</Text>

          <Text style={styles.subtitle}>
            Find your rhythm with workouts, daily movement and little wins that
            add up.
          </Text>

          {/* Pagination */}
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          <View style={styles.bottom}>
            <PrimaryButton
              title="Get Started"
              onPress={handleNext}
              showDescription={true}
              description="Already a member? Log in"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    backgroundImage: {
      position: "absolute",
      top: 0,
      left: 0,
      width: responsiveWidth(100),
      height: responsiveHeight(100),
    },
    overlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: theme.colors.overlay,
    },
    overlayBottom: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: responsiveHeight(55),
      backgroundColor: theme.colors.overlay,
    },
    safeArea: {
      flex: 1,
      justifyContent: "space-between",
    },

    /* Header */
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 22,
      paddingTop: 8,
    },
    logoText: {
      fontFamily: theme.typography.fontFamilyBold,
      fontSize: responsiveFontSize(2.2),
      fontWeight: "700",
      color: theme.colors.white,
    },
    skipText: {
      fontFamily: theme.typography.fontFamilyMedium,
      fontSize: responsiveFontSize(1.8),
      fontWeight: "600",
      color: theme.colors.white,
      opacity: 0.9,
    },

    /* Content */
    content: {
      paddingHorizontal: 22,
      paddingBottom: 12,
    },
    eyebrow: {
      fontFamily: theme.typography.fontFamilyBold,
      fontSize: responsiveFontSize(1.7),
      fontWeight: "700",
      letterSpacing: 0.3,
      color: theme.colors.primary,
      marginBottom: 10,
    },
    title: {
      fontFamily: theme.typography.fontFamilyBold,
      color: theme.colors.white,
      fontSize: responsiveFontSize(5),
      lineHeight: responsiveFontSize(5.8),
      fontWeight: "800",
      letterSpacing: -0.8,
    },
    subtitle: {
      fontFamily: theme.typography.fontFamily,
      color: theme.colors.white,
      opacity: 0.8,
      marginTop: 12,
      maxWidth: 320,
      fontSize: responsiveFontSize(1.9),
      lineHeight: responsiveFontSize(2.8),
    },

    /* Pagination */
    pagination: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 20,
      gap: 6,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.overlay,
    },
    activeDot: {
      width: 24,
      backgroundColor: theme.colors.primary,
    },

    /* Bottom button */
    bottom: {
      width: "100%",
      marginTop: 24,
    },
  });