import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useSession, fmtClock } from "../../../data/SessionProvider";
import { useTheme } from "../../../theme/ThemeProvider";
import { useUser } from "../../../data/UserProvider";
import { ROUTES } from "../../../navigation/routes";
import { ScreenHeader, ACCENT } from "../data/Movementui";

type Metric = "move" | "steps" | "energy";
const utcDateKey = (date: Date) => date.toISOString().slice(0, 10);

export default function MovementDashboard({ onViewAll }: { onViewAll?: () => void }) {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { name } = useUser();
  const { history, goals, stepEntries, active, startSession, pause, resume, endSession, elapsedSeconds, error } = useSession();
  const s = createStyles(theme);
  const [metric, setMetric] = useState<Metric>("move");
  const [, setTick] = useState(0);
  const [activityType, setActivityType] = useState<"Walk" | "Run">("Walk");

  useEffect(() => {
    if (!active?.workoutId.startsWith("manual-") || active.status !== "running") return;
    const interval = setInterval(() => setTick(value => value + 1), 1000);
    return () => clearInterval(interval);
  }, [active?.workoutId, active?.status]);

  const todayKey = utcDateKey(new Date());
  const todaySessions = history.filter(item => utcDateKey(new Date(item.startedAt)) === todayKey);
  const todaySeconds = todaySessions.reduce((total, item) => total + item.seconds, 0);
  const todayCalories = todaySessions.reduce((total, item) => total + item.calories, 0);
  const todaySteps = stepEntries
    .filter(item => utcDateKey(new Date(item.recordedAt)) === todayKey)
    .reduce((total, item) => total + item.steps, 0);
  const metrics = {
    move: { value: Math.round(todaySeconds / 60), goal: 60, caption: "active minutes recorded" },
    steps: { value: todaySteps, goal: goals?.dailySteps ?? 10000, caption: "steps logged" },
    energy: { value: todayCalories, goal: goals?.dailyCalories ?? 2000, caption: "workout kcal recorded" },
  };
  const current = metrics[metric];
  const initials = (name || "?").trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase()).join("");
  const recent = useMemo(() => history.slice(0, 3), [history]);
  const manualActive = active?.workoutId.startsWith("manual-") ? active : null;
  const elapsed = manualActive ? Math.floor(elapsedSeconds()) : 0;
  const begin = () => {
    if (active) {
      Alert.alert("Workout in progress", "Finish or pause your current workout before starting a walk or run.");
      return;
    }
    startSession({
      workoutId: `manual-${activityType.toLowerCase()}`,
      title: activityType === "Walk" ? "Walking session" : "Running session",
      minutes: 1,
      estCalories: 0,
      moves: [],
    });
  };

  const finish = async () => {
    if (!manualActive) return;
    if (elapsed < 1) {
      Alert.alert("Session too short", "Keep moving for at least one second before saving.");
      return;
    }
    try {
      await endSession();
      Alert.alert("Activity saved", "Your activity time has been added to your account history.");
    } catch (saveError) {
      Alert.alert("Could not save activity", saveError instanceof Error ? saveError.message : "Please try again.");
    }
  };

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Movement Dashboard"
          onBack={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate(ROUTES.HOME, { tab: "home" });
          }}
          onProfile={() => navigation.navigate(ROUTES.PROFILE)}
        />
        <View style={s.userRow}>
          <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
          <View><Text style={s.hello}>Hello</Text><Text style={s.name}>{name || "Fitness member"}</Text></View>
        </View>

        <View style={s.panel}>
          <View style={s.metricTabs}>
            {(["move", "steps", "energy"] as Metric[]).map(value => (
              <Pressable key={value} onPress={() => setMetric(value)} style={[s.metricTab, metric === value && s.metricTabActive]}>
                <Text style={[s.metricTabText, metric === value && s.metricTabTextActive]}>{value === "move" ? "Move" : value === "steps" ? "Steps" : "Energy"}</Text>
              </Pressable>
            ))}
          </View>
          <View style={s.metric}>
            <Text style={s.metricValue}>{current.value.toLocaleString()}</Text>
            <Text style={s.metricCaption}>{current.caption}</Text>
            <View style={s.track}><View style={[s.trackFill, { width: `${Math.min(current.value / Math.max(current.goal, 1), 1) * 100}%` }]} /></View>
            <Text style={s.goalText}>Goal: {current.goal.toLocaleString()}{metric === "move" ? " min" : metric === "energy" ? " kcal" : ""}</Text>
          </View>
        </View>

        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Log a walk or run</Text>
        </View>
        <View style={s.timerCard}>
          <View style={s.activityChoices}>
            {(["Walk", "Run"] as const).map(type => (
              <Pressable key={type} onPress={() => !manualActive && setActivityType(type)} style={[s.choice, activityType === type && s.choiceActive]}>
                <Ionicons name={type === "Walk" ? "walk-outline" : "footsteps-outline"} size={17} color={activityType === type ? theme.colors.onPrimary : theme.colors.text} />
                <Text style={[s.choiceText, activityType === type && s.choiceTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.timer}>{fmtClock(elapsed)}</Text>
          <Text style={s.timerNote}>Timer only records duration; steps, distance and calories are not estimated.</Text>
          {manualActive ? (
            <View style={s.timerActions}>
              <Pressable onPress={manualActive.status === "running" ? pause : resume} style={s.secondaryButton}>
                <Text style={s.secondaryButtonText}>{manualActive.status === "running" ? "Pause" : "Resume"}</Text>
              </Pressable>
              <Pressable onPress={finish} style={s.primaryButton}><Text style={s.primaryButtonText}>Save activity</Text></Pressable>
            </View>
          ) : (
            <Pressable onPress={begin} style={s.primaryButton}><Text style={s.primaryButtonText}>Start {activityType.toLowerCase()} timer</Text></Pressable>
          )}
          {error ? <Text style={s.error}>{error}</Text> : null}
        </View>

        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Recent activity</Text>
          <Pressable onPress={onViewAll ?? (() => navigation.navigate(ROUTES.RUNNING_HOME))}><Text style={s.viewAll}>View all</Text></Pressable>
        </View>
        {recent.length === 0 ? (
          <View style={s.empty}><Ionicons name="time-outline" size={22} color={theme.colors.muted} /><Text style={s.emptyText}>Your saved workout sessions will appear here.</Text></View>
        ) : recent.map(item => (
          <View key={item.id} style={s.activityRow}>
            <View style={s.activityIcon}><Ionicons name={item.workoutId.startsWith("manual-run") ? "footsteps-outline" : "barbell-outline"} size={18} color={theme.colors.primary} /></View>
            <View style={{ flex: 1 }}><Text style={s.activityTitle}>{item.title}</Text><Text style={s.activityMeta}>{new Date(item.startedAt).toLocaleDateString()} · {fmtClock(item.seconds, false)}</Text></View>
            <Text style={s.activityCalories}>{item.calories} kcal</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 18, paddingBottom: 28 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 8 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: ACCENT.purple, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
  hello: { color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily },
  name: { color: theme.colors.text, fontSize: 15, fontFamily: theme.typography.fontFamilyBold },
  panel: { backgroundColor: theme.colors.card, borderRadius: 20, padding: 14, marginTop: 10, borderWidth: 1, borderColor: theme.colors.border },
  metricTabs: { flexDirection: "row", padding: 3, backgroundColor: theme.colors.surface, borderRadius: 18 },
  metricTab: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 15 },
  metricTabActive: { backgroundColor: theme.colors.primary },
  metricTabText: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
  metricTabTextActive: { color: theme.colors.onPrimary, fontFamily: theme.typography.fontFamilyBold },
  metric: { alignItems: "center", paddingVertical: 24 },
  metricValue: { color: theme.colors.text, fontSize: 38, fontFamily: theme.typography.fontFamilyBold },
  metricCaption: { color: theme.colors.muted, fontSize: 12, marginTop: 3, fontFamily: theme.typography.fontFamily },
  track: { width: "100%", height: 7, backgroundColor: theme.colors.border, borderRadius: 4, marginTop: 19, overflow: "hidden" },
  trackFill: { height: "100%", backgroundColor: theme.colors.primary, borderRadius: 4 },
  goalText: { color: theme.colors.muted, fontSize: 10, marginTop: 7, fontFamily: theme.typography.fontFamily },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 23, marginBottom: 10 },
  sectionTitle: { color: theme.colors.text, fontSize: 16, fontFamily: theme.typography.fontFamilyBold },
  viewAll: { color: theme.colors.primary, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  timerCard: { padding: 16, borderRadius: 18, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  activityChoices: { flexDirection: "row", gap: 8 },
  choice: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: theme.colors.surface },
  choiceActive: { backgroundColor: theme.colors.primary },
  choiceText: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
  choiceTextActive: { color: theme.colors.onPrimary, fontFamily: theme.typography.fontFamilyBold },
  timer: { textAlign: "center", color: theme.colors.text, fontSize: 38, marginTop: 16, fontVariant: ["tabular-nums"], fontFamily: theme.typography.fontFamilyBold },
  timerNote: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, textAlign: "center", marginVertical: 10, fontFamily: theme.typography.fontFamily },
  timerActions: { flexDirection: "row", gap: 10 },
  primaryButton: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 44, paddingHorizontal: 14, borderRadius: 22, backgroundColor: theme.colors.primary },
  primaryButtonText: { color: theme.colors.onPrimary, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
  secondaryButton: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.border },
  secondaryButtonText: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
  error: { color: "#B42318", fontSize: 12, marginTop: 9, fontFamily: theme.typography.fontFamily },
  empty: { alignItems: "center", gap: 8, padding: 20, borderRadius: 14, backgroundColor: theme.colors.card },
  emptyText: { color: theme.colors.muted, fontSize: 12, textAlign: "center", fontFamily: theme.typography.fontFamily },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, marginBottom: 8, borderRadius: 13, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  activityIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surface },
  activityTitle: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
  activityMeta: { color: theme.colors.muted, fontSize: 10, marginTop: 3, fontFamily: theme.typography.fontFamily },
  activityCalories: { color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamilyMedium },
});
