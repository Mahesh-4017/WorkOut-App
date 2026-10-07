import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { useUser } from "../../../data/UserProvider";
import { ROUTES } from "../../../navigation/routes";
import { PillTabs, ProgressRing, ScreenHeader, ACCENT } from "../data/Movementui";
import { METRICS, RECENT_ACTIVITY } from "../data/Movementdata";

type Metric = keyof typeof METRICS;

export default function MovementDashboard({ onViewAll }: { onViewAll?: () => void }) {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { name } = useUser();
  const s = createStyles(theme);
  const [metric, setMetric] = useState<Metric>("steps");

  const m = METRICS[metric];
  const initials = (name || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join("");

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Movement Dashboard" onBack={() => navigation.goBack()} onProfile={() => navigation.navigate(ROUTES.PROFILE)} />

        <View style={s.userRow}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={s.hello}>Hello 👋</Text>
            <Text style={s.name}>{name}</Text>
          </View>
        </View>

        <View style={s.panel}>
          <PillTabs
            value={metric}
            onChange={setMetric}
            options={[
              { label: "Move", value: "move" },
              { label: "Steps", value: "steps" },
              { label: "Energy", value: "energy" },
            ]}
          />
          <View style={s.ringBox}>
            <ProgressRing size={190} stroke={14} progress={m.value / m.goal}>
              <Text style={s.value}>{m.value.toLocaleString()}</Text>
              <Text style={s.caption}>{m.caption}</Text>
            </ProgressRing>
          </View>
        </View>

        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Recent activity</Text>
          <Pressable onPress={onViewAll ?? (() => navigation.navigate(ROUTES.WORKOUTCALENDAR))}>
            <Text style={s.viewAll}>View all</Text>
          </Pressable>
        </View>

        <View style={s.cardRow}>
          {RECENT_ACTIVITY.map(a => (
            <View key={a.id} style={s.activityCard}>
              <View style={[s.activityIcon, { backgroundColor: a.tint }]}>
                <Ionicons name={a.icon as any} size={16} color="#1B1F1A" />
              </View>
              <Text style={s.activityTitle}>{a.title}</Text>
              <Text style={s.activityMeta}>{a.meta}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingHorizontal: 18, paddingBottom: 24 },
    userRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 8 },
    avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: ACCENT.purple, alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#fff", fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    hello: { color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamily },
    name: { color: theme.colors.text, fontSize: 15, fontFamily: theme.typography.fontFamilyBold },
    panel: { backgroundColor: theme.colors.card, borderRadius: 24, padding: 14, marginTop: 10, borderWidth: 1, borderColor: theme.colors.border },
    ringBox: { alignItems: "center", paddingVertical: 22 },
    value: { color: theme.colors.text, fontSize: 36, fontFamily: theme.typography.fontFamilyBold },
    caption: { color: theme.colors.muted, fontSize: 11, marginTop: 2, fontFamily: theme.typography.fontFamily },
    sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 12 },
    sectionTitle: { color: theme.colors.text, fontSize: 16, fontFamily: theme.typography.fontFamilyBold },
    viewAll: { color: ACCENT.purple, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    cardRow: { flexDirection: "row", gap: 12 },
    activityCard: { flex: 1, backgroundColor: theme.colors.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.colors.border },
    activityIcon: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", marginBottom: 14 },
    activityTitle: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
    activityMeta: { color: theme.colors.muted, fontSize: 11, marginTop: 3, fontFamily: theme.typography.fontFamily },
  });