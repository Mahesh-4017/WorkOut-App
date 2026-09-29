import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { responsiveFontSize, responsiveHeight } from "react-native-responsive-dimensions";
import { saveOnboarding } from "../../utils/onboarding";
import { ROUTES } from "../../navigation/routes";
import { useTheme } from "../../theme/ThemeProvider";

export default function BodyInfo() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [age, setAge] = useState(""); const [height, setHeight] = useState(""); const [weight, setWeight] = useState("");
  const valid = Boolean(age && height && weight);
  const field = (label: string, value: string, set: (v: string) => void, placeholder: string) => <View style={{ marginTop: 16 }}><Text style={{ fontFamily: theme.typography.fontFamilyMedium, color: theme.colors.text, marginBottom: 6 }}>{label}</Text><TextInput value={value} onChangeText={set} placeholder={placeholder} placeholderTextColor={theme.colors.muted} keyboardType="numeric" style={{ fontFamily: theme.typography.fontFamily, height: responsiveHeight(6.5), borderRadius: 14, borderWidth: 1.5, borderColor: theme.colors.border, color: theme.colors.text, paddingHorizontal: 16, fontSize: responsiveFontSize(2) }} /></View>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 22, paddingBottom: 20 }}><Pressable onPress={() => navigation.goBack()}><Text style={{ fontFamily: theme.typography.fontFamilyMedium, color: theme.colors.text, marginTop: 10, fontSize: responsiveFontSize(1.8) }}>← Back</Text></Pressable><Text style={{ fontFamily: theme.typography.fontFamilyMedium, color: theme.colors.primaryDark, marginTop: 24, fontWeight: theme.typography.weights.bold }}>Step 2 of 3</Text><Text style={{ fontFamily: theme.typography.fontFamilyBold, color: theme.colors.text, fontSize: responsiveFontSize(3.4), fontWeight: theme.typography.weights.heavy, marginTop: 8 }}>Tell us about yourself</Text>{field("Age", age, setAge, "e.g. 25")}{field("Height (cm)", height, setHeight, "e.g. 170")}{field("Weight (kg)", weight, setWeight, "e.g. 65")}<View style={{ flex: 1 }} /><Pressable disabled={!valid} style={{ height: responsiveHeight(6), borderRadius: 25, backgroundColor: theme.colors.primary, opacity: valid ? 1 : 0.4, alignItems: "center", justifyContent: "center" }} onPress={async () => { await saveOnboarding({ age: Number(age), height: Number(height), weight: Number(weight) }); navigation.navigate(ROUTES.GOAL); }}><Text style={{ fontFamily: theme.typography.fontFamilyBold, color: theme.colors.onPrimary, fontSize: responsiveFontSize(2), fontWeight: theme.typography.weights.bold }}>Continue</Text></Pressable></SafeAreaView>;
}
