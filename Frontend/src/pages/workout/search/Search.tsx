import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { getAllPublicExercises, PublicExercise } from "../../../api/exercises";
import { resolveApiMediaUrl } from "../../../api/client";
import { OnboardingHeader } from "../../../components/OnboardingUI";
import BottomTabBar from "../../../components/BottomTabBar";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { useWorkouts } from "../../../data/WorkoutProvider";
import { useTheme } from "../../../theme/ThemeProvider";

export default function WorkoutSearch() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const { isFavorite, toggleFavorite } = useWorkouts();
  const s = createStyles(theme);
  const bodyPart = params?.bodyPart as string | undefined;
  const category = params?.category as string | undefined;
  const title = (params?.title as string | undefined) || category || bodyPart || "Workout library";
  const [query, setQuery] = React.useState<string>(params?.query ?? "");
  const [exercises, setExercises] = React.useState<PublicExercise[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getAllPublicExercises({ bodyPart, category, search: query })
      .then(items => {
        if (mounted) setExercises(items);
      })
      .catch(loadError => {
        if (mounted) setError(loadError instanceof Error ? loadError.message : "Unable to load exercises.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [bodyPart, category, query]);

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <View style={s.header}>
        <OnboardingHeader title={title} onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.search}>
          <Ionicons name="search" size={16} color={theme.colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Search ${category || bodyPart || "workout exercises"}`}
            placeholderTextColor={theme.colors.muted}
            style={s.input}
            accessibilityLabel="Search exercises"
          />
          {query ? (
            <Pressable onPress={() => setQuery("")} hitSlop={10} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={16} color={theme.colors.muted} />
            </Pressable>
          ) : null}
        </View>
        <View style={s.resultsHeader}>
          <View>
            <Text style={s.heading}>{category || bodyPart || "Published exercises"}</Text>
            <Text style={s.sub}>{exercises.length} exercise{exercises.length === 1 ? "" : "s"}</Text>
          </View>
          <Pressable onPress={() => navigation.navigate(WORKOUT_ROUTES.COLLECTIONS)} accessibilityRole="button">
            <Text style={s.collections}>Collections</Text>
          </Pressable>
        </View>

        {loading ? <Text style={s.message}>Loading exercises…</Text> : null}
        {!loading && error ? <Text style={s.message}>{error}</Text> : null}
        {!loading && !error && exercises.length === 0 ? (
          <Text style={s.message}>No published exercises match this selection.</Text>
        ) : null}
        <View style={s.list}>
          {exercises.map(exercise => {
            const favorite = isFavorite(exercise._id);
            return (
              <Pressable
                key={exercise._id}
                onPress={() => navigation.navigate(WORKOUT_ROUTES.LIBRARY_EXERCISE, { exerciseId: exercise._id })}
                style={s.exerciseRow}
                accessibilityRole="button"
              >
                {exercise.imageUrl ? (
                  <Image source={{ uri: resolveApiMediaUrl(exercise.imageUrl) }} style={s.image} resizeMode="cover" />
                ) : (
                  <View style={[s.image, s.imageFallback]}><Ionicons name="barbell-outline" size={22} color={theme.colors.primary} /></View>
                )}
                <View style={s.copy}>
                  <Text numberOfLines={1} style={s.exerciseTitle}>{exercise.title}</Text>
                  <Text numberOfLines={2} style={s.description}>{exercise.description || `${exercise.level} · ${exercise.durationMinutes} min`}</Text>
                  <Text numberOfLines={1} style={s.meta}>{exercise.category} · {exercise.durationMinutes} min · {exercise.level}</Text>
                </View>
                <Pressable
                  onPress={event => {
                    event.stopPropagation();
                    toggleFavorite(exercise._id);
                  }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={favorite ? "Remove favorite" : "Save favorite"}
                >
                  <Ionicons name={favorite ? "heart" : "heart-outline"} size={18} color={favorite ? "#E5484D" : theme.colors.muted} />
                </Pressable>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <BottomTabBar activeTab="workout" variant="workout" workoutActiveTab="explore" />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: 18 },
  scroll: { paddingHorizontal: 18, paddingBottom: 120 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, height: 44, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  input: { flex: 1, color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamily },
  resultsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18, marginBottom: 8 },
  heading: { color: theme.colors.text, fontSize: 16, fontFamily: theme.typography.fontFamilyBold },
  sub: { color: theme.colors.muted, fontSize: 11, marginTop: 3, fontFamily: theme.typography.fontFamily },
  collections: { color: theme.colors.primary, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  message: { color: theme.colors.muted, fontSize: 13, marginVertical: 18, fontFamily: theme.typography.fontFamily },
  list: { gap: 8 },
  exerciseRow: { flexDirection: "row", alignItems: "center", gap: 9, padding: 9, borderRadius: 13, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  image: { width: 64, height: 66, borderRadius: 10, backgroundColor: theme.colors.border },
  imageFallback: { alignItems: "center", justifyContent: "center" },
  copy: { flex: 1 },
  exerciseTitle: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  description: { color: theme.colors.muted, fontSize: 10, lineHeight: 14, marginTop: 3, fontFamily: theme.typography.fontFamily },
  meta: { color: theme.colors.primary, fontSize: 9, marginTop: 4, fontFamily: theme.typography.fontFamilyMedium },
});
