import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useTheme } from "../../../theme/ThemeProvider";
import { FOOD_ROUTES } from "../../../navigation/foodRoutes";
import { analyzeMealImage, MealResult } from "../../../api/nutrition";
import { defaultMeal, GOALS, useFood } from "../../../data/FoodProvider";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { MACRO_COLORS, MacroRing } from "../../../components/FoodUI";

export default function MealAnalysis() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const { addEntry } = useFood();
  const s = createStyles(theme);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MealResult | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await analyzeMealImage(params.uri, params.mimeType));
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [params.mimeType, params.uri]);

  useEffect(() => {
    run();
  }, [run]);

  const addMeal = () => {
    if (!result) return;
    addEntry({ ...result, meal: defaultMeal(), qty: 1 });
    navigation.navigate(FOOD_ROUTES.HOME, { tab: "diary" });
  };

  return (
    <SafeAreaView style={s.screen}>
      <OnboardingHeader title="Meal Analysis" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: params.uri }} style={s.photo} />

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator color={theme.colors.primaryDark} />
            <Text style={s.muted}>Analyzing your meal…</Text>
          </View>
        ) : error || !result ? (
          <View style={s.center}>
            <Text style={s.errorText}>{error}</Text>
            <Pressable onPress={run} style={s.retry}>
              <Text style={s.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={s.center}>
              <Text style={s.kcal}>{Math.round(result.kcal)} kcal</Text>
              <Text style={s.desc}>{result.description || result.name}</Text>
            </View>

            <View style={s.macros}>
              <MacroRing label="Protein" grams={result.protein} goal={GOALS.protein} color={MACRO_COLORS.protein} />
              <MacroRing label="Carbs" grams={result.carbs} goal={GOALS.carbs} color={MACRO_COLORS.carbs} />
              <MacroRing label="Fat" grams={result.fat} goal={GOALS.fat} color={MACRO_COLORS.fat} />
            </View>

            <View style={s.scoreRow}>
              <Text style={s.scoreLabel}>Healthy score</Text>
              <Text style={s.scoreValue}>{result.healthScore}/10</Text>
            </View>
            <View style={s.track}>
              <View style={[s.fill, { width: `${Math.min(result.healthScore, 10) * 10}%` }]} />
            </View>
            <Text style={s.note}>Photo estimates can be off. Use Edit details to adjust.</Text>

            <View style={s.buttons}>
              <Pressable
                onPress={() => navigation.navigate(FOOD_ROUTES.ADD_FOOD, { food: result })}
                style={s.outline}
                accessibilityRole="button"
              >
                <Text style={s.outlineText}>Edit details</Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <PrimaryButton label="Add meal" onPress={addMeal} />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 20 },
    scroll: { paddingBottom: 30 },
    photo: { width: "100%", height: 170, borderRadius: 18, backgroundColor: theme.colors.border, marginTop: 6 },
    center: { alignItems: "center", marginTop: 22, gap: 8 },
    muted: { color: theme.colors.muted, fontSize: 13, fontFamily: theme.typography.fontFamily },
    kcal: { color: theme.colors.text, fontSize: 34, fontFamily: theme.typography.fontFamilyBold },
    desc: { color: theme.colors.muted, fontSize: 12, textAlign: "center", fontFamily: theme.typography.fontFamily },
    macros: { flexDirection: "row", justifyContent: "space-around", marginTop: 22 },
    scoreRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
    scoreLabel: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    scoreValue: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
    track: { height: 7, borderRadius: 4, backgroundColor: theme.colors.border, marginTop: 6, overflow: "hidden" },
    fill: { height: "100%", borderRadius: 4, backgroundColor: "#7B4EF0" },
    note: { color: theme.colors.muted, fontSize: 11, marginTop: 10, fontFamily: theme.typography.fontFamily },
    buttons: { flexDirection: "row", gap: 12, marginTop: 22, alignItems: "center" },
    outline: { flex: 1, height: 54, borderRadius: 27, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, alignItems: "center", justifyContent: "center" },
    outlineText: { color: theme.colors.text, fontSize: 15, fontFamily: theme.typography.fontFamilyBold },
    errorText: { color: theme.colors.text, fontSize: 14, textAlign: "center", fontFamily: theme.typography.fontFamilyMedium },
    retry: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: theme.colors.primary },
    retryText: { color: theme.colors.onPrimary, fontFamily: theme.typography.fontFamilyBold },
  });