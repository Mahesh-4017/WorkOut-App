import React from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../navigation/routes";

type Props = {
  exercise: {
    id: string;
    name: string;
    muscle: string;
    sets: number;
    reps: string;
  };
};

export default function ExerciseCard({
  exercise,
}: Props) {

  const navigation = useNavigation<any>();

  return (
    <Pressable
      style={styles.card}
      onPress={() => {

        navigation.navigate(
          ROUTES.EXERCISE_DETAIL as never,
          {
            exerciseId: exercise.id,
          } as never
        );

      }}
    >

      {/* Number */}

      <View style={styles.number}>
        <Text style={styles.numberText}>
          01
        </Text>
      </View>


      {/* Information */}

      <View style={styles.content}>

        <Text style={styles.name}>
          {exercise.name}
        </Text>

        <Text style={styles.meta}>
          {exercise.muscle} •{" "}
          {exercise.sets} sets •{" "}
          {exercise.reps} reps
        </Text>

      </View>


      {/* Video */}

      <Pressable
        style={styles.videoButton}
        onPress={() => {

          navigation.navigate(
            ROUTES.EXERCISE_DETAIL as never,
            {
              exerciseId: exercise.id,
            } as never
          )
        }}
      >
        <Text style={styles.videoIcon}>
          ▶
        </Text>
      </Pressable>


      {/* Arrow */}

      <Text style={styles.arrow}>
        ›
      </Text>

    </Pressable>
  );
}


const styles = StyleSheet.create({

  card: {
    minHeight: 78,

    backgroundColor: "#FFFFFF",

    borderRadius: 15,

    borderWidth: 1,

    borderColor: "#E8EDF5",

    padding: 10,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 9,
  },

  number: {
    width: 38,
    height: 38,

    borderRadius: 12,

    backgroundColor: "#EEF0FF",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  numberText: {
    fontSize: 11,

    fontWeight: "800",

    color: "#5865F2",
  },

  content: {
    flex: 1,
  },

  name: {
    fontSize: 14,

    fontWeight: "800",

    color: "#111827",
  },

  meta: {
    fontSize: 10,

    color: "#64748B",

    marginTop: 4,
  },

  videoButton: {
    width: 34,
    height: 34,

    borderRadius: 10,

    backgroundColor: "#F0F2FF",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 7,
  },

  videoIcon: {
    fontSize: 11,

    color: "#5865F2",

    marginLeft: 2,
  },

  arrow: {
    fontSize: 24,

    color: "#94A3B8",
  },
});