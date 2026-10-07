import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { ROUTES } from "../../../navigation/routes";
import { PillTabs, ScreenHeader, ACCENT } from "../data/Movementui";
import { HIGHLIGHTS, Range, TRENDS } from "../data/Movementdata";

const CHART_H = 130;

export default function HealthTrends() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const s = createStyles(theme);
  const [range, setRange] = useState<Range>("week");

  const data = TRENDS[range];
  const [selected, setSelected] = useState(data.selected);
  useEffect(() => setSelected(TRENDS[range].selected), [range]);

  const max = Math.max(...data.values, 1);
  const total = data.values.reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Health Trends" onBack={() => navigation.goBack()} onProfile={() => navigation.navigate(ROUTES.PROFILE)} />

        <PillTabs
          value={range}
          onChange={setRange}
          options={[
            { label: "Day", value: "day" },
            { label: "Week", value: "week" },
            { label: "Month", value: "month" },
          ]}
        />

        <View style={s.chartCard}>
          <View style={s.chartTop}>
            <Text style={s.chartLabel}>Total steps</Text>
            <Text style={s.chartTotal}>{total.toLocaleString()}</Text>
          </View>

          <View style={s.bars}>
            {data.values.map((v, i) => {
              const active = i === selected;
              return (
                <Pressable key={i} style={s.barCol} onPress={() => setSelected(i)} accessibilityLabel={`${data.labels[i]}: ${v} steps`}>
                  <Text style={[s.barValue, !active && { opacity: 0 }]}>{v.toLocaleString()}</Text>
                  <View style={[s.bar, { height: Math.max((v / max) * CHART_H, 8), backgroundColor: active ? ACCENT.purple : theme.colors.primary }]} />
                  <Text style={s.barLabel}>{data.labels[i]}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={s.sectionTitle}>Weekly highlights</Text>
        {HIGHLIGHTS.map(h => (
          <View key={h.id} style={s.row}>
            <View style={[s.rowIcon, { borderColor: h.color }]}>
              <Ionicons name={h.icon as any} size={16} color={h.color} />
            </View>
            <Text style={s.rowLabel}>{h.label}</Text>
            <Text style={[s.rowValue, { color: h.color }]}>{h.value}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingHorizontal: 18, paddingBottom: 24 },
    chartCard: { backgroundColor: theme.colors.card, borderRadius: 20, padding: 16, marginTop: 14, borderWidth: 1, borderColor: theme.colors.border },
    chartTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    chartLabel: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamily },
    chartTotal: { color: theme.colors.text, fontSize: 20, fontFamily: theme.typography.fontFamilyBold },
    bars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 14, height: CHART_H + 48 },
    barCol: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
    bar: { width: 11, borderRadius: 6 },
    barValue: { color: ACCENT.purple, fontSize: 10, marginBottom: 4, fontFamily: theme.typography.fontFamilyBold },
    barLabel: { color: theme.colors.muted, fontSize: 11, marginTop: 8, fontFamily: theme.typography.fontFamilyMedium },
    sectionTitle: { color: theme.colors.text, fontSize: 16, marginTop: 22, marginBottom: 10, fontFamily: theme.typography.fontFamilyBold },
    row: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border },
    rowIcon: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginRight: 12 },
    rowLabel: { flex: 1, color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyMedium },
    rowValue: { fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
  });