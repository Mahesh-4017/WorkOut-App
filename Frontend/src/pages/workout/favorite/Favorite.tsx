import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { getPublicExercise, PublicExercise } from "../../../api/exercises";
import { resolveApiMediaUrl } from "../../../api/client";
import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { useWorkouts } from "../../../data/WorkoutProvider";
import BottomTabBar from "../../../components/BottomTabBar";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";

export default function FavoriteWorkouts() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { favorites, toggleFavorite } = useWorkouts();
  const s = createStyles(theme);
  const [exercises, setExercises] = React.useState<PublicExercise[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    if (!favorites.length) {
      setExercises([]);
      setError(null);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }
    setLoading(true);
    Promise.allSettled(favorites.map(id => getPublicExercise(id)))
      .then(results => {
        if (!mounted) return;
        const loaded = results.flatMap(result => result.status === "fulfilled" ? [result.value] : []);
        const unavailable = results.filter(result => result.status === "rejected").length;
        setExercises(loaded);
        setError(unavailable ? `${unavailable} saved exercise${unavailable === 1 ? " is" : "s are"} no longer available in the workout library.` : null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [favorites]);

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <View style={s.header}>
        <OnboardingHeader title="Favorite exercises" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Your saved exercises.</Text>
        <Text style={s.sub}>Favorites load from your published workout library.</Text>
        {loading ? <Text style={s.message}>Loading favorites…</Text> : null}
        {!loading && error ? <Text style={s.message}>{error}</Text> : null}
        {!loading && !favorites.length ? <Text style={s.message}>Tap the heart on a published exercise to save it here.</Text> : null}
        {!loading && favorites.length > 0 && exercises.length === 0 && !error ? <Text style={s.message}>No saved exercises are available.</Text> : null}
        {exercises.map(exercise => (
          <Pressable
            key={exercise._id}
            onPress={() => navigation.navigate(WORKOUT_ROUTES.LIBRARY_EXERCISE, { exerciseId: exercise._id })}
            style={s.row}
            accessibilityRole="button"
          >
            {exercise.imageUrl
              ? <Image source={{ uri: resolveApiMediaUrl(exercise.imageUrl) }} style={s.image} />
              : <View style={[s.image, s.imageFallback]}><Ionicons name="barbell-outline" size={22} color={theme.colors.primary} /></View>}
            <View style={s.copy}>
              <Text numberOfLines={1} style={s.exerciseTitle}>{exercise.title}</Text>
              <Text style={s.meta}>{exercise.bodyPart} · {exercise.category} · {exercise.level}</Text>
            </View>
            <Pressable
              onPress={event => {
                event.stopPropagation();
                toggleFavorite(exercise._id);
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Remove favorite"
            >
              <Ionicons name="heart" size={19} color="#E5484D" />
            </Pressable>
          </Pressable>
        ))}
        <Pressable onPress={() => navigation.navigate(WORKOUT_ROUTES.COLLECTIONS)} style={s.routine}>
          <Text style={s.routineTitle}>Browse by body part</Text>
          <Text style={s.routineText}>Explore live workout categories and choose your next exercise.</Text>
        </Pressable>
      </ScrollView>
      <View style={s.bottom}>
        <PrimaryButton label="Explore exercises" onPress={() => navigation.navigate(WORKOUT_ROUTES.EXPLORE)} />
      </View>
      <BottomTabBar activeTab="workout" variant="workout" workoutActiveTab="favorites" />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: 18 },
  scroll: { paddingHorizontal: 18, paddingBottom: 200 },
  title: { color: theme.colors.text, fontSize: 22, marginTop: 8, fontFamily: theme.typography.fontFamilyBold },
  sub: { color: theme.colors.muted, fontSize: 12, marginTop: 4, fontFamily: theme.typography.fontFamily },
  message: { color: theme.colors.muted, fontSize: 13, lineHeight: 19, marginVertical: 16, fontFamily: theme.typography.fontFamily },
  row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, marginTop: 8, borderRadius: 13, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  image: { width: 58, height: 58, borderRadius: 10, backgroundColor: theme.colors.border },
  imageFallback: { alignItems: "center", justifyContent: "center" },
  copy: { flex: 1 },
  exerciseTitle: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  meta: { color: theme.colors.muted, fontSize: 10, marginTop: 4, fontFamily: theme.typography.fontFamily },
  routine: { backgroundColor: theme.colors.surfaceAlt ?? theme.colors.card, borderRadius: 12, padding: 14, marginTop: 18 },
  routineTitle: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
  routineText: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3, fontFamily: theme.typography.fontFamily },
  bottom: { position: "absolute", left: 18, right: 18, bottom: 84 },
});
