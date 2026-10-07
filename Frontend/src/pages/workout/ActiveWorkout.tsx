import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { responsiveFontSize, responsiveWidth } from "react-native-responsive-dimensions";
import { useTheme } from "../../theme/ThemeProvider";
import { useUser } from "../../data/UserProvider";
import { exercises } from "../../data/exercises";

const images = [
  require("../../assets/workout.png"),
  require("../../assets/workout2.png"),
  require("../../assets/workout3.png"),
  require("../../assets/workout4.png"),
];

type ActiveExercise = {
  id: string;
  name: string;
  sets: number;
  repsRange: string;
  thumbnail: number;
};

export default function ActiveWorkout() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { history, addHistory } = useUser();
  const workout = route.params?.workout;
  const activeExercises: ActiveExercise[] = useMemo(() => workout?.exercises?.length ? workout.exercises : exercises.slice(0, 4).map((exercise, index) => ({
    id: exercise.id,
    name: exercise.name,
    sets: exercise.sets,
    repsRange: `${exercise.reps} reps`,
    thumbnail: images[index % images.length],
  })), [workout]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [completed, setCompleted] = useState<string[]>(() => history.map(item => item.exerciseId));

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => setSeconds(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    setCompleted(history.map(item => item.exerciseId));
  }, [history]);

  const currentExercise = activeExercises[currentIndex];
  const isComplete = completed.includes(currentExercise.id);
  const completedCount = activeExercises.filter(item => completed.includes(item.id)).length;
  const progress = activeExercises.length ? completedCount / activeExercises.length : 0;
  const progressStyles = StyleSheet.create({
    progressFill: { width: `${progress * 100}%` },
  });
  const timeLabel = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const completeCurrent = () => {
    if (!isComplete) addHistory(currentExercise.id);
    if (currentIndex < activeExercises.length - 1) setCurrentIndex(value => value + 1);
    else setRunning(false);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.iconButton}>
            <Ionicons name="close" size={22} color={theme.colors.text} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>{workout?.title || "Active workout"}</Text>
            <Text style={styles.headerSubtitle}>Exercise {currentIndex + 1} of {activeExercises.length}</Text>
          </View>
          <Pressable onPress={() => setRunning(value => !value)} hitSlop={10} style={styles.iconButton}>
            <Ionicons name={running ? "pause" : "play"} size={18} color={theme.colors.icon} />
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, progressStyles.progressFill]} />
        </View>

        <View style={styles.exerciseCard}>
          <Image source={currentExercise.thumbnail} resizeMode="cover" style={styles.exerciseImage} />
          <View style={styles.exerciseBody}>
            <Text style={styles.eyebrow}>CURRENT MOVE</Text>
            <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>
            <View style={styles.metrics}>
              <View style={styles.metric}><Text style={styles.metricLabel}>Sets</Text><Text style={styles.metricValue}>{currentExercise.sets}</Text></View>
              <View style={styles.metric}><Text style={styles.metricLabel}>Target</Text><Text style={styles.metricValue}>{currentExercise.repsRange}</Text></View>
              <View style={styles.metric}><Text style={styles.metricLabel}>Time</Text><Text style={styles.metricValue}>{timeLabel}</Text></View>
            </View>
          </View>
        </View>

        <Pressable onPress={completeCurrent} style={[styles.completeButton, isComplete ? styles.completedButton : styles.primaryButton]}>
          <Ionicons name={isComplete ? "checkmark-circle" : "checkmark-circle-outline"} size={22} color={theme.colors.onPrimary} />
          <Text style={styles.completeText}>{isComplete ? "Completed" : "Mark exercise complete"}</Text>
        </Pressable>

        <View style={styles.navigationButtons}>
          <Pressable disabled={currentIndex === 0} onPress={() => setCurrentIndex(value => value - 1)} style={[styles.navigationButton, currentIndex === 0 && styles.disabledButton]}>
            <Text style={styles.navigationText}>Previous</Text>
          </Pressable>
          <Pressable disabled={currentIndex === activeExercises.length - 1} onPress={() => setCurrentIndex(value => value + 1)} style={[styles.navigationButton, currentIndex === activeExercises.length - 1 && styles.disabledButton]}>
            <Text style={styles.navigationText}>Next exercise</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Session checklist</Text>
        {activeExercises.map((exercise, index) => {
          const done = completed.includes(exercise.id);
          return (
            <Pressable key={exercise.id} onPress={() => setCurrentIndex(index)} style={styles.checklistRow}>
              <Ionicons name={done ? "checkmark-circle" : "ellipse-outline"} size={21} color={done ? theme.colors.success : theme.colors.muted} />
              <Text style={[styles.checklistLabel, done && styles.checklistDone]}>{exercise.name}</Text>
              <Text style={styles.setsLabel}>{exercise.sets} sets</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: responsiveWidth(5), paddingBottom: 36 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.card, alignItems: "center", justifyContent: "center" },
  headerCopy: { alignItems: "center", flex: 1, paddingHorizontal: 8 },
  headerTitle: { color: theme.colors.text, fontSize: responsiveFontSize(1.8), fontWeight: "800", textAlign: "center" },
  headerSubtitle: { color: theme.colors.textSecondary, marginTop: 3, fontSize: responsiveFontSize(1.25) },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: theme.colors.border, marginTop: 24, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: theme.colors.primary, borderRadius: 4 },
  exerciseCard: { marginTop: 22, borderRadius: 18, overflow: "hidden", backgroundColor: theme.colors.card },
  exerciseImage: { width: "100%", height: responsiveWidth(62) },
  exerciseBody: { padding: 18 },
  eyebrow: { color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.25), fontWeight: "800", letterSpacing: 1 },
  exerciseTitle: { color: theme.colors.text, fontSize: responsiveFontSize(3), fontWeight: "900", marginTop: 6 },
  metrics: { flexDirection: "row", gap: 18, marginTop: 14 },
  metric: { flex: 1 },
  metricLabel: { color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.25) },
  metricValue: { color: theme.colors.text, fontSize: responsiveFontSize(2), fontWeight: "800", marginTop: 3 },
  completeButton: { marginTop: 20, height: 56, borderRadius: 28, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  completedButton: { backgroundColor: theme.colors.success },
  primaryButton: { backgroundColor: theme.colors.primary },
  completeText: { color: theme.colors.onPrimary, fontSize: responsiveFontSize(1.8), fontWeight: "800", marginLeft: 8 },
  navigationButtons: { flexDirection: "row", gap: 12, marginTop: 12 },
  navigationButton: { flex: 1, height: 48, borderRadius: 24, backgroundColor: theme.colors.card, alignItems: "center", justifyContent: "center" },
  disabledButton: { opacity: 0.4 },
  navigationText: { color: theme.colors.text, fontWeight: "700" },
  sectionTitle: { color: theme.colors.text, fontSize: responsiveFontSize(2), fontWeight: "800", marginTop: 28, marginBottom: 12 },
  checklistRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  checklistLabel: { flex: 1, marginLeft: 10, color: theme.colors.text, fontWeight: "700" },
  checklistDone: { color: theme.colors.textSecondary, textDecorationLine: "line-through" },
  setsLabel: { color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.25) },
});
