import type { Metadata } from "next";
import WorkoutsBrowser from "../workouts-browser";

export const metadata: Metadata = {
  title: "Workout Collections | WorkOut",
  description: "Browse WorkOut exercise collections by body part, focus, and category.",
};

export default function CollectionsPage() {
  return <WorkoutsBrowser collections />;
}
