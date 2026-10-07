import React from "react";
import {
  Image,
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
import { exercises, Exercise } from "../data/exercises";
import { ROUTES } from "../navigation/routes";
import { useTheme } from "../theme/ThemeProvider";

const cardImages = [
  require("../assets/workout.png"),
  require("../assets/workout2.png"),
  require("../assets/workout3.png"),
  require("../assets/workout4.png"),
];

export default function WorkoutHome() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();

  const featuredExercise = exercises[0];

  const startFeaturedWorkout = () => {
    navigation.navigate(ROUTES.EXERCISE_DETAIL, {
      exerciseId: featuredExercise.id,
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Challenge */}
        <View style={styles.challenge}>
          <View style={styles.challengeHeader}>
            <View style={styles.challengeCopy}>
              <Text style={styles.eyebrow}>
                Current challenge
              </Text>

              <Text style={styles.challengeTitle}>
                30 Day Movement
              </Text>

              <Text style={styles.challengeDescription}>
                Keep your streak alive
              </Text>
            </View>

            <View style={styles.challengeRing}>
              <Text style={styles.challengePercent}>
                68%
              </Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* Choose a day */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.heading}>
              Choose a day
            </Text>

            <Pressable
              onPress={() =>
                navigation.navigate("CalendarScreen" as never)
              }
            >
              <Text style={styles.linkText}>
                View calendar
              </Text>
            </Pressable>
          </View>

          {/* Your date selector goes here */}
        </View>

        {/* Start Workout */}
        <View style={styles.workoutSection}>
          <Text style={styles.sectionTitle}>
            Start your workout
          </Text>

          <Pressable
            onPress={startFeaturedWorkout}
            style={styles.featuredCard}
          >
            {/* Put workout image here */}

            <View
              style={styles.featuredContent}
            >
              <Text style={styles.featuredTitle}>
                {featuredExercise.name}
              </Text>

              <Text style={styles.featuredSubtitle}>
                {featuredExercise.duration} • {featuredExercise.category}
              </Text>

              <View style={styles.playButton}>
                <Text style={styles.playIcon}>
                  ▶
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Daily Programs */}
        <View style={styles.programSection}>
          <View style={styles.programHeader}>
            <Text style={styles.heading}>
              Daily programs
            </Text>

            <Text style={styles.programCount}>
              {exercises.length} workouts
            </Text>
          </View>

          <View style={styles.programGrid}>
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
  const styles = createCardStyles(theme);
  const navigation = useNavigation<any>();

  return (
    <Pressable
      onPress={() =>
        navigation.navigate(ROUTES.EXERCISE_DETAIL, {
          exerciseId: exercise.id,
        })
      }
      style={styles.card}
    >
      <View style={styles.imageWrap}>
        <Image
          source={cardImages[exercise.id.length % cardImages.length]}
          resizeMode="cover"
          style={styles.image}
        />
        <Text style={styles.badge}>
          {exercise.sets} × {exercise.reps}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <Text
          numberOfLines={1}
          style={styles.cardTitle}
        >
          {exercise.name}
        </Text>
        <Text
          numberOfLines={1}
          style={styles.cardSubtitle}
        >
          {exercise.duration} • {exercise.difficulty}
        </Text>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: responsiveWidth(5), paddingBottom: 40 },
  challenge: { marginTop: 18, padding: 18, borderRadius: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  challengeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  challengeCopy: { flex: 1 },
  eyebrow: { fontSize: responsiveFontSize(1.35), fontWeight: "700", color: theme.colors.icon, textTransform: "uppercase", letterSpacing: 1 },
  challengeTitle: { marginTop: 6, fontSize: responsiveFontSize(2.3), fontWeight: "800", color: theme.colors.text },
  challengeDescription: { marginTop: 4, fontSize: responsiveFontSize(1.45), color: theme.colors.textSecondary },
  challengeRing: { width: 58, height: 58, borderRadius: 29, borderWidth: 5, borderColor: theme.colors.icon, alignItems: "center", justifyContent: "center" },
  challengePercent: { fontSize: responsiveFontSize(1.7), fontWeight: "800", color: theme.colors.text },
  progressTrack: { height: 6, marginTop: 18, borderRadius: 3, backgroundColor: theme.colors.border, overflow: "hidden" },
  progressFill: { width: "68%", height: "100%", borderRadius: 3, backgroundColor: theme.colors.icon },
  section: { marginTop: 28 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heading: { fontSize: responsiveFontSize(2.3), fontWeight: "800", color: theme.colors.text },
  linkText: { fontSize: responsiveFontSize(1.45), fontWeight: "700", color: theme.colors.icon },
  workoutSection: { marginTop: 30 },
  sectionTitle: { fontSize: responsiveFontSize(2.3), fontWeight: "800", color: theme.colors.text, marginBottom: 14 },
  featuredCard: { height: responsiveWidth(48), borderRadius: 18, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, overflow: "hidden" },
  featuredContent: { flex: 1, justifyContent: "flex-end", padding: 20 },
  featuredTitle: { fontSize: responsiveFontSize(2.7), fontWeight: "900", color: theme.colors.text },
  featuredSubtitle: { marginTop: 5, fontSize: responsiveFontSize(1.5), color: theme.colors.textSecondary },
  playButton: { position: "absolute", right: 18, bottom: 18, width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.text, alignItems: "center", justifyContent: "center" },
  playIcon: { color: theme.colors.background },
  programSection: { marginTop: 32 },
  programHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  programCount: { fontSize: responsiveFontSize(1.4), color: theme.colors.textSecondary },
  programGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
});

const createCardStyles = (theme: any) => StyleSheet.create({
  card: { width: "48%", marginBottom: responsiveWidth(4), borderRadius: 14, overflow: "hidden", backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  imageWrap: { height: responsiveWidth(35) },
  image: { width: "100%", height: "100%" },
  badge: { position: "absolute", zIndex: 1, right: 10, bottom: 10, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12, overflow: "hidden", backgroundColor: theme.colors.primary, color: theme.colors.onPrimary, fontSize: responsiveFontSize(1.2), fontWeight: "800" },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: responsiveFontSize(1.9), fontWeight: "800", color: theme.colors.text },
  cardSubtitle: { marginTop: 7, fontSize: responsiveFontSize(1.35), color: theme.colors.textSecondary },
});