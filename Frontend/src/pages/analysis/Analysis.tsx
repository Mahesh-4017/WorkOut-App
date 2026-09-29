import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  responsiveFontSize,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import Ionicons from "@react-native-vector-icons/ionicons";
import BottomTabBar from "../../components/BottomTabBar";
import { useTheme } from "../../theme/ThemeProvider";
import { useUser } from "../../data/UserProvider";
import { exercises } from "../../data/exercises";

type Range = "Week" | "Month" | "3 Months" | "Year";

const ranges: Range[] = ["Week", "Month", "3 Months", "Year"];

export default function Analysis() {
  const { theme } = useTheme();
  const { history } = useUser();
  const [selectedRange, setSelectedRange] = useState<Range>("Month");
  const rangeDays: Record<Range, number> = { Week: 7, Month: 30, "3 Months": 90, Year: 365 };
  const filteredHistory = useMemo(() => {
    const cutoff = Date.now() - rangeDays[selectedRange] * 24 * 60 * 60 * 1000;
    return history.filter(item => new Date(item.completedAt).getTime() >= cutoff);
  }, [history, selectedRange]);
  const frequency = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return { day: date.toLocaleDateString(undefined, { weekday: "short" }), value: filteredHistory.filter(item => item.completedAt.slice(0, 10) === key).length };
  }), [filteredHistory]);
  const maxFrequency = Math.max(1, ...frequency.map(item => item.value));
  const muscleGroups = useMemo(() => {
    const counts = filteredHistory.reduce<Record<string, number>>((result, item) => {
      const exercise = exercises.find(value => value.id === item.exerciseId);
      if (exercise) result[exercise.muscle] = (result[exercise.muscle] || 0) + 1;
      return result;
    }, {});
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0) || 1;
    const colors = [theme.colors.primary, theme.colors.success, theme.colors.warning, theme.colors.icon, theme.colors.primaryDark];
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, count], index) => ({ label, percent: Math.round((count / total) * 100), color: colors[index % colors.length] }));
  }, [filteredHistory, theme.colors]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: responsiveWidth(5),
          paddingTop: 6,
          paddingBottom: 78,
        }}
      >
        <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          {[["Completed", filteredHistory.length.toString(), "checkmark-circle-outline"], ["This week", history.filter(item => Date.now() - new Date(item.completedAt).getTime() <= 7 * 24 * 60 * 60 * 1000).length.toString(), "calendar-outline"], ["Streak", filteredHistory.length ? "Active" : "Start", "flame-outline"]].map(([label, value, icon]) => <View key={label} style={{ flex: 1, padding: 13, borderRadius: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}><Ionicons name={icon as React.ComponentProps<typeof Ionicons>["name"]} size={18} color={theme.colors.icon} /><Text style={{ marginTop: 8, fontSize: responsiveFontSize(1.8), fontWeight: "900", color: theme.colors.text }}>{value}</Text><Text style={{ marginTop: 2, fontSize: responsiveFontSize(1.15), color: theme.colors.textSecondary }}>{label}</Text></View>)}
        </View>
        {/* Range tabs */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 18,
            padding: 4,
            borderRadius: 16,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          {ranges.map((range) => {
            const active = range === selectedRange;
            return (
              <Pressable
                key={range}
                onPress={() => setSelectedRange(range)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: active
                    ? theme.colors.primary
                    : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.35),
                    fontWeight: "700",
                    color: active
                      ? theme.colors.onPrimary
                      : theme.colors.text,
                    opacity: active ? 1 : 0.6,
                  }}
                >
                  {range}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Workout Frequency */}
        <View
          style={{
            marginTop: 24,
            padding: 18,
            borderRadius: 22,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(1.9),
              fontWeight: "800",
              color: theme.colors.text,
              marginBottom: 20,
            }}
          >
            Workout Frequency
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              height: 120,
            }}
          >
            {frequency.map((item) => (
              <View key={item.day} style={{ alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 14,
                    height: Math.max(
                      6,
                      (item.value / maxFrequency) * 96
                    ),
                    borderRadius: 7,
                    backgroundColor: theme.colors.primary,
                    opacity: item.value === maxFrequency ? 1 : 0.55,
                  }}
                />
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: responsiveFontSize(1.25),
                    color: theme.colors.text,
                    opacity: 0.55,
                  }}
                >
                  {item.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Muscle Groups */}
        <View
          style={{
            marginTop: 20,
            padding: 18,
            borderRadius: 22,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(1.9),
              fontWeight: "800",
              color: theme.colors.text,
              marginBottom: 18,
            }}
          >
            Muscle Groups
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {muscleGroups.length ? <MuscleDonut segments={muscleGroups} trackColor={theme.colors.border} centerLabelColor={theme.colors.text} totalValue={filteredHistory.length.toString()} /> : <View style={{ width: 130, height: 130, borderRadius: 65, borderWidth: 16, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center" }}><Ionicons name="barbell-outline" size={28} color={theme.colors.muted} /></View>}

            <View style={{ flex: 1, marginLeft: 20 }}>
              {muscleGroups.length ? muscleGroups.map((group) => (
                <View
                  key={group.label}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 5,
                        backgroundColor: group.color,
                        marginRight: 8,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: responsiveFontSize(1.45),
                        color: theme.colors.text,
                        opacity: 0.8,
                      }}
                    >
                      {group.label}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(1.45),
                      fontWeight: "700",
                      color: theme.colors.text,
                    }}
                  >
                    {group.percent}%
                  </Text>
                </View>
              )) : <Text style={{ color: theme.colors.textSecondary }}>Complete exercises to see your training balance.</Text>}
            </View>
          </View>
        </View>

        {/* Activity summary */}
        <Text
          style={{
            marginTop: 26,
            marginBottom: 14,
            fontSize: responsiveFontSize(2.1),
            fontWeight: "800",
            color: theme.colors.text,
          }}
        >
          Activity summary
        </Text>

        <View style={{ flexDirection: "row", gap: 12 }}>
          {[{ exercise: "Exercises completed", value: `${filteredHistory.length}`, icon: "checkmark-circle-outline" as const }, { exercise: "Training balance", value: muscleGroups.length ? `${muscleGroups[0].label} focus` : "Not started", icon: "analytics-outline" as const }].map((best) => (
            <View
              key={best.exercise}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 20,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Ionicons
                name={best.icon}
                size={20}
                color={theme.colors.icon}
              />
              <Text
                style={{
                  marginTop: 12,
                  fontSize: responsiveFontSize(1.5),
                  color: theme.colors.text,
                  opacity: 0.7,
                }}
              >
                {best.exercise}
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: responsiveFontSize(2.1),
                  fontWeight: "800",
                  color: theme.colors.text,
                }}
              >
                {best.value}
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: responsiveFontSize(1.2),
                  color: theme.colors.text,
                  opacity: 0.45,
                }}
              >
                {selectedRange} overview
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

    </View>
  );
}

function MuscleDonut({
  segments,
  trackColor,
  centerLabelColor,
  totalValue,
}: {
  segments: { label: string; percent: number; color: string }[];
  trackColor: string;
  centerLabelColor: string;
  totalValue: string;
}) {
  const size = 130;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((segment) => {
          const segmentLength = (segment.percent / 100) * circumference;
          // Negative offset advances the dash start clockwise around the circle
          // by however much of the circle prior segments already used.
          const dashOffset = -(cumulativePercent / 100) * circumference;
          cumulativePercent += segment.percent;

          return (
            <Circle
              key={segment.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              fill="none"
              // Rotate so segments start at 12 o'clock instead of 3 o'clock
              rotation={-90}
              origin={`${size / 2}, ${size / 2}`}
            />
          );
        })}
      </Svg>

      <View
        style={{
          ...{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(1.05),
            color: centerLabelColor,
            opacity: 0.55,
          }}
        >
          Completed
        </Text>
        <Text
          style={{
            fontSize: responsiveFontSize(1.7),
            fontWeight: "800",
            color: centerLabelColor,
          }}
        >
          {totalValue}
        </Text>
      </View>
    </View>
  );
}