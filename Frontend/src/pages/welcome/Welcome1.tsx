import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { responsiveFontSize, responsiveWidth } from "react-native-responsive-dimensions";

import PrimaryButton from "../../components/PrimaryButton";
import { ROUTES } from "../../navigation/routes";
import { useTheme } from "../../theme/ThemeProvider";

const WorkoutRoutineScreen = () => {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>WorkOut</Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>YOUR WEEK, YOUR PACE</Text>

          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Made for you</Text>
            <Text style={styles.progressText}>3 of 4 sessions complete</Text>
            <View style={styles.progressBackground}>
              <View style={styles.progress} />
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>30</Text>
                <Text style={styles.statLabel}>Minutes / session</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>Start</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
            </View>
          </View>

          <View style={styles.workoutCard}>
            <View style={styles.workoutCopy}>
              <Text style={styles.workoutTitle}>Dumbbell Burn and Build</Text>
              <Text style={styles.workoutSubtitle}>Today  ·  Strength  ·  30 min</Text>
            </View>
            <View style={styles.checkCircle}>
              <Text style={styles.check}>✓</Text>
            </View>
          </View>

          <Text style={styles.mainTitle}>Build your workout routine</Text>
          <Text style={styles.mainDescription}>
            Personalized workouts for your goals, experience and equipment.
          </Text>
          <Text style={styles.smallDescription}>Start small. Build steadily.</Text>

          <View style={styles.pagination}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.bottom}>
          <PrimaryButton
            title="Next"
            onPress={() => navigation.navigate(ROUTES.WELCOME_2)}
            description="A plan that fits your life."
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WorkoutRoutineScreen;

const createStyles = (theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, justifyContent: "space-between", paddingHorizontal: responsiveWidth(6) },
  header: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { color: theme.colors.text, fontSize: responsiveFontSize(2.1), fontWeight: "800" },
  skip: { color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.8), fontWeight: "600" },
  content: { flex: 1, justifyContent: "center", paddingVertical: 16 },
  eyebrow: { color: theme.colors.primary, fontSize: responsiveFontSize(1.5), fontWeight: "800", letterSpacing: 1, marginBottom: 14 },
  summaryCard: { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 18, padding: 18 },
  cardTitle: { color: theme.colors.text, fontSize: responsiveFontSize(2.2), fontWeight: "800" },
  progressText: { color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.6), marginTop: 8 },
  progressBackground: { height: 8, backgroundColor: theme.colors.border, borderRadius: 4, marginTop: 12, overflow: "hidden" },
  progress: { width: "75%", height: "100%", backgroundColor: theme.colors.primary, borderRadius: 4 },
  statsContainer: { flexDirection: "row", marginTop: 18 },
  stat: { flex: 1 },
  statNumber: { color: theme.colors.text, fontSize: responsiveFontSize(2.5), fontWeight: "800" },
  statLabel: { color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.5), marginTop: 2 },
  workoutCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 12 },
  workoutCopy: { flex: 1, paddingRight: 10 },
  workoutTitle: { color: theme.colors.text, fontSize: responsiveFontSize(1.7), fontWeight: "700" },
  workoutSubtitle: { color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.4), marginTop: 5 },
  checkCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
  check: { color: theme.colors.onPrimary, fontSize: 17, fontWeight: "800" },
  mainTitle: { color: theme.colors.text, fontSize: responsiveFontSize(3.2), fontWeight: "800", lineHeight: responsiveFontSize(4), marginTop: 22 },
  mainDescription: { color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.8), lineHeight: responsiveFontSize(2.6), marginTop: 8 },
  smallDescription: { color: theme.colors.primaryDark, fontSize: responsiveFontSize(1.6), fontWeight: "700", marginTop: 8 },
  pagination: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 18 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.border },
  activeDot: { width: 22, backgroundColor: theme.colors.primary },
  bottom: { paddingBottom: 10 },
});