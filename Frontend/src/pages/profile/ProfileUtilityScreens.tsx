import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { responsiveFontSize, responsiveWidth } from "react-native-responsive-dimensions";
import AppHeader from "../../components/AppHeader";
import { useTheme } from "../../theme/ThemeProvider";
import { useUser } from "../../data/UserProvider";
import { useAuth } from "../../context/AuthContext";

function Page({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.screen}>
      <AppHeader title={title} showBack />
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </View>
  );
}

export function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { name, email, setUser } = useUser();
  const styles = createStyles(theme);
  const [nextName, setNextName] = useState(name);
  const [nextEmail, setNextEmail] = useState(email);
  return (
    <Page title="Settings">
      <Text style={styles.description}>Keep your profile and app preferences up to date.</Text>
      {[['Name', nextName, setNextName], ['Email', nextEmail, setNextEmail]].map(([label, value, setter]) => (
        <View key={label as string} style={styles.field}>
          <Text style={styles.fieldLabel}>{label as string}</Text>
          <TextInput value={value as string} onChangeText={setter as (value: string) => void} placeholder={label as string} placeholderTextColor={theme.colors.muted} style={styles.input} />
        </View>
      ))}
      <Pressable onPress={() => setUser(nextName, nextEmail)} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Save profile</Text>
      </Pressable>
      <Pressable onPress={toggleTheme} style={styles.themeButton}>
        <Ionicons name={isDark ? "moon" : "sunny-outline"} size={20} color={theme.colors.icon} />
        <Text style={styles.themeButtonText}>{isDark ? "Dark mode" : "Light mode"}</Text>
      </Pressable>
    </Page>
  );
}

export function HelpSupportScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return <Page title="Help & Support"><Text style={styles.heading}>We are here to help.</Text><Text style={styles.body}>For questions about your plan, workout history, or the app, contact your support team and include the screen where you got stuck.</Text></Page>;
}

export function EditGoalsScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const [goal, setGoal] = useState("Build Muscle");
  return <Page title="Edit goals"><Text style={styles.description}>Choose the goal you want to focus on next.</Text><TextInput value={goal} onChangeText={setGoal} style={styles.input} /><Pressable onPress={() => navigation.goBack()} style={styles.saveGoalButton}><Text style={styles.primaryButtonText}>Save goal</Text></Pressable></Page>;
}

export function GoalDetailScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const route = useRoute<any>();
  const goal = route.params?.goal ?? { title: "Your goal", progress: 0 };
  return <Page title="Goal detail"><Text style={styles.goalTitle}>{goal.title}</Text><Text style={styles.goalBody}>You are {Math.round(goal.progress * 100)}% of the way there. Keep the next session small and consistent.</Text></Page>;
}

export function LogoutScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  return <Page title="Log out"><View style={styles.logoutContent}><Ionicons name="log-out-outline" size={44} color={theme.colors.primaryDark} /><Text style={styles.logoutTitle}>Leave your session?</Text><Text style={styles.logoutBody}>You can log back in anytime. Your workout history will stay saved on this device.</Text><Pressable onPress={async () => { await logout(); navigation.reset({ index: 0, routes: [{ name: "Welcome" }] }); }} style={styles.logoutButton}><Text style={styles.primaryButtonText}>Log out</Text></Pressable><Pressable onPress={() => navigation.goBack()} style={styles.stayButton}><Text style={styles.stayButtonText}>Stay signed in</Text></Pressable></View></Page>;
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: responsiveWidth(5), paddingBottom: 40 },
  description: { color: theme.colors.textSecondary, marginBottom: 20 },
  field: { marginBottom: 16 },
  fieldLabel: { color: theme.colors.text, fontWeight: "700", marginBottom: 7 },
  input: { color: theme.colors.text, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 12, padding: 13 },
  primaryButton: { padding: 14, borderRadius: 14, alignItems: "center", backgroundColor: theme.colors.primary },
  primaryButtonText: { color: theme.colors.onPrimary, fontWeight: "800" },
  themeButton: { flexDirection: "row", alignItems: "center", marginTop: 22, padding: 15, borderRadius: 14, backgroundColor: theme.colors.card },
  themeButtonText: { marginLeft: 10, color: theme.colors.text, fontWeight: "700" },
  heading: { fontSize: responsiveFontSize(2.4), fontWeight: "800", color: theme.colors.text },
  body: { marginTop: 12, lineHeight: 22, color: theme.colors.textSecondary },
  saveGoalButton: { marginTop: 18, padding: 14, borderRadius: 14, alignItems: "center", backgroundColor: theme.colors.primary },
  goalTitle: { fontSize: responsiveFontSize(3), fontWeight: "800", color: theme.colors.text },
  goalBody: { marginTop: 10, color: theme.colors.textSecondary },
  logoutContent: { alignItems: "center", paddingTop: 24 },
  logoutTitle: { marginTop: 18, color: theme.colors.text, fontSize: responsiveFontSize(2.6), fontWeight: "900" },
  logoutBody: { marginTop: 8, color: theme.colors.textSecondary, textAlign: "center", lineHeight: 22 },
  logoutButton: { width: "100%", marginTop: 26, padding: 15, borderRadius: 12, alignItems: "center", backgroundColor: theme.colors.primary },
  stayButton: { marginTop: 16, padding: 12 },
  stayButtonText: { color: theme.colors.text, fontWeight: "700" },
});