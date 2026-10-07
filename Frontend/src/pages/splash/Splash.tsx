import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  Easing,
  StyleSheet,
  StatusBar,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/AuthContext";
import { getPostAuthRoute } from "../../utils/onboarding";
import { useUser } from "../../data/UserProvider";

const BAR_WIDTH = responsiveWidth(46);
const TOTAL_MS = 3000;

export default function Splash() {
  const navigation = useNavigation<any>();
  const { restore } = useAuth();
  const { setUser } = useUser();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const bgScale = useRef(new Animated.Value(1.15)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(24)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const subY = useRef(new Animated.Value(16)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slow background zoom-out
    Animated.timing(bgScale, {
      toValue: 1,
      duration: TOTAL_MS + 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Logo pop-in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing ring behind logo
    const pulseLoop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );
    pulseLoop.start();

    // Staggered text reveal
    Animated.sequence([
      Animated.delay(450),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(subOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(subY, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar over the splash duration
    Animated.timing(progress, {
      toValue: 1,
      duration: TOTAL_MS - 300,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();

    // Restore an existing session before choosing the first screen.
    const timer = setTimeout(async () => {
        const [token, onboardingDone] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("onboardingDone"),
        ]);
        const restoredUser = token ? await restore() : null;
        if (restoredUser) setUser(restoredUser.name, restoredUser.email);
        const nextRoute = restoredUser
          ? await getPostAuthRoute(restoredUser)
          : onboardingDone === "true" ? ROUTES.LOGIN : ROUTES.WELCOME;
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => navigation.replace(nextRoute));
    }, TOTAL_MS);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, [
    bgScale,
    footerOpacity,
    logoOpacity,
    logoScale,
    navigation,
    progress,
    pulse,
    restore,
    screenOpacity,
    setUser,
    subOpacity,
    subY,
    titleOpacity,
    titleY,
  ]);

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.1],
  });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });
  const barTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-BAR_WIDTH, 0],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen image with slow zoom */}
      <Animated.Image
        source={require("../../assets/Blue-Gold.png")}
        style={[styles.backgroundImage, { transform: [{ scale: bgScale }] }]}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <View style={styles.overlayBottom} />

      <SafeAreaView style={styles.safeArea}>
        {/* Center brand */}
        <View style={styles.center}>
          <View style={styles.logoWrap}>
            <Animated.View
              style={[
                styles.ring,
                { opacity: ringOpacity, transform: [{ scale: ringScale }] },
              ]}
            />
            <Animated.View
              style={[
                styles.logoCircle,
                { opacity: logoOpacity, transform: [{ scale: logoScale }] },
              ]}
            >
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
              />
            </Animated.View>
          </View>

          <Animated.Text
            style={[
              styles.title,
              { opacity: titleOpacity, transform: [{ translateY: titleY }] },
            ]}
          >
            Velocity Health
          </Animated.Text>

          <Animated.Text
            style={[
              styles.subtitle,
              { opacity: subOpacity, transform: [{ translateY: subY }] },
            ]}
          >
            Move better. Live stronger.
          </Animated.Text>
        </View>

        {/* Bottom loader */}
        <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
          <View style={styles.barTrack}>
            <Animated.View
              style={[styles.barFill, { transform: [{ translateX: barTranslate }] }]}
            />
          </View>
          <Text style={styles.loadingText}>
            A little moment goes a long way.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
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
      height: responsiveHeight(45),
      backgroundColor: theme.colors.overlay,
    },
    safeArea: {
      flex: 1,
      alignItems: "center",
      justifyContent: "space-between",
    },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: responsiveHeight(6),
    },
    logoWrap: {
      width: 110,
      height: 110,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 22,
    },
    ring: {
      position: "absolute",
      width: 84,
      height: 84,
      borderRadius: 42,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    logoCircle: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    logo: {
      width: 48,
      height: 48,
      resizeMode: "contain",
    },
    title: {
      fontFamily: theme.typography.fontFamilyBold,
      fontSize: responsiveFontSize(3.8),
      fontWeight: "800",
      letterSpacing: -0.6,
      color: theme.colors.white,
    },
    subtitle: {
      fontFamily: theme.typography.fontFamily,
      marginTop: 8,
      fontSize: responsiveFontSize(1.9),
      color: theme.colors.white,
      opacity: 0.8,
    },

    footer: {
      alignItems: "center",
      paddingBottom: responsiveHeight(5),
    },
    barTrack: {
      width: BAR_WIDTH,
      height: 4,
      borderRadius: 2,
      overflow: "hidden",
      backgroundColor: theme.colors.overlay,
    },
    barFill: {
      width: BAR_WIDTH,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
    },
    loadingText: {
      fontFamily: theme.typography.fontFamily,
      marginTop: 14,
      fontSize: responsiveFontSize(1.6),
      color: theme.colors.white,
      opacity: 0.7,
    },
  });