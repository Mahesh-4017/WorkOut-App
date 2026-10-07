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
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileGroup}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.profileName}>
                {name}
              </Text>
              <Text style={styles.profileEmail}>
                {email || "Fitness member"}
              </Text>
            </View>
          </View>

          <Pressable onPress={() => navigation.navigate("Settings")} hitSlop={10} style={styles.settingsButton}>
            <Ionicons
              name="settings-outline"
              size={22}
              color={theme.colors.icon}
            />
          </Pressable>
        </View>

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

        {/* Keep Going milestone card */}
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneHeader}>
            <View style={styles.milestoneIcon}>
              <Ionicons name="trophy-outline" size={17} color={theme.colors.icon} />
            </View>
            <Text style={styles.milestoneTitle}>
              Keep Going!
            </Text>
          </View>

          <Text style={styles.milestoneCopy}>
            {thisWeekCount} of {weeklyGoal} saved sessions completed this week.
          </Text>

          <View style={styles.milestoneTrack}>
            <View style={[styles.milestoneFill, { width: `${goal.progress * 100}%` }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Your dashboard
        </Text>
        <View style={styles.dashboardLinks}>
          {[
            { label: "Dashboard", icon: "grid-outline" as const, route: ROUTES.DASHBOARD },
            { label: "Calendar", icon: "calendar-outline" as const, route: ROUTES.WORKOUTCALENDAR },
            { label: "Analysis", icon: "analytics-outline" as const, route: ROUTES.ANALYSIS },
          ].map(item => (
            <Pressable
              key={item.label}
              onPress={() => navigation.navigate(item.route)}
              style={styles.dashboardLink}
            >
              <Ionicons name={item.icon} size={20} color={theme.colors.icon} />
              <Text style={styles.dashboardLinkText}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          Workout history
        </Text>
        {loading ? <Text style={styles.emptyText}>Loading account workout history…</Text> : null}
        {error ? <Text style={styles.emptyText}>{error}</Text> : null}
        {!loading && history.length === 0 ? (
          <Text style={styles.emptyText}>
            Workouts saved to your account will appear here.
          </Text>
        ) : (
          history.slice(0, 8).map(item => {
            return (
              <View key={item.id} style={styles.historyRow}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                <View style={styles.historyCopy}>
                  <Text style={styles.historyName}>{item.title}</Text>
                  <Text style={styles.historyDetail}>{new Date(item.startedAt).toLocaleDateString()} · {Math.floor(item.seconds / 60)} min</Text>
                </View>
              </View>
            );
          })
        )}

        {/* Goals */}
        <View style={styles.goalsHeader}>
          <Text style={styles.sectionTitle}>
            Goals
          </Text>

          <Pressable onPress={() => navigation.navigate("EditGoals")}>
            <Text style={styles.editText}>
              Edit
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => navigation.navigate("GoalDetail", { goal })}
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

        {/* Settings list */}
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
  content: { paddingHorizontal: responsiveWidth(5), paddingTop: 24, paddingBottom: 78 },
  profileHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  profileGroup: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.primary },
  avatarText: { fontSize: responsiveFontSize(2.3), fontWeight: "900", color: theme.colors.onPrimary },
  profileCopy: { marginLeft: 12 },
  profileName: { fontSize: responsiveFontSize(2.1), fontWeight: "800", color: theme.colors.text },
  profileEmail: { marginTop: 2, fontSize: responsiveFontSize(1.4), color: theme.colors.textSecondary },
  settingsButton: { padding: 8 },
  statsCard: { flexDirection: "row", marginTop: 22, padding: 16, borderRadius: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { borderLeftWidth: 1, borderLeftColor: theme.colors.border },
  statValue: { fontSize: responsiveFontSize(1.9), fontWeight: "800", color: theme.colors.text },
  statLabel: { marginTop: 3, fontSize: responsiveFontSize(1.25), color: theme.colors.textSecondary },
  milestoneCard: { marginTop: 18, padding: 16, borderRadius: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  milestoneHeader: { flexDirection: "row", alignItems: "center" },
  milestoneIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background },
  milestoneTitle: { marginLeft: 10, fontSize: responsiveFontSize(1.65), fontWeight: "700", color: theme.colors.text },
  milestoneCopy: { marginTop: 8, fontSize: responsiveFontSize(1.4), color: theme.colors.textSecondary },
  milestoneTrack: { height: 6, marginTop: 12, borderRadius: 3, backgroundColor: theme.colors.border, overflow: "hidden" },
  milestoneFill: { height: "100%", borderRadius: 3, backgroundColor: theme.colors.primary },
  sectionTitle: { marginTop: 26, marginBottom: 12, fontSize: responsiveFontSize(2.1), fontWeight: "800", color: theme.colors.text },
  dashboardLinks: { flexDirection: "row", gap: 10 },
  dashboardLink: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  dashboardLinkText: { marginTop: 8, fontSize: responsiveFontSize(1.35), fontWeight: "700", color: theme.colors.text },
  emptyText: { color: theme.colors.textSecondary },
  historyRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  historyCopy: { marginLeft: 10 },
  historyName: { fontWeight: "700", color: theme.colors.text },
  historyDetail: { marginTop: 2, fontSize: responsiveFontSize(1.25), color: theme.colors.textSecondary },
  goalsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 26, marginBottom: 12 },
  editText: { fontSize: responsiveFontSize(1.4), fontWeight: "700", color: theme.colors.icon },
  goalCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  goalIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background },
  goalCopy: { flex: 1, marginLeft: 12 },
  goalName: { fontSize: responsiveFontSize(1.65), fontWeight: "700", color: theme.colors.text },
  goalProgress: { marginTop: 2, fontSize: responsiveFontSize(1.3), color: theme.colors.textSecondary },
  settingsList: { marginTop: 26, gap: 4 },
  settingsRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14, borderRadius: 12 },
  settingsLabel: { flex: 1, marginLeft: 12, fontSize: responsiveFontSize(1.65), fontWeight: "600", color: theme.colors.text },
  destructiveLabel: { color: theme.colors.danger },
});