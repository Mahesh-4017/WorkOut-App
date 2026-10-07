export type Step = { title: string; body: string };
export type Note = { title: string; note: string; time?: number };

export type Move = {
  id: string;
  name: string;
  muscles: string[];
  level: string;
  sets: number;
  reps: number;
  loadKg: number;
  restSec: number;
  summary: string;
  noteTitle: string;
  noteBody: string;
  steps: Step[];
  stepNote: Step;
  chapters: Note[];
  tips: Note[];
  mistakes: Note[];
  videoUrl?: string;
  imageUrl?: string;
};

export type WorkoutDetail = {
  workoutId: string;
  blurb: string;
  coach: string;
  calories: number;
  moves: Move[];
};

const gobletSquat: Move = {
  id: "m1",
  name: "Goblet squat",
  muscles: ["Legs", "Lower body"],
  level: "Beginner",
  sets: 3,
  reps: 12,
  loadKg: 8,
  restSec: 45,
  summary: "Build leg and core strength while keeping your chest tall and your weight centered.",
  noteTitle: "Start with control",
  noteBody: "Keep your heels planted and your chest tall. Slow is better than deep.",
  steps: [
    { title: "Set your stance", body: "Stand with feet slightly wider than shoulder-width and toes turned out a little. Hold the dumbbell close to your chest." },
    { title: "Brace and lower", body: "Breathe in, tighten your core, and sit your hips down and back between your heels." },
    { title: "Find your depth", body: "Lower only as far as you can keep your heels down and your chest tall." },
    { title: "Drive up", body: "Press through your whole foot and stand tall, breathing out as you rise." },
  ],
  stepNote: { title: "Move within your range", body: "If your heels lift or your back rounds, stop a little higher. Depth comes with practice." },
  chapters: [
    { time: 0, title: "Setup and grip", note: "Stance and how to hold the weight" },
    { time: 18, title: "Squat and return", note: "The full rep at a slow pace" },
    { time: 42, title: "Watch, then move", note: "Take a moment, then try the first rep" },
  ],
  tips: [
    { title: "Use a lighter weight first", note: "Perfect the movement before adding load." },
    { title: "Look straight ahead", note: "A steady gaze helps keep your chest tall." },
  ],
  mistakes: [
    { title: "Heels lifting", note: "Widen your stance or reduce your depth." },
    { title: "Knees caving in", note: "Keep your knees tracking in line with your toes." },
  ],
};

const dumbbellRow: Move = {
  id: "m2",
  name: "Dumbbell row + press",
  muscles: ["Back", "Shoulders"],
  level: "Beginner",
  sets: 3,
  reps: 10,
  loadKg: 6,
  restSec: 45,
  summary: "A controlled pull and press to train your back, shoulders, and arms.",
  noteTitle: "Stay steady",
  noteBody: "Keep your hips square and avoid twisting as you press.",
  steps: [
    { title: "Hinge forward", body: "Soften your knees, move your hips back, and keep your back flat." },
    { title: "Row", body: "Pull your elbows toward your hips while keeping your shoulders relaxed." },
    { title: "Stand tall", body: "Lower the weights with control and bring them to shoulder height." },
    { title: "Press", body: "Press overhead only as far as you can without arching your back." },
  ],
  stepNote: { title: "Keep it light", body: "Choose a weight you can control through the whole movement." },
  chapters: [
    { time: 0, title: "Setup", note: "Find a stable hinge position" },
    { time: 20, title: "Row and press", note: "See the movement at a controlled pace" },
  ],
  tips: [{ title: "Breathe out on effort", note: "Exhale as you pull and press." }],
  mistakes: [{ title: "Rounded back", note: "Keep your spine comfortable and neutral as you hinge." }],
};

const lungeDeadlift: Move = {
  id: "m3",
  name: "Lunge, deadlift + plank",
  muscles: ["Legs", "Core"],
  level: "Intermediate",
  sets: 3,
  reps: 8,
  loadKg: 8,
  restSec: 60,
  summary: "A controlled combination for balance, hamstrings, and core stability.",
  noteTitle: "Go slow",
  noteBody: "Control each part before moving to the next.",
  steps: [
    { title: "Reverse lunge", body: "Step back, lower only as far as comfortable, then return to standing." },
    { title: "Deadlift", body: "Hinge at your hips with a comfortable, neutral back." },
    { title: "Plank", body: "Place the weights down and hold a straight, comfortable body position." },
    { title: "Reset", body: "Return to standing and repeat on the other side." },
  ],
  stepNote: { title: "Balance first", body: "Use a wall or chair for support if you need it." },
  chapters: [
    { time: 0, title: "Lunge", note: "Step back and return" },
    { time: 25, title: "Deadlift and plank", note: "Hinge and hold with control" },
  ],
  tips: [{ title: "Brace gently", note: "Keep your middle steady as you move." }],
  mistakes: [{ title: "Rushing between moves", note: "Pause and reset your balance before continuing." }],
};

export const WORKOUT_DETAILS: Record<string, WorkoutDetail> = {
  w1: {
    workoutId: "w1",
    coach: "Maya Chen",
    calories: 240,
    blurb: "Build full-body strength and core stability with a focused dumbbell circuit.",
    moves: [gobletSquat, dumbbellRow, lungeDeadlift],
  },
};

export function loadLabel(move: Move, equipment: string[], weightKg: number): string {
  const usesWeight = move.loadKg > 0 &&
    (equipment.includes("Dumbbells") || equipment.includes("Kettlebell"));
  return usesWeight
    ? `${move.loadKg === 8 ? weightKg : Math.max(1, Math.round((move.loadKg / 8) * weightKg))} kg`
    : "Bodyweight";
}

export const EQUIPMENT_OPTIONS = [
  { id: "Dumbbells", sub: "Recommended for this workout" },
  { id: "Exercise mat", sub: "For floor work and core stability" },
  { id: "Resistance bands", sub: "Optional alternative" },
  { id: "Kettlebell", sub: "Alternative for goblet squats" },
  { id: "No equipment", sub: "Switch to bodyweight alternatives" },
];

export const fmtTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
