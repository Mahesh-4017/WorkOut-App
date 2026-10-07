import { TINTS } from "./workoutCatalog";

export type Instructor = { id: string; name: string; photoUrl?: string };

export type ClassSession = {
  id: string;
  title: string;
  instructorId: string;
  minutes: number;
  level: string;
  tag: string;
  tagColor: "lime" | "orange";
  time: string;
  description: string;
  tint: string;
  workoutId?: string;
  videoUrl?: string;
  completedOn?: string;
};

export const INSTRUCTORS: Instructor[] = [
  { id: "i1", name: "Matt Boykin" },
  { id: "i2", name: "Bodhi Sobel" },
  { id: "i3", name: "Dylan Hunter" },
  { id: "i4", name: "Marcus Reed" },
  { id: "i5", name: "James Anderson" },
  { id: "i6", name: "Mike Robinson" },
];

export const instructorName = (id: string) =>
  INSTRUCTORS.find(instructor => instructor.id === id)?.name ?? "Instructor";

export const CLASSES: ClassSession[] = [
  { id: "c1", title: "Flowing Hands Strike", instructorId: "i4", minutes: 30, level: "Beginner", tag: "BEGINNER", tagColor: "lime", time: "10:45 AM", description: "A flowing strike class that builds rhythm, balance, and shoulder endurance.", tint: TINTS.sage },
  { id: "c2", title: "Pilates Flow: Core & Beyond", instructorId: "i2", minutes: 20, level: "All levels", tag: "ALL LEVELS", tagColor: "lime", time: "12:30 PM", description: "Slow, controlled Pilates sequences to wake up your deep core muscles.", tint: TINTS.lavender },
  { id: "c3", title: "Recovery Restore", instructorId: "i3", minutes: 30, level: "All levels", tag: "RECOVERY", tagColor: "orange", time: "6:00 PM", description: "Gentle stretching and breathing to help your body recover and reset.", tint: TINTS.peach },
  { id: "c4", title: "Shock Attack", instructorId: "i1", minutes: 45, level: "Advanced", tag: "ADVANCED", tagColor: "lime", time: "7:30 AM", description: "High-intensity intervals with short rests. Bring water and go at your own pace.", tint: TINTS.mint },
  { id: "c5", title: "Ultimate Dumbbell Burn and Build", instructorId: "i5", minutes: 30, level: "Beginner", tag: "STRENGTH", tagColor: "lime", time: "9:00 AM", description: "A full-body dumbbell strength workout focused on form, control, and steady progress.", tint: TINTS.sage, workoutId: "w1", completedOn: "2026-09-19" },
  { id: "c6", title: "Lower Body Kickstart", instructorId: "i6", minutes: 25, level: "Intermediate", tag: "STRENGTH", tagColor: "lime", time: "10:45 AM", description: "Squats, lunges, and hinges to work your legs and glutes.", tint: TINTS.peach },
  { id: "c7", title: "Medicine Ball Lunge", instructorId: "i3", minutes: 20, level: "Intermediate", tag: "STRENGTH", tagColor: "orange", time: "7:30 PM", description: "Lunge variations that challenge balance and core stability.", tint: TINTS.lavender },
];

export const toKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const fromKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (date: Date, amount: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};
