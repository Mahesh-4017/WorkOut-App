import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useTheme } from "../../../theme/ThemeProvider";

export const ACCENT = { purple: "#7B4EF0", orange: "#F59E2B" };

export function ScreenHeader({ title, onBell, onProfile, onBack }: { title: string; onBell?: () => void; onProfile?: () => void; onBack?: () => void }) {
  const { theme } = useTheme();
  const s = styles(theme);
  return (
    <View style={s.header}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={10} accessibilityLabel="Back to main app">
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </Pressable>
      ) : null}
      <Text style={[s.headerTitle, onBack && s.headerTitleWithBack]}>{title}</Text>
      <View style={s.headerIcons}>
        <Pressable onPress={onBell} hitSlop={10} accessibilityLabel="Notifications">
          <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
        </Pressable>
        <Pressable onPress={onProfile} hitSlop={10} accessibilityLabel="Profile">
          <Ionicons name="person-circle-outline" size={26} color={theme.colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

export function PillTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { theme } = useTheme();
  const s = styles(theme);
  return (
    <View style={s.pillTrack}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[s.pillItem, active && s.pillItemActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[s.pillText, active && s.pillTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProgressRing({
  size = 170,
  stroke = 12,
  progress,
  color,
  children,
}: {
  size?: number;
  stroke?: number;
  progress: number; // 0..1
  color?: string;
  children?: React.ReactNode;
}) {
  const { theme } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(progress, 1));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.colors.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? theme.colors.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
        />
      </Svg>
      <View style={{ position: "absolute", alignItems: "center" }}>{children}</View>
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
    headerTitle: { color: theme.colors.text, fontSize: 22, fontFamily: theme.typography.fontFamilyBold },
    headerTitleWithBack: { marginLeft: 12 },
    headerIcons: { flexDirection: "row", alignItems: "center", gap: 14 },
    pillTrack: {
      flexDirection: "row",
      backgroundColor: theme.colors.surfaceAlt ?? theme.colors.border,
      borderRadius: 22,
      padding: 4,
    },
    pillItem: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 18 },
    pillItemActive: {
      backgroundColor: theme.colors.surface,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    pillText: { color: theme.colors.muted, fontSize: 13, fontFamily: theme.typography.fontFamilyMedium },
    pillTextActive: { color: theme.colors.text, fontFamily: theme.typography.fontFamilyBold },
  });