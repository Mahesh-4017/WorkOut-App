import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { responsiveFontSize, responsiveHeight } from "react-native-responsive-dimensions";
import { useTheme } from "../theme/ThemeProvider";

type Choice = { label: string; value: string };
type Props = { step: string; title: string; options: Choice[]; onNext: (value: string) => void; onBack?: () => void };

export default function ChoiceScreen({ step, title, options, onNext, onBack }: Props) {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 22, paddingBottom: 20 }}>
      {onBack && <Pressable onPress={onBack}><Text style={{ color: theme.colors.text, marginTop: 10, fontSize: responsiveFontSize(1.8) }}>← Back</Text></Pressable>}
      <Text style={{ color: theme.colors.primaryDark, marginTop: 24, fontWeight: "700" }}>{step}</Text>
      <Text style={{ color: theme.colors.text, fontSize: responsiveFontSize(3.4), fontWeight: "800", marginTop: 8 }}>{title}</Text>
      <View style={{ marginTop: 24 }}>
        {options.map(option => {
          const active = selected === option.value;
          return <Pressable key={option.value} onPress={() => setSelected(option.value)} style={{ height: responsiveHeight(7), borderRadius: 16, borderWidth: 1.5, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.card : "transparent", justifyContent: "center", paddingHorizontal: 18, marginBottom: 12 }}><Text style={{ color: active ? theme.colors.primaryDark : theme.colors.text, fontSize: responsiveFontSize(2), fontWeight: "600" }}>{option.label}</Text></Pressable>;
        })}
      </View>
      <View style={{ flex: 1 }} />
      <Pressable disabled={!selected} onPress={() => selected && onNext(selected)} style={{ height: responsiveHeight(6), borderRadius: 25, backgroundColor: theme.colors.primary, opacity: selected ? 1 : 0.4, alignItems: "center", justifyContent: "center" }}><Text style={{ color: theme.colors.onPrimary, fontSize: responsiveFontSize(2), fontWeight: "700" }}>Continue</Text></Pressable>
    </SafeAreaView>
  );
}
