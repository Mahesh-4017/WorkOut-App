import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { FOOD_ROUTES } from "../../../navigation/foodRoutes";
import { POPULAR_FOODS, searchFoods } from "../../../api/nutrition";
import { FoodItem, useFood } from "../../../data/FoodProvider";
import { OnboardingHeader } from "../../../components/OnboardingUI";
import { ACCENT } from "../../running/data/Movementui";

export default function FoodSearch() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { recents, addRecent, clearRecents } = useFood();
  const s = createStyles(theme);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  // debounce the network search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    setFailed(false);
    const t = setTimeout(() => {
      searchFoods(q)
        .then(setResults)
        .catch(() => {
          setResults([]);
          setFailed(true);
        })
        .finally(() => setLoading(false));
    }, 450);
    return () => clearTimeout(t);
  }, [query]);

  const open = (food: FoodItem) => {
    if (query.trim()) addRecent(query.trim());
    navigation.navigate(FOOD_ROUTES.ADD_FOOD, { food });
  };

  const list = results ?? POPULAR_FOODS;

  return (
    <SafeAreaView style={s.screen}>
      <OnboardingHeader title="Food Search" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.search}>
          <Ionicons name="search" size={16} color={theme.colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search food, meal or brand"
            placeholderTextColor={theme.colors.muted}
            style={s.input}
            returnKeyType="search"
          />
          <Pressable onPress={() => navigation.navigate(FOOD_ROUTES.SCAN_INTRO)} hitSlop={10} accessibilityLabel="Scan a meal">
            <Ionicons name="scan-outline" size={18} color={theme.colors.text} />
          </Pressable>
        </View>

        {results === null && recents.length > 0 ? (
          <>
            <View style={s.rowBetween}>
              <Text style={s.heading}>Recent searches</Text>
              <Pressable onPress={clearRecents}>
                <Text style={s.clear}>Clear</Text>
              </Pressable>
            </View>
            <View style={s.chips}>
              {recents.map(r => (
                <Pressable key={r} onPress={() => setQuery(r)} style={s.chip}>
                  <Text style={s.chipText}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        <Text style={[s.heading, { marginTop: 18 }]}>{results === null ? "Popular foods" : "Results"}</Text>

        {loading ? <ActivityIndicator color={theme.colors.primaryDark} style={{ marginTop: 20 }} /> : null}
        {!loading && results !== null && results.length === 0 ? (
          <Text style={s.muted}>{failed ? "Search is unavailable right now. Check your connection." : "No foods found. Try another name."}</Text>
        ) : null}

        <View style={s.list}>
          {!loading &&
            list.map((f, i) => (
              <Pressable key={`${f.name}-${i}`} onPress={() => open(f)} style={[s.item, i > 0 && s.itemDivider]}>
                <View style={s.itemIcon}>
                  <Ionicons name="nutrition-outline" size={16} color={theme.colors.primaryDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={s.itemName}>
                    {f.name}
                  </Text>
                  <Text style={s.itemMeta}>
                    {Math.round(f.kcal)} kcal · {f.serving}
                  </Text>
                </View>
                <View style={s.plus}>
                  <Ionicons name="add" size={18} color={theme.colors.onPrimary} />
                </View>
              </Pressable>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    scroll: { paddingBottom: 30 },
    search: { flexDirection: "row", alignItems: "center", gap: 8, height: 44, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1.5, borderColor: ACCENT.purple, backgroundColor: theme.colors.surface },
    input: { flex: 1, color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamily },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18 },
    heading: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    clear: { color: ACCENT.purple, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: theme.colors.surfaceAlt ?? theme.colors.border },
    chipText: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamily },
    muted: { color: theme.colors.muted, fontSize: 13, marginTop: 14, fontFamily: theme.typography.fontFamily },
    list: { marginTop: 10, backgroundColor: theme.colors.card, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border },
    item: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
    itemDivider: { borderTopWidth: 1, borderTopColor: theme.colors.border },
    itemIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.surfaceAlt ?? theme.colors.border, alignItems: "center", justifyContent: "center" },
    itemName: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    itemMeta: { color: theme.colors.muted, fontSize: 11, marginTop: 2, fontFamily: theme.typography.fontFamily },
    plus: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
  });