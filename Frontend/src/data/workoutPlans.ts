export type WorkoutPlan = {
  id: string;
  title: string;
  tags: string[];
  durationMinutes: number;
  exerciseIds: string[];
};

export const workoutPlans: WorkoutPlan[] = [
  {
    id: "upper-body-push",
    title: "Upper Body Push",
    tags: ["Chest", "Shoulders", "Triceps"],
    durationMinutes: 45,
    exerciseIds: [
      "bench-press",
      "incline-dumbbell-press",
      "shoulder-press",
    ],
  },
  {
    id: "lower-body",
    title: "Lower Body",
    tags: ["Legs", "Glutes"],
    durationMinutes: 50,
    exerciseIds: ["squat", "leg-press", "romanian-deadlift"],
  },
  {
    id: "pull-day",
    title: "Pull Day",
    tags: ["Back", "Biceps", "Rear Delts"],
    durationMinutes: 45,
    exerciseIds: ["cable-row", "dumbbell-curl"],
  },
  {
    id: "full-body",
    title: "Full Body",
    tags: ["Full Body", "Core"],
    durationMinutes: 55,
    exerciseIds: [
      "bench-press",
      "shoulder-press",
      "squat",
      "leg-press",
      "cable-row",
    ],
  },
];

const completedExerciseIds = new Set<string>();

export const setExerciseCompleted = (exerciseId: string) => {
  completedExerciseIds.add(exerciseId);
};

export const isExerciseCompleted = (exerciseId: string) =>
  completedExerciseIds.has(exerciseId);