import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { responsiveFontSize, responsiveHeight } from "react-native-responsive-dimensions";
import { useTheme } from "../theme/ThemeProvider";

type Choice = { label: string; value: string };
type Props = { step: string; title: string; options: Choice[]; onNext: (value: string) => void; onBack?: () => void };

export default function ChoiceScreen({ step, title, options, onNext, onBack }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <SafeAreaView style={styles.screen}>
      {onBack && <Pressable onPress={onBack}><Text style={styles.back}>← Back</Text></Pressable>}
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.options}>
        {options.map(option => {
          const active = selected === option.value;
          return <Pressable key={option.value} onPress={() => setSelected(option.value)} style={[styles.option, active && styles.optionActive]}><Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text></Pressable>;
        })}
      </View>
      <View style={styles.spacer} />
      <Pressable disabled={!selected} onPress={() => selected && onNext(selected)} style={[styles.continueButton, !selected && styles.disabled]}><Text style={styles.continueText}>Continue</Text></Pressable>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 22, paddingBottom: 20 },
  back: { fontFamily: theme.typography.fontFamilyMedium, color: theme.colors.text, marginTop: 10, fontSize: responsiveFontSize(1.8) },
  step: { fontFamily: theme.typography.fontFamilyMedium, color: theme.colors.primaryDark, marginTop: 24, fontWeight: theme.typography.weights.bold },
  title: { fontFamily: theme.typography.fontFamilyBold, color: theme.colors.text, fontSize: responsiveFontSize(3.4), fontWeight: theme.typography.weights.heavy, marginTop: 8 },
  options: { marginTop: 24 },
  option: { height: responsiveHeight(7), borderRadius: 12, borderWidth: 1.5, borderColor: theme.colors.border, justifyContent: "center", paddingHorizontal: 18, marginBottom: 12 },
  optionActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.card },
  optionText: { fontFamily: theme.typography.fontFamilyMedium, color: theme.colors.text, fontSize: responsiveFontSize(2), fontWeight: theme.typography.weights.semibold },
  optionTextActive: { color: theme.colors.primaryDark },
  spacer: { flex: 1 },
  continueButton: { height: responsiveHeight(6), borderRadius: 25, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.4 },
  continueText: { fontFamily: theme.typography.fontFamilyBold, color: theme.colors.onPrimary, fontSize: responsiveFontSize(2), fontWeight: theme.typography.weights.bold },
});
