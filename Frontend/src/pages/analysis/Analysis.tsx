import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  responsiveFontSize,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import Ionicons from "@react-native-vector-icons/ionicons";
import BottomTabBar from "../../components/BottomTabBar";
import { useTheme } from "../../theme/ThemeProvider";

type Range = "Week" | "Month" | "3 Months" | "Year";

const ranges: Range[] = ["Week", "Month", "3 Months", "Year"];

const frequency = [
  { day: "Mon", value: 3 },
  { day: "Tue", value: 4 },
  { day: "Wed", value: 2 },
  { day: "Thu", value: 5 },
  { day: "Fri", value: 4 },
  { day: "Sat", value: 5 },
  { day: "Sun", value: 1 },
];

const muscleGroups = [
  { label: "Chest", percent: 32, color: "#6C63FF" },
  { label: "Back", percent: 24, color: "#4FD1C5" },
  { label: "Legs", percent: 18, color: "#68D391" },
  { label: "Shoulders", percent: 15, color: "#F6AD55" },
  { label: "Arms", percent: 11, color: "#FC8181" },
];

const personalBests = [
  { exercise: "Bench Press", weightKg: 80, icon: "barbell-outline" as const },
  { exercise: "Squat", weightKg: 100, icon: "medal-outline" as const },
];

export default function Analysis() {
  const { theme } = useTheme();
  const [selectedRange, setSelectedRange] = useState<Range>("Month");

  const maxFrequency = Math.max(...frequency.map((f) => f.value));

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: responsiveWidth(5),
          paddingTop: 16,
          paddingBottom: 40,
        }}
      >
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
            <MuscleDonut
              segments={muscleGroups}
              trackColor={theme.colors.border}
              centerLabelColor={theme.colors.text}
            />

            <View style={{ flex: 1, marginLeft: 20 }}>
              {muscleGroups.map((group) => (
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
              ))}
            </View>
          </View>
        </View>

        {/* Personal Bests */}
        <Text
          style={{
            marginTop: 26,
            marginBottom: 14,
            fontSize: responsiveFontSize(2.1),
            fontWeight: "800",
            color: theme.colors.text,
          }}
        >
          Personal Bests
        </Text>

        <View style={{ flexDirection: "row", gap: 12 }}>
          {personalBests.map((best) => (
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
                {best.weightKg} kg
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: responsiveFontSize(1.2),
                  color: theme.colors.text,
                  opacity: 0.45,
                }}
              >
                1RM (est)
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
}: {
  segments: { label: string; percent: number; color: string }[];
  trackColor: string;
  centerLabelColor: string;
}) {
  const size = 130;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const totalVolumeKg = 8420;

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
          Total Volume
        </Text>
        <Text
          style={{
            fontSize: responsiveFontSize(1.7),
            fontWeight: "800",
            color: centerLabelColor,
          }}
        >
          {totalVolumeKg.toLocaleString()} kg
        </Text>
      </View>
    </View>
  );
}