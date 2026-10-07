import React from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { getPublicExercise, PublicExercise } from "../../../api/exercises";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { useTheme } from "../../../theme/ThemeProvider";
import { resolveApiMediaUrl } from "../../../api/client";

export default function LibraryExerciseDetails() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const s = createStyles(theme);
  const [exercise, setExercise] = React.useState<PublicExercise | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [videoError, setVideoError] = React.useState<string | null>(null);
  const id = params?.exerciseId as string | undefined;

  React.useEffect(() => {
    let mounted = true;
    if (!id) {
      setError("Exercise details are unavailable.");
      setLoading(false);
      return () => {
        mounted = false;
      };
    }
    getPublicExercise(id)
      .then(result => {
        if (mounted) setExercise(result);
      })
      .catch(loadError => {
        if (mounted) setError(loadError instanceof Error ? loadError.message : "Unable to load exercise details.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  const openVideo = async () => {
    if (!exercise?.videoUrl) return;
    try {
      const supported = await Linking.canOpenURL(exercise.videoUrl);
      if (!supported) throw new Error("This video link can't be opened on this device.");
      await Linking.openURL(exercise.videoUrl);
      setVideoError(null);
    } catch (openError) {
      setVideoError(openError instanceof Error ? openError.message : "Unable to open the exercise video.");
    }
  };

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <OnboardingHeader title="Exercise details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {loading ? <Text style={s.message}>Loading exercise…</Text> : null}
        {!loading && error ? <Text style={s.message}>{error}</Text> : null}
        {!loading && !error && exercise ? (
          <>
            <View style={s.imageWrap}>
              {exercise.imageUrl ? (
                <Image source={{ uri: resolveApiMediaUrl(exercise.imageUrl) }} style={s.image} resizeMode="cover" />
              ) : <View style={[s.image, s.imageFallback]}><Ionicons name="barbell-outline" size={44} color={theme.colors.primary} /></View>}
              <View style={s.categoryBadge}><Text style={s.categoryText}>{exercise.bodyPart.toUpperCase()} · {exercise.category.toUpperCase()}</Text></View>
            </View>
            <Text style={s.title}>{exercise.title}</Text>
            <Text style={s.description}>{exercise.description || "Follow this guided movement at a comfortable pace."}</Text>

            <View style={s.stats}>
              <View style={s.stat}><Text style={s.statValue}>{exercise.durationMinutes}</Text><Text style={s.statLabel}>MINUTES</Text></View>
              <View style={s.stat}><Text style={s.statValue}>{exercise.level}</Text><Text style={s.statLabel}>LEVEL</Text></View>
            </View>

            {exercise.muscles.length || exercise.equipment.length ? (
              <View style={s.tags}>
                {[...exercise.muscles, ...exercise.equipment].map((tag, index) => (
                  <Text key={`${tag}-${index}`} style={s.tag}>{tag}</Text>
                ))}
              </View>
            ) : null}

            {exercise.instructions.length ? (
              <View style={s.instructions}>
                <Text style={s.sectionTitle}>Exercise instructions</Text>
                {exercise.instructions.map((instruction, index) => (
                  <View key={`${index}-${instruction}`} style={s.instructionRow}>
                    <View style={s.number}><Text style={s.numberText}>{index + 1}</Text></View>
                    <Text style={s.instruction}>{instruction}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {videoError ? <Text accessibilityRole="alert" style={s.error}>{videoError}</Text> : null}
          </>
        ) : null}
      </ScrollView>
      {!loading && exercise ? (
        <View style={s.footer}>
          <PrimaryButton label="Watch exercise video" onPress={openVideo} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
  scroll: { paddingBottom: 20 },
  message: { color: theme.colors.muted, fontSize: 13, marginTop: 18, fontFamily: theme.typography.fontFamily },
  imageWrap: { height: 220, marginTop: 8, borderRadius: 17, overflow: "hidden", backgroundColor: theme.colors.card },
  image: { width: "100%", height: "100%" },
  imageFallback: { alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surfaceAlt ?? theme.colors.card },
  categoryBadge: { position: "absolute", left: 10, top: 10, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(0,0,0,.68)" },
  categoryText: { color: "#fff", fontSize: 9, fontFamily: theme.typography.fontFamilyBold },
  title: { color: theme.colors.text, fontSize: 23, marginTop: 16, fontFamily: theme.typography.fontFamilyBold },
  description: { color: theme.colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6, fontFamily: theme.typography.fontFamily },
  stats: { flexDirection: "row", gap: 10, marginTop: 16 },
  stat: { flex: 1, padding: 13, borderRadius: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  statValue: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
  statLabel: { color: theme.colors.muted, fontSize: 9, marginTop: 3, letterSpacing: .6, fontFamily: theme.typography.fontFamilyMedium },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 14 },
  tag: { overflow: "hidden", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, color: theme.colors.text, backgroundColor: theme.colors.surfaceAlt ?? theme.colors.card, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
  instructions: { marginTop: 22 },
  sectionTitle: { color: theme.colors.text, fontSize: 16, marginBottom: 10, fontFamily: theme.typography.fontFamilyBold },
  instructionRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, marginBottom: 8, borderRadius: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  number: { width: 23, height: 23, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: theme.colors.primary },
  numberText: { color: theme.colors.onPrimary, fontSize: 11, fontFamily: theme.typography.fontFamilyBold },
  instruction: { flex: 1, color: theme.colors.text, fontSize: 12, lineHeight: 18, fontFamily: theme.typography.fontFamily },
  error: { color: theme.colors.error ?? "#b84d4d", fontSize: 12, marginTop: 10, fontFamily: theme.typography.fontFamily },
  footer: { paddingTop: 8, paddingBottom: 16 },
});
