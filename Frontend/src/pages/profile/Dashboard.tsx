import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { responsiveFontSize, responsiveWidth } from "react-native-responsive-dimensions";
import AppHeader from "../../components/AppHeader";
import { useTheme } from "../../theme/ThemeProvider";
import { useUser } from "../../data/UserProvider";
import { ROUTES } from "../../navigation/routes";
import { PROGRESS_ROUTES } from "../../navigation/progressRoutes";

export default function Dashboard() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const { name, history } = useUser();
  const actions = [
    { label: "Today's workout", icon: "barbell-outline" as const, route: ROUTES.WORKOUT },
    { label: "Calendar", icon: "calendar-outline" as const, route: ROUTES.WORKOUTCALENDAR },
    { label: "Analysis", icon: "stats-chart-outline" as const, route: ROUTES.ANALYSIS },
    { label: "Progress overview", icon: "trending-up-outline" as const, route: PROGRESS_ROUTES.OVERVIEW },
  ];
  return (
    <View style={styles.screen}>
      <AppHeader title="Dashboard" description={`Welcome back, ${name}`} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          {[{ label: "Completed", value: history.length }, { label: "Sessions", value: Math.ceil(history.length / 3) }, { label: "Progress", value: `${Math.min(history.length * 10, 100)}%` }].map(item => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.nextStep}>
          <Text style={styles.eyebrow}>YOUR NEXT STEP</Text>
          <Text style={styles.nextTitle}>Keep your momentum going.</Text>
          <Text style={styles.nextDescription}>Choose a session and make today count.</Text>
          <Pressable onPress={() => navigation.navigate(ROUTES.WORKOUT)} style={styles.startButton}>
            <Text style={styles.startButtonText}>Start now</Text>
          </Pressable>
        </View>
        <Text style={styles.sectionTitle}>Quick access</Text>
        {actions.map(action => (
          <Pressable key={action.label} onPress={() => navigation.navigate(action.route)} style={styles.actionRow}>
            <Ionicons name={action.icon} size={21} color={theme.colors.icon} />
            <Text style={styles.actionLabel}>{action.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: responsiveWidth(5), paddingTop: 14, paddingBottom: 80 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, padding: 13, borderRadius: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  statValue: { color: theme.colors.text, fontSize: responsiveFontSize(2), fontWeight: "900" },
  statLabel: { color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.2), marginTop: 4 },
  nextStep: { marginTop: 22, padding: 18, borderRadius: 16, backgroundColor: theme.colors.primary },
  eyebrow: { color: theme.colors.onPrimary, fontSize: responsiveFontSize(1.25), fontWeight: "800", letterSpacing: 1 },
  nextTitle: { color: theme.colors.onPrimary, fontSize: responsiveFontSize(2.5), fontWeight: "900", marginTop: 8 },
  nextDescription: { color: theme.colors.onPrimary, opacity: 0.75, marginTop: 6 },
  startButton: { alignSelf: "flex-start", marginTop: 16, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: theme.colors.onPrimary },
  startButtonText: { color: theme.colors.primaryDark, fontWeight: "800" },
  sectionTitle: { color: theme.colors.text, fontSize: responsiveFontSize(2.1), fontWeight: "800", marginTop: 28, marginBottom: 12 },
  actionRow: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 10 },
  actionLabel: { flex: 1, marginLeft: 12, color: theme.colors.text, fontWeight: "700" },
});
