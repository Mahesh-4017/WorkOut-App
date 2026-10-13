import type { Metadata } from "next";
import YogaLibrary from "./yoga-library";

export const metadata: Metadata = {
  title: "Yoga Library | WorkOut",
  description: "Find published Yoga sessions and make room for a reset.",
};

export default function YogaPage() {
  return <YogaLibrary />;
}
