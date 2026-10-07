import React, { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import Video, { VideoRef } from "react-native-video";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { fmtTime, Note, WORKOUT_DETAILS } from "../../../data/workoutDetails";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { NoteCard } from "../../../components/WorkoutDetailUI";

type Tab = "technique" | "tips" | "mistakes";
const TABS: { id: Tab; label: string }[] = [
  { id: "technique", label: "Technique" },
  { id: "tips", label: "Beginner tips" },
  { id: "mistakes", label: "Mistakes" },
];

export default function ExerciseVideo() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const detail = WORKOUT_DETAILS[params?.workoutId];
  const move = detail?.moves.find(item => item.id === params?.moveId);
  const player = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tab, setTab] = useState<Tab>("technique");

  if (!move || !detail) {
    return (
      <SafeAreaView style={styles.screen}>
        <OnboardingHeader title="Exercise video" onBack={() => navigation.goBack()} />
        <Text style={styles.sub}>Video guide not found.</Text>
      </SafeAreaView>
    );
  }

  const hasVideo = Boolean(move.videoUrl);
  const items: Note[] = tab === "technique"
    ? move.chapters
    : tab === "tips" ? move.tips : move.mistakes;
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  const seek = (time?: number) => {
    if (time === undefined || !hasVideo) return;
    player.current?.seek(time);
    setPaused(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <OnboardingHeader title="Exercise video" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.player}>
          {hasVideo ? (
            <Video
              ref={player}
              source={{ uri: move.videoUrl! }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              paused={paused}
              repeat
              onLoad={loaded => setDuration(loaded.duration)}
              onProgress={update => setPosition(update.currentTime)}
            />
          ) : (
            <View style={styles.noVideo}>
              <Ionicons name="videocam-outline" size={30} color="rgba(255,255,255,0.7)" />
              <Text style={styles.noVideoText}>Video coming soon</Text>
            </View>
          )}

          <View style={styles.playerTag}>
            <Text style={styles.playerTagText}>{move.name.toUpperCase()} · FORM GUIDE</Text>
          </View>

          {hasVideo ? (
            <>
              <Pressable
                onPress={() => setPaused(value => !value)}
                style={styles.playBtn}
                accessibilityRole="button"
                accessibilityLabel={paused ? "Play video" : "Pause video"}
              >
                <Ionicons name={paused ? "play" : "pause"} size={20} color={theme.colors.onPrimary} />
              </Pressable>
              <View style={styles.controls}>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${progress * 100}%` }]} />
                </View>
                <View style={styles.times}>
                  <Text style={styles.time}>{fmtTime(position)}</Text>
                  <Text style={styles.time}>{fmtTime(duration)}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        <Text style={styles.title}>{move.name} · Form guide</Text>
        <Text style={styles.sub}>Coach {detail.coach}</Text>

        <View style={styles.tabs}>
          {TABS.map(item => {
            const active = item.id === tab;
            return (
              <Pressable
                key={item.id}
                onPress={() => setTab(item.id)}
                style={[styles.tab, active && styles.tabOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.tabText, active && styles.tabTextOn]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.heading}>
          {tab === "technique" ? "In this video" : tab === "tips" ? "Tips to start strong" : "Watch out for"}
        </Text>
        {items.map(item => (
          <Pressable
            key={item.title}
            onPress={() => seek(item.time)}
            style={styles.item}
            disabled={item.time === undefined || !hasVideo}
          >
            <View style={styles.itemCopy}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemNote}>
                {item.time !== undefined ? `${fmtTime(item.time)} · ` : ""}
                {item.note}
              </Text>
            </View>
            {item.time !== undefined && hasVideo ? (
              <Ionicons name="play-circle-outline" size={18} color={theme.colors.muted} />
            ) : null}
          </Pressable>
        ))}

        <View style={styles.note}>
          <NoteCard title="Watch, then move" body="Take a moment to learn the pattern, then try your first rep." />
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <PrimaryButton
          label="Back to workout"
          onPress={() => navigation.navigate({
            name: WORKOUT_ROUTES.DETAILS,
            params: { workoutId: params.workoutId },
            merge: true,
          })}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    scroll: { paddingBottom: 16 },
    player: { height: 200, borderRadius: 16, overflow: "hidden", backgroundColor: "#111", marginTop: 6, justifyContent: "center", alignItems: "center" },
    noVideo: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", gap: 8 },
    noVideoText: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: theme.typography.fontFamily },
    playerTag: { position: "absolute", top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: "rgba(0,0,0,0.55)" },
    playerTagText: { color: "#fff", fontSize: 9, letterSpacing: 0.5, fontFamily: theme.typography.fontFamilyBold },
    playBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
    controls: { position: "absolute", left: 12, right: 12, bottom: 10 },
    track: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.35)", overflow: "hidden" },
    fill: { height: "100%", backgroundColor: theme.colors.primary },
    times: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
    time: { color: "#fff", fontSize: 10 },
    title: { color: theme.colors.text, fontSize: 18, marginTop: 14, fontFamily: theme.typography.fontFamilyBold },
    sub: { color: theme.colors.muted, fontSize: 12, marginTop: 3, fontFamily: theme.typography.fontFamily },
    tabs: { flexDirection: "row", gap: 6, backgroundColor: theme.colors.panel, borderRadius: 12, padding: 4, marginTop: 14, alignSelf: "flex-start" },
    tab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9 },
    tabOn: { backgroundColor: theme.colors.surface },
    tabText: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
    tabTextOn: { color: theme.colors.text, fontFamily: theme.typography.fontFamilyBold },
    heading: { color: theme.colors.text, fontSize: 14, marginTop: 16, marginBottom: 8, fontFamily: theme.typography.fontFamilyBold },
    item: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.card, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
    itemCopy: { flex: 1 },
    itemTitle: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    itemNote: { color: theme.colors.muted, fontSize: 11, marginTop: 2, fontFamily: theme.typography.fontFamily },
    note: { marginTop: 6 },
    bottom: { paddingBottom: 16, paddingTop: 8 },
  });
