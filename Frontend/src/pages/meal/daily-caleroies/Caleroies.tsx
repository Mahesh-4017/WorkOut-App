import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useTheme } from "../../../theme/ThemeProvider";
import { ROUTES } from "../../../navigation/routes";
import { useFood } from "../../../data/FoodProvider";
import { ProgressRing, ScreenHeader } from "../../running/data/Movementui";
import { BLUE_BG, MACRO_COLORS, MacroBox, BLUE } from "../../../components/FoodUI";

export default function CalorieBreakdown() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { totals, goals, waterMl } = useFood();
  const s = createStyles(theme);

  const remaining = Math.max(goals.kcal - totals.kcal, 0);
  const ratio = totals.kcal / goals.kcal;
  const status = ratio > 1.05 ? "Over" : ratio >= 0.6 ? "Good" : "Low";
  const waterPct = Math.min(Math.round((waterMl / goals.water) * 100), 100);
  const dateLabel = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long" });

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Daily Calorie Breakdown" onBack={() => navigation.goBack()} onProfile={() => navigation.navigate(ROUTES.PROFILE)} />

        <View style={s.rowBetween}>
          <Text style={s.heading}>Daily breakdown</Text>
          <Text style={s.muted}>{dateLabel}</Text>
        </View>

        <View style={s.card}>
          <ProgressRing size={120} stroke={11} progress={ratio}>
            <Text style={s.kcal}>{totals.kcal}</Text>
            <Text style={s.kcalSub}>of {goals.kcal.toLocaleString()} kcal</Text>
          </ProgressRing>
          <View style={{ flex: 1, paddingLeft: 18, gap: 12 }}>
            <View>
              <Text style={s.label}>EATEN</Text>
              <Text style={s.big}>
                {totals.kcal} <Text style={s.unit}>kcal</Text>
              </Text>
            </View>
            <View>
              <Text style={s.label}>REMAINING</Text>
              <Text style={[s.big, { color: "#7B4EF0" }]}>
                {remaining.toLocaleString()} <Text style={s.unit}>kcal</Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={s.macros}>
          <MacroBox label="Protein" grams={totals.protein} color={MACRO_COLORS.protein} />
          <MacroBox label="Carbs" grams={totals.carbs} color={MACRO_COLORS.carbs} />
          <MacroBox label="Fat" grams={totals.fat} color={MACRO_COLORS.fat} />
        </View>

        <View style={[s.water]}>
          <View>
            <Text style={s.waterTitle}>Water</Text>
            <Text style={s.waterValue}>
              {waterMl} / {goals.water} ml
            </Text>
          </View>
          <Text style={s.waterPct}>{waterPct}%</Text>
        </View>

        <View style={s.status}>
          <View>
            <Text style={s.label}>Calorie status</Text>
            <Text style={[s.statusText, status === "Over" && { color: "#C2410C" }]}>{status}</Text>
          </View>
          <ProgressRing size={64} stroke={8} progress={ratio} color={status === "Over" ? "#F59E2B" : "#6BB300"} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingHorizontal: 18, paddingBottom: 24 },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4, marginBottom: 10 },
    heading: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    muted: { color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily },
    card: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: theme.colors.border },
    kcal: { color: theme.colors.text, fontSize: 26, fontFamily: theme.typography.fontFamilyBold },
    kcalSub: { color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamily },
    label: { color: theme.colors.muted, fontSize: 10, letterSpacing: 0.6, fontFamily: theme.typography.fontFamilyMedium },
    big: { color: theme.colors.text, fontSize: 20, fontFamily: theme.typography.fontFamilyBold },
    unit: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily },
    macros: { flexDirection: "row", gap: 10, marginTop: 12 },
    water: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: BLUE_BG, borderRadius: 14, padding: 14, marginTop: 12 },
    waterTitle: { color: "#1B3A5C", fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    waterValue: { color: BLUE, fontSize: 16, marginTop: 2, fontFamily: theme.typography.fontFamilyBold },
    waterPct: { color: BLUE, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    status: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: theme.colors.card, borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: theme.colors.border },
    statusText: { color: "#2F8A00", fontSize: 18, marginTop: 2, fontFamily: theme.typography.fontFamilyBold },
  });