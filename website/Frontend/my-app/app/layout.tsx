import type { Metadata } from "next";
import { WebsiteShell } from "./website-auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkOut | Move with intention",
  description: "Explore published workouts, exercise details, and guided movement from the WorkOut library.",
  icons: { icon: "/workout-logo.webp", apple: "/workout-logo.webp" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col"><WebsiteShell>{children}</WebsiteShell></body>
    </html>
  );
}
