import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workout Calendar | WorkOut",
  description: "Plan workouts, manage your schedule, and keep your movement routine in sync.",
};

export default function CalendarLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
