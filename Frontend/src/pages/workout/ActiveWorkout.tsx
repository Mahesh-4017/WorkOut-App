import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
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
  const timeLabel = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const completeCurrent = () => {
    if (!isComplete) addHistory(currentExercise.id);
    if (currentIndex < activeExercises.length - 1) setCurrentIndex(value => value + 1);
    else setRunning(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: responsiveWidth(5), paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.card, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="close" size={22} color={theme.colors.text} />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: theme.colors.text, fontSize: responsiveFontSize(1.8), fontWeight: "800" }}>{workout?.title || "Active workout"}</Text>
            <Text style={{ color: theme.colors.textSecondary, marginTop: 3, fontSize: responsiveFontSize(1.25) }}>Exercise {currentIndex + 1} of {activeExercises.length}</Text>
          </View>
          <Pressable onPress={() => setRunning(value => !value)} hitSlop={10} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.card, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={running ? "pause" : "play"} size={18} color={theme.colors.icon} />
          </Pressable>
        </View>

        <View style={{ height: 8, borderRadius: 4, backgroundColor: theme.colors.border, marginTop: 24, overflow: "hidden" }}>
          <View style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: theme.colors.primary, borderRadius: 4 }} />
        </View>

        <View style={{ marginTop: 22, borderRadius: 24, overflow: "hidden", backgroundColor: theme.colors.card }}>
          <Image source={currentExercise.thumbnail} resizeMode="cover" style={{ width: "100%", height: responsiveWidth(62) }} />
          <View style={{ padding: 18 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.25), fontWeight: "800", letterSpacing: 1 }}>CURRENT MOVE</Text>
            <Text style={{ color: theme.colors.text, fontSize: responsiveFontSize(3), fontWeight: "900", marginTop: 6 }}>{currentExercise.name}</Text>
            <View style={{ flexDirection: "row", gap: 18, marginTop: 14 }}>
              <View><Text style={{ color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.25) }}>Sets</Text><Text style={{ color: theme.colors.text, fontSize: responsiveFontSize(2), fontWeight: "800", marginTop: 3 }}>{currentExercise.sets}</Text></View>
              <View><Text style={{ color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.25) }}>Target</Text><Text style={{ color: theme.colors.text, fontSize: responsiveFontSize(2), fontWeight: "800", marginTop: 3 }}>{currentExercise.repsRange}</Text></View>
              <View><Text style={{ color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.25) }}>Time</Text><Text style={{ color: theme.colors.text, fontSize: responsiveFontSize(2), fontWeight: "800", marginTop: 3 }}>{timeLabel}</Text></View>
            </View>
          </View>
        </View>

        <Pressable onPress={completeCurrent} style={{ marginTop: 20, height: 56, borderRadius: 28, backgroundColor: isComplete ? theme.colors.success : theme.colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={isComplete ? "checkmark-circle" : "checkmark-circle-outline"} size={22} color={theme.colors.onPrimary} />
          <Text style={{ color: theme.colors.onPrimary, fontSize: responsiveFontSize(1.8), fontWeight: "800", marginLeft: 8 }}>{isComplete ? "Completed" : "Mark exercise complete"}</Text>
        </Pressable>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
          <Pressable disabled={currentIndex === 0} onPress={() => setCurrentIndex(value => value - 1)} style={{ flex: 1, height: 48, borderRadius: 24, backgroundColor: theme.colors.card, alignItems: "center", justifyContent: "center", opacity: currentIndex === 0 ? 0.4 : 1 }}><Text style={{ color: theme.colors.text, fontWeight: "700" }}>Previous</Text></Pressable>
          <Pressable disabled={currentIndex === activeExercises.length - 1} onPress={() => setCurrentIndex(value => value + 1)} style={{ flex: 1, height: 48, borderRadius: 24, backgroundColor: theme.colors.card, alignItems: "center", justifyContent: "center", opacity: currentIndex === activeExercises.length - 1 ? 0.4 : 1 }}><Text style={{ color: theme.colors.text, fontWeight: "700" }}>Next exercise</Text></Pressable>
        </View>

        <Text style={{ color: theme.colors.text, fontSize: responsiveFontSize(2), fontWeight: "800", marginTop: 28, marginBottom: 12 }}>Session checklist</Text>
        {activeExercises.map((exercise, index) => {
          const done = completed.includes(exercise.id);
          return <Pressable key={exercise.id} onPress={() => setCurrentIndex(index)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}><Ionicons name={done ? "checkmark-circle" : "ellipse-outline"} size={21} color={done ? theme.colors.success : theme.colors.muted} /><Text style={{ flex: 1, marginLeft: 10, color: done ? theme.colors.textSecondary : theme.colors.text, textDecorationLine: done ? "line-through" : "none", fontWeight: "700" }}>{exercise.name}</Text><Text style={{ color: theme.colors.textSecondary, fontSize: responsiveFontSize(1.25) }}>{exercise.sets} sets</Text></Pressable>;
        })}
      </ScrollView>
    </View>
  );
}
