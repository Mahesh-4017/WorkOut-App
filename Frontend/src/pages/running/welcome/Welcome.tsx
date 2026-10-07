import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { ROUTES } from "../../../navigation/routes";
import { useSession } from "../../../data/SessionProvider";

const DEFAULT_DAILY_GOAL = 10000;

const SIZE = 240;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function Welcome() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { stepEntries, goals, loading } = useSession();
  const s = createStyles(theme);

  const [shown, setShown] = useState(0);
  const ring = useRef(new Animated.Value(0)).current;
  const todayKey = new Date().toISOString().slice(0, 10);
  const value = stepEntries
    .filter(entry => entry.recordedAt.slice(0, 10) === todayKey)
    .reduce((total, entry) => total + entry.steps, 0);
  const dailyGoal = goals?.dailySteps ?? DEFAULT_DAILY_GOAL;

  // Animate ring + count-up once the value is known
  useEffect(() => {
    if (loading) return;
    const ratio = Math.min(value / Math.max(dailyGoal, 1), 1);
    const id = ring.addListener(({ value: v }) =>
      setShown(Math.round(v * dailyGoal)),
    );
    Animated.timing(ring, {
      toValue: ratio,
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => ring.removeListener(id);
  }, [loading, value, dailyGoal, ring]);

  const onStart = () => {
    navigation.replace(ROUTES.RUNNING_HOME);
  };

  const dashOffset = ring.interpolate({ inputRange: [0, 1], outputRange: [CIRCUMFERENCE, 0] });

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.top}>
        {/* soft decorative circles */}
        <View style={[s.blob, { top: 40, left: 24, width: 56, height: 56, backgroundColor: "#E4DDF3" }]} />
        <View style={[s.blob, { bottom: 10, right: 16, width: 84, height: 84, backgroundColor: "#F6E6CC" }]} />

        {/* floating chip */}
        <View style={s.chip}>
          <Ionicons name="footsteps-outline" size={14} color={theme.colors.primaryDark} />
          <Text style={s.chipText}>{value ? `${value.toLocaleString()} steps today` : "No steps logged today"}</Text>
        </View>

        {/* ring */}
        <View style={s.ringWrap}>
          <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke={theme.colors.border} strokeWidth={STROKE} fill="none" />
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={theme.colors.primary}
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </Svg>
          <View style={s.ringCenter}>
            <Ionicons name="walk" size={38} color={theme.colors.text} />
            <Text style={s.steps}>{shown.toLocaleString()}</Text>
            <Text style={s.stepsLabel}>STEPS TODAY</Text>
          </View>
        </View>
      </View>

      <View style={s.bottom}>
        <View style={s.tag}>
          <Text style={s.tagText}>MOVE AT YOUR PACE</Text>
        </View>
        <Text style={s.title}>{value ? "Keep your movement going." : "Start moving at your pace."}</Text>
        <Text style={s.subtitle}>
          {loading
            ? "Loading your saved activity."
            : `${value.toLocaleString()} steps recorded today. Step totals include saved entries only.`}
        </Text>

        <Pressable onPress={onStart} style={s.button} accessibilityRole="button">
          <Ionicons name="arrow-forward" size={18} color={theme.colors.onPrimary} />
          <Text style={s.buttonText}>Open movement dashboard</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 24 },
    top: { flex: 1, alignItems: "center", justifyContent: "center" },
    blob: { position: "absolute", borderRadius: 999 },
    chip: {
      position: "absolute",
      top: 24,
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chipText: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
    ringWrap: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
    ringCenter: { position: "absolute", alignItems: "center" },
    steps: { color: theme.colors.text, fontSize: 46, lineHeight: 54, marginTop: 4, fontFamily: theme.typography.fontFamilyBold },
    stepsLabel: { color: theme.colors.muted, fontSize: 12, letterSpacing: 2, fontFamily: theme.typography.fontFamilyMedium },

    bottom: { paddingBottom: 20 },
    tag: {
      alignSelf: "center",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      marginBottom: 16,
    },
    tagText: { color: theme.colors.onPrimary, fontSize: 10, letterSpacing: 1, fontFamily: theme.typography.fontFamilyBold },
    title: { color: theme.colors.text, fontSize: 28, lineHeight: 34, textAlign: "center", fontFamily: theme.typography.fontFamilyBold },
    subtitle: { color: theme.colors.muted, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 10, marginBottom: 24, fontFamily: theme.typography.fontFamily },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 54,
      borderRadius: 27,
      backgroundColor: theme.colors.primary,
    },
    buttonText: { color: theme.colors.onPrimary, fontSize: 16, fontFamily: theme.typography.fontFamilyBold },
  });