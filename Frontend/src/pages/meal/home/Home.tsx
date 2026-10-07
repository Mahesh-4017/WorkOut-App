import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { ROUTES } from "../../../navigation/routes";
import { FOOD_ROUTES } from "../../../navigation/foodRoutes";
import { MEALS, useFood } from "../../../data/FoodProvider";
import { PrimaryButton } from "../../../components/OnboardingUI";
import { ProgressRing, ScreenHeader, ACCENT } from "../../running/data/Movementui";
import { MACRO_COLORS, MacroRing } from "../../../components/FoodUI";

export default function FoodDiary() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { todayEntries, totals, goals, removeEntry } = useFood();
  const s = createStyles(theme);

  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const over = totals.kcal > goals.kcal * 1.05;

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Daily Food Diary" onBack={() => navigation.goBack()} onProfile={() => navigation.navigate(ROUTES.PROFILE)} />

        <View style={s.dateRow}>
          <View>
            <Text style={s.date}>{dateLabel}</Text>
            <Text style={s.headline}>{over ? "A bit over today" : "Stay on track today"}</Text>
          </View>
          <View style={[s.chip, over && { backgroundColor: "#FBE3D0" }]}>
            <Text style={s.chipText}>{over ? "Over goal" : "On track"}</Text>
          </View>
        </View>

        <Pressable onPress={() => navigation.navigate(FOOD_ROUTES.HOME, { tab: "calories" })} style={s.summary}>
          <ProgressRing size={118} stroke={11} progress={totals.kcal / goals.kcal}>
            <Text style={s.kcal}>{totals.kcal}</Text>
            <Text style={s.kcalSub}>of {goals.kcal.toLocaleString()} kcal</Text>
          </ProgressRing>
          <View style={s.macros}>
            <MacroRing label="Protein" grams={totals.protein} goal={goals.protein} color={MACRO_COLORS.protein} />
            <MacroRing label="Carbs" grams={totals.carbs} goal={goals.carbs} color={MACRO_COLORS.carbs} />
            <MacroRing label="Fat" grams={totals.fat} goal={goals.fat} color={MACRO_COLORS.fat} />
          </View>
        </Pressable>

        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Today's meals</Text>
          <Pressable onPress={() => navigation.navigate(FOOD_ROUTES.SCAN_INTRO)} style={s.scanLink}>
            <Ionicons name="scan-outline" size={14} color={ACCENT.purple} />
            <Text style={s.scanText}>Scan meal</Text>
          </Pressable>
        </View>

        {todayEntries.length === 0 ? (
          <Text style={s.empty}>Nothing logged yet. Add food or scan a meal to get started.</Text>
        ) : (
          MEALS.map(meal => {
            const items = todayEntries.filter(e => e.meal === meal);
            if (!items.length) return null;
            const sum = Math.round(items.reduce((a, e) => a + e.kcal, 0));
            return (
              <View key={meal} style={s.mealCard}>
                <View style={s.mealHead}>
                  <Text style={s.mealName}>{meal}</Text>
                  <Text style={s.mealKcal}>{sum} kcal</Text>
                </View>
                {items.map(e => (
                  <Pressable key={e.id} onLongPress={() => removeEntry(e.id)} style={s.entry}>
                    <View style={s.entryIcon}>
                      <Ionicons name="restaurant-outline" size={14} color={theme.colors.primaryDark} />
                    </View>
                    <Text numberOfLines={1} style={s.entryName}>
                      {e.name}
                    </Text>
                    <Text style={s.entryKcal}>{Math.round(e.kcal)} kcal</Text>
                  </Pressable>
                ))}
              </View>
            );
          })
        )}
        {todayEntries.length > 0 ? <Text style={s.hint}>Press and hold an item to delete it.</Text> : null}

        <View style={{ marginTop: 14 }}>
          <PrimaryButton label="+  Add food" onPress={() => navigation.navigate(FOOD_ROUTES.FOOD_SEARCH)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingHorizontal: 18, paddingBottom: 24 },
    dateRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 4 },
    date: { color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily },
    headline: { color: theme.colors.text, fontSize: 16, marginTop: 2, fontFamily: theme.typography.fontFamilyBold },
    chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: "#FBEBC8" },
    chipText: { color: "#7A4B00", fontSize: 10, fontFamily: theme.typography.fontFamilyBold },
    summary: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: 16,
      marginTop: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    kcal: { color: theme.colors.text, fontSize: 28, fontFamily: theme.typography.fontFamilyBold },
    kcalSub: { color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamily },
    macros: { flexDirection: "row", gap: 14 },
    sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 22, marginBottom: 10 },
    sectionTitle: { color: theme.colors.text, fontSize: 16, fontFamily: theme.typography.fontFamilyBold },
    scanLink: { flexDirection: "row", alignItems: "center", gap: 4 },
    scanText: { color: ACCENT.purple, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    empty: { color: theme.colors.muted, fontSize: 13, lineHeight: 19, fontFamily: theme.typography.fontFamily },
    mealCard: { backgroundColor: theme.colors.card, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border },
    mealHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    mealName: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    mealKcal: { color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
    entry: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.colors.border },
    entryIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: theme.colors.surfaceAlt ?? theme.colors.border, alignItems: "center", justifyContent: "center" },
    entryName: { flex: 1, color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyMedium },
    entryKcal: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily },
    hint: { color: theme.colors.muted, fontSize: 10, textAlign: "center", marginTop: 2, fontFamily: theme.typography.fontFamily },
  });