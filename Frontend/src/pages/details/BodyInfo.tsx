import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { saveOnboarding } from "../../utils/onboarding";
import { ROUTES } from "../../navigation/routes";
import { useTheme } from "../../theme/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../api/user";
import { OnboardingHeader, PrimaryButton, ProgressBar, Segmented, StepFooter } from "./Onboardingui";

type Units = "metric" | "imperial";

export default function BodyInfo() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = createStyles(theme);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [units, setUnits] = useState<Units>("metric");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const metric = units === "metric";
  const valid = Boolean(name.trim() && age && height && weight);

  const card = (label: string, value: string, set: (v: string) => void, opts: { numeric?: boolean; suffix?: string; placeholder?: string } = {}) => (
    <View style={s.card}>
      <Text style={s.cardLabel}>{label}</Text>
      <View style={s.cardRow}>
        <TextInput
          value={value}
          onChangeText={set}
          placeholder={opts.placeholder}
          placeholderTextColor={theme.colors.muted}
          keyboardType={opts.numeric ? "numeric" : "default"}
          style={s.cardInput}
        />
        {opts.suffix ? <Text style={s.suffix}>{opts.suffix}</Text> : null}
      </View>
    </View>
  );

  const onContinue = async () => {
    // Always store metric values
    const h = Number(height);
    const w = Number(weight);
    const data = {
      name: name.trim(),
      age: Number(age),
      units,
      height: metric ? h : Math.round(h * 2.54 * 10) / 10, // in -> cm
      weight: metric ? w : Math.round(w * 0.45359237 * 10) / 10, // lb -> kg
    };
    await saveOnboarding(data);
    if (user) await updateUserProfile(data);
    navigation.navigate(ROUTES.GOAL);
  };

  return (
    <SafeAreaView style={s.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <OnboardingHeader title="Personal measurements" onBack={() => navigation.goBack()} />
        <ProgressBar progress={0.5} />

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={s.title}>Let's make it personal.</Text>
          <Text style={s.subtitle}>A few details help us tailor your workouts and health estimates.</Text>

          {card("Name", name, setName, { placeholder: "Your name" })}
          {card("Age", age, setAge, { numeric: true, suffix: "years", placeholder: "29" })}

          <View style={{ marginTop: 12 }}>
            <Segmented
              value={units}
              onChange={setUnits}
              options={[
                { label: "Metric", value: "metric" },
                { label: "Imperial", value: "imperial" },
              ]}
            />
          </View>

          <View style={s.twoCol}>
            <View style={{ flex: 1 }}>
              {card("Height", height, setHeight, { numeric: true, suffix: metric ? "cm" : "in", placeholder: metric ? "172" : "68" })}
            </View>
            <View style={{ flex: 1 }}>
              {card("Weight", weight, setWeight, { numeric: true, suffix: metric ? "kg" : "lb", placeholder: metric ? "72.4" : "160" })}
            </View>
          </View>

          <View style={s.note}>
            <Text style={s.noteTitle}>For your eyes only</Text>
            <Text style={s.noteBody}>Your measurements stay private. You can update them anytime in your profile.</Text>
          </View>
        </ScrollView>

        <View style={s.bottom}>
          <PrimaryButton label="Continue" onPress={onContinue} disabled={!valid} />
          <StepFooter text="Step 1 of 2 · Personal setup" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 20 },
    scroll: { paddingTop: 22, paddingBottom: 16 },
    title: { color: theme.colors.text, fontSize: 26, lineHeight: 32, fontFamily: theme.typography.fontFamilyBold },
    subtitle: { color: theme.colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 18, fontFamily: theme.typography.fontFamily },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginTop: 12,
    },
    cardLabel: { color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily },
    cardRow: { flexDirection: "row", alignItems: "center" },
    cardInput: { flex: 1, paddingVertical: 4, color: theme.colors.text, fontSize: 15, fontFamily: theme.typography.fontFamilyMedium },
    suffix: { color: theme.colors.text, fontSize: 15, fontFamily: theme.typography.fontFamilyMedium },
    twoCol: { flexDirection: "row", gap: 12 },
    note: { backgroundColor: theme.colors.surfaceAlt ?? theme.colors.border, borderRadius: 12, padding: 14, marginTop: 16 },
    noteTitle: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    noteBody: { color: theme.colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4, fontFamily: theme.typography.fontFamily },
    bottom: { paddingBottom: 16, paddingTop: 8 },
  });