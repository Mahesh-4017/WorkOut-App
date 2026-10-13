import type { Metadata } from "next";
import WorkoutsBrowser from "../workouts-browser";

export const metadata: Metadata = {
  title: "Explore Workouts | WorkOut",
  description: "Explore published workouts and find your next exercise by focus area.",
};

export default function WorkoutsPage() {
  return <WorkoutsBrowser />;
}
