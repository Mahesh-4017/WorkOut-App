import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { ROUTES } from "../../../navigation/routes";
import { ScreenHeader, ACCENT } from "../data/Movementui";
import { MONTH_SUMMARY, TODAY_SESSIONS } from "../data/Movementdata";

export default function ActivityOverview() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const s = createStyles(theme);
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "short", month: "long", day: "numeric" });

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Activity Overview" onBack={() => navigation.goBack()} onProfile={() => navigation.navigate(ROUTES.PROFILE)} />

        <View style={s.statChip}>
          <Ionicons name="flame" size={13} color={theme.colors.primaryDark} />
          <Text style={s.statChipText}>
            {MONTH_SUMMARY.calories} CAL · {MONTH_SUMMARY.duration} HOUR
          </Text>
        </View>

        <View style={s.hero}>
          <Text style={s.heroSmall}>This Month</Text>
          <View style={s.heroHighlight}>
            <Text style={s.heroBig}>{MONTH_SUMMARY.daysActive} Days Active</Text>
          </View>
          <View style={s.recordTag}>
            <Text style={s.recordText}>Break Your Last Record!</Text>
          </View>
        </View>

        <View style={s.todayRow}>
          <Text style={s.todayTitle}>Today</Text>
          <Text style={s.todayDate}>{dateLabel}</Text>
        </View>

        {TODAY_SESSIONS.map(t => (
          <Pressable key={t.id} onPress={() => navigation.navigate(ROUTES.WORKOUT)} style={s.session}>
            <View style={s.sessionIcon}>
              <Ionicons name="barbell-outline" size={18} color="#1B1F1A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.sessionTitle}>{t.title}</Text>
              <Text style={s.sessionMeta}>{t.coach}</Text>
            </View>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.muted} />
          </Pressable>
        ))}

        <Pressable onPress={() => navigation.navigate(ROUTES.WORKOUTCALENDAR)} style={s.scheduleButton} accessibilityRole="button">
          <Text style={s.scheduleText}>View schedule</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingHorizontal: 18, paddingBottom: 24 },
    statChip: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: 4 },
    statChipText: { color: theme.colors.muted, fontSize: 10, letterSpacing: 0.5, fontFamily: theme.typography.fontFamilyMedium },
    hero: { alignItems: "center", marginTop: 44, marginBottom: 44 },
    heroSmall: { color: theme.colors.muted, fontSize: 22, fontFamily: theme.typography.fontFamily },
    heroHighlight: { marginTop: 8, paddingHorizontal: 8, backgroundColor: theme.colors.primary },
    heroBig: { color: theme.colors.onPrimary, fontSize: 30, lineHeight: 38, fontFamily: theme.typography.fontFamilyBold },
    recordTag: { marginTop: 14, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: ACCENT.orange },
    recordText: { color: "#1B1F1A", fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    todayRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    todayTitle: { color: theme.colors.text, fontSize: 16, fontFamily: theme.typography.fontFamilyBold },
    todayDate: { color: ACCENT.purple, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
    session: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme.colors.card, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border },
    sessionIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
    sessionTitle: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    sessionMeta: { color: theme.colors.muted, fontSize: 11, marginTop: 2, fontFamily: theme.typography.fontFamily },
    scheduleButton: { height: 48, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, alignItems: "center", justifyContent: "center", marginTop: 8 },
    scheduleText: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
  });