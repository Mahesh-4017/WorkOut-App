import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { TurboModuleRegistry } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { OnboardingHeader } from "../../components/OnboardingUI";
import { ApiCard } from "../../api/cards";
import { useTheme } from "../../theme/ThemeProvider";
import { ROUTES } from "../../navigation/routes";

const DEFAULT_YOGA_VIDEO_ID = "ow3hpYJqYEI";

type YoutubePlayerComponent = typeof import("react-native-youtube-iframe").default;

function getYoutubeVideoId(videoUrl: string) {
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.toLocaleLowerCase();
    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      host === "youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "youtube-nocookie.com" ||
      host.endsWith(".youtube-nocookie.com")
    ) {
      const segments = url.pathname.split("/").filter(Boolean);
      videoId = url.searchParams.get("v")
        ?? (["embed", "shorts", "live"].includes(segments[0] ?? "") ? segments[1] : null);
    }

    return videoId && /^[\w-]{6,}$/.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

export default function YogaSessionDetails() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const card = route.params?.card as ApiCard | undefined;
  const [YoutubePlayer, setYoutubePlayer] = useState<YoutubePlayerComponent | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const videoId = card?.videoUrl ? getYoutubeVideoId(card.videoUrl) : DEFAULT_YOGA_VIDEO_ID;
  const playerWidth = Math.min(Dimensions.get("window").width - 36, 560);
  const playerHeight = Math.max(200, Math.round(playerWidth * 9 / 16));

  useEffect(() => {
    if (!videoId) return;
    if (!TurboModuleRegistry.get("RNCWebViewModule")) {
      setPlayerError("Embedded playback is not included in this installed app. Rebuild and reinstall the app to watch Yoga sessions here.");
      return;
    }

    try {
      const playerModule = require("react-native-youtube-iframe") as typeof import("react-native-youtube-iframe");
      setYoutubePlayer(() => playerModule.default);
    } catch (loadError) {
      setPlayerError(
        loadError instanceof Error
          ? `Unable to initialize the embedded video player: ${loadError.message}`
          : "Unable to initialize the embedded video player.",
      );
    }
  }, [videoId]);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <OnboardingHeader
          title={card?.category || "Session details"}
          onBack={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate(ROUTES.YOGA);
          }}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!card ? (
          <View style={styles.empty}>
            <Ionicons name="alert-circle-outline" size={28} color={theme.colors.primary} />
            <Text style={styles.message}>This Yoga session is unavailable.</Text>
            <Text style={styles.link} onPress={() => navigation.navigate(ROUTES.YOGA)}>Back to Yoga</Text>
          </View>
        ) : (
          <>
            <View style={[styles.player, { height: playerHeight }]}>
              {videoId && YoutubePlayer ? (
                <YoutubePlayer
                  videoId={videoId}
                  width={playerWidth}
                  height={playerHeight}
                  play={false}
                  onError={(playerFailure: string) => setPlayerError(`The YouTube player could not play this session (${playerFailure}).`)}
                  webViewProps={{ allowsFullscreenVideo: true, allowsInlineMediaPlayback: true }}
                />
              ) : (
                <View style={styles.playerEmpty}>
                  <Ionicons
                    name={videoId ? "phone-portrait-outline" : "videocam-outline"}
                    size={30}
                    color={theme.colors.muted}
                  />
                  <Text style={styles.message}>
                    {playerError ?? (videoId ? "Preparing YouTube player…" : "A valid YouTube video is not available for this session.")}
                  </Text>
                </View>
              )}
            </View>
            {playerError && YoutubePlayer ? <Text style={styles.error}>{playerError}</Text> : null}
            <Text style={styles.category}>{card.category || "Yoga"}</Text>
            <Text style={styles.title}>{card.title}</Text>
            {card.description ? <Text style={styles.description}>{card.description}</Text> : null}
            {card.tags.length > 0 ? (
              <View style={styles.tags}>
                {card.tags.map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <View style={styles.note}>
              <Ionicons name="leaf-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.noteText}>Follow along at a comfortable pace and pause whenever you need.</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: 18 },
    content: { paddingHorizontal: 18, paddingBottom: 36 },
    player: {
      width: "100%",
      marginTop: 8,
      overflow: "hidden",
      borderRadius: 16,
      backgroundColor: "#101010",
    },
    playerEmpty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 20 },
    category: {
      alignSelf: "flex-start",
      marginTop: 20,
      paddingHorizontal: 10,
      paddingVertical: 6,
      overflow: "hidden",
      borderRadius: 10,
      color: theme.colors.primary,
      backgroundColor: theme.colors.surface,
      fontSize: 11,
      fontFamily: theme.typography.fontFamilyBold,
    },
    title: { color: theme.colors.text, fontSize: 24, lineHeight: 30, marginTop: 10, fontFamily: theme.typography.fontFamilyBold },
    description: { color: theme.colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8, fontFamily: theme.typography.fontFamily },
    tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
    tag: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 12, backgroundColor: theme.colors.card },
    tagText: { color: theme.colors.text, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
    note: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 22, padding: 14, borderRadius: 14, backgroundColor: theme.colors.card },
    noteText: { flex: 1, color: theme.colors.muted, fontSize: 12, lineHeight: 18, fontFamily: theme.typography.fontFamily },
    empty: { alignItems: "center", gap: 12, padding: 24, borderRadius: 16, backgroundColor: theme.colors.card },
    message: { color: theme.colors.muted, fontSize: 13, lineHeight: 19, textAlign: "center", fontFamily: theme.typography.fontFamily },
    link: { color: theme.colors.primary, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    error: { color: theme.colors.danger, fontSize: 12, marginTop: 10, fontFamily: theme.typography.fontFamily },
  });
