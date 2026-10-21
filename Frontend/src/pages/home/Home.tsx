import React from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { responsiveWidth } from "react-native-responsive-dimensions";

import { useTheme } from "../../theme/ThemeProvider";
import { useUser } from "../../data/UserProvider";
import { ROUTES } from "../../navigation/routes";
import { WORKOUT_ROUTES } from "../../navigation/workoutRoutes";
import { useSession } from "../../data/SessionProvider";
import { useAuth } from "../../context/AuthContext";
import { getAllPublicCards, ApiCard } from "../../api/cards";
import { getPublicExercises, PublicExercise } from "../../api/exercises";
import { resolveApiMediaUrl } from "../../api/client";
import { FOOD_ROUTES } from "../../navigation/foodRoutes";
import { useSchedule } from "../../data/ScheduleProvider";
import { toKey } from "../../data/classSchedule";
import { indiaDateKey, indiaWeekday } from "../../utils/indiaTime";
import { useNotifications } from "../../data/NotificationProvider";

const DEFAULT_WEEKLY_GOAL = 5;
const DARK_TEXT = "#1B1F1A"; // text on the pastel tiles

export default function Home() {
  const navigation = useNavigation<any>();
  const { theme, isDark, toggleTheme } = useTheme();
  const { name } = useUser();
  const { history, goals, loading: progressLoading, error: progressError } = useSession();
  const { scheduled, dayPlans, refresh: refreshSchedule } = useSchedule();
  const { readIds, ready: notificationsReady } = useNotifications();
  const { user } = useAuth();
  const s = createStyles(theme);

  const [today] = React.useState(() => new Date());
  const todayKey = toKey(today);
  const todayIndiaKey = indiaDateKey();
  const todayWorkouts = scheduled.filter(item => item.date === todayKey);
  const todayPersonalPlans = dayPlans.filter(plan => plan.repeatDays.length
    ? todayIndiaKey >= plan.date && plan.repeatDays.includes(indiaWeekday(todayIndiaKey))
    : plan.date === todayIndiaKey);
  const todayWorkoutGroups = Array.from(
    todayWorkouts.reduce((groups, plan) => {
      const key = (plan.bodyPart || plan.title).trim().toLocaleLowerCase();
      const group = groups.get(key);
      if (group) group.push(plan);
      else groups.set(key, [plan]);
      return groups;
    }, new Map<string, typeof todayWorkouts>()),
    ([, plans]) => plans,
  );
  const todayWorkoutNames = todayWorkoutGroups.map(plans => plans[0].bodyPart || plans[0].title);
  const todayWorkoutTimes = [...new Set(todayWorkouts.map(item => item.time))].sort();
  const unreadNotifications = todayWorkouts.filter(item =>
    !readIds.includes(`today-workout-${item.id}-${item.date}`),
  ).length + todayPersonalPlans.filter(plan =>
    !readIds.includes(`today-day-${plan.id}-${todayIndiaKey}`),
  ).length;
  const [cardsState, setCardsState] = React.useState<{ items: ApiCard[]; error: string | null }>({
    items: [],
    error: null,
  });
  const [loading, setLoading] = React.useState(true);
  const [latestExercises, setLatestExercises] = React.useState<PublicExercise[]>([]);
  const [latestLoading, setLatestLoading] = React.useState(true);
  const [latestError, setLatestError] = React.useState<string | null>(null);
  const { items: cards, error: cardsError } = cardsState;

  const loadLatestExercises = React.useCallback(async () => {
    setLatestLoading(true);
    setLatestError(null);
    try {
      const result = await getPublicExercises({ page: 1, limit: 6, sort: "latest" });
      setLatestExercises(result.items);
    } catch (error) {
      setLatestError(error instanceof Error ? error.message : "Unable to load the latest workouts.");
    } finally {
      setLatestLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setCardsState(current => ({ ...current, error: null }));
    getAllPublicCards(user?.gender)
      .then(items => mounted && setCardsState({ items, error: null }))
      .catch(error => {
        if (!mounted) return;
        setCardsState({
          items: [],
          error: error instanceof Error ? error.message : "Unable to load exercise videos.",
        });
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [user?.gender]);

  React.useEffect(() => {
    loadLatestExercises();
  }, [loadLatestExercises]);

  // ---- derived values ----
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = (name || "").trim().split(" ")[0] || "there";
  const initials = (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join("");

  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weeklySessions = history.filter(item => new Date(item.startedAt) >= weekStart).length;
  const weeklyGoal = goals?.weeklySessions ?? DEFAULT_WEEKLY_GOAL;
  const done = Math.min(weeklySessions, weeklyGoal);
  const progress = done / weeklyGoal;
  // Monday -> Sunday of the current week
  const week = React.useMemo(() => {
    const offset = (today.getDay() + 6) % 7;
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - offset + i);
      return {
        letter: d.toLocaleDateString(undefined, { weekday: "narrow" }),
        date: d.getDate(),
        dateString: d.toISOString().slice(0, 10),
        isToday: i === offset,
      };
    });
  }, [today]);

  const goWorkout = () => navigation.navigate(WORKOUT_ROUTES.EXPLORE);
  const goRunning = () => navigation.navigate(ROUTES.RUNNING);
  const goCalendar = (selectedDate?: string) => navigation.navigate(ROUTES.WORKOUTCALENDAR, { selectedDate });
  const goWorkoutSchedule = () => navigation.navigate(WORKOUT_ROUTES.SCHEDULE);
  const goFood = () => navigation.navigate(FOOD_ROUTES.WELCOME);
  const goYoga = () => navigation.navigate(ROUTES.YOGA);

  useFocusEffect(
    React.useCallback(() => {
      refreshSchedule();
    }, [refreshSchedule]),
  );

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* App bar */}
        <View style={s.appBar}>
          <View style={s.brandLockup} accessibilityLabel="WorkOut">
            <Image
              source={require("../../assets/workout-wordmark.png")}
              style={s.brandWordmark}
              resizeMode="cover"
              accessibilityLabel="WorkOut"
            />
          </View>
          <View style={s.appActions}>
            <Pressable onPress={toggleTheme} style={s.iconButton} accessibilityLabel="Toggle theme">
              <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={theme.colors.text} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
              style={[s.iconButton, s.notificationButton]}
              accessibilityLabel={`${unreadNotifications} unread notifications`}
              accessibilityRole="button"
            >
              <Ionicons name="notifications-outline" size={18} color={theme.colors.text} />
              {notificationsReady && unreadNotifications > 0 ? (
                <View style={s.notificationBadge}>
                  <Text style={s.notificationBadgeText}>{unreadNotifications > 9 ? "9+" : unreadNotifications}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        {/* Greeting */}
        <View style={s.greetRow}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={s.todayPlanCopy}>
            <Text style={s.greetTitle}>
              {greeting}, {firstName}
            </Text>
            <Text style={s.greetSub}>A little movement. A better day.</Text>
          </View>
        </View>

        {todayWorkouts.length > 1 ? (
          <View style={s.todayPlanSection}>
            <Pressable
              onPress={() => goCalendar(todayIndiaKey)}
              style={s.todayPlanCard}
              accessibilityRole="button"
              accessibilityLabel={`Today's workouts: ${todayWorkoutNames.join(", ")}. Open calendar.`}
            >
              <View style={s.todayPlanTop}>
                <View style={s.todayPlanEyebrow}>
                  <Ionicons name="sunny-outline" size={13} color={theme.colors.onPrimary} />
                  <Text style={s.todayPlanEyebrowText}>TODAY’S WORKOUT</Text>
                </View>
                <View style={s.todayPlanTime}>
                  <Ionicons name="time-outline" size={13} color={theme.colors.onPrimary} />
                  <Text style={s.todayPlanTimeText}>
                    {todayWorkoutTimes.length === 1 ? todayWorkoutTimes[0] : `${todayWorkouts.length} plans`}
                  </Text>
                </View>
              </View>
              <View style={s.todayPlanMiddle}>
                <View style={s.todayPlanIcon}>
                  <Ionicons name="barbell-outline" size={23} color={theme.colors.primaryDark} />
                </View>
                <View style={s.todayPlanCopy}>
                  <Text style={s.todayPlanKicker}>YOUR TRAINING PLAN</Text>
                  <Text numberOfLines={2} style={s.todayPlanTitle}>{todayWorkoutNames.join(", ")}</Text>
                  <Text numberOfLines={1} style={s.todayPlanMeta}>
                    {todayWorkouts.length} workouts planned · Tap to explore
                  </Text>
                </View>
              </View>
              <View style={s.todayPlanAction}>
                <Text style={s.todayPlanActionText}>View calendar</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.onPrimary} />
              </View>
            </Pressable>
          </View>
        ) : null}

        {/* Week progress */}
        <View style={s.weekCard}>
          <View style={s.weekHeader}>
            <Text style={s.weekTitle}>This week</Text>
            <Text style={s.weekCount}>
              {done} of {weeklyGoal} saved sessions
            </Text>
          </View>
          {progressLoading ? <Text style={s.message}>Loading your saved workout activity…</Text> : null}
          {progressError ? <Text style={s.message}>{progressError}</Text> : null}
          <View style={s.weekRow}>
            {week.map(d => (
              <Pressable key={d.dateString} onPress={() => goCalendar(d.dateString)} style={s.dayCol} accessibilityLabel={`Open ${d.dateString} in calendar`}>
                <Text style={s.dayLetter}>{d.letter}</Text>
                <View style={[s.dayCircle, d.isToday && s.dayCircleActive]}>
                  <Text style={[s.dayNum, d.isToday && s.dayNumActive]}>{d.date}</Text>
                </View>
              </Pressable>
            ))}
          </View>
          <View style={s.track}>
            <View style={[s.trackFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {/* What's next */}
        <Text style={s.sectionTitle}>What's next for you?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tileRow}>
          <Pressable onPress={goWorkout} style={[s.tile, { backgroundColor: "#E8E3F7" }]} accessibilityRole="button">
            <View style={s.tileIcon}>
              <Ionicons name="barbell-outline" size={18} color={DARK_TEXT} />
            </View>
            <Text style={s.tileTitle}>Explore Workouts</Text>
            <Text style={s.tileSub}>Browse workouts from your studio library.</Text>
            <Text style={s.tileAction}>Explore →</Text>
          </Pressable>
          <Pressable onPress={goYoga} style={[s.tile, { backgroundColor: "#E5F0E5" }]} accessibilityRole="button">
            <View style={s.tileIcon}>
              <Ionicons name="leaf-outline" size={18} color={DARK_TEXT} />
            </View>
            <Text style={s.tileTitle}>Yoga &amp; mobility</Text>
            <Text style={s.tileSub}>Browse published Yoga sessions.</Text>
            <Text style={s.tileAction}>Explore Yoga →</Text>
          </Pressable>
          <Pressable onPress={goWorkoutSchedule} style={[s.tile, { backgroundColor: "#F8F0CF" }]} accessibilityRole="button">
            <View style={s.tileIcon}>
              <Ionicons name="calendar-outline" size={18} color={DARK_TEXT} />
            </View>
            <Text style={s.tileTitle}>Plan your week</Text>
            <Text style={s.tileSub}>Choose workouts and build your schedule.</Text>
            <Text style={s.tileAction}>Make a plan →</Text>
          </Pressable>
        </ScrollView>

        <Text style={s.sectionTitle}>Running</Text>
        <Pressable
          onPress={goRunning}
          style={s.scanCard}
          accessibilityRole="button"
          accessibilityLabel="Explore running workouts"
        >
          <View style={s.scanIcon}>
            <Ionicons name="walk-outline" size={20} color={DARK_TEXT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.tileTitle}>Ready for a run?</Text>
            <Text style={s.tileSub}>Explore workouts and find your pace.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={DARK_TEXT} />
        </Pressable>

        <Pressable onPress={goFood} style={s.scanCard}>
          <View style={s.scanIcon}>
            <Ionicons name="camera-outline" size={20} color={DARK_TEXT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.tileTitle}>Food & nutrition</Text>
            <Text style={s.tileSub}>Log meals, scan food, and track hydration.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={DARK_TEXT} />
        </Pressable>

        {/* Featured sessions */}
        <View style={s.sectionRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitleFlat}>A little stronger today</Text>
            <Text style={s.sectionSub}>Exercise videos from your studio library.</Text>
          </View>
          <Pressable onPress={goWorkout} hitSlop={8}>
            <Text style={s.viewAll}>View all ›</Text>
          </Pressable>
        </View>

        {loading ? (
          <Text style={s.message}>Loading exercise videos...</Text>
        ) : cardsError ? (
          <Text style={s.message}>{cardsError}</Text>
        ) : cards.length === 0 ? (
          <Text style={s.message}>No exercise videos have been published yet.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.cardRow}>
            {cards.map(card => (
              <View key={card._id} style={s.card}>
                <View>
                  {card.thumbnailUrl ? (
                    <Image source={{ uri: resolveApiMediaUrl(card.thumbnailUrl) }} style={s.cardImage} />
                  ) : (
                    <View style={[s.cardImage, s.cardPlaceholder]}>
                      <Ionicons name="play" size={22} color={theme.colors.primary} />
                    </View>
                  )}
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{card.category}</Text>
                  </View>
                </View>
                <View style={s.cardBody}>
                  <Text numberOfLines={1} style={s.cardTitle}>
                    {card.title}
                  </Text>
                  <Text numberOfLines={2} style={s.cardDesc}>
                    {card.description}
                  </Text>
                  <Text numberOfLines={1} style={s.cardMeta}>
                    {card.audience === "all" ? "Everyone" : card.audience}
                  </Text>
                  <Pressable onPress={() => Linking.openURL(card.videoUrl)} style={s.cardButton} accessibilityRole="button">
                    <Ionicons name="play" size={12} color={theme.colors.primaryDark} />
                    <Text style={s.cardButtonText}>Start exercise</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={s.sectionRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitleFlat}>Latest workout exercises</Text>
            <Text style={s.sectionSub}>Recently published from your exercise library.</Text>
          </View>
          <Pressable onPress={goWorkout} hitSlop={8}>
            <Text style={s.viewAll}>View all ›</Text>
          </Pressable>
        </View>
        {latestLoading ? <Text style={s.message}>Loading latest workouts...</Text> : null}
        {latestError ? (
          <View style={s.latestError}>
            <Text style={s.message}>{latestError}</Text>
            <Pressable onPress={loadLatestExercises} accessibilityRole="button">
              <Text style={s.viewAll}>Retry</Text>
            </Pressable>
          </View>
        ) : null}
        {!latestLoading && !latestError && latestExercises.length === 0 ? (
          <Text style={s.message}>New workout exercises will appear here when published.</Text>
        ) : null}
        {!latestLoading && !latestError && latestExercises.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.cardRow}>
            {latestExercises.map(exercise => (
              <Pressable
                key={exercise._id}
                onPress={() => navigation.navigate(WORKOUT_ROUTES.LIBRARY_EXERCISE, { exerciseId: exercise._id })}
                style={s.latestCard}
                accessibilityRole="button"
                accessibilityLabel={`View details for ${exercise.title}`}
              >
                <View style={s.latestImageFrame}>
                  {exercise.imageUrl ? (
                    <Image
                      source={{ uri: resolveApiMediaUrl(exercise.imageUrl) }}
                      style={s.latestImage}
                      resizeMode="cover"
                      accessibilityLabel={`${exercise.title} exercise`}
                    />
                  ) : (
                    <View style={s.latestImagePlaceholder}>
                      <Ionicons name="barbell-outline" size={28} color={theme.colors.primary} />
                    </View>
                  )}
                </View>
                <View style={s.latestCardBody}>
                  <Text style={s.latestMeta}>{exercise.level} · {exercise.durationMinutes} min</Text>
                  <Text numberOfLines={2} style={s.cardTitle}>{exercise.title}</Text>
                  <Text numberOfLines={1} style={s.cardMeta}>{exercise.bodyPart} · {exercise.category}</Text>
                  <Text style={s.latestDetails}>View details →</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingHorizontal: 18, paddingBottom: 120 },

    appBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
    brandLockup: { width: 106, height: 30, justifyContent: "center" },
    brandWordmark: { width: "100%", height: "100%" },
    appActions: { flexDirection: "row", gap: 8 },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    notificationButton: { position: "relative" },
    notificationBadge: {
      position: "absolute",
      right: -3,
      top: -3,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 4,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#D84C45",
      borderWidth: 1.5,
      borderColor: theme.colors.background,
    },
    notificationBadgeText: { color: "#FFFFFF", fontSize: 9, lineHeight: 11, fontFamily: theme.typography.fontFamilyBold },

    greetRow: { flexDirection: "row", alignItems: "center", marginTop: 6, marginBottom: 16 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    avatarText: { color: theme.colors.onPrimary, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    greetTitle: { color: theme.colors.text, fontSize: 16, fontFamily: theme.typography.fontFamilyBold },
    greetSub: { color: theme.colors.muted, fontSize: 12, marginTop: 2, fontFamily: theme.typography.fontFamily },
    todayPlanCopy: { flex: 1 },
    todayPlanSection: { marginBottom: 12 },
    todayPlanCard: {
      padding: 15,
      borderRadius: 19,
      backgroundColor: theme.colors.primary,
    },
    todayPlanTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    todayPlanEyebrow: { flexDirection: "row", alignItems: "center", gap: 6 },
    todayPlanEyebrowText: { color: theme.colors.onPrimary, fontSize: 10, letterSpacing: 1, fontFamily: theme.typography.fontFamilyBold },
    todayPlanTime: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.12)" },
    todayPlanTimeText: { color: theme.colors.onPrimary, fontSize: 10, fontFamily: theme.typography.fontFamilyMedium },
    todayPlanMiddle: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16, marginBottom: 14 },
    todayPlanIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.onPrimary,
    },
    todayPlanKicker: { color: theme.colors.onPrimary, opacity: 0.75, fontSize: 9, letterSpacing: 0.8, fontFamily: theme.typography.fontFamilyMedium },
    todayPlanTitle: { color: theme.colors.onPrimary, fontSize: 22, lineHeight: 27, textTransform: "capitalize", marginTop: 2, fontFamily: theme.typography.fontFamilyBold },
    todayPlanMeta: { color: theme.colors.onPrimary, opacity: 0.82, fontSize: 10, marginTop: 4, fontFamily: theme.typography.fontFamily },
    todayPlanAction: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 11, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.35)" },
    todayPlanActionText: { color: theme.colors.onPrimary, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },

    /* Hero */
    hero: { height: 200, borderRadius: 24, overflow: "hidden", backgroundColor: theme.colors.card, justifyContent: "space-between", padding: 14 },
    heroImage: { ...StyleSheet.absoluteFill, width: "40%", height: "100%" },
    heroShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.42)" },
    heroTopRow: { flexDirection: "row", gap: 8 },
    heroChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    heroChipText: { color: "#FFFFFF", fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
    heroBottom: { flexDirection: "row", alignItems: "flex-end" },
    heroTitle: { color: "#FFFFFF", fontSize: 24, lineHeight: 29, fontFamily: theme.typography.fontFamilyBold },
    heroSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4, fontFamily: theme.typography.fontFamily },
    heroPlay: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingLeft: 3,
    },

    /* Week */
    weekCard: {
      marginTop: 12,
      padding: 14,
      borderRadius: 18,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    weekHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    weekTitle: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    weekCount: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily },
    weekRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
    dayCol: { alignItems: "center", gap: 6 },
    dayLetter: { color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
    dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    dayCircleActive: { backgroundColor: theme.colors.primary },
    dayNum: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    dayNumActive: { color: theme.colors.onPrimary },
    track: { height: 5, borderRadius: 3, backgroundColor: theme.colors.border, marginTop: 12, overflow: "hidden" },
    trackFill: { height: "100%", borderRadius: 3, backgroundColor: theme.colors.primary },

    /* What's next */
    sectionTitle: { color: theme.colors.text, fontSize: 16, marginTop: 22, marginBottom: 10, fontFamily: theme.typography.fontFamilyBold },
    tileRow: { gap: 12, paddingRight: 18 },
    tile: { width: responsiveWidth(42), borderRadius: 18, padding: 14, minHeight: 142 },
    tileIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "rgba(255,255,255,0.7)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    tileTitle: { color: DARK_TEXT, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    tileSub: { color: "rgba(27,31,26,0.7)", fontSize: 11, lineHeight: 15, marginTop: 3, fontFamily: theme.typography.fontFamily },
    tileAction: { color: DARK_TEXT, fontSize: 11, marginTop: "auto", paddingTop: 12, fontFamily: theme.typography.fontFamilyBold },
    scanCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: "#E1F0E6",
      borderRadius: 18,
      padding: 14,
      marginTop: 12,
    },
    scanIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(255,255,255,0.7)",
      alignItems: "center",
      justifyContent: "center",
    },

    /* Featured */
    sectionRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 26, marginBottom: 12 },
    sectionTitleFlat: { color: theme.colors.text, fontSize: 16, fontFamily: theme.typography.fontFamilyBold },
    sectionSub: { color: theme.colors.muted, fontSize: 12, marginTop: 2, fontFamily: theme.typography.fontFamily },
    viewAll: { color: theme.colors.primaryDark, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    message: { color: theme.colors.textSecondary, fontSize: 12, fontFamily: theme.typography.fontFamily },
    cardRow: { gap: 12, paddingRight: 18 },
    card: {
      width: responsiveWidth(46),
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardImage: { width: "100%", height: 112, backgroundColor: theme.colors.border },
    cardPlaceholder: { alignItems: "center", justifyContent: "center" },
    badge: {
      position: "absolute",
      top: 8,
      left: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      backgroundColor: "rgba(0,0,0,0.55)",
    },
    badgeText: { color: "#FFFFFF", fontSize: 10, fontFamily: theme.typography.fontFamilyMedium },
    cardBody: { padding: 12 },
    latestCard: {
      width: responsiveWidth(66),
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    latestImageFrame: {
      width: "100%",
      height: 176,
      padding: 0,
      backgroundColor: theme.colors.surface,
    },
    latestImage: { width: "100%", height: "100%" },
    latestImagePlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: theme.colors.card,
    },
    latestCardBody: { padding: 12 },
    latestMeta: { color: theme.colors.primaryDark, fontSize: 10, marginBottom: 6, fontFamily: theme.typography.fontFamilyMedium },
    latestDetails: { color: theme.colors.primaryDark, fontSize: 11, marginTop: 10, fontFamily: theme.typography.fontFamilyBold },
    latestError: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    cardTitle: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    cardDesc: { color: theme.colors.textSecondary, fontSize: 11, lineHeight: 15, marginTop: 3, fontFamily: theme.typography.fontFamily },
    cardMeta: { color: theme.colors.muted, fontSize: 11, marginTop: 4, fontFamily: theme.typography.fontFamily },
    cardButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: 34,
      borderRadius: 17,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      marginTop: 10,
    },
    cardButtonText: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  });