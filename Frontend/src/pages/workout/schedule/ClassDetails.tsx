import React from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { CLASSES, fromKey, instructorName, toKey } from "../../../data/classSchedule";
import { useSchedule } from "../../../data/ScheduleProvider";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";
import { ACCENT } from "../../../components/MovementUI";
import { DARK_TEXT } from "../../../components/WorkoutUI";

export default function ClassDetails() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { theme } = useTheme();
  const { find, add, remove, error } = useSchedule();
  const styles = createStyles(theme);
  const classSession = CLASSES.find(item => item.id === params?.classId);
  const date: string = params?.date ?? toKey(new Date());

  if (!classSession) {
    return (
      <SafeAreaView style={styles.screen}>
        <OnboardingHeader title="Class Details" onBack={() => navigation.goBack()} />
        <Text style={styles.description}>Class not found.</Text>
      </SafeAreaView>
    );
  }

  const entry = find(classSession.id, date);
  const dateText = fromKey(date).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
  const completed = classSession.completedOn
    ? fromKey(classSession.completedOn).toLocaleDateString(undefined, { day: "numeric", month: "long" })
    : null;

  const join = () => {
    if (classSession.workoutId) {
      navigation.navigate(WORKOUT_ROUTES.DETAILS, { workoutId: classSession.workoutId });
    } else if (classSession.videoUrl) {
      Linking.openURL(classSession.videoUrl).catch(openError => {
        console.error("Unable to open the class video.", openError);
        Alert.alert("Unable to open video", "Please try again later.");
      });
    } else {
      Alert.alert("Not available yet", "This class isn't ready to stream yet.");
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <OnboardingHeader title="Class Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={join} style={styles.preview} accessibilityRole="button" accessibilityLabel="Preview class">
          <View style={styles.badge}><Text style={styles.badgeText}>{classSession.minutes}:00</Text></View>
          <View style={styles.play}>
            <Ionicons name="play" size={20} color={theme.colors.onPrimary} />
          </View>
        </Pressable>

        <Text style={styles.title}>{classSession.title}</Text>
        <View style={styles.instructor}>
          <Ionicons name="person-circle-outline" size={18} color={theme.colors.muted} />
          <Text style={styles.instructorText}>{instructorName(classSession.instructorId)}</Text>
        </View>

        <View style={styles.tags}>
          <View style={[styles.tag, styles.tagBlue]}>
            <Text style={styles.tagText}>{classSession.tag}</Text>
          </View>
          <View style={[styles.tag, styles.tagLavender]}>
            <Text style={styles.tagText}>{classSession.level.toUpperCase()}</Text>
          </View>
          <View style={[styles.tag, styles.tagOrange]}>
            <Text style={styles.tagText}>{classSession.minutes} MIN</Text>
          </View>
        </View>

        <Text style={styles.description}>{classSession.description}</Text>

        {completed ? (
          <View style={styles.done}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.primaryDark} />
            <Text style={styles.doneText}>You completed this class on {completed}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => (entry ? remove(entry.id) : add(classSession.id, date, classSession.time))}
          style={styles.scheduleRow}
          accessibilityRole="button"
        >
          <Ionicons name={entry ? "calendar" : "calendar-outline"} size={16} color={ACCENT.purple} />
          <Text style={styles.scheduleText}>
            {entry
              ? `Scheduled for ${dateText}, ${entry.time} (tap to remove)`
              : `Add to schedule · ${dateText}, ${classSession.time}`}
          </Text>
        </Pressable>
        {error ? <Text style={styles.scheduleError} accessibilityRole="alert">{error}</Text> : null}
      </ScrollView>

      <View style={styles.bottom}>
        <PrimaryButton label="▶  Join class" onPress={join} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    scroll: { paddingBottom: 16 },
    preview: { height: 220, borderRadius: 16, backgroundColor: "#111", marginTop: 6, alignItems: "center", justifyContent: "center" },
    badge: { position: "absolute", top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.18)" },
    badgeText: { color: "#fff", fontSize: 10, fontFamily: theme.typography.fontFamilyBold },
    play: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center", paddingLeft: 3 },
    title: { color: theme.colors.text, fontSize: 22, lineHeight: 27, marginTop: 16, fontFamily: theme.typography.fontFamilyBold },
    instructor: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
    instructorText: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
    tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
    tag: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
    tagBlue: { backgroundColor: "#CFE3F5" },
    tagLavender: { backgroundColor: "#E6DFF6" },
    tagOrange: { backgroundColor: "#FBE5C4" },
    tagText: { color: DARK_TEXT, fontSize: 9, letterSpacing: 0.4, fontFamily: theme.typography.fontFamilyBold },
    description: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 12, fontFamily: theme.typography.fontFamily },
    done: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: theme.colors.surfaceAlt ?? theme.colors.card, borderRadius: 10, padding: 10, marginTop: 14 },
    doneText: { color: theme.colors.text, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
    scheduleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
    scheduleText: { flex: 1, color: ACCENT.purple, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    scheduleError: { color: "#A63737", fontSize: 11, lineHeight: 16, marginTop: 8, fontFamily: theme.typography.fontFamilyMedium },
    bottom: { paddingBottom: 16, paddingTop: 8 },
  });
