import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { getExerciseBodyParts, ExerciseBodyPart } from "../../../api/exercises";
import { resolveApiMediaUrl } from "../../../api/client";
import { useTheme } from "../../../theme/ThemeProvider";
import { ROUTES } from "../../../navigation/routes";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import BottomTabBar from "../../../components/BottomTabBar";
import { ScreenHeader } from "../../../components/MovementUI";

export default function ExploreWorkouts({
  showBottomTabBar = true,
  onBack,
}: {
  showBottomTabBar?: boolean;
  onBack?: () => void;
}) {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const s = createStyles(theme);
  const [query, setQuery] = React.useState("");
  const [bodyParts, setBodyParts] = React.useState<ExerciseBodyPart[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadBodyParts = React.useCallback(() => {
    setLoading(true);
    setError(null);
    return getExerciseBodyParts()
      .then(setBodyParts)
      .catch(loadError => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load workout categories.");
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    let mounted = true;
    getExerciseBodyParts()
      .then(items => mounted && setBodyParts(items))
      .catch(loadError => mounted && setError(loadError instanceof Error ? loadError.message : "Unable to load workout categories."))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleBodyParts = bodyParts.filter(bodyPart =>
    !normalizedQuery ||
    bodyPart.name.toLocaleLowerCase().includes(normalizedQuery) ||
    bodyPart.categories.some(category => category.name.toLocaleLowerCase().includes(normalizedQuery)),
  );
  const exerciseCount = bodyParts.reduce((total, part) => total + part.count, 0);

  const openBodyPart = (bodyPart: string, category?: string) =>
    navigation.navigate(WORKOUT_ROUTES.SEARCH, { bodyPart, category, title: category || bodyPart });

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Explore Workouts"
          onBack={onBack ?? (() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate(ROUTES.HOME, { tab: "home" });
          })}
          onBell={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
          onProfile={() => navigation.navigate(ROUTES.PROFILE)}
        />

        <View style={s.intro}>
          <View style={s.eyebrow}>
            <Ionicons name="barbell-outline" size={13} color={theme.colors.primary} />
            <Text style={s.eyebrowText}>WORKOUT LIBRARY</Text>
          </View>
          <Text style={s.title}>What do you want{"\n"}to train today?</Text>
          <Text style={s.subtitle}>Choose a body part to find focused exercises, coaching details, and videos.</Text>
        </View>

        <View style={s.search}>
          <Ionicons name="search-outline" size={18} color={theme.colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search body parts or categories"
            placeholderTextColor={theme.colors.muted}
            style={s.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search body parts and categories"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={theme.colors.muted} />
            </Pressable>
          ) : null}
        </View>

        <View style={s.sectionHeading}>
          <View>
            <Text style={s.sectionTitle}>Choose a body part</Text>
            <Text style={s.sectionSubtitle}>
              {loading ? "Loading your workout library" : `${bodyParts.length} focus areas · ${exerciseCount} exercises`}
            </Text>
          </View>
          <View style={s.sectionIcon}>
            <Ionicons name="options-outline" size={18} color={theme.colors.primary} />
          </View>
        </View>

        {loading ? <Text style={s.message}>Loading workout categories…</Text> : null}
        {!loading && error ? (
          <View style={s.messageCard}>
            <Text style={s.error}>{error}</Text>
            <Pressable onPress={loadBodyParts} accessibilityRole="button">
              <Text style={s.retry}>Try again</Text>
            </Pressable>
          </View>
        ) : null}
        {!loading && !error && bodyParts.length === 0 ? (
          <View style={s.emptyState}>
            <View style={s.emptyIcon}><Ionicons name="fitness-outline" size={25} color={theme.colors.primary} /></View>
            <Text style={s.emptyTitle}>Workouts are on the way</Text>
            <Text style={s.emptyText}>Published workout categories will appear here.</Text>
          </View>
        ) : null}
        {!loading && !error && bodyParts.length > 0 && visibleBodyParts.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyTitle}>No matching body parts</Text>
            <Text style={s.emptyText}>Try another body part or category name.</Text>
          </View>
        ) : null}

        <View style={s.list}>
          {visibleBodyParts.map(bodyPart => (
            <View key={bodyPart.name} style={s.partGroup}>
              <Pressable
                onPress={() => openBodyPart(bodyPart.name)}
                style={s.partCard}
                accessibilityRole="button"
                accessibilityLabel={`${bodyPart.name}, ${bodyPart.count} exercises`}
              >
                <View style={s.partCopy}>
                  <View style={s.partCount}>
                    <Text style={s.partCountText}>{String(bodyPart.count).padStart(2, "0")} EXERCISES</Text>
                  </View>
                  <Text numberOfLines={1} style={s.partName}>{bodyPart.name}</Text>
                  <Text style={s.partMeta}>Browse all {bodyPart.name.toLocaleLowerCase()} workouts</Text>
                  <View style={s.cardAction}>
                    <Text style={s.cardActionText}>Explore</Text>
                    <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
                  </View>
                </View>
                <View style={s.imageWrap}>
                  {bodyPart.imageUrl ? (
                    <Image source={{ uri: resolveApiMediaUrl(bodyPart.imageUrl) }} style={s.partImage} resizeMode="cover" />
                  ) : (
                    <View style={[s.partImage, s.imageFallback]}>
                      <Ionicons name="barbell-outline" size={27} color={theme.colors.primary} />
                    </View>
                  )}
                  <View style={s.imageArrow}>
                    <Ionicons name="arrow-forward" size={13} color={theme.colors.onPrimary} />
                  </View>
                </View>
              </Pressable>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categories}>
                {bodyPart.categories
                  .filter(category =>
                    !normalizedQuery ||
                    bodyPart.name.toLocaleLowerCase().includes(normalizedQuery) ||
                    category.name.toLocaleLowerCase().includes(normalizedQuery),
                  )
                  .map(category => (
                    <Pressable
                      key={`${bodyPart.name}-${category.name}`}
                      onPress={() => openBodyPart(bodyPart.name, category.name)}
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
        </View>

        <Pressable onPress={() => navigation.navigate(WORKOUT_ROUTES.COLLECTIONS)} style={s.collectionLink}>
          <View style={s.collectionIcon}><Ionicons name="layers-outline" size={18} color={theme.colors.primary} /></View>
          <View style={s.collectionCopy}>
            <Text style={s.collectionLabel}>Workout collections</Text>
            <Text style={s.collectionHint}>Browse your full exercise library</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
        </Pressable>
      </ScrollView>
      {showBottomTabBar ? <BottomTabBar activeTab="workout" variant="workout" workoutActiveTab="explore" /> : null}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 18, paddingBottom: 130 },
  intro: { marginTop: 9, marginBottom: 18 },
  eyebrow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 9 },
  eyebrowText: { color: theme.colors.primary, fontSize: 10, letterSpacing: 1.2, fontFamily: theme.typography.fontFamilyBold },
  title: { color: theme.colors.text, fontSize: 27, lineHeight: 33, fontFamily: theme.typography.fontFamilyBold },
  subtitle: { maxWidth: 320, color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8, fontFamily: theme.typography.fontFamily },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 48, paddingHorizontal: 14, borderRadius: 14, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  searchInput: { flex: 1, color: theme.colors.text, fontSize: 12, paddingVertical: 0, fontFamily: theme.typography.fontFamily },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 24, marginBottom: 12 },
  sectionTitle: { color: theme.colors.text, fontSize: 16, fontFamily: theme.typography.fontFamilyBold },
  sectionSubtitle: { color: theme.colors.muted, fontSize: 10, marginTop: 3, fontFamily: theme.typography.fontFamily },
  sectionIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.card },
  message: { color: theme.colors.muted, fontSize: 13, paddingVertical: 20, fontFamily: theme.typography.fontFamily },
  messageCard: { padding: 14, borderRadius: 12, backgroundColor: theme.colors.card },
  error: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamily },
  retry: { color: theme.colors.primary, fontSize: 13, marginTop: 10, fontFamily: theme.typography.fontFamilyBold },
  emptyState: { alignItems: "center", paddingHorizontal: 22, paddingVertical: 28, marginTop: 4, borderRadius: 17, backgroundColor: theme.colors.card },
  emptyIcon: { width: 50, height: 50, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surface },
  emptyTitle: { color: theme.colors.text, fontSize: 14, marginTop: 12, fontFamily: theme.typography.fontFamilyBold },
  emptyText: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, textAlign: "center", marginTop: 4, fontFamily: theme.typography.fontFamily },
  list: { gap: 13 },
  partGroup: { gap: 7 },
  partCard: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 142, padding: 13, borderRadius: 18, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  partImage: { width: 116, height: 116, borderRadius: 13, backgroundColor: theme.colors.surface },
  imageFallback: { alignItems: "center", justifyContent: "center" },
  imageWrap: { position: "relative" },
  imageArrow: { position: "absolute", right: 7, bottom: 7, width: 25, height: 25, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.primary },
  partCopy: { flex: 1, justifyContent: "center" },
  partCount: { alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, backgroundColor: theme.colors.surface },
  partCountText: { color: theme.colors.primary, fontSize: 8, letterSpacing: 0.5, fontFamily: theme.typography.fontFamilyBold },
  partName: { color: theme.colors.text, fontSize: 17, marginTop: 8, fontFamily: theme.typography.fontFamilyBold },
  partMeta: { color: theme.colors.muted, fontSize: 9, marginTop: 4, fontFamily: theme.typography.fontFamily },
  cardAction: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10 },
  cardActionText: { color: theme.colors.primary, fontSize: 10, fontFamily: theme.typography.fontFamilyBold },
  categories: { gap: 7, paddingLeft: 2, paddingRight: 4 },
  categoryChip: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, backgroundColor: theme.colors.surface },
  categoryText: { color: theme.colors.text, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
  categoryCount: { color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamily },
  collectionLink: { flexDirection: "row", alignItems: "center", gap: 11, padding: 13, marginTop: 22, borderRadius: 15, backgroundColor: theme.colors.card },
  collectionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surface },
  collectionCopy: { flex: 1 },
  collectionLabel: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  collectionHint: { color: theme.colors.muted, fontSize: 9, marginTop: 3, fontFamily: theme.typography.fontFamily },
});
