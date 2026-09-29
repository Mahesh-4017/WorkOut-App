import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Image,
} from "react-native";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { exercises } from "../data/exercises";
import { useUser } from "../data/UserProvider";
import { useTheme } from "../theme/ThemeProvider";
import { AppTheme } from "../theme/theme";

type RootStackParamList = {
  Home: undefined;
  Calendar: undefined;
  ExerciseDetail: {
    exerciseId: string;
  };
};

export default function ExerciseDetailsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { addHistory } = useUser();
  const styles = createStyles(theme);
  const route = useRoute<RouteProp<RootStackParamList, "ExerciseDetail">>();

  const exerciseId = route.params?.exerciseId;
  const exercise = exercises.find(item => item.id === exerciseId) ?? exercises[0];

  const [activeTab, setActiveTab] =
    useState<"instructions" | "tips">(
      "instructions"
    );

  // ------------------------------------------------
  // SAFETY
  // ------------------------------------------------

  if (!exercise) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Exercise not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ==========================================
            VIDEO
        ========================================== */}

        <View style={styles.videoContainer}>

          <Image
            source={{
              uri: exercise.image,
            }}
            style={styles.videoImage}
          />

          {/* Dark overlay */}

          <View
            style={styles.videoOverlay}
          />


          {/* Play */}

          <Pressable
            style={styles.playButton}
            onPress={() => {
              // Open video here
              console.log(
                "Play:",
                exercise.video
              );
            }}
          >

            <Text style={styles.playIcon}>
              ▶
            </Text>

          </Pressable>


          {/* Video duration */}

          <View style={styles.duration}>
            <Text
              style={styles.durationText}
            >
              0:32 / {exercise.duration}
            </Text>
          </View>

        </View>


        {/* ==========================================
            EXERCISE INFO
        ========================================== */}

        <View style={styles.info}>

          <Text style={styles.exerciseName}>
            {exercise.name}
          </Text>

          <Text style={styles.exerciseMeta}>
            {exercise.muscle} •{" "}
            {exercise.category}
          </Text>


          {/* Stats */}

          <View style={styles.statsRow}>

            <InfoStat
              styles={styles}
              label="Sets"
              value={`${exercise.sets}`}
            />

            <InfoStat
              styles={styles}
              label="Reps"
              value={exercise.reps}
            />

            <InfoStat
              styles={styles}
              label="Difficulty"
              value={exercise.difficulty}
            />

          </View>


          {/* Equipment */}

          <View style={styles.equipmentBox}>

            <Text style={styles.equipmentIcon}>
              🏋️
            </Text>

            <View>
              <Text
                style={styles.equipmentLabel}
              >
                Equipment
              </Text>

              <Text
                style={styles.equipmentValue}
              >
                {exercise.equipment}
              </Text>
            </View>

          </View>

        </View>


        {/* ==========================================
            TABS
        ========================================== */}

        <View style={styles.tabs}>

          <Pressable
            onPress={() =>
              setActiveTab(
                "instructions"
              )
            }
            style={[
              styles.tab,
              activeTab ===
                "instructions" &&
                styles.activeTab,
            ]}
          >

            <Text
              style={[
                styles.tabText,
                activeTab ===
                  "instructions" &&
                  styles.activeTabText,
              ]}
            >
              Instructions
            </Text>

          </Pressable>


          <Pressable
            onPress={() =>
              setActiveTab("tips")
            }
            style={[
              styles.tab,
              activeTab === "tips" &&
                styles.activeTab,
            ]}
          >

            <Text
              style={[
                styles.tabText,
                activeTab === "tips" &&
                  styles.activeTabText,
              ]}
            >
              Tips
            </Text>

          </Pressable>

        </View>


        {/* ==========================================
            CONTENT
        ========================================== */}

        <View style={styles.stepsContainer}>

          {activeTab ===
          "instructions"
            ? exercise.instructions.map(
                (instruction, index) => (
                  <InstructionRow
                    styles={styles}
                    key={index}
                    number={index + 1}
                    text={instruction}
                  />
                )
              )
            : exercise.tips.map(
                (tip, index) => (
                  <InstructionRow
                    styles={styles}
                    key={index}
                    number={index + 1}
                    text={tip}
                  />
                )
              )}

        </View>


        {/* ==========================================
            BOTTOM BUTTON
        ========================================== */}

        <Pressable
          style={styles.doneButton}
          onPress={() => {
            addHistory(exercise.id);
            navigation.goBack();
          }}
        >

          <Text style={styles.doneIcon}>
            ✓
          </Text>

          <Text style={styles.doneText}>
            Mark as Done
          </Text>

        </Pressable>

      </ScrollView>

    </SafeAreaView>
  );
}


// --------------------------------------------------
// INFO STAT
// --------------------------------------------------

function InfoStat({
  styles,
  label,
  value,
}: {
  styles: ReturnType<typeof createStyles>;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoStat}>

      <Text style={styles.infoStatValue}>
        {value}
      </Text>

      <Text style={styles.infoStatLabel}>
        {label}
      </Text>

    </View>
  );
}


// --------------------------------------------------
// INSTRUCTION ROW
// --------------------------------------------------

function InstructionRow({
  styles,
  number,
  text,
}: {
  styles: ReturnType<typeof createStyles>;
  number: number;
  text: string;
}) {
  return (
    <View style={styles.instructionRow}>

      <View style={styles.numberCircle}>

        <Text style={styles.numberText}>
          {number}
        </Text>

      </View>

      <Text style={styles.instructionText}>
        {text}
      </Text>

    </View>
  );
}


// --------------------------------------------------
// STYLES
// --------------------------------------------------

const createStyles = (theme: AppTheme) => StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor:
      theme.colors.background,
  },

  scrollContent: {
    paddingBottom: 30,
  },


  // ================================================
  // HERO
  // ================================================

  hero: {
    height: 92,

    backgroundColor:
      theme.colors.surface,

    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 20,
  },

  backButton: {
    width: 40,
    height: 40,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  backIcon: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: "300",

    marginTop: -4,
  },

  heroTitle: {
    color: theme.colors.text,

    fontSize: 17,
    fontWeight: "700",
  },


  // ================================================
  // VIDEO
  // ================================================

  videoContainer: {
    height: 235,

    backgroundColor: theme.colors.black,

    position: "relative",

    overflow: "hidden",
  },

  videoImage: {
    width: "100%",
    height: "100%",

    resizeMode: "cover",
  },

  videoOverlay: {
    position: "absolute",

    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    backgroundColor:
      "rgba(0,0,0,0.30)",
  },

  playButton: {
    position: "absolute",

    width: 64,
    height: 64,

    borderRadius: 32,

    backgroundColor: theme.colors.primary,

    alignItems: "center",
    justifyContent: "center",

    left: "50%",
    top: "50%",

    marginLeft: -32,
    marginTop: -32,
  },

  playIcon: {
    color: theme.colors.onPrimary,
    fontSize: 23,

    marginLeft: 3,
  },

  duration: {
    position: "absolute",

    bottom: 12,
    left: 15,

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 6,

    backgroundColor: theme.colors.overlay,
  },

  durationText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: "600",
  },


  // ================================================
  // INFO
  // ================================================

  info: {
    backgroundColor:
      theme.colors.surface,

    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
  },

  exerciseName: {
    fontSize: 24,
    fontWeight: "800",

    color: theme.colors.text,

    letterSpacing: -0.4,
  },

  exerciseMeta: {
    fontSize: 13,

    color: theme.colors.textSecondary,

    marginTop: 5,
  },


  // ================================================
  // STATS
  // ================================================

  statsRow: {
    flexDirection: "row",

    marginTop: 18,

    gap: 8,
  },

  infoStat: {
    flex: 1,

    backgroundColor:
      theme.colors.background,

    borderRadius: 13,

    paddingVertical: 11,

    alignItems: "center",
  },

  infoStatValue: {
    fontSize: 13,

    fontWeight: "800",

    color: theme.colors.text,
  },

  infoStatLabel: {
    fontSize: 10,

    color: theme.colors.muted,

    marginTop: 3,
  },


  // ================================================
  // EQUIPMENT
  // ================================================

  equipmentBox: {
    marginTop: 12,

    padding: 13,

    borderRadius: 13,

    backgroundColor:
      theme.colors.card,

    flexDirection: "row",

    alignItems: "center",
  },

  equipmentIcon: {
    fontSize: 20,

    marginRight: 10,
  },

  equipmentLabel: {
    fontSize: 10,

    color: theme.colors.textSecondary,

    fontWeight: "600",
  },

  equipmentValue: {
    fontSize: 13,

    color: theme.colors.text,

    fontWeight: "700",

    marginTop: 2,
  },


  // ================================================
  // TABS
  // ================================================

  tabs: {
    height: 55,

    backgroundColor:
      theme.colors.surface,

    flexDirection: "row",

    borderBottomWidth: 1,

    borderBottomColor:
      theme.colors.border,

    paddingHorizontal: 20,
  },

  tab: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    position: "relative",
  },

  activeTab: {
    borderBottomWidth: 2,

    borderBottomColor:
      theme.colors.primary,
  },

  tabText: {
    fontSize: 13,

    color: theme.colors.textSecondary,

    fontWeight: "600",
  },

  activeTabText: {
    color: theme.colors.primary,

    fontWeight: "800",
  },


  // ================================================
  // INSTRUCTIONS
  // ================================================

  stepsContainer: {
    backgroundColor:
      theme.colors.surface,

    paddingHorizontal: 20,

    paddingTop: 18,

    paddingBottom: 8,
  },

  instructionRow: {
    flexDirection: "row",

    marginBottom: 19,

    alignItems: "flex-start",
  },

  numberCircle: {
    width: 25,
    height: 25,

    borderRadius: 13,

    backgroundColor:
      theme.colors.primary,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  numberText: {
    color: "#FFFFFF",

    fontSize: 11,

    fontWeight: "800",
  },

  instructionText: {
    flex: 1,

    fontSize: 13,

    lineHeight: 20,

    color: "#475569",
  },


  // ================================================
  // DONE
  // ================================================

  doneButton: {
    height: 56,

    marginHorizontal: 20,

    marginTop: 16,

    borderRadius: 15,

    backgroundColor:
      theme.colors.primary,

    alignItems: "center",
    justifyContent: "center",

    flexDirection: "row",
  },

  doneIcon: {
    color: "#FFFFFF",

    fontSize: 18,

    fontWeight: "800",

    marginRight: 8,
  },

  doneText: {
    color: "#FFFFFF",

    fontSize: 15,

    fontWeight: "800",
  },


  // ================================================
  // ERROR
  // ================================================

  errorContainer: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",
  },

  errorText: {
    fontSize: 16,

    color: theme.colors.text,

    fontWeight: "700",
  },
});