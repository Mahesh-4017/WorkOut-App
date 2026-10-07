import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useSession } from "../../../data/SessionProvider";
import { ROUTES } from "../../../navigation/routes";
import { useTheme } from "../../../theme/ThemeProvider";
import { PillTabs, ScreenHeader } from "../data/Movementui";

type Range = "week" | "month";
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function HealthTrends() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const s = createStyles(theme);
  const { stepEntries, history, loading, error, refreshProgress } = useSession();
  const [range, setRange] = useState<Range>("week");

  const buckets = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    if (range === "week") {
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - 6 + index);
        const key = dateKey(date);
        const value = stepEntries.filter(entry => entry.recordedAt.slice(0, 10) === key).reduce((total, entry) => total + entry.steps, 0);
        return { label: date.toLocaleDateString(undefined, { weekday: "short" }), value };
      });
    }
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const weekCount = Math.ceil(today.getDate() / 7);
    return Array.from({ length: weekCount }, (_, index) => {
      const from = new Date(start);
      from.setDate(index * 7 + 1);
      const through = new Date(start);
      through.setDate(Math.min((index + 1) * 7, today.getDate()));
      const fromKey = dateKey(from);
      const throughKey = dateKey(through);
      const value = stepEntries.filter(entry => {
        const recorded = entry.recordedAt.slice(0, 10);
        return recorded >= fromKey && recorded <= throughKey;
      }).reduce((total, entry) => total + entry.steps, 0);
      return { label: `W${index + 1}`, value };
    });
  }, [range, stepEntries]);
  const totalSteps = buckets.reduce((total, item) => total + item.value, 0);
  const max = Math.max(...buckets.map(item => item.value), 1);
  const totalSeconds = history.reduce((total, session) => total + session.seconds, 0);
  const totalCalories = history.reduce((total, session) => total + session.calories, 0);
  const hasSteps = stepEntries.length > 0;

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Health Trends"
          onBack={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate(ROUTES.HOME, { tab: "home" });
          }}
          onProfile={() => navigation.navigate(ROUTES.PROFILE)}
        />
        <PillTabs
          value={range}
          onChange={setRange}
          options={[{ label: "Week", value: "week" }, { label: "Month", value: "month" }]}
        />
        <View style={s.chartCard}>
          <View style={s.chartTop}>
            <View><Text style={s.chartLabel}>Steps logged</Text><Text style={s.chartTotal}>{totalSteps.toLocaleString()}</Text></View>
            <Ionicons name="footsteps-outline" size={22} color={theme.colors.primary} />
          </View>
          {loading ? <Text style={s.message}>Loading your step records…</Text> : null}
          {error ? <Text style={s.error}>{error}</Text> : null}
          {!loading && !hasSteps ? (
            <Text style={s.message}>No step records for this account yet. This chart will use saved step entries only; it does not estimate device activity.</Text>
          ) : (
            <View style={s.bars}>
              {buckets.map((item, index) => (
                <View key={`${item.label}-${index}`} style={s.barCol}>
                  <Text style={s.barValue}>{item.value ? item.value.toLocaleString() : ""}</Text>
                  <View style={[s.bar, { height: Math.max((item.value / max) * 125, item.value > 0 ? 8 : 2), backgroundColor: theme.colors.primary }]} />
                  <Text style={s.barLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <Text style={s.sectionTitle}>Recorded workout summary</Text>
        {[
          { label: "Saved sessions", value: history.length.toLocaleString(), icon: "barbell-outline" as const },
          { label: "Recorded exercise time", value: `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m`, icon: "time-outline" as const },
          { label: "Workout calories", value: `${totalCalories.toLocaleString()} kcal`, icon: "flame-outline" as const },
        ].map(item => (
          <View key={item.label} style={s.row}>
            <View style={s.rowIcon}><Ionicons name={item.icon} size={17} color={theme.colors.primary} /></View>
            <Text style={s.rowLabel}>{item.label}</Text>
            <Text style={s.rowValue}>{item.value}</Text>
          </View>
        ))}
        <Text style={s.disclaimer}>Workout calorie values come from saved workout sessions. Walking/running timer entries record time only and do not estimate calories, steps or distance.</Text>
        <View style={s.refreshRow}>
          <Text style={s.message}>Data is synced to your signed-in account.</Text>
          <Pressable
            onPress={async () => {
              try {
                await refreshProgress();
              } catch (refreshError) {
                Alert.alert("Unable to refresh progress", refreshError instanceof Error ? refreshError.message : "Please try again.");
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Refresh progress"
          >
            <Ionicons name="refresh-outline" size={17} color={theme.colors.primary} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 18, paddingBottom: 28 },
  chartCard: { backgroundColor: theme.colors.card, borderRadius: 18, padding: 16, marginTop: 14, borderWidth: 1, borderColor: theme.colors.border },
  chartTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chartLabel: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily },
  chartTotal: { color: theme.colors.text, fontSize: 22, marginTop: 3, fontFamily: theme.typography.fontFamilyBold },
  bars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 16, minHeight: 170 },
  barCol: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: 12, borderRadius: 6, marginTop: 5 },
  barValue: { color: theme.colors.muted, fontSize: 8, height: 12, fontFamily: theme.typography.fontFamilyMedium },
  barLabel: { color: theme.colors.muted, fontSize: 10, marginTop: 7, fontFamily: theme.typography.fontFamilyMedium },
  message: { flex: 1, color: theme.colors.muted, fontSize: 11, lineHeight: 17, fontFamily: theme.typography.fontFamily },
  error: { color: "#B42318", fontSize: 12, marginTop: 8, fontFamily: theme.typography.fontFamily },
  sectionTitle: { color: theme.colors.text, fontSize: 16, marginTop: 22, marginBottom: 10, fontFamily: theme.typography.fontFamilyBold },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.card, borderRadius: 13, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  rowIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surface, marginRight: 10 },
  rowLabel: { flex: 1, color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
  rowValue: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
  disclaimer: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 5, fontFamily: theme.typography.fontFamily },
  refreshRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
});
