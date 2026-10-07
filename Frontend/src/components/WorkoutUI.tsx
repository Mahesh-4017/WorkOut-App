import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../navigation/workoutRoutes";
import type { Workout } from "../data/workoutCatalog";

export const DARK_TEXT = "#1B1F1A";

export const openWorkout = (navigation: any, workout: Workout) =>
  navigation.navigate(WORKOUT_ROUTES.DETAILS, { workoutId: workout.id });

export function WorkoutRow({
  w,
  onPress,
  favorite,
  onToggleFavorite,
  heartIcon,
}: {
  w: Workout;
  onPress: () => void;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  heartIcon?: "heart" | "remove-circle-outline";
}) {
  const { theme } = useTheme();
  const tinted = Boolean(w.tint);
  const text = tinted ? DARK_TEXT : theme.colors.text;
  const sub = tinted ? "rgba(27,31,26,0.65)" : theme.colors.muted;
  const styles = StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: w.tint ?? theme.colors.card,
      borderWidth: tinted ? 0 : 1,
      borderColor: theme.colors.border,
    },
    title: { color: text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    meta: { color: sub, fontSize: 11, marginTop: 2, fontFamily: theme.typography.fontFamily },
  });

  return (
    <Pressable onPress={onPress} style={styles.row} accessibilityRole="button">
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={styles.title}>{w.title}</Text>
        <Text numberOfLines={1} style={styles.meta}>
          {w.focus} · {w.level} · {w.minutes} min
        </Text>
      </View>
      {onToggleFavorite ? (
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={favorite ? "Remove favorite" : "Save favorite"}
        >
          <Ionicons
            name={heartIcon ?? (favorite ? "heart" : "heart-outline")}
            size={18}
            color={favorite || heartIcon ? "#E5484D" : text}
          />
        </Pressable>
      ) : null}
      <Ionicons name="chevron-forward" size={16} color={text} />
    </Pressable>
  );
}

export function ChipGroup({
  options,
  value,
  onChange,
  multi,
}: {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  multi?: boolean;
}) {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    wrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, backgroundColor: theme.colors.panel, borderRadius: 12, padding: 5 },
    chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9 },
    chipOn: { backgroundColor: theme.colors.primary },
    text: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
    textOn: { color: theme.colors.onPrimary, fontFamily: theme.typography.fontFamilyBold },
  });

  const toggle = (option: string) => {
    const selected = value.includes(option);
    if (multi) {
      onChange(selected ? value.filter(item => item !== option) : [...value, option]);
    } else {
      onChange(selected ? [] : [option]);
    }
  };

  return (
    <View style={styles.wrap}>
      {options.map(option => {
        const selected = value.includes(option);
        return (
          <Pressable
            key={option}
            onPress={() => toggle(option)}
            style={[styles.chip, selected && styles.chipOn]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.text, selected && styles.textOn]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
