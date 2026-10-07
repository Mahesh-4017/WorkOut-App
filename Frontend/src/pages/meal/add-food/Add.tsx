import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useTheme } from "../../../theme/ThemeProvider";
import { FOOD_ROUTES } from "../../../navigation/foodRoutes";
import { defaultMeal, FoodItem, MealType, MEALS, useFood } from "../../../data/FoodProvider";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { MACRO_COLORS, MacroBox } from "../../../components/FoodUI";
import { ACCENT } from "../../running/data/Movementui";

export default function AddFood() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const food: FoodItem = params.food;
  const { theme } = useTheme();
  const { addEntry } = useFood();
  const s = createStyles(theme);

  const [qty, setQty] = useState(1);
  const [meal, setMeal] = useState<MealType>(params.meal ?? defaultMeal());

  const scale = (n: number) => Math.round(n * qty * 10) / 10;
  const kcal = Math.round(food.kcal * qty);

  const save = () => {
    addEntry({
      name: food.name,
      serving: food.serving,
      kcal,
      protein: scale(food.protein),
      carbs: scale(food.carbs),
      fat: scale(food.fat),
      meal,
      qty,
    });
    navigation.navigate(FOOD_ROUTES.HOME, { tab: "diary" });
  };

  return (
    <SafeAreaView style={s.screen}>
      <OnboardingHeader title="Add Food" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Text style={s.heroName}>{food.name}</Text>
          <Text style={s.heroSub}>per {qty === 1 ? "serving" : `${qty} servings`}</Text>
          <Text style={s.heroKcal}>{kcal} kcal</Text>
        </View>

        <Text style={s.heading}>Serving details</Text>
        <View style={s.field}>
          <Text style={s.fieldLabel}>Serving size</Text>
          <Text style={s.fieldValue}>{food.serving}</Text>
        </View>

        <View style={[s.field, { marginTop: 10 }]}>
          <Text style={s.fieldLabel}>Quantity</Text>
          <View style={s.stepper}>
            <Pressable onPress={() => setQty(q => Math.max(0.5, q - 0.5))} style={s.stepBtn} accessibilityLabel="Decrease quantity">
              <Text style={s.stepText}>−</Text>
            </Pressable>
            <Text style={s.qty}>{qty}</Text>
            <Pressable onPress={() => setQty(q => q + 0.5)} style={[s.stepBtn, s.stepPlus]} accessibilityLabel="Increase quantity">
              <Text style={[s.stepText, { color: theme.colors.onPrimary }]}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={s.macros}>
          <MacroBox label="Protein" grams={scale(food.protein)} color={MACRO_COLORS.protein} />
          <MacroBox label="Carbs" grams={scale(food.carbs)} color={MACRO_COLORS.carbs} />
          <MacroBox label="Fat" grams={scale(food.fat)} color={MACRO_COLORS.fat} />
        </View>

        <Text style={[s.heading, { marginTop: 18 }]}>Add to meal</Text>
        <View style={s.mealRow}>
          {MEALS.map(m => (
            <Pressable key={m} onPress={() => setMeal(m)} style={[s.mealChip, meal === m && s.mealChipActive]}>
              <Text style={[s.mealText, meal === m && s.mealTextActive]}>{m}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={s.bottom}>
        <PrimaryButton label="Add to diary" onPress={save} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    scroll: { paddingBottom: 20 },
    hero: { alignItems: "center", backgroundColor: theme.colors.surfaceAlt ?? theme.colors.card, borderRadius: 18, padding: 20, marginTop: 6 },
    heroName: { color: theme.colors.text, fontSize: 16, textAlign: "center", fontFamily: theme.typography.fontFamilyBold },
    heroSub: { color: theme.colors.muted, fontSize: 11, marginTop: 2, fontFamily: theme.typography.fontFamily },
    heroKcal: { color: ACCENT.purple, fontSize: 24, marginTop: 6, fontFamily: theme.typography.fontFamilyBold },
    heading: { color: theme.colors.text, fontSize: 14, marginTop: 18, marginBottom: 10, fontFamily: theme.typography.fontFamilyBold },
    field: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: theme.colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.border },
    fieldLabel: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily },
    fieldValue: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyMedium },
    stepper: { flexDirection: "row", alignItems: "center", gap: 14 },
    stepBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center" },
    stepPlus: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    stepText: { color: theme.colors.text, fontSize: 16, lineHeight: 18, fontFamily: theme.typography.fontFamilyBold },
    qty: { minWidth: 22, textAlign: "center", color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    macros: { flexDirection: "row", gap: 10, marginTop: 12 },
    mealRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    mealChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
    mealChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    mealText: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
    mealTextActive: { color: theme.colors.onPrimary, fontFamily: theme.typography.fontFamilyBold },
    bottom: { paddingBottom: 16, paddingTop: 8 },
  });