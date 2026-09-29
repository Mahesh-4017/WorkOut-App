import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { exercises, Exercise } from "../data/exercises";
import { ROUTES } from "../navigation/routes";
import { useTheme } from "../theme//ThemeProvider";

const cardImages = [
  require("../assets/workout.png"),
  require("../assets/workout2.png"),
  require("../assets/workout3.png"),
  require("../assets/workout4.png"),
];

export default function WorkoutHome() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const featuredExercise = exercises[0];

  const startFeaturedWorkout = () => {
    navigation.navigate(ROUTES.EXERCISE_DETAIL, {
      exerciseId: featuredExercise.id,
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: responsiveWidth(5),
          paddingBottom: 40,
        }}
      >
        {/* Challenge */}
        <View
          style={{
            marginTop: 18,
            padding: 18,
            borderRadius: 22,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.35),
                  fontWeight: "700",
                  color: theme.colors.icon,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Current challenge
              </Text>

              <Text
                style={{
                  marginTop: 6,
                  fontSize: responsiveFontSize(2.3),
                  fontWeight: "800",
                  color: theme.colors.text,
                }}
              >
                30 Day Movement
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  fontSize: responsiveFontSize(1.45),
                  color: theme.colors.text,
                  opacity: 0.55,
                }}
              >
                Keep your streak alive
              </Text>
            </View>

            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                borderWidth: 5,
                borderColor: theme.colors.icon,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(1.7),
                  fontWeight: "800",
                  color: theme.colors.text,
                }}
              >
                68%
              </Text>
            </View>
          </View>

          {/* Progress */}
          <View
            style={{
              height: 6,
              marginTop: 18,
              borderRadius: 3,
              backgroundColor: theme.colors.border,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: "68%",
                height: "100%",
                borderRadius: 3,
                backgroundColor: theme.colors.icon,
              }}
            />
          </View>
        </View>

        {/* Choose a day */}
        <View style={{ marginTop: 28 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2.3),
                fontWeight: "800",
                color: theme.colors.text,
              }}
            >
              Choose a day
            </Text>

            <Pressable
              onPress={() =>
                navigation.navigate("CalendarScreen" as never)
              }
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(1.45),
                  fontWeight: "700",
                  color: theme.colors.icon,
                }}
              >
                View calendar
              </Text>
            </Pressable>
          </View>

          {/* Your date selector goes here */}
        </View>

        {/* Start Workout */}
        <View style={{ marginTop: 30 }}>
          <Text
            style={{
              fontSize: responsiveFontSize(2.3),
              fontWeight: "800",
              color: theme.colors.text,
              marginBottom: 14,
            }}
          >
            Start your workout
          </Text>

          <Pressable
            onPress={startFeaturedWorkout}
            style={{
              height: responsiveWidth(48),
              borderRadius: 24,
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
              overflow: "hidden",
            }}
          >
            {/* Put workout image here */}

            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                padding: 20,
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(2.7),
                  fontWeight: "900",
                  color: theme.colors.text,
                }}
              >
                {featuredExercise.name}
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  fontSize: responsiveFontSize(1.5),
                  color: theme.colors.text,
                  opacity: 0.6,
                }}
              >
                {featuredExercise.duration} • {featuredExercise.category}
              </Text>

              <View
                style={{
                  position: "absolute",
                  right: 18,
                  bottom: 18,
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: theme.colors.text,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: theme.colors.background }}>
                  ▶
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Daily Programs */}
        <View style={{ marginTop: 32 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2.3),
                fontWeight: "800",
                color: theme.colors.text,
              }}
            >
              Daily programs
            </Text>

            <Text
              style={{
                fontSize: responsiveFontSize(1.4),
                color: theme.colors.text,
                opacity: 0.5,
              }}
            >
              {exercises.length} workouts
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {exercises.map((exercise) => (
              <WorkoutCard key={exercise.id} exercise={exercise} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export function WorkoutCard({ exercise }: { exercise: Exercise }) {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <Pressable
      onPress={() =>
        navigation.navigate(ROUTES.EXERCISE_DETAIL, {
          exerciseId: exercise.id,
        })
      }
      style={{
        width: "48%",
        marginBottom: responsiveWidth(4),
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <View style={{ height: responsiveWidth(35) }}>
        <Image
          source={cardImages[exercise.id.length % cardImages.length]}
          resizeMode="cover"
          style={{ width: "100%", height: "100%" }}
        />
        <Text
          style={{
            position: "absolute",
            zIndex: 1,
            right: 10,
            bottom: 10,
            paddingHorizontal: 9,
            paddingVertical: 6,
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: theme.colors.primary,
            color: theme.colors.onPrimary,
            fontSize: responsiveFontSize(1.2),
            fontWeight: "800",
          }}
        >
          {exercise.sets} × {exercise.reps}
        </Text>
      </View>

      <View style={{ padding: 12 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: responsiveFontSize(1.9),
            fontWeight: "800",
            color: theme.colors.text,
          }}
        >
          {exercise.name}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            marginTop: 7,
            fontSize: responsiveFontSize(1.35),
            color: theme.colors.textSecondary,
          }}
        >
          {exercise.duration} • {exercise.difficulty}
        </Text>
      </View>
    </Pressable>
  );
}