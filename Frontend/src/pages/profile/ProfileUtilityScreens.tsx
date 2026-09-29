import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { responsiveFontSize, responsiveWidth } from "react-native-responsive-dimensions";
import AppHeader from "../../components/AppHeader";
import { useTheme } from "../../theme/ThemeProvider";
import { useUser } from "../../data/UserProvider";
import { useAuth } from "../../context/AuthContext";

function Page({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppHeader title={title} showBack />
      <ScrollView contentContainerStyle={{ padding: responsiveWidth(5), paddingBottom: 40 }}>{children}</ScrollView>
    </View>
  );
}

export function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { name, email, setUser } = useUser();
  const [nextName, setNextName] = useState(name);
  const [nextEmail, setNextEmail] = useState(email);
  return (
    <Page title="Settings">
      <Text style={{ color: theme.colors.textSecondary, marginBottom: 20 }}>Keep your profile and app preferences up to date.</Text>
      {[['Name', nextName, setNextName], ['Email', nextEmail, setNextEmail]].map(([label, value, setter]) => (
        <View key={label as string} style={{ marginBottom: 16 }}>
          <Text style={{ color: theme.colors.text, fontWeight: "700", marginBottom: 7 }}>{label as string}</Text>
          <TextInput value={value as string} onChangeText={setter as (value: string) => void} placeholder={label as string} placeholderTextColor={theme.colors.muted} style={{ color: theme.colors.text, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 12, padding: 13 }} />
        </View>
      ))}
      <Pressable onPress={() => setUser(nextName, nextEmail)} style={{ padding: 14, borderRadius: 14, alignItems: "center", backgroundColor: theme.colors.primary }}>
        <Text style={{ color: theme.colors.onPrimary, fontWeight: "800" }}>Save profile</Text>
      </Pressable>
      <Pressable onPress={toggleTheme} style={{ flexDirection: "row", alignItems: "center", marginTop: 22, padding: 15, borderRadius: 14, backgroundColor: theme.colors.card }}>
        <Ionicons name={isDark ? "moon" : "sunny-outline"} size={20} color={theme.colors.icon} />
        <Text style={{ marginLeft: 10, color: theme.colors.text, fontWeight: "700" }}>{isDark ? "Dark mode" : "Light mode"}</Text>
      </Pressable>
    </Page>
  );
}

export function HelpSupportScreen() {
  const { theme } = useTheme();
  return <Page title="Help & Support"><Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: "800", color: theme.colors.text }}>We are here to help.</Text><Text style={{ marginTop: 12, lineHeight: 22, color: theme.colors.textSecondary }}>For questions about your plan, workout history, or the app, contact your support team and include the screen where you got stuck.</Text></Page>;
}

export function EditGoalsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [goal, setGoal] = useState("Build Muscle");
  return <Page title="Edit goals"><Text style={{ color: theme.colors.textSecondary, marginBottom: 18 }}>Choose the goal you want to focus on next.</Text><TextInput value={goal} onChangeText={setGoal} style={{ color: theme.colors.text, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 12, padding: 13 }} /><Pressable onPress={() => navigation.goBack()} style={{ marginTop: 18, padding: 14, borderRadius: 14, alignItems: "center", backgroundColor: theme.colors.primary }}><Text style={{ color: theme.colors.onPrimary, fontWeight: "800" }}>Save goal</Text></Pressable></Page>;
}

export function GoalDetailScreen() {
  const { theme } = useTheme();
  const route = useRoute<any>();
  const goal = route.params?.goal ?? { title: "Your goal", progress: 0 };
  return <Page title="Goal detail"><Text style={{ fontSize: responsiveFontSize(3), fontWeight: "800", color: theme.colors.text }}>{goal.title}</Text><Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>You are {Math.round(goal.progress * 100)}% of the way there. Keep the next session small and consistent.</Text></Page>;
}

export function LogoutScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  return <Page title="Log out"><View style={{ alignItems: "center", paddingTop: 24 }}><Ionicons name="log-out-outline" size={44} color={theme.colors.primaryDark} /><Text style={{ marginTop: 18, color: theme.colors.text, fontSize: responsiveFontSize(2.6), fontWeight: "900" }}>Leave your session?</Text><Text style={{ marginTop: 8, color: theme.colors.textSecondary, textAlign: "center", lineHeight: 22 }}>You can log back in anytime. Your workout history will stay saved on this device.</Text><Pressable onPress={async () => { await logout(); navigation.reset({ index: 0, routes: [{ name: "Welcome" }] }); }} style={{ width: "100%", marginTop: 26, padding: 15, borderRadius: 15, alignItems: "center", backgroundColor: theme.colors.primary }}><Text style={{ color: theme.colors.onPrimary, fontWeight: "800" }}>Log out</Text></Pressable><Pressable onPress={() => navigation.goBack()} style={{ marginTop: 16, padding: 12 }}><Text style={{ color: theme.colors.text, fontWeight: "700" }}>Stay signed in</Text></Pressable></View></Page>;
}