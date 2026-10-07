import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { FOOD_ROUTES } from "../../../navigation/foodRoutes";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";

const TIPS = [
  "Center the meal in the frame",
  "Use good, even lighting",
  "Keep the food steady while you shoot",
  "Include all items on the plate",
];

export default function ScanMealIntro() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const s = createStyles(theme);

  return (
    <SafeAreaView style={s.screen}>
      <OnboardingHeader title="Scan Meal Intro" onBack={() => navigation.goBack()} />
      <View style={s.body}>
        <View style={s.card}>
          <Text style={s.title}>Ready to scan your meal?</Text>
          <Text style={s.text}>Take a quick photo and we'll estimate calories, protein, carbs and fat for you.</Text>
          {TIPS.map(t => (
            <View key={t} style={s.tip}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.primaryDark} />
              <Text style={s.tipText}>{t}</Text>
            </View>
          ))}
          <Text style={s.note}>Photo estimates can be off. You can always edit the result.</Text>
          <PrimaryButton label="Got it" onPress={() => navigation.navigate(FOOD_ROUTES.SCAN_CAMERA)} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 20 },
    body: { flex: 1, justifyContent: "flex-end", paddingBottom: 24 },
    card: { backgroundColor: theme.colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: theme.colors.border },
    title: { color: theme.colors.text, fontSize: 20, fontFamily: theme.typography.fontFamilyBold },
    text: { color: theme.colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 14, fontFamily: theme.typography.fontFamily },
    tip: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
    tipText: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyMedium },
    note: { color: theme.colors.muted, fontSize: 11, marginVertical: 14, fontFamily: theme.typography.fontFamily },
  });