import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useTheme } from "../../theme/ThemeProvider";
import { useUser } from "../../data/UserProvider";
import { useSession } from "../../data/SessionProvider";
import { ROUTES } from "../../navigation/routes";
import { WORKOUT_ROUTES } from "../../navigation/workoutRoutes";

const DEFAULT_WEEKLY_GOAL = 5;

type SettingsRow = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  destructive?: boolean;
};

const settingsRows: SettingsRow[] = [
  { label: "Settings", icon: "settings-outline" },
  { label: "Help & Support", icon: "help-circle-outline" },
  { label: "Log Out", icon: "log-out-outline", destructive: true },
];

export default function ProfileScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const { name, email } = useUser();
  const { history, goals, loading, error } = useSession();
  const weeklyGoal = goals?.weeklySessions ?? DEFAULT_WEEKLY_GOAL;
  const thisWeekCount = history.filter(item => Date.now() - new Date(item.startedAt).getTime() < 7 * 24 * 60 * 60 * 1000).length;
  const goal = { title: "Weekly sessions", progress: Math.min(thisWeekCount / weeklyGoal, 1) };
  const totalMinutes = Math.floor(history.reduce((total, item) => total + item.seconds, 0) / 60);
  const stats = [
    { label: "Saved sessions", value: `${history.length}` },
    { label: "This week", value: `${thisWeekCount}` },
    { label: "Minutes", value: `${totalMinutes}` },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.pageHeading}>
          <Text style={styles.eyebrow}>ACCOUNT</Text>
          <Text style={styles.pageTitle}>Your space</Text>
          <Text style={styles.pageSubtitle}>Profile, progress, and preferences</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate(ROUTES.SETTINGS)}
          style={styles.profileHeader}
          accessibilityRole="button"
          accessibilityLabel="Edit profile details"
        >
          <View style={styles.profileGroup}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name.trim().charAt(0).toUpperCase() || "W"}
              </Text>
            </View>
            <View style={styles.profileCopy}>
              <Text numberOfLines={1} style={styles.profileName}>{name || "Fitness member"}</Text>
              <Text numberOfLines={1} style={styles.profileEmail}>{email || "Manage your profile"}</Text>
            </View>
          </View>
          <View style={styles.profileAction}>
            <Ionicons name="chevron-forward" size={19} color={theme.colors.onPrimary} />
          </View>
        </Pressable>

        {/* Stats */}
        <View style={styles.statsCard}>
          {stats.map((stat, index) => (
            <View
              key={stat.label}
              style={[styles.statItem, index > 0 && styles.statDivider]}
            >
              <Text style={styles.statValue}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeading}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>Quick access</Text>
            <Text style={styles.sectionSubtitle}>Your most-used tools</Text>
          </View>
        </View>
        <View style={styles.dashboardLinks}>
          {[
            { label: "Calendar", icon: "calendar-outline" as const, route: ROUTES.WORKOUTCALENDAR, tint: theme.colors.panelWarm },
            { label: "Progress", icon: "stats-chart-outline" as const, route: ROUTES.ANALYSIS, tint: theme.colors.panel },
            { label: "History", icon: "time-outline" as const, route: WORKOUT_ROUTES.HISTORY, tint: theme.colors.statsBackground },
            { label: "Notifications", icon: "notifications-outline" as const, route: ROUTES.NOTIFICATIONS, tint: theme.colors.panelWarm },
          ].map(item => (
            <Pressable
              key={item.label}
              onPress={() => navigation.navigate(item.route)}
              style={styles.dashboardLink}
              accessibilityRole="button"
            >
              <View style={[styles.quickIcon, { backgroundColor: item.tint }]}>
                <Ionicons name={item.icon} size={19} color={theme.colors.primaryDark} />
              </View>
              <Text style={styles.dashboardLinkText}>{item.label}</Text>
              <Ionicons name="arrow-forward" size={15} color={theme.colors.muted} style={styles.quickArrow} />
            </Pressable>
          ))}
        </View>

        {/* Weekly milestone */}
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneTop}>
            <View style={styles.milestoneHeader}>
              <View style={styles.milestoneIcon}>
                <Ionicons name="trophy-outline" size={18} color={theme.colors.onPrimary} />
              </View>
              <View>
                <Text style={styles.milestoneTitle}>Weekly goal</Text>
                <Text style={styles.milestoneCopy}>{thisWeekCount} of {weeklyGoal} sessions completed</Text>
              </View>
            </View>
            <Text style={styles.milestonePercent}>{Math.round(goal.progress * 100)}%</Text>
          </View>
          <View style={styles.milestoneTrack}>
            <View style={[styles.milestoneFill, { width: `${goal.progress * 100}%` }]} />
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>Recent workouts</Text>
            <Text style={styles.sectionSubtitle}>Your latest completed sessions.</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate(ROUTES.WORKOUTCALENDAR)}
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>View all</Text>
          </Pressable>
        </View>
        {loading ? <Text style={styles.emptyText}>Loading account workout history…</Text> : null}
        {error ? <Text style={styles.emptyText}>{error}</Text> : null}
        {!loading && history.length === 0 ? (
          <View style={styles.historyEmpty}>
            <Ionicons name="barbell-outline" size={22} color={theme.colors.muted} />
            <Text style={styles.emptyText}>Completed workouts will appear here.</Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {history.slice(0, 8).map(item => (
              <View key={item.id} style={styles.historyRow}>
                <View style={styles.historyIcon}>
                  <Ionicons name="checkmark" size={15} color={theme.colors.primaryDark} />
                </View>
                <View style={styles.historyCopy}>
                  <Text numberOfLines={1} style={styles.historyName}>{item.title}</Text>
                  <Text style={styles.historyDetail}>{new Date(item.startedAt).toLocaleDateString()} · {Math.floor(item.seconds / 60)} min</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
              </View>
            ))}
          </View>
        )}

        {/* Goals */}
        <View style={styles.goalsHeader}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>Your goal</Text>
            <Text style={styles.sectionSubtitle}>Small steps add up over time.</Text>
          </View>

          <Pressable onPress={() => navigation.navigate(ROUTES.EDIT_GOALS)} accessibilityRole="button">
            <Text style={styles.editText}>
              Edit
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => navigation.navigate(ROUTES.GOAL_DETAIL, { goal })}
          style={styles.goalCard}
        >
          <View style={styles.goalIcon}>
            <Ionicons name="barbell-outline" size={19} color={theme.colors.icon} />
          </View>

          <View style={styles.goalCopy}>
            <Text style={styles.goalName}>
              {goal.title}
            </Text>
            <Text style={styles.goalProgress}>
              Progress: {Math.round(goal.progress * 100)}%
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={theme.colors.icon} />
        </Pressable>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingsList}>
          {settingsRows.map((row) => (
            <Pressable
              key={row.label}
              onPress={async () => {
                if (row.label === "Log Out") {
                  navigation.navigate(ROUTES.LOGOUT);
                  return;
                }
                navigation.navigate(row.label === "Help & Support" ? ROUTES.HELP_SUPPORT : ROUTES.SETTINGS);
              }}
              style={styles.settingsRow}
            >
              <Ionicons
                name={row.icon}
                size={19}
                color={row.destructive ? theme.colors.danger : theme.colors.icon}
              />
              <Text style={[styles.settingsLabel, row.destructive && styles.destructiveLabel]}>
                {row.label}
              </Text>
              {!row.destructive && (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.colors.icon}
                />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>

    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: responsiveWidth(5), paddingTop: 18, paddingBottom: 100 },
  pageHeading: { marginBottom: 18 },
  eyebrow: { color: theme.colors.primaryDark, fontSize: responsiveFontSize(1.05), fontWeight: "800", letterSpacing: 1.4 },
  pageTitle: { color: theme.colors.text, fontSize: responsiveFontSize(3.2), fontWeight: "900", marginTop: 3 },
  pageSubtitle: { color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.3), marginTop: 4 },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 17,
    minHeight: 94,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryDark,
  },
  profileGroup: { flex: 1, flexDirection: "row", alignItems: "center", minWidth: 0 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  avatarText: { fontSize: responsiveFontSize(2.5), fontWeight: "900", color: theme.colors.onPrimary },
  profileCopy: { flex: 1, marginLeft: 13, minWidth: 0 },
  profileName: { fontSize: responsiveFontSize(2), fontWeight: "800", color: theme.colors.onPrimary },
  profileEmail: { marginTop: 4, fontSize: responsiveFontSize(1.3), color: theme.colors.onPrimary, opacity: 0.78 },
  profileAction: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  statsCard: {
    flexDirection: "row",
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 17,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  statDivider: { borderLeftWidth: 1, borderLeftColor: theme.colors.border },
  statValue: { fontSize: responsiveFontSize(2), fontWeight: "800", color: theme.colors.text },
  statLabel: { marginTop: 4, fontSize: responsiveFontSize(1.15), color: theme.colors.textSecondary, textAlign: "center" },
  milestoneCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: theme.colors.panelWarm,
  },
  milestoneTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  milestoneHeader: { flexDirection: "row", alignItems: "center", flex: 1 },
  milestoneIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.primary },
  milestoneTitle: { marginLeft: 10, fontSize: responsiveFontSize(1.6), fontWeight: "800", color: theme.colors.text },
  milestoneCopy: { marginLeft: 10, marginTop: 3, fontSize: responsiveFontSize(1.2), color: theme.colors.textSecondary },
  milestonePercent: { color: theme.colors.primaryDark, fontSize: responsiveFontSize(1.7), fontWeight: "800" },
  milestoneTrack: { height: 7, marginTop: 14, borderRadius: 4, backgroundColor: theme.colors.border, overflow: "hidden" },
  milestoneFill: { height: "100%", borderRadius: 4, backgroundColor: theme.colors.primary },
  sectionTitle: { marginTop: 22, marginBottom: 4, fontSize: responsiveFontSize(1.9), fontWeight: "800", color: theme.colors.text },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 9 },
  sectionCopy: { flex: 1 },
  sectionSubtitle: { color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.2), marginTop: 3 },
  linkText: { color: theme.colors.primaryDark, fontSize: responsiveFontSize(1.25), fontWeight: "800" },
  dashboardLinks: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  dashboardLink: {
    width: "47%",
    minHeight: 91,
    justifyContent: "center",
    padding: 13,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickIcon: { width: 35, height: 35, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  dashboardLinkText: { marginTop: 8, fontSize: responsiveFontSize(1.35), fontWeight: "700", color: theme.colors.text },
  quickArrow: { position: "absolute", right: 12, top: 15 },
  emptyText: { color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.3) },
  historyList: { paddingHorizontal: 13, borderRadius: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  historyEmpty: { minHeight: 74, flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 16, backgroundColor: theme.colors.card },
  historyRow: { flexDirection: "row", alignItems: "center", minHeight: 60, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  historyIcon: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: theme.colors.surface },
  historyCopy: { flex: 1, marginLeft: 10 },
  historyName: { fontWeight: "700", color: theme.colors.text },
  historyDetail: { marginTop: 3, fontSize: responsiveFontSize(1.2), color: theme.colors.textSecondary },
  goalsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 9 },
  editText: { fontSize: responsiveFontSize(1.4), fontWeight: "700", color: theme.colors.primaryDark },
  goalCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  goalIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surface },
  goalCopy: { flex: 1, marginLeft: 12 },
  goalName: { fontSize: responsiveFontSize(1.65), fontWeight: "700", color: theme.colors.text },
  goalProgress: { marginTop: 3, fontSize: responsiveFontSize(1.3), color: theme.colors.textSecondary },
  settingsList: { marginTop: 2, paddingHorizontal: 13, borderRadius: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  settingsRow: { flexDirection: "row", alignItems: "center", minHeight: 53, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  settingsLabel: { flex: 1, marginLeft: 12, fontSize: responsiveFontSize(1.5), fontWeight: "600", color: theme.colors.text },
  destructiveLabel: { color: theme.colors.danger },
});