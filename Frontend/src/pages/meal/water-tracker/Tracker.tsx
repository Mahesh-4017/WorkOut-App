import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { ROUTES } from "../../../navigation/routes";
import { GLASS_ML, useFood } from "../../../data/FoodProvider";
import { PrimaryButton } from "../../../components/OnboardingUI";
import { ProgressRing, ScreenHeader } from "../../running/data/Movementui";
import { useHydrationColors } from "../../../components/FoodUI";

export default function WaterTracker() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const hydrationColors = useHydrationColors();
  const { goals, waterMl, todayWater, addWater } = useFood();
  const s = createStyles(theme, hydrationColors);

  const totalGlasses = Math.ceil(goals.water / GLASS_ML);
  const filled = Math.min(Math.floor(waterMl / GLASS_ML), totalGlasses);
  const pct = Math.min(Math.round((waterMl / goals.water) * 100), 100);
  const liters = (n: number) => `${(n / 1000).toFixed(2).replace(/\.?0+$/, "")} L`;
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Water Tracker" onBack={() => navigation.goBack()} onProfile={() => navigation.navigate(ROUTES.PROFILE)} />

        <View style={s.hero}>
          <View>
            <Text style={s.today}>TODAY</Text>
            <Text style={s.liters}>{liters(waterMl)}</Text>
            <Text style={s.goal}>of {liters(goals.water)} daily goal</Text>
          </View>
          <ProgressRing size={96} stroke={10} progress={waterMl / goals.water} color={hydrationColors.foreground}>
            <Text style={s.pct}>{pct}%</Text>
            <Text style={s.pctSub}>hydrated</Text>
          </ProgressRing>
        </View>

        <View style={s.rowBetween}>
          <Text style={s.heading}>Today's glasses</Text>
          <Text style={s.muted}>
            {filled} of {totalGlasses}
          </Text>
        </View>

        <View style={s.grid}>
          {Array.from({ length: totalGlasses }, (_, i) => {
            const on = i < filled;
            return (
              <Pressable
                key={i}
                onPress={() => !on && addWater()}
                disabled={on}
                style={[s.glass, on && s.glassOn]}
                accessibilityLabel={on ? "Glass logged" : "Log a glass"}
              >
                <Ionicons name={on ? "water" : "water-outline"} size={20} color={on ? hydrationColors.foreground : theme.colors.muted} />
                <Text style={[s.glassText, on && { color: hydrationColors.foreground }]}>{GLASS_ML} ml</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 14 }}>
          <PrimaryButton label="+  Log a glass" onPress={() => addWater()} />
        </View>

        <Text style={[s.heading, { marginTop: 22, marginBottom: 6 }]}>Hydration log</Text>
        {todayWater.length === 0 ? (
          <Text style={s.muted}>No water logged yet today.</Text>
        ) : (
          [...todayWater].reverse().map(w => (
            <View key={w.id} style={s.logRow}>
              <Text style={s.logTime}>{fmtTime(w.time)}</Text>
              <Text style={s.logMl}>{w.ml} ml</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, hydrationColors: { foreground: string; background: string }) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingHorizontal: 18, paddingBottom: 24 },
    hero: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: hydrationColors.background, borderRadius: 20, padding: 18, marginTop: 4 },
    today: { color: hydrationColors.foreground, fontSize: 10, letterSpacing: 0.8, fontFamily: theme.typography.fontFamilyMedium },
    liters: { color: hydrationColors.foreground, fontSize: 32, marginTop: 2, fontFamily: theme.typography.fontFamilyBold },
    goal: { color: hydrationColors.foreground, fontSize: 11, fontFamily: theme.typography.fontFamily },
    pct: { color: hydrationColors.foreground, fontSize: 20, fontFamily: theme.typography.fontFamilyBold },
    pctSub: { color: hydrationColors.foreground, fontSize: 9, fontFamily: theme.typography.fontFamily },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 22, marginBottom: 10 },
    heading: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    muted: { color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    glass: { width: "22.5%", aspectRatio: 1, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card, alignItems: "center", justifyContent: "center", gap: 4 },
    glassOn: { backgroundColor: hydrationColors.background, borderColor: hydrationColors.background },
    glassText: { color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamilyMedium },
    logRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    logTime: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily },
    logMl: { color: hydrationColors.foreground, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
  });