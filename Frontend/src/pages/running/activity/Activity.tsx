import React, { useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { fmtClock, useSession } from "../../../data/SessionProvider";
import { useTheme } from "../../../theme/ThemeProvider";
import { ROUTES } from "../../../navigation/routes";
import { ScreenHeader } from "../data/Movementui";

export default function ActivityOverview() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const s = createStyles(theme);
  const { history, loading, error, refreshProgress } = useSession();
  const monthKey = new Date().toISOString().slice(0, 7);
  const monthly = useMemo(() => history.filter(item => item.startedAt.slice(0, 7) === monthKey), [history, monthKey]);
  const activeDays = new Set(monthly.map(item => item.startedAt.slice(0, 10))).size;
  const totalSeconds = monthly.reduce((total, item) => total + item.seconds, 0);

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Activity"
          onBack={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate(ROUTES.HOME, { tab: "home" });
          }}
          onProfile={() => navigation.navigate(ROUTES.PROFILE)}
        />
        <View style={s.summary}>
          <Text style={s.eyebrow}>THIS MONTH · {new Date().toLocaleDateString(undefined, { month: "long" }).toUpperCase()}</Text>
          <View style={s.stats}>
            <View style={s.stat}><Text style={s.statValue}>{activeDays}</Text><Text style={s.statLabel}>active days</Text></View>
            <View style={s.divider} />
            <View style={s.stat}><Text style={s.statValue}>{Math.floor(totalSeconds / 3600)}h {Math.floor((totalSeconds % 3600) / 60)}m</Text><Text style={s.statLabel}>recorded time</Text></View>
            <View style={s.divider} />
            <View style={s.stat}><Text style={s.statValue}>{monthly.length}</Text><Text style={s.statLabel}>sessions</Text></View>
          </View>
        </View>

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Saved activity</Text>
          <Pressable
            onPress={async () => {
              try {
                await refreshProgress();
              } catch (refreshError) {
                Alert.alert("Unable to refresh activity", refreshError instanceof Error ? refreshError.message : "Please try again.");
              }
            }}
            accessibilityRole="button"
          >
            <Ionicons name="refresh-outline" size={19} color={theme.colors.primary} />
          </Pressable>
        </View>
        {loading ? <Text style={s.message}>Loading your saved activity…</Text> : null}
        {error ? <Text style={s.error}>{error}</Text> : null}
        {!loading && history.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="walk-outline" size={28} color={theme.colors.muted} />
            <Text style={s.emptyTitle}>No activity recorded yet</Text>
            <Text style={s.message}>Use the timer on the Run tab or finish a workout to add real session history.</Text>
          </View>
        ) : null}
        {history.map(session => (
          <View key={session.id} style={s.session}>
            <View style={s.sessionIcon}>
              <Ionicons name={session.workoutId.startsWith("manual-run") ? "footsteps-outline" : session.workoutId.startsWith("manual-walk") ? "walk-outline" : "barbell-outline"} size={19} color={theme.colors.primary} />
            </View>
            <View style={s.sessionCopy}>
              <Text style={s.sessionTitle}>{session.title}</Text>
              <Text style={s.sessionMeta}>{new Date(session.startedAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {fmtClock(session.seconds, false)}</Text>
            </View>
            <Text style={s.sessionValue}>{session.calories} kcal</Text>
          </View>
        ))}
        <Pressable onPress={() => navigation.navigate(ROUTES.WORKOUTCALENDAR)} style={s.scheduleButton} accessibilityRole="button">
          <Text style={s.scheduleText}>View workout schedule</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 18, paddingBottom: 28 },
  summary: { borderRadius: 18, padding: 16, marginTop: 8, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  eyebrow: { color: theme.colors.muted, fontSize: 10, letterSpacing: 0.7, fontFamily: theme.typography.fontFamilyBold },
  stats: { flexDirection: "row", alignItems: "center", marginTop: 17 },
  stat: { flex: 1, alignItems: "center" },
  statValue: { color: theme.colors.text, fontSize: 17, fontFamily: theme.typography.fontFamilyBold },
  statLabel: { color: theme.colors.muted, fontSize: 9, marginTop: 4, textAlign: "center", fontFamily: theme.typography.fontFamily },
  divider: { width: 1, height: 32, backgroundColor: theme.colors.border },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 23, marginBottom: 10 },
  sectionTitle: { color: theme.colors.text, fontSize: 16, fontFamily: theme.typography.fontFamilyBold },
  message: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center", fontFamily: theme.typography.fontFamily },
  error: { color: "#B42318", fontSize: 12, marginBottom: 8, fontFamily: theme.typography.fontFamily },
  empty: { alignItems: "center", gap: 8, padding: 24, borderRadius: 16, backgroundColor: theme.colors.card },
  emptyTitle: { color: theme.colors.text, fontSize: 15, fontFamily: theme.typography.fontFamilyBold },
  session: { flexDirection: "row", alignItems: "center", gap: 11, padding: 12, marginBottom: 8, borderRadius: 13, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  sessionIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: theme.colors.surface },
  sessionCopy: { flex: 1 },
  sessionTitle: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
  sessionMeta: { color: theme.colors.muted, fontSize: 10, marginTop: 3, fontFamily: theme.typography.fontFamily },
  sessionValue: { color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamilyMedium },
  scheduleButton: { height: 46, alignItems: "center", justifyContent: "center", borderRadius: 23, marginTop: 10, backgroundColor: theme.colors.primary },
  scheduleText: { color: theme.colors.onPrimary, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
});
