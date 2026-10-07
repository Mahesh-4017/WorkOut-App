import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useTheme } from "../../theme/ThemeProvider";

/** Top bar: back arrow, centered-left title, "..." menu */
export function OnboardingHeader({
  title,
  onBack,
  onMenu,
}: {
  title: string;
  onBack: () => void;
  onMenu?: () => void;
}) {
  const { theme } = useTheme();
  const s = styles(theme);
  return (
    <View style={s.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} hitSlop={12}>
        <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
      </Pressable>
      <Text style={s.headerTitle}>{title}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="More options" onPress={onMenu} hitSlop={12}>
        <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.text} />
      </Pressable>
    </View>
  );
}

/** Lime progress bar. progress = 0..1 */
export function ProgressBar({ progress }: { progress: number }) {
  const { theme } = useTheme();
  const s = styles(theme);
  return (
    <View style={s.track}>
      <View style={[s.fill, { width: `${Math.round(progress * 100)}%` }]} />
    </View>
  );
}

/** Pill-style segmented selector (Metric/Imperial, Low/Moderate/High, ...) */
export function Segmented<T extends string>({
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
    <View style={s.segment}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={s.segmentItem}
          >
            <Text style={[s.segmentText, active && s.segmentTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Primary lime button */
export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { theme } = useTheme();
  const s = styles(theme);
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[s.primaryButton, disabled && { opacity: 0.5 }]}
    >
      <Text style={s.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function StepFooter({ text }: { text: string }) {
  const { theme } = useTheme();
  return <Text style={styles(theme).footer}>{text}</Text>;
}

const styles = (theme: any) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    headerTitle: {
      flex: 1,
      marginLeft: 14,
      color: theme.colors.text,
      fontSize: 18,
      fontFamily: theme.typography.fontFamilyBold,
    },
    track: { height: 6, borderRadius: 3, backgroundColor: theme.colors.border, overflow: "hidden", marginTop: 8 },
    fill: { height: "100%", borderRadius: 3, backgroundColor: theme.colors.primary },
    segment: {
      flexDirection: "row",
      backgroundColor: theme.colors.surfaceAlt ?? theme.colors.border,
      borderRadius: 10,
      padding: 4,
    },
    segmentItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
    segmentText: { color: theme.colors.muted, fontSize: 13, fontFamily: theme.typography.fontFamily },
    segmentTextActive: {
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamilyBold,
      textDecorationLine: "underline",
    },
    primaryButton: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 54,
      borderRadius: 27,
      backgroundColor: theme.colors.primary,
    },
    primaryText: { color: theme.colors.onPrimary, fontSize: 16, fontFamily: theme.typography.fontFamilyBold },
    footer: {
      textAlign: "center",
      color: theme.colors.muted,
      fontSize: 12,
      marginTop: 12,
      fontFamily: theme.typography.fontFamily,
    },
  });