import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { CLASSES, instructorName, INSTRUCTORS } from "../../../data/classSchedule";
import { COLLECTIONS } from "../../../data/workoutCatalog";
import { OnboardingHeader } from "../../../components/OnboardingUI";
import { DARK_TEXT } from "../../../components/WorkoutUI";

type Tab = "instructors" | "ondemand" | "collections";
const TABS: { id: Tab; label: string }[] = [
  { id: "instructors", label: "Instructors" },
  { id: "ondemand", label: "On-demand" },
  { id: "collections", label: "Collections" },
];

export default function Instructors() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [tab, setTab] = useState<Tab>("instructors");
  const initials = (name: string) => name.split(" ").map(word => word[0]).join("").slice(0, 2);

  return (
    <SafeAreaView style={styles.screen}>
      <OnboardingHeader title="Instructors" onBack={() => navigation.goBack()} />
      <View style={styles.tabs}>
        {TABS.map(item => {
          const selected = item.id === tab;
          return (
            <Pressable
              key={item.id}
              onPress={() => setTab(item.id)}
              style={[styles.tab, selected && styles.tabOn]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.tabText, selected && styles.tabTextOn]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === "instructors" ? (
          <View style={styles.grid}>
            {INSTRUCTORS.map(instructor => (
              <Pressable
                key={instructor.id}
                onPress={() => navigation.navigate(WORKOUT_ROUTES.DATE_CLASSES, { instructorId: instructor.id })}
                style={styles.person}
                accessibilityRole="button"
                accessibilityLabel={instructor.name}
              >
                <View style={styles.photo}>
                  {instructor.photoUrl
                    ? <Image source={{ uri: instructor.photoUrl }} style={styles.img} />
                    : <Text style={styles.initials}>{initials(instructor.name)}</Text>}
                </View>
                <Text style={styles.name}>{instructor.name}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {tab === "ondemand" ? CLASSES.map(session => (
          <Pressable
            key={session.id}
            onPress={() => navigation.navigate(WORKOUT_ROUTES.CLASS_DETAILS, { classId: session.id })}
            style={[styles.row, { backgroundColor: session.tint }]}
            accessibilityRole="button"
          >
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{session.title}</Text>
              <Text style={styles.rowMeta}>{session.minutes} min · {instructorName(session.instructorId)}</Text>
            </View>
          </Pressable>
        )) : null}

        {tab === "collections" ? COLLECTIONS.map(collection => (
          <Pressable
            key={collection.id}
            onPress={() => navigation.navigate(WORKOUT_ROUTES.SEARCH, {
              collection: collection.id,
              title: collection.title,
            })}
            style={styles.row}
            accessibilityRole="button"
          >
            <Text style={styles.rowTitle}>{collection.title}</Text>
          </Pressable>
        )) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    tabs: { flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 14 },
    tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, backgroundColor: theme.colors.card },
    tabOn: { backgroundColor: theme.colors.primary },
    tabText: { color: theme.colors.muted, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
    tabTextOn: { color: DARK_TEXT, fontFamily: theme.typography.fontFamilyBold },
    scroll: { paddingBottom: 24 },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 18 },
    person: { width: "31%", alignItems: "center" },
    photo: { width: 76, height: 76, borderRadius: 38, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center", overflow: "hidden" },
    img: { width: "100%", height: "100%" },
    initials: { color: DARK_TEXT, fontSize: 20, fontFamily: theme.typography.fontFamilyBold },
    name: { color: theme.colors.text, fontSize: 11, marginTop: 7, textAlign: "center", fontFamily: theme.typography.fontFamilyMedium },
    row: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 14, marginBottom: 9, backgroundColor: theme.colors.card },
    rowCopy: { flex: 1 },
    rowTitle: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    rowMeta: { color: theme.colors.muted, fontSize: 11, marginTop: 3, fontFamily: theme.typography.fontFamily },
  });
