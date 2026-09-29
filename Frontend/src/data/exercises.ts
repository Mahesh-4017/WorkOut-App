export type Exercise = {
  id: string;
  name: string;
  muscle: string;
  category: string;

  image: string;
  video?: string;

  duration: string;

  instructions: string[];
  tips: string[];

  equipment: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";

  sets: number;
  reps: string;
};

export const exercises: Exercise[] = [
  {
    id: "bench-press",
    name: "Bench Press",
    muscle: "Chest",
    category: "Compound",

    image:
      "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa",

    video: "https://example.com/bench-press-video",

    duration: "01:24",

    equipment: "Barbell + Bench",
    difficulty: "Intermediate",

    sets: 3,
    reps: "10–12",

    instructions: [
      "Lie flat on the bench with your feet firmly on the floor.",
      "Grip the bar slightly wider than shoulder-width.",
      "Unrack the bar and position it directly above your chest.",
      "Lower the bar slowly toward your mid-chest.",
      "Keep your elbows slightly tucked while lowering.",
      "Push the bar upward until your arms are extended.",
    ],

    tips: [
      "Keep your shoulder blades pulled back throughout the movement.",
      "Do not bounce the bar off your chest.",
      "Keep your wrists straight and aligned with your forearms.",
      "Control the weight during both directions.",
    ],
  },

  {
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    muscle: "Chest",
    category: "Compound",

    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",

    video: "https://example.com/incline-dumbbell-video",

    duration: "01:18",

    equipment: "Dumbbells + Bench",
    difficulty: "Intermediate",

    sets: 3,
    reps: "10–12",

    instructions: [
      "Set the bench to a comfortable incline.",
      "Sit down with a dumbbell in each hand.",
      "Bring the dumbbells to shoulder level.",
      "Press both dumbbells upward.",
      "Keep your elbows slightly below your wrists.",
      "Lower the dumbbells slowly back to the starting position.",
    ],

    tips: [
      "Keep your back firmly against the bench.",
      "Avoid bringing the dumbbells together at the top.",
      "Use a controlled range of motion.",
      "Do not use momentum to move the weight.",
    ],
  },

  {
    id: "shoulder-press",
    name: "Shoulder Press",
    muscle: "Shoulders",
    category: "Compound",

    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e",

    video: "https://example.com/shoulder-press-video",

    duration: "01:15",

    equipment: "Dumbbells",
    difficulty: "Beginner",

    sets: 3,
    reps: "10–12",

    instructions: [
      "Sit or stand with your back straight.",
      "Hold the dumbbells at shoulder height.",
      "Brace your core before starting.",
      "Press the dumbbells upward.",
      "Fully extend your arms without locking aggressively.",
      "Lower the dumbbells slowly.",
    ],

    tips: [
      "Keep your core tight.",
      "Avoid excessive arching in your lower back.",
      "Keep the movement controlled.",
      "Do not shrug your shoulders toward your ears.",
    ],
  },

  {
    id: "squat",
    name: "Barbell Squat",
    muscle: "Legs",
    category: "Compound",

    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",

    video: "https://example.com/squat-video",

    duration: "01:35",

    equipment: "Barbell + Rack",
    difficulty: "Intermediate",

    sets: 4,
    reps: "8–10",

    instructions: [
      "Place the bar securely across your upper back.",
      "Stand with your feet around shoulder-width apart.",
      "Brace your core and keep your chest lifted.",
      "Bend your knees and push your hips backward.",
      "Lower until you reach a comfortable depth.",
      "Drive through your feet to return to standing.",
    ],

    tips: [
      "Keep your knees tracking in line with your toes.",
      "Keep your heels planted on the floor.",
      "Avoid collapsing your chest forward.",
      "Use a weight you can control safely.",
    ],
  },

  {
    id: "leg-press",
    name: "Leg Press",
    muscle: "Legs",
    category: "Machine",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
    video: "https://example.com/leg-press-video",
    duration: "01:20",
    equipment: "Leg Press Machine",
    difficulty: "Beginner",
    sets: 3,
    reps: "10–12",
    instructions: [
      "Set the machine and place your feet shoulder-width apart.",
      "Lower the platform with control until your knees are bent.",
      "Push through your feet to return to the starting position.",
    ],
    tips: [
      "Keep your lower back against the pad.",
      "Do not lock your knees at the top.",
    ],
  },

  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    muscle: "Hamstrings",
    category: "Dumbbell",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
    video: "https://example.com/romanian-deadlift-video",
    duration: "01:28",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    sets: 3,
    reps: "8–10",
    instructions: [
      "Stand tall with dumbbells in front of your thighs.",
      "Hinge at your hips while keeping your back neutral.",
      "Drive through your feet to stand tall again.",
    ],
    tips: [
      "Keep the dumbbells close to your legs.",
      "Stop when you feel a controlled hamstring stretch.",
    ],
  },

  {
    id: "cable-row",
    name: "Seated Cable Row",
    muscle: "Back",
    category: "Cable",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e",
    video: "https://example.com/cable-row-video",
    duration: "01:16",
    equipment: "Cable Machine",
    difficulty: "Beginner",
    sets: 3,
    reps: "10–12",
    instructions: [
      "Sit tall and hold the cable handle with both hands.",
      "Pull the handle toward your waist while squeezing your back.",
      "Extend your arms slowly to return to the start.",
    ],
    tips: [
      "Keep your chest lifted throughout the movement.",
      "Avoid using momentum to pull the handle.",
    ],
  },

  {
    id: "dumbbell-curl",
    name: "Dumbbell Curl",
    muscle: "Biceps",
    category: "Dumbbell",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
    video: "https://example.com/dumbbell-curl-video",
    duration: "01:05",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    sets: 3,
    reps: "10–12",
    instructions: [
      "Stand with your arms by your sides and palms forward.",
      "Curl the dumbbells while keeping your elbows still.",
      "Lower the weights slowly to the starting position.",
    ],
    tips: [
      "Keep your shoulders relaxed.",
      "Use a controlled tempo instead of swinging the weights.",
    ],
  },
];