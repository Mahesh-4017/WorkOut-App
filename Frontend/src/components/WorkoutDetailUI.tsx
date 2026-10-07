import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { TINTS } from "../data/workoutCatalog";
import { DARK_TEXT } from "./WorkoutUI";

export function NoteCard({
  title,
  body,
  tint = TINTS.peach,
}: {
  title: string;
  body: string;
  tint?: string;
}) {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    card: { backgroundColor: tint, borderRadius: 12, padding: 14 },
    title: { color: DARK_TEXT, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    body: { color: "rgba(27,31,26,0.75)", fontSize: 12, lineHeight: 17, marginTop: 3, fontFamily: theme.typography.fontFamily },
  });
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

export function StatRow({ stats }: { stats: { value: string; label: string }[] }) {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    row: { flexDirection: "row", gap: 10 },
    box: { flex: 1, backgroundColor: theme.colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.border },
    value: { color: theme.colors.text, fontSize: 18, fontFamily: theme.typography.fontFamilyBold },
    label: { color: theme.colors.muted, fontSize: 11, marginTop: 2, fontFamily: theme.typography.fontFamily },
  });
  return (
    <View style={styles.row}>
      {stats.map(stat => (
        <View key={stat.label} style={styles.box}>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function Tags({ items }: { items: string[] }) {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    row: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: theme.colors.panel },
    text: { color: theme.colors.text, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
  });
  return (
    <View style={styles.row}>
      {items.map(item => (
        <View key={item} style={styles.tag}><Text style={styles.text}>{item}</Text></View>
      ))}
    </View>
  );
}

export function FooterLinks({
  left,
  right,
}: {
  left: { label: string; onPress: () => void };
  right: { label: string; onPress: () => void };
}) {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    row: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 12 },
    text: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
  });
  return (
    <View style={styles.row}>
      <Pressable onPress={left.onPress} hitSlop={8}><Text style={styles.text}>{left.label}</Text></Pressable>
      <Text style={styles.text}>·</Text>
      <Pressable onPress={right.onPress} hitSlop={8}><Text style={styles.text}>{right.label}</Text></Pressable>
    </View>
  );
}
