import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { responsiveFontSize, responsiveWidth } from "react-native-responsive-dimensions";
import AppHeader from "../../components/AppHeader";
import { useTheme } from "../../theme/ThemeProvider";
import { useUser } from "../../data/UserProvider";
import { ROUTES } from "../../navigation/routes";

export default function Dashboard() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { name, history } = useUser();
  const actions = [
    { label: "Today's workout", icon: "barbell-outline" as const, route: ROUTES.WORKOUT },
    { label: "Calendar", icon: "calendar-outline" as const, route: ROUTES.WORKOUTCALENDAR },
    { label: "Analysis", icon: "stats-chart-outline" as const, route: ROUTES.ANALYSIS },
  ];
  return <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
    <AppHeader title="Dashboard" description={`Welcome back, ${name}`} showBack />
    <ScrollView contentContainerStyle={{ paddingHorizontal: responsiveWidth(5), paddingTop: 14, paddingBottom: 80 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {[{ label: "Completed", value: history.length }, { label: "Sessions", value: Math.ceil(history.length / 3) }, { label: "Progress", value: `${Math.min(history.length * 10, 100)}%` }].map(item => <View key={item.label} style={{ flex: 1, padding: 13, borderRadius: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}><Text style={{ color: theme.colors.text, fontSize: responsiveFontSize(2), fontWeight: "900" }}>{item.value}</Text><Text style={{ color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.2), marginTop: 4 }}>{item.label}</Text></View>)}
      </View>
      <View style={{ marginTop: 22, padding: 18, borderRadius: 20, backgroundColor: theme.colors.primary }}>
        <Text style={{ color: theme.colors.onPrimary, fontSize: responsiveFontSize(1.25), fontWeight: "800", letterSpacing: 1 }}>YOUR NEXT STEP</Text>
        <Text style={{ color: theme.colors.onPrimary, fontSize: responsiveFontSize(2.5), fontWeight: "900", marginTop: 8 }}>Keep your momentum going.</Text>
        <Text style={{ color: theme.colors.onPrimary, opacity: 0.75, marginTop: 6 }}>Choose a session and make today count.</Text>
        <Pressable onPress={() => navigation.navigate(ROUTES.WORKOUT)} style={{ alignSelf: "flex-start", marginTop: 16, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: theme.colors.onPrimary }}><Text style={{ color: theme.colors.primaryDark, fontWeight: "800" }}>Start now</Text></Pressable>
      </View>
      <Text style={{ color: theme.colors.text, fontSize: responsiveFontSize(2.1), fontWeight: "800", marginTop: 28, marginBottom: 12 }}>Quick access</Text>
      {actions.map(action => <Pressable key={action.label} onPress={() => navigation.navigate(action.route)} style={{ flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 10 }}><Ionicons name={action.icon} size={21} color={theme.colors.icon} /><Text style={{ flex: 1, marginLeft: 12, color: theme.colors.text, fontWeight: "700" }}>{action.label}</Text><Ionicons name="chevron-forward" size={18} color={theme.colors.muted} /></Pressable>)}
    </ScrollView>
  </View>;
}
