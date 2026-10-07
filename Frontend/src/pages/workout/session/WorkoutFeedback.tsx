import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { useSession } from "../../../data/SessionProvider";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { ChipGroup } from "../../../components/WorkoutUI";

const EFFORT = ["Too easy", "Easy", "Just right", "Hard", "Very hard"];
const FEELINGS = ["Energized", "Strong", "Tired", "Sore"];

export default function WorkoutFeedback() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const { history, saveFeedback } = useSession();
  const styles = createStyles(theme);
  const entry = history.find(item => item.id === params?.id);
  const [rating, setRating] = useState(0);
  const [effort, setEffort] = useState(0);
  const [feel, setFeel] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const done = () => navigation.navigate(WORKOUT_ROUTES.HISTORY);
  const submit = async () => {
    try {
      if (entry) {
        await saveFeedback(entry.id, {
          rating: rating || undefined,
          effort: effort || undefined,
          feel,
          note: note.trim() || undefined,
        });
      }
      done();
    } catch (error) {
      Alert.alert("Unable to save feedback", error instanceof Error ? error.message : "Please try again.");
    }
  };
  const date = entry
    ? new Date(entry.startedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "";

  return (
    <SafeAreaView style={styles.screen}>
      <OnboardingHeader title="Workout feedback" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>How did that feel?</Text>
          {entry ? <Text style={styles.subtitle}>{entry.title} · {date}</Text> : null}

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(value => (
              <Pressable
                key={value}
                onPress={() => setRating(value)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`${value} star${value > 1 ? "s" : ""}`}
                accessibilityState={{ selected: value === rating }}
              >
                <Ionicons
                  name={value <= rating ? "star" : "star-outline"}
                  size={36}
                  color={value <= rating ? theme.colors.primaryDark : theme.colors.muted}
                />
              </Pressable>
            ))}
          </View>

          <Text style={styles.heading}>Effort level</Text>
          <View style={styles.effortRow}>
            {EFFORT.map((label, index) => {
              const selected = effort === index + 1;
              return (
                <Pressable
                  key={label}
                  onPress={() => setEffort(index + 1)}
                  style={[styles.effort, selected && styles.effortSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={label}
                >
                  <Text style={[styles.effortNumber, selected && styles.effortNumberSelected]}>
                    {index + 1}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.effortLabels}>
            <Text style={styles.small}>{EFFORT[0]}</Text>
            <Text style={styles.small}>{effort ? EFFORT[effort - 1] : "Tap to choose"}</Text>
            <Text style={styles.small}>{EFFORT[4]}</Text>
          </View>

          <Text style={styles.heading}>How's your body?</Text>
          <ChipGroup multi options={FEELINGS} value={feel} onChange={setFeel} />

          <Text style={styles.heading}>Anything to add? (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Ready for the next one…"
            placeholderTextColor={theme.colors.muted}
            multiline
            style={styles.input}
          />
          <Text style={styles.hint}>Your notes help us suggest the right workouts next time.</Text>
        </ScrollView>

        <View style={styles.bottom}>
          <PrimaryButton label="Submit feedback" onPress={submit} />
          <Pressable onPress={done} style={styles.skip} hitSlop={8} accessibilityRole="button">
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    keyboard: { flex: 1 },
    scroll: { paddingBottom: 16 },
    title: { color: theme.colors.text, fontSize: 24, marginTop: 8, fontFamily: theme.typography.fontFamilyBold },
    subtitle: { color: theme.colors.muted, fontSize: 12, marginTop: 4, fontFamily: theme.typography.fontFamily },
    stars: { flexDirection: "row", justifyContent: "space-between", marginTop: 18, paddingHorizontal: 6 },
    heading: { color: theme.colors.text, fontSize: 14, marginTop: 22, marginBottom: 10, fontFamily: theme.typography.fontFamilyBold },
    effortRow: { flexDirection: "row", gap: 8 },
    effort: { flex: 1, height: 40, borderRadius: 10, backgroundColor: theme.colors.surfaceAlt ?? theme.colors.border, alignItems: "center", justifyContent: "center" },
    effortSelected: { backgroundColor: theme.colors.primary },
    effortNumber: { color: theme.colors.muted, fontSize: 14, fontFamily: theme.typography.fontFamilyMedium },
    effortNumberSelected: { color: theme.colors.onPrimary, fontFamily: theme.typography.fontFamilyBold },
    effortLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
    small: { color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamily },
    input: { minHeight: 80, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 12, color: theme.colors.text, fontSize: 13, textAlignVertical: "top", fontFamily: theme.typography.fontFamily },
    hint: { color: theme.colors.muted, fontSize: 10, marginTop: 6, fontFamily: theme.typography.fontFamily },
    bottom: { paddingBottom: 16, paddingTop: 8 },
    skip: { alignItems: "center", marginTop: 12 },
    skipText: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
  });
