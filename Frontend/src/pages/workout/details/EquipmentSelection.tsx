import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { EQUIPMENT_OPTIONS } from "../../../data/workoutDetails";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { NoteCard } from "../../../components/WorkoutDetailUI";
import { TINTS } from "../../../data/workoutCatalog";

export default function EquipmentSelection() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [selected, setSelected] = useState<string[]>(
    params?.equipment?.length ? params.equipment : ["Dumbbells"],
  );
  const [weight, setWeight] = useState<number>(params?.weight ?? 8);

  const toggle = (id: string) => {
    if (id === "No equipment") {
      setSelected(["No equipment"]);
      return;
    }
    setSelected(current => {
      const withoutNone = current.filter(item => item !== "No equipment");
      return withoutNone.includes(id)
        ? withoutNone.filter(item => item !== id)
        : [...withoutNone, id];
    });
  };

  const hasWeights = selected.includes("Dumbbells") || selected.includes("Kettlebell");
  const apply = () => navigation.navigate({
    name: WORKOUT_ROUTES.DETAILS,
    params: {
      workoutId: params?.workoutId,
      equipment: selected.length ? selected : ["No equipment"],
      weight,
    },
    merge: true,
  });

  return (
    <SafeAreaView style={styles.screen}>
      <OnboardingHeader title="Equipment selection" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What's available?</Text>
        <Text style={styles.sub}>We'll adjust your workout to the equipment you have.</Text>

        {EQUIPMENT_OPTIONS.map(option => {
          const selectedOption = selected.includes(option.id);
          return (
            <Pressable
              key={option.id}
              onPress={() => toggle(option.id)}
              style={[styles.option, selectedOption && styles.optionOn]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selectedOption }}
            >
              <View style={styles.optionCopy}>
                <Text style={styles.optName}>{option.id}</Text>
                <Text style={styles.optSub}>{option.sub}</Text>
              </View>
              <View style={[styles.check, selectedOption && styles.checkOn]}>
                {selectedOption ? <Ionicons name="checkmark" size={13} color={theme.colors.onPrimary} /> : null}
              </View>
            </Pressable>
          );
        })}

        {hasWeights ? (
          <View style={styles.weightCard}>
            <Text style={styles.weightLabel}>Your dumbbell weight</Text>
            <View style={styles.stepper}>
              <Pressable onPress={() => setWeight(value => Math.max(1, value - 1))} style={styles.stepBtn} accessibilityLabel="Lighter">
                <Text style={styles.stepText}>−</Text>
              </Pressable>
              <Text style={styles.weight}>{weight} kg</Text>
              <Pressable onPress={() => setWeight(value => Math.min(40, value + 1))} style={[styles.stepBtn, styles.stepPlus]} accessibilityLabel="Heavier">
                <Text style={[styles.stepText, { color: theme.colors.onPrimary }]}>+</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.note}>
          <NoteCard tint={TINTS.peach} title="No perfect setup needed" body="Pick what you have and we'll adjust the moves and loads to match." />
        </View>
      </ScrollView>
      <View style={styles.bottom}>
        <PrimaryButton label="Use selected equipment" onPress={apply} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    scroll: { paddingBottom: 16 },
    title: { color: theme.colors.text, fontSize: 22, marginTop: 8, fontFamily: theme.typography.fontFamilyBold },
    sub: { color: theme.colors.muted, fontSize: 12, marginTop: 4, marginBottom: 14, fontFamily: theme.typography.fontFamily },
    option: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
    optionOn: { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
    optionCopy: { flex: 1 },
    optName: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    optSub: { color: theme.colors.muted, fontSize: 11, marginTop: 2, fontFamily: theme.typography.fontFamily },
    check: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.muted, alignItems: "center", justifyContent: "center" },
    checkOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    weightCard: { backgroundColor: theme.colors.card, borderRadius: 12, padding: 14, marginTop: 6, borderWidth: 1, borderColor: theme.colors.border },
    weightLabel: { color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily },
    stepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
    weight: { color: theme.colors.text, fontSize: 18, fontFamily: theme.typography.fontFamilyBold },
    stepBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center" },
    stepPlus: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    stepText: { color: theme.colors.text, fontSize: 18, lineHeight: 20, fontFamily: theme.typography.fontFamilyBold },
    note: { marginTop: 14 },
    bottom: { paddingBottom: 16, paddingTop: 8 },
  });
