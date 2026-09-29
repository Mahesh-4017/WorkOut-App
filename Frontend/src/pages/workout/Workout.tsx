import React from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../theme/ThemeProvider";
import { ROUTES } from "../../navigation/routes";
import { exercises } from "../../data/exercises";
import {
  workoutPlans,
} from "../../data/workoutPlans";
import { useUser } from "../../data/UserProvider";

type WorkoutExercise = {
  id: string;
  name: string;
  sets: number;
  repsRange: string;
  thumbnail: ImageSourcePropType;
};

type WorkoutDetail = {
  title: string;
  tags: string[];
  exerciseCount: number;
  durationMinutes: number;
  heroVideo: ImageSourcePropType;
  exercises: WorkoutExercise[];
};

const thumbnailSources = [
  require("../../assets/workout.png"),
  require("../../assets/workout2.png"),
  require("../../assets/workout3.png"),
  require("../../assets/workout4.png"),
];

export default function TodayWorkoutScreen() {
  const { theme } = useTheme();
  const { history } = useUser();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const plan =
    workoutPlans.find(item => item.id === route.params?.workoutId) ??
    workoutPlans[0];
  const todaysWorkout: WorkoutDetail = {
    title: plan.title,
    tags: plan.tags,
    exerciseCount: plan.exerciseIds.length,
    durationMinutes: plan.durationMinutes,
    heroVideo: thumbnailSources[0],
    exercises: plan.exerciseIds
      .map((exerciseId, index) => {
        const exercise = exercises.find(item => item.id === exerciseId);
        if (!exercise) return null;
        return {
          id: exercise.id,
          name: exercise.name,
          sets: exercise.sets,
          repsRange: `${exercise.reps} reps`,
          thumbnail: thumbnailSources[index % thumbnailSources.length],
        };
      })
      .filter((exercise): exercise is WorkoutExercise => exercise !== null),
  };

  const [, refreshCompletionState] = React.useState(0);

  useFocusEffect(
    React.useCallback(() => {
      refreshCompletionState(value => value + 1);
    }, [])
  );

  const openExercise = (exercise: WorkoutExercise) => {
    navigation.navigate(ROUTES.EXERCISE_DETAIL, { exerciseId: exercise.id });
  };

  const startWorkout = () => {
    navigation.navigate(ROUTES.ACTIVE_WORKOUT, { workout: todaysWorkout });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: responsiveWidth(5),
          paddingBottom: 40,
        }}
      >
        {/* Video preview */}
        <Pressable
          style={{
            marginTop: 14,
            height: responsiveWidth(44),
            borderRadius: 22,
            overflow: "hidden",
            backgroundColor: theme.colors.card,
          }}
        >
          <Image
            source={todaysWorkout.heroVideo}
            resizeMode="cover"
            style={{
              width: "100%",
              height: "100%",
            }}
          />

          {/* Darken the image slightly so the play button and badge stay readable */}
          <View
            style={{
              ...StyleSheet.absoluteFill,
              backgroundColor: "rgba(0,0,0,0.25)",
            }}
          />

          {/* Play button */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.9)",
              }}
            >
              <Ionicons name="play" size={22} color={theme.colors.black} />
            </View>
          </View>

          {/* Duration badge */}
          <View
            style={{
              position: "absolute",
              right: 12,
              bottom: 12,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 12,
              backgroundColor: "rgba(0,0,0,0.55)",
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(1.3),
                fontWeight: "700",
                color: "#fff",
              }}
            >
              {todaysWorkout.durationMinutes} min
            </Text>
          </View>
        </Pressable>

        {/* Title + tags */}
        <Text
          style={{
            marginTop: 18,
            fontSize: responsiveFontSize(2.7),
            fontWeight: "900",
            color: theme.colors.text,
          }}
        >
          {todaysWorkout.title}
        </Text>

        <Text
          style={{
            marginTop: 6,
            fontSize: responsiveFontSize(1.5),
            color: theme.colors.textSecondary,
          }}
        >
          {todaysWorkout.tags.join(" • ")}
        </Text>

        {/* Meta row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="barbell-outline"
              size={16}
              color={theme.colors.icon}
            />
            <Text
              style={{
                marginLeft: 6,
                fontSize: responsiveFontSize(1.5),
                color: theme.colors.text,
                opacity: 0.7,
              }}
            >
              {todaysWorkout.exerciseCount} exercises
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 18,
            }}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={theme.colors.icon}
            />
            <Text
              style={{
                marginLeft: 6,
                fontSize: responsiveFontSize(1.5),
                color: theme.colors.text,
                opacity: 0.7,
              }}
            >
              {todaysWorkout.durationMinutes} min
            </Text>
          </View>
        </View>

        {/* Start workout button */}
        <Pressable
          onPress={startWorkout}
          style={{
            marginTop: 20,
            height: 52,
            borderRadius: 26,
            backgroundColor: theme.colors.primary,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="play" size={16} color={theme.colors.onPrimary} />
          <Text
            style={{
              marginLeft: 8,
              fontSize: responsiveFontSize(1.75),
              fontWeight: "700",
              color: theme.colors.onPrimary,
            }}
          >
            Start Workout
          </Text>
        </Pressable>

        {/* Exercises */}
        <Text
          style={{
            marginTop: 26,
            marginBottom: 12,
            fontSize: responsiveFontSize(2.1),
            fontWeight: "800",
            color: theme.colors.text,
          }}
        >
          Exercises
        </Text>

        <View style={{ gap: 12 }}>
          {todaysWorkout.exercises.map((exercise, index) => (
            <Pressable
              key={exercise.id}
              onPress={() => openExercise(exercise)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 10,
                borderRadius: 18,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.colors.background,
                  marginRight: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.4),
                    fontWeight: "700",
                    color: theme.colors.text,
                  }}
                >
                  {index + 1}
                </Text>
              </View>

              <Image
                source={exercise.thumbnail}
                style={{
                  width: 60,
                  height: 72,
                  borderRadius: 12,
                  backgroundColor: theme.colors.border,
                }}
              />

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.7),
                    fontWeight: "700",
                    color: theme.colors.text,
                  }}
                  numberOfLines={1}
                >
                  {exercise.name}
                </Text>
                <Text
                  style={{
                    marginTop: 3,
                    fontSize: responsiveFontSize(1.4),
                    color: theme.colors.text,
                    opacity: 0.55,
                  }}
                >
                  {exercise.sets} sets • {exercise.repsRange}
                </Text>
                {history.some(item => item.exerciseId === exercise.id) && (
                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: responsiveFontSize(1.25),
                      fontWeight: "800",
                      color: theme.colors.success,
                    }}
                  >
                    Completed
                  </Text>
                )}
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.icon}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}