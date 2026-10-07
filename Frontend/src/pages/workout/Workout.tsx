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
  const styles = createStyles(theme);
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
  const completedCount = todaysWorkout.exercises.filter(exercise => history.some(item => item.exerciseId === exercise.id)).length;
  const completionPercent = todaysWorkout.exerciseCount ? Math.round((completedCount / todaysWorkout.exerciseCount) * 100) : 0;
  const progressStyles = StyleSheet.create({
    progressFill: { width: `${completionPercent}%` },
  });
  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

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
    <View style={styles.screen}>
      {/* Header */}
      

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Video preview */}
        <Pressable
          style={styles.preview}
        >
          <Image
            source={todaysWorkout.heroVideo}
            resizeMode="cover"
            style={styles.heroImage}
          />

          {/* Darken the image slightly so the play button and badge stay readable */}
          <View style={styles.previewOverlay} />

          {/* Play button */}
          <View style={styles.previewCenter}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={22} color={theme.colors.black} />
            </View>
          </View>

          {/* Duration badge */}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {todaysWorkout.durationMinutes} min
            </Text>
          </View>
        </Pressable>

        {/* Title + tags */}
        <Text style={styles.title}>
          {todaysWorkout.title}
        </Text>

        <Text style={styles.tags}>
          {todaysWorkout.tags.join(" • ")}
        </Text>

        <Text style={styles.date}>
          {todayLabel}
        </Text>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons
              name="barbell-outline"
              size={16}
              color={theme.colors.icon}
            />
            <Text style={styles.metaText}>
              {todaysWorkout.exerciseCount} exercises
            </Text>
          </View>

          <View style={styles.metaItemSecond}>
            <Ionicons
              name="time-outline"
              size={16}
              color={theme.colors.icon}
            />
            <Text style={styles.metaText}>
              {todaysWorkout.durationMinutes} min
            </Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today&apos;s progress</Text>
            <Text style={styles.progressPercent}>{completionPercent}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, progressStyles.progressFill]} />
          </View>
          <Text style={styles.progressCaption}>
            {completedCount} of {todaysWorkout.exerciseCount} exercises completed
          </Text>
        </View>

        {/* Start workout button */}
        <Pressable
          onPress={startWorkout}
          style={styles.startButton}
        >
          <Ionicons name="play" size={16} color={theme.colors.onPrimary} />
          <Text style={styles.startButtonText}>
            Start Workout
          </Text>
        </Pressable>

        {/* Exercises */}
        <Text style={styles.sectionTitle}>
          Exercises
        </Text>

        <View style={styles.exerciseList}>
          {todaysWorkout.exercises.map((exercise, index) => (
            <Pressable
              key={exercise.id}
              onPress={() => openExercise(exercise)}
              style={styles.exerciseRow}
            >
              <View style={styles.exerciseNumber}>
                <Text style={styles.exerciseNumberText}>
                  {index + 1}
                </Text>
              </View>

              <Image
                source={exercise.thumbnail}
                style={styles.exerciseThumbnail}
              />

              <View style={styles.exerciseCopy}>
                <Text
                  style={styles.exerciseName}
                  numberOfLines={1}
                >
                  {exercise.name}
                </Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets} sets • {exercise.repsRange}
                </Text>
                {history.some(item => item.exerciseId === exercise.id) && (
                  <Text style={styles.completedText}>
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

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingHorizontal: responsiveWidth(5), paddingBottom: 40 },
  preview: { marginTop: 14, height: responsiveWidth(44), borderRadius: 18, overflow: "hidden", backgroundColor: theme.colors.card },
  heroImage: { width: "100%", height: "100%" },
  previewOverlay: { ...StyleSheet.absoluteFill, backgroundColor: theme.colors.overlay },
  previewCenter: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  playButton: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surface },
  durationBadge: { position: "absolute", right: 12, bottom: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: theme.colors.overlay },
  durationText: { fontSize: responsiveFontSize(1.3), fontWeight: "700", color: theme.colors.onPrimary },
  title: { marginTop: 18, fontSize: responsiveFontSize(2.7), fontWeight: "900", color: theme.colors.text },
  tags: { marginTop: 6, fontSize: responsiveFontSize(1.5), color: theme.colors.textSecondary },
  date: { marginTop: 8, fontSize: responsiveFontSize(1.35), color: theme.colors.textSecondary },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  metaItem: { flexDirection: "row", alignItems: "center" },
  metaItemSecond: { flexDirection: "row", alignItems: "center", marginLeft: 18 },
  metaText: { marginLeft: 6, fontSize: responsiveFontSize(1.5), color: theme.colors.text, opacity: 0.7 },
  progressCard: { marginTop: 18, padding: 14, borderRadius: 14, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTitle: { fontSize: responsiveFontSize(1.5), fontWeight: "800", color: theme.colors.text },
  progressPercent: { fontSize: responsiveFontSize(1.45), fontWeight: "800", color: theme.colors.primaryDark },
  progressTrack: { height: 8, marginTop: 10, borderRadius: 4, backgroundColor: theme.colors.border, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4, backgroundColor: theme.colors.primary },
  progressCaption: { marginTop: 7, fontSize: responsiveFontSize(1.25), color: theme.colors.textSecondary },
  startButton: { marginTop: 20, height: 52, borderRadius: 26, backgroundColor: theme.colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  startButtonText: { marginLeft: 8, fontSize: responsiveFontSize(1.75), fontWeight: "700", color: theme.colors.onPrimary },
  sectionTitle: { marginTop: 26, marginBottom: 12, fontSize: responsiveFontSize(2.1), fontWeight: "800", color: theme.colors.text },
  exerciseList: { gap: 12 },
  exerciseRow: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 14, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  exerciseNumber: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background, marginRight: 12 },
  exerciseNumberText: { fontSize: responsiveFontSize(1.4), fontWeight: "700", color: theme.colors.text },
  exerciseThumbnail: { width: 60, height: 72, borderRadius: 10, backgroundColor: theme.colors.border },
  exerciseCopy: { flex: 1, marginLeft: 12 },
  exerciseName: { fontSize: responsiveFontSize(1.7), fontWeight: "700", color: theme.colors.text },
  exerciseDetails: { marginTop: 3, fontSize: responsiveFontSize(1.4), color: theme.colors.text, opacity: 0.65 },
  completedText: { marginTop: 4, fontSize: responsiveFontSize(1.25), fontWeight: "800", color: theme.colors.success },
});