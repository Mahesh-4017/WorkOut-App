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
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { responsiveWidth } from "react-native-responsive-dimensions";

import { useTheme } from "../../theme/ThemeProvider";
import { ROUTES } from "../../navigation/routes";
import { WORKOUT_ROUTES } from "../../navigation/workoutRoutes";
import { useUser } from "../../data/UserProvider";
import { useAuth } from "../../context/AuthContext";
import { getAllPublicCards, ApiCard } from "../../api/cards";
import { resolveApiMediaUrl } from "../../api/client";
import { FOOD_ROUTES } from "../../navigation/foodRoutes";

const WEEKLY_GOAL = 5; // workouts per week
const DARK_TEXT = "#1B1F1A"; // text on the pastel tiles

export default function Home() {
  const navigation = useNavigation<any>();
  const { theme, isDark, toggleTheme } = useTheme();
  const { name, history } = useUser();
  const { user } = useAuth();
  const s = createStyles(theme);

  const [today] = React.useState(() => new Date());
  const [cardsState, setCardsState] = React.useState<{ items: ApiCard[]; error: string | null }>({
    items: [],
    error: null,
  });
  const [loading, setLoading] = React.useState(true);
  const { items: cards, error: cardsError } = cardsState;

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

  const done = Math.min(history.length, WEEKLY_GOAL);
  const progress = done / WEEKLY_GOAL;
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

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* App bar */}
        <View style={s.appBar}>
          <Text style={s.appTitle}>Velocity Health</Text>
          <View style={s.appActions}>
            <Pressable onPress={toggleTheme} style={s.iconButton} accessibilityLabel="Toggle theme">
              <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={theme.colors.text} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
              style={s.iconButton}
              accessibilityLabel="Notifications"
              accessibilityRole="button"
            >
              <Ionicons name="notifications-outline" size={18} color={theme.colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Greeting */}
        <View style={s.greetRow}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.greetTitle}>
              {greeting}, {firstName}
            </Text>
            <Text style={s.greetSub}>A little movement. A better day.</Text>
          </View>
        </View>

        {/* Hero: today's workout */}
        {/* <Pressable onPress={startFeatured} style={s.hero} accessibilityRole="button" accessibilityLabel="Start today's workout">
          <Image source={require("../../assets/challenge.png")} style={s.heroImage} resizeMode="cover" />
          <View style={s.heroShade} />
          <View style={s.heroTopRow}>
            <View style={s.heroChip}>
              <Text style={s.heroChipText}>Today's workout</Text>
            </View>
            {featured ? (
              <View style={s.heroChip}>
                <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                <Text style={s.heroChipText}>{featured.duration}</Text>
              </View>
            ) : null}
          </View>
          <View style={s.heroBottom}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text numberOfLines={2} style={s.heroTitle}>
                {featured?.name ?? "Pick a workout"}
              </Text>
              <Text numberOfLines={1} style={s.heroSub}>
                {featured ? `${featured.sets} sets × ${featured.reps} reps · ${featured.difficulty}` : "Browse the full library"}
              </Text>
            </View>
            <View style={s.heroPlay}>
              <Ionicons name="play" size={22} color={theme.colors.onPrimary} />
            </View>
          </View>
        </Pressable> */}

        {/* Week progress */}
        <View style={s.weekCard}>
          <View style={s.weekHeader}>
            <Text style={s.weekTitle}>This week</Text>
            <Text style={s.weekCount}>
              {done} of {WEEKLY_GOAL} workouts
            </Text>
          </View>
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
        <View style={s.tileRow}>
          <Pressable onPress={goWorkout} style={[s.tile, { backgroundColor: "#E8E3F7" }]}>
            <View style={s.tileIcon}>
              <Ionicons name="barbell-outline" size={18} color={DARK_TEXT} />
            </View>
            <Text style={s.tileTitle}>Explore Workouts</Text>
            <Text style={s.tileSub}>Find your fit in 27 sessions</Text>
          </Pressable>
          <Pressable onPress={goWorkoutSchedule} style={[s.tile, { backgroundColor: "#F8F0CF" }]}>
            <View style={s.tileIcon}>
              <Ionicons name="calendar-outline" size={18} color={DARK_TEXT} />
            </View>
            <Text style={s.tileTitle}>Workout Schedule</Text>
            <Text style={s.tileSub}>Plan and manage upcoming classes</Text>
          </Pressable>
        </View>

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
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingHorizontal: 18, paddingBottom: 120 },

    appBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
    appTitle: { color: theme.colors.text, fontSize: 16, fontFamily: theme.typography.fontFamilyBold },
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
    tileRow: { flexDirection: "row", gap: 12 },
    tile: { flex: 1, borderRadius: 18, padding: 14, minHeight: 118 },
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