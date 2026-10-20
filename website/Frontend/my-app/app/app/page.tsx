import type { Metadata } from "next";
import AppPromo from "../app-promo";

export const metadata: Metadata = {
  title: "Get the WorkOut App | WorkOut",
  description: "Explore workouts, plan sessions, and keep your progress close with the WorkOut Android app.",
};

export default function GetAppPage() {
  return <AppPromo />;
}
