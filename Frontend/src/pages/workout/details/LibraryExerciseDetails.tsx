import React from "react";
import { Alert, Dimensions, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TurboModuleRegistry, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { getPublicExercise, PublicExercise } from "../../../api/exercises";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { useTheme } from "../../../theme/ThemeProvider";
import { resolveApiMediaUrl } from "../../../api/client";
import { useSession } from "../../../data/SessionProvider";

type YoutubePlayerComponent = typeof import("react-native-youtube-iframe").default;

const localDayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const disableYoutubeIframeInteractions = `
  (function () {
    var disableIframePointerEvents = function () {
      document.querySelectorAll("iframe").forEach(function (iframe) {
        iframe.style.pointerEvents = "none";
      });
    };
    disableIframePointerEvents();
    new MutationObserver(disableIframePointerEvents).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    true;
  })();
`;

function getYoutubeVideoId(videoUrl: string) {
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.toLocaleLowerCase();
    const segments = url.pathname.split("/").filter(Boolean);
    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = segments[0] ?? null;
    } else if (
      host === "youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "youtube-nocookie.com" ||
      host.endsWith(".youtube-nocookie.com")
    ) {
      videoId = url.searchParams.get("v")
        ?? (["embed", "shorts", "live"].includes(segments[0] ?? "") ? segments[1] : null);
    }

    return videoId && /^[\w-]{6,}$/.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

export default function LibraryExerciseDetails() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const { history, markExerciseDone } = useSession();
  const s = createStyles(theme);
  const [exercise, setExercise] = React.useState<PublicExercise | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [videoError, setVideoError] = React.useState<string | null>(null);
  const [YoutubePlayer, setYoutubePlayer] = React.useState<YoutubePlayerComponent | null>(null);
  const [videoPlaying, setVideoPlaying] = React.useState(false);
  const [videoEnded, setVideoEnded] = React.useState(false);
  const [savingCompletion, setSavingCompletion] = React.useState(false);
  const [completionError, setCompletionError] = React.useState<string | null>(null);
  const completionPending = React.useRef(false);
  const id = params?.exerciseId as string | undefined;
  const youtubeVideoId = exercise?.videoUrl ? getYoutubeVideoId(exercise.videoUrl) : null;
  const playerWidth = Math.min(Dimensions.get("window").width - 36, 560);
  const playerHeight = Math.max(200, Math.round(playerWidth * 9 / 16));
  const todayKey = localDayKey(new Date());
  const completedToday = Boolean(exercise && history.some(entry =>
    entry.workoutId === `exercise:${exercise._id}`
    && localDayKey(new Date(entry.startedAt)) === todayKey,
  ));

  React.useEffect(() => {
    setYoutubePlayer(null);
    setVideoError(null);
    setVideoPlaying(false);
    setVideoEnded(false);
    if (!youtubeVideoId) return;
    if (!TurboModuleRegistry.get("RNCWebViewModule")) {
      setVideoError("Embedded video playback is not available in this installed app. Rebuild and reinstall the app to watch videos here.");
      return;
    }

    try {
      const playerModule = require("react-native-youtube-iframe") as typeof import("react-native-youtube-iframe");
      setYoutubePlayer(() => playerModule.default);
    } catch (loadError) {
      setVideoError(
        loadError instanceof Error
          ? `Unable to initialize the embedded video player: ${loadError.message}`
          : "Unable to initialize the embedded video player.",
      );
    }
  }, [youtubeVideoId]);

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

  const completeExercise = async () => {
    if (!exercise || completedToday || completionPending.current) return;
    completionPending.current = true;
    setSavingCompletion(true);
    setCompletionError(null);
    try {
      const saved = await markExerciseDone({
        id: exercise._id,
        title: exercise.title,
        durationMinutes: exercise.durationMinutes,
      });
      if (!saved) {
        setCompletionError("This exercise is already recorded for today.");
      }
    } catch (saveError) {
      setCompletionError(saveError instanceof Error ? saveError.message : "Unable to save exercise completion.");
      Alert.alert("Couldn't save completion", saveError instanceof Error ? saveError.message : "Please try again.");
    } finally {
      completionPending.current = false;
      setSavingCompletion(false);
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

            {exercise.videoUrl ? (
              <View style={s.videoSection}>
                <Text style={s.sectionTitle}>Exercise video</Text>
                {youtubeVideoId && YoutubePlayer ? (
                  <View style={[s.videoPlayer, { height: playerHeight }]}>
                    <YoutubePlayer
                      videoId={youtubeVideoId}
                      width={playerWidth}
                      height={playerHeight}
                      play={videoPlaying}
                      initialPlayerParams={{ controls: false, rel: false, preventFullScreen: true }}
                      onChangeState={(state: string) => {
                        setVideoPlaying(state === "playing");
                        setVideoEnded(state === "ended");
                      }}
                      onError={(playerFailure: string) => setVideoError(`The YouTube player could not play this video (${playerFailure}).`)}
                      webViewProps={{
                        allowsFullscreenVideo: false,
                        allowsInlineMediaPlayback: true,
                        injectedJavaScript: disableYoutubeIframeInteractions,
                      }}
                    />
                    {videoEnded ? (
                      <View style={s.videoEndedOverlay}>
                        <Pressable
                          onPress={() => {
                            setVideoEnded(false);
                            setVideoPlaying(true);
                          }}
                          style={s.videoControl}
                          accessibilityRole="button"
                          accessibilityLabel="Replay exercise video"
                        >
                          <Ionicons name="reload" size={22} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => setVideoPlaying(current => !current)}
                        style={s.videoControl}
                        accessibilityRole="button"
                        accessibilityLabel={videoPlaying ? "Pause exercise video" : "Play exercise video"}
                      >
                        <Ionicons name={videoPlaying ? "pause" : "play"} size={20} color="#FFFFFF" />
                      </Pressable>
                    )}
                  </View>
                ) : youtubeVideoId ? (
                  <View style={[s.videoPlaceholder, { height: playerHeight }]}>
                    <Ionicons name="logo-youtube" size={30} color={theme.colors.muted} />
                    <Text style={s.videoPlaceholderText}>{videoError ?? "Preparing video player…"}</Text>
                  </View>
                ) : (
                  <Text style={s.videoPlaceholderText}>This video uses an external link and will open in your browser or video app.</Text>
                )}
                {videoError && YoutubePlayer ? <Text accessibilityRole="alert" style={s.error}>{videoError}</Text> : null}
              </View>
            ) : null}

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
            {videoError && !youtubeVideoId ? <Text accessibilityRole="alert" style={s.error}>{videoError}</Text> : null}
          </>
        ) : null}
      </ScrollView>
      {!loading && exercise ? (
        <View style={s.footer}>
          {completionError ? <Text accessibilityRole="alert" style={s.error}>{completionError}</Text> : null}
          <PrimaryButton
            label={savingCompletion ? "Saving…" : completedToday ? "Done today" : "Done"}
            onPress={completeExercise}
            disabled={savingCompletion || completedToday}
          />
          {completedToday ? (
            <Text style={s.completionNote}>Added to today’s activity and progress.</Text>
          ) : null}
          {exercise.videoUrl && !youtubeVideoId ? (
            <Pressable onPress={openVideo} style={s.externalVideoButton} accessibilityRole="button">
              <Text style={s.externalVideoText}>Open exercise video</Text>
            </Pressable>
          ) : null}
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
  videoSection: { marginTop: 20 },
  videoPlayer: { alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 14, backgroundColor: "#000" },
  videoControl: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
  },
  videoEndedOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  videoPlaceholder: { alignItems: "center", justifyContent: "center", gap: 9, padding: 18, borderRadius: 14, backgroundColor: theme.colors.card },
  videoPlaceholderText: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, textAlign: "center", fontFamily: theme.typography.fontFamily },
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
  footer: { paddingTop: 8, paddingBottom: 16, gap: 8 },
  completionNote: { color: theme.colors.primaryDark, fontSize: 11, textAlign: "center", fontFamily: theme.typography.fontFamily },
  externalVideoButton: { alignItems: "center", paddingVertical: 10 },
  externalVideoText: { color: theme.colors.primaryDark, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
});
