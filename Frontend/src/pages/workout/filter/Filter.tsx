import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { CATALOG, EMPTY_FILTERS, FILTER_OPTIONS, Filters, filterWorkouts } from "../../../data/workoutCatalog";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { ChipGroup } from "../../../components/WorkoutUI";

export default function WorkoutFilters() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const s = createStyles(theme);

  const [f, setF] = useState<Filters>(params?.filters ?? EMPTY_FILTERS);
  const count = filterWorkouts(CATALOG, f).length;

  const apply = () => navigation.navigate({ name: WORKOUT_ROUTES.SEARCH, params: { filters: f }, merge: true });
  const one = (v: string | null) => (v ? [v] : []);

  const group = (label: string, children: React.ReactNode) => (
    <View style={s.group}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={s.screen}>
      <OnboardingHeader title="Workout filters" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Find your kind of move.</Text>
        <Text style={s.sub}>Choose your focus. Mix and match to fit today.</Text>

        {group("Workout type", <ChipGroup multi options={FILTER_OPTIONS.types} value={f.types} onChange={types => setF({ ...f, types })} />)}
        {group("Duration", <ChipGroup options={FILTER_OPTIONS.duration} value={one(f.duration)} onChange={v => setF({ ...f, duration: v[0] ?? null })} />)}
        {group("Experience level", <ChipGroup options={FILTER_OPTIONS.level} value={one(f.level)} onChange={v => setF({ ...f, level: v[0] ?? null })} />)}
        {group("Equipment", <ChipGroup multi options={FILTER_OPTIONS.equipment} value={f.equipment} onChange={equipment => setF({ ...f, equipment })} />)}
        {group("Muscle focus", <ChipGroup options={FILTER_OPTIONS.muscle} value={one(f.muscle)} onChange={v => setF({ ...f, muscle: v[0] ?? null })} />)}

        <Text style={s.note}>
          {count} workout{count === 1 ? "" : "s"} match your preference. Filters apply to search and explore.
        </Text>
      </ScrollView>

      <View style={s.bottom}>
        <PrimaryButton label={`Show ${count} workout${count === 1 ? "" : "s"}`} onPress={apply} disabled={count === 0} />
        <Pressable onPress={() => setF(EMPTY_FILTERS)} style={s.reset} accessibilityRole="button">
          <Text style={s.resetText}>Reset filters</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    scroll: { paddingBottom: 20 },
    title: { color: theme.colors.text, fontSize: 22, marginTop: 8, fontFamily: theme.typography.fontFamilyBold },
    sub: { color: theme.colors.muted, fontSize: 12, marginTop: 4, marginBottom: 6, fontFamily: theme.typography.fontFamily },
    group: { marginTop: 16 },
    label: { color: theme.colors.text, fontSize: 14, marginBottom: 8, fontFamily: theme.typography.fontFamilyBold },
    note: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 20, fontFamily: theme.typography.fontFamily },
    bottom: { gap: 10, paddingBottom: 16, paddingTop: 8 },
    reset: { height: 50, borderRadius: 25, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, alignItems: "center", justifyContent: "center" },
    resetText: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
  });