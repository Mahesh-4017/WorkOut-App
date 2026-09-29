import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import BottomTabBar from "../../components/BottomTabBar";
import { useTheme } from "../../theme/ThemeProvider";
import { useUser } from "../../data/UserProvider";
import { exercises } from "../../data/exercises";
import { ROUTES } from "../../navigation/routes";
import { useAuth } from "../../context/AuthContext";

const goal = {
  title: "Build Muscle",
  progress: 0.6,
};

type SettingsRow = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  destructive?: boolean;
};

const settingsRows: SettingsRow[] = [
  { label: "Settings", icon: "settings-outline" },
  { label: "Help & Support", icon: "help-circle-outline" },
  { label: "Log Out", icon: "log-out-outline", destructive: true },
];

export default function ProfileScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { name, email, history } = useUser();
  const { logout } = useAuth();
  const stats = [
    { label: "Exercises", value: `${history.length}` },
    { label: "Sessions", value: `${Math.ceil(history.length / 3)}` },
    { label: "Progress", value: `${Math.min(history.length * 10, 100)}%` },
  ];

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
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.primary }}>
              <Text style={{ fontSize: responsiveFontSize(2.3), fontWeight: "900", color: theme.colors.onPrimary }}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text
                style={{
                  fontSize: responsiveFontSize(2.1),
                  fontWeight: "800",
                  color: theme.colors.text,
                }}
              >
                {name}
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: responsiveFontSize(1.4),
                  color: theme.colors.text,
                  opacity: 0.55,
                }}
              >
                {email || "Fitness member"}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => navigation.navigate("Settings")}
            hitSlop={10}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={theme.colors.icon}
            />
          </Pressable>
        </View>

        {/* Stats */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 22,
            padding: 16,
            borderRadius: 20,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          {stats.map((stat, index) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                alignItems: "center",
                borderLeftWidth: index === 0 ? 0 : 1,
                borderLeftColor: theme.colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(1.9),
                  fontWeight: "800",
                  color: theme.colors.text,
                }}
              >
                {stat.value}
              </Text>
              <Text
                style={{
                  marginTop: 3,
                  fontSize: responsiveFontSize(1.25),
                  color: theme.colors.text,
                  opacity: 0.55,
                }}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Keep Going milestone card */}
        <View
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 20,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.background,
              }}
            >
              <Ionicons name="trophy-outline" size={17} color={theme.colors.icon} />
            </View>
            <Text
              style={{
                marginLeft: 10,
                fontSize: responsiveFontSize(1.65),
                fontWeight: "700",
                color: theme.colors.text,
              }}
            >
              Keep Going!
            </Text>
          </View>

          <Text
            style={{
              marginTop: 8,
              fontSize: responsiveFontSize(1.4),
              color: theme.colors.text,
              opacity: 0.6,
            }}
          >
            You&apos;re 3 workouts away from your next milestone!
          </Text>

          <View
            style={{
              height: 6,
              marginTop: 12,
              borderRadius: 3,
              backgroundColor: theme.colors.border,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: "70%",
                height: "100%",
                borderRadius: 3,
                backgroundColor: theme.colors.primary,
              }}
            />
          </View>
        </View>

        <Text style={{ marginTop: 26, marginBottom: 12, fontSize: responsiveFontSize(2.1), fontWeight: "800", color: theme.colors.text }}>
          Your dashboard
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[
            { label: "Dashboard", icon: "grid-outline" as const, route: ROUTES.HOME },
            { label: "Calendar", icon: "calendar-outline" as const, route: ROUTES.WORKOUTCALENDAR },
            { label: "Analysis", icon: "analytics-outline" as const, route: ROUTES.ANALYSIS },
          ].map(item => (
            <Pressable
              key={item.label}
              onPress={() => navigation.navigate(item.route)}
              style={{ flex: 1, padding: 12, borderRadius: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}
            >
              <Ionicons name={item.icon} size={20} color={theme.colors.icon} />
              <Text style={{ marginTop: 8, fontSize: responsiveFontSize(1.35), fontWeight: "700", color: theme.colors.text }}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ marginTop: 26, marginBottom: 12, fontSize: responsiveFontSize(2.1), fontWeight: "800", color: theme.colors.text }}>
          Workout history
        </Text>
        {history.length === 0 ? (
          <Text style={{ color: theme.colors.textSecondary }}>
            Completed exercises will appear here.
          </Text>
        ) : (
          history.slice().reverse().map(item => {
            const exercise = exercises.find(value => value.id === item.exerciseId);
            if (!exercise) return null;
            return (
              <View key={item.exerciseId} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ fontWeight: "700", color: theme.colors.text }}>{exercise.name}</Text>
                  <Text style={{ marginTop: 2, fontSize: responsiveFontSize(1.25), color: theme.colors.textSecondary }}>{exercise.muscle} • Completed</Text>
                </View>
              </View>
            );
          })
        )}

        {/* Goals */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 26,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(2.1),
              fontWeight: "800",
              color: theme.colors.text,
            }}
          >
            Goals
          </Text>

          <Pressable onPress={() => navigation.navigate("EditGoals")}>
            <Text
              style={{
                fontSize: responsiveFontSize(1.4),
                fontWeight: "700",
                color: theme.colors.icon,
              }}
            >
              Edit
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => navigation.navigate("GoalDetail", { goal })}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 14,
            borderRadius: 18,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.background,
            }}
          >
            <Ionicons name="barbell-outline" size={19} color={theme.colors.icon} />
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              style={{
                fontSize: responsiveFontSize(1.65),
                fontWeight: "700",
                color: theme.colors.text,
              }}
            >
              {goal.title}
            </Text>
            <Text
              style={{
                marginTop: 2,
                fontSize: responsiveFontSize(1.3),
                color: theme.colors.text,
                opacity: 0.55,
              }}
            >
              Progress: {Math.round(goal.progress * 100)}%
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={theme.colors.icon} />
        </Pressable>

        {/* Settings list */}
        <View style={{ marginTop: 26, gap: 4 }}>
          {settingsRows.map((row) => (
            <Pressable
              key={row.label}
              onPress={async () => {
                if (row.label === "Log Out") {
                  await logout();
                  navigation.reset({ index: 0, routes: [{ name: ROUTES.WELCOME }] });
                  return;
                }
                navigation.navigate(row.label === "Help & Support" ? ROUTES.HELP_SUPPORT : ROUTES.SETTINGS);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderRadius: 16,
              }}
            >
              <Ionicons
                name={row.icon}
                size={19}
                color={row.destructive ? "#E5484D" : theme.colors.icon}
              />
              <Text
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: responsiveFontSize(1.65),
                  fontWeight: "600",
                  color: row.destructive ? "#E5484D" : theme.colors.text,
                }}
              >
                {row.label}
              </Text>
              {!row.destructive && (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.colors.icon}
                />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>

    </View>
  );
}