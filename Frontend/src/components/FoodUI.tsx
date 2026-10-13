import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { ProgressRing } from "../pages/running/data/Movementui";

export function useMacroColors() {
  const { theme } = useTheme();
  return { protein: theme.colors.accent, carbs: theme.colors.primary, fat: theme.colors.warning };
}

export function useHydrationColors() {
  const { theme } = useTheme();
  return { foreground: theme.colors.accent, background: theme.colors.panel };
}

/** Small ring with grams underneath, used for protein / carbs / fat. */
export function MacroRing({ label, grams, goal, color }: { label: string; grams: number; goal: number; color: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      <ProgressRing size={46} stroke={5} progress={goal ? grams / goal : 0} color={color} />
      <Text style={{ color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyBold }}>{Math.round(grams)}g</Text>
      <Text style={{ color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamily }}>{label}</Text>
    </View>
  );
}

/** Boxed macro value (PROTEIN 34g). */
export function MacroBox({ label, grams, color }: { label: string; grams: number; color: string }) {
  const { theme } = useTheme();
  const s = StyleSheet.create({
    box: { flex: 1, backgroundColor: theme.colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.border },
    label: { color: theme.colors.muted, fontSize: 10, letterSpacing: 0.5, fontFamily: theme.typography.fontFamilyMedium },
    value: { color, fontSize: 18, marginTop: 4, fontFamily: theme.typography.fontFamilyBold },
  });
  return (
    <View style={s.box}>
      <Text style={s.label}>{label.toUpperCase()}</Text>
      <Text style={s.value}>{Math.round(grams * 10) / 10}g</Text>
    </View>
  );
}