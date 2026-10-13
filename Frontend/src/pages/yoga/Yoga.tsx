import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { ApiCard, getAllPublicCards } from "../../api/cards";
import { resolveApiMediaUrl } from "../../api/client";
import { ROUTES } from "../../navigation/routes";
import { WORKOUT_ROUTES } from "../../navigation/workoutRoutes";
import { useTheme } from "../../theme/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { ScreenHeader } from "../running/data/Movementui";

const YOGA_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=900&q=80";

export default function YogaPage() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = createStyles(theme);
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadYoga = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allCards = await getAllPublicCards(user?.gender);
      setCards(allCards.filter(card =>
        card.category.trim().toLocaleLowerCase().includes("yoga") ||
        card.tags.some(tag => tag.trim().toLocaleLowerCase() === "yoga"),
      ));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Yoga sessions.");
    } finally {
      setLoading(false);
    }
  }, [user?.gender]);

  useEffect(() => {
    loadYoga();
  }, [loadYoga]);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Yoga"
          onBack={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate(ROUTES.HOME, { tab: "home" });
          }}
          onProfile={() => navigation.navigate(ROUTES.PROFILE)}
        />
        <Text style={styles.subtitle}>Published sessions for a calmer, more mobile day.</Text>
        {loading ? <Text style={styles.message}>Loading published Yoga sessions…</Text> : null}
        {error ? (
          <View style={styles.empty}>
            <Text style={styles.message}>{error}</Text>
            <Pressable onPress={() => loadYoga()} accessibilityRole="button"><Text style={styles.retry}>Try again</Text></Pressable>
          </View>
        ) : null}
        {!loading && !error && cards.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={30} color={theme.colors.primary} />
            <Text style={styles.emptyTitle}>No Yoga sessions published yet</Text>
            <Text style={styles.message}>New sessions will appear here when they are published.</Text>
          </View>
        ) : null}
        {cards.map(card => (
          <Pressable
            key={card._id}
            style={styles.card}
            onPress={() => navigation.navigate(WORKOUT_ROUTES.YOGA_DETAILS, { card })}
            accessibilityRole="button"
          >
            <YogaCardImage
              thumbnailUrl={card.thumbnailUrl}
              title={card.title}
              imageStyle={styles.image}
              fallbackStyle={styles.imageFallback}
              fallbackLabelStyle={styles.fallbackLabel}
              iconColor={theme.colors.primary}
            />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDescription}>{card.description}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.category}>{card.category}</Text>
                <Ionicons name="play-circle-outline" size={23} color={theme.colors.primary} />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function YogaCardImage({
  thumbnailUrl,
  title,
  imageStyle,
  fallbackStyle,
  fallbackLabelStyle,
  iconColor,
}: {
  thumbnailUrl?: string;
  title: string;
  imageStyle: object;
  fallbackStyle: object;
  fallbackLabelStyle: object;
  iconColor: string;
}) {
  const [failedImage, setFailedImage] = useState<"thumbnail" | "fallback" | null>(null);
  const imageUrl = thumbnailUrl && failedImage !== "thumbnail"
    ? resolveApiMediaUrl(thumbnailUrl)
    : failedImage !== "fallback" ? YOGA_FALLBACK_IMAGE : undefined;

  if (!imageUrl) {
    return (
      <View style={[imageStyle, fallbackStyle]}>
        <Ionicons name="leaf-outline" size={34} color={iconColor} />
        <Text style={fallbackLabelStyle}>YOGA SESSION</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={imageStyle}
      resizeMode="cover"
      onError={() => setFailedImage(current => current === "thumbnail" || !thumbnailUrl ? "fallback" : "thumbnail")}
      accessibilityLabel={`${title} Yoga session`}
    />
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: 18, paddingBottom: 30 },
  subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 14, fontFamily: theme.typography.fontFamily },
  message: { color: theme.colors.muted, fontSize: 13, lineHeight: 19, fontFamily: theme.typography.fontFamily },
  retry: { color: theme.colors.primary, marginTop: 10, fontFamily: theme.typography.fontFamilyBold },
  empty: { alignItems: "center", gap: 8, padding: 24, borderRadius: 16, backgroundColor: theme.colors.card },
  emptyTitle: { color: theme.colors.text, fontSize: 16, textAlign: "center", fontFamily: theme.typography.fontFamilyBold },
  card: { overflow: "hidden", borderRadius: 18, marginTop: 14, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  image: { width: "100%", height: 190 },
  imageFallback: { alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: theme.colors.surface },
  fallbackLabel: { color: theme.colors.muted, fontSize: 10, letterSpacing: 1.2, fontFamily: theme.typography.fontFamilyBold },
  cardBody: { padding: 15 },
  cardTitle: { color: theme.colors.text, fontSize: 18, fontFamily: theme.typography.fontFamilyBold },
  cardDescription: { color: theme.colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6, fontFamily: theme.typography.fontFamily },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  category: { color: theme.colors.primary, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
});
