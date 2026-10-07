import React from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { getExerciseBodyParts, ExerciseBodyPart } from "../../../api/exercises";
import { resolveApiMediaUrl } from "../../../api/client";
import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import BottomTabBar from "../../../components/BottomTabBar";
import { OnboardingHeader } from "../../../components/OnboardingUI";

export default function WorkoutCollections() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const s = createStyles(theme);
  const [bodyParts, setBodyParts] = React.useState<ExerciseBodyPart[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    getExerciseBodyParts()
      .then(items => {
        if (mounted) setBodyParts(items);
      })
      .catch(loadError => {
        if (mounted) setError(loadError instanceof Error ? loadError.message : "Unable to load workout collections.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const openCategory = (bodyPart: string, category?: string) =>
    navigation.navigate(WORKOUT_ROUTES.SEARCH, { bodyPart, category, title: category || bodyPart });

  const showWorkoutOptions = () => {
    Alert.alert("Workout options", "Where would you like to go?", [
      { text: "Favorites", onPress: () => navigation.navigate(WORKOUT_ROUTES.FAVORITES) },
      { text: "Workout schedule", onPress: () => navigation.navigate(WORKOUT_ROUTES.SCHEDULE) },
      { text: "Workout history", onPress: () => navigation.navigate(WORKOUT_ROUTES.HISTORY) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <View style={s.header}>
        <OnboardingHeader
          title="Workout Collections"
          onBack={() => navigation.goBack()}
          onMenu={showWorkoutOptions}
        />
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => navigation.navigate(WORKOUT_ROUTES.HISTORY)}
          style={s.historyLink}
          accessibilityRole="button"
        >
          <Ionicons name="time-outline" size={18} color={theme.colors.text} />
          <Text style={s.historyText}>Workout history</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
        </Pressable>
        <Text style={s.subtitle}>Collections from your workout library.</Text>
        {loading ? <Text style={s.message}>Loading collections…</Text> : null}
        {!loading && error ? <Text style={s.message}>{error}</Text> : null}
        {!loading && !error && !bodyParts.length ? <Text style={s.message}>Published workout collections will appear here.</Text> : null}
        {bodyParts.map(bodyPart => (
          <View key={bodyPart.name} style={s.group}>
            <Pressable
              onPress={() => openCategory(bodyPart.name)}
              style={s.card}
              accessibilityRole="button"
              accessibilityLabel={`${bodyPart.name}, ${bodyPart.count} exercises`}
            >
              <View style={s.cardContent}>
                <Text style={s.title}>{bodyPart.name}</Text>
                <Text style={s.meta}>{bodyPart.count} exercise{bodyPart.count === 1 ? "" : "s"}</Text>
                <View style={s.action}><Text style={s.actionText}>Explore collection</Text><Ionicons name="arrow-forward" size={15} color={theme.colors.primary} /></View>
              </View>
              <CollectionImage imageUrl={bodyPart.imageUrl} />
            </Pressable>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categories}>
              {bodyPart.categories.map(category => (
                <Pressable
                  key={`${bodyPart.name}-${category.name}`}
                  onPress={() => openCategory(bodyPart.name, category.name)}
                  style={s.categoryChip}
                  accessibilityRole="button"
                >
                  <Text style={s.categoryText}>{category.name}</Text>
                  <Text style={s.categoryCount}>{category.count}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
      <BottomTabBar activeTab="workout" variant="workout" workoutActiveTab="explore" />
    </SafeAreaView>
  );
}

function CollectionImage({ imageUrl }: { imageUrl?: string }) {
  const { theme } = useTheme();
  const s = createStyles(theme);
  const [failed, setFailed] = React.useState(false);
  const uri = imageUrl ? resolveApiMediaUrl(imageUrl) : undefined;

  return (
    <View style={s.cardImageFrame}>
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={s.cardImage}
          resizeMode="contain"
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={s.imageFallback}>
          <Ionicons name="barbell-outline" size={26} color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: 18 },
  scroll: { paddingHorizontal: 18, paddingBottom: 120, paddingTop: 6 },
  historyLink: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: theme.colors.card, borderRadius: 12, padding: 14, marginBottom: 12 },
  historyText: { flex: 1, color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
  subtitle: { color: theme.colors.muted, fontSize: 12, marginBottom: 14, fontFamily: theme.typography.fontFamily },
  message: { color: theme.colors.muted, fontSize: 13, marginVertical: 18, fontFamily: theme.typography.fontFamily },
  group: { marginBottom: 14 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 150, padding: 13, borderRadius: 18, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  cardContent: { flex: 1, alignSelf: "stretch", justifyContent: "center", gap: 7 },
  title: { color: theme.colors.text, fontSize: 19, lineHeight: 24, fontFamily: theme.typography.fontFamilyBold },
  meta: { color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
  action: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  actionText: { color: theme.colors.primary, fontSize: 11, fontFamily: theme.typography.fontFamilyBold },
  cardImageFrame: { width: "44%", aspectRatio: 1.4, borderRadius: 13, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surface },
  cardImage: { width: "100%", height: "100%" },
  imageFallback: { flex: 1, alignSelf: "stretch", alignItems: "center", justifyContent: "center" },
  categories: { gap: 7, paddingTop: 8, paddingLeft: 4 },
  categoryChip: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 15, backgroundColor: theme.colors.surfaceAlt ?? theme.colors.card },
  categoryText: { color: theme.colors.text, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
  categoryCount: { color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamily },
});
