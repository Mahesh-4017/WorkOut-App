import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Profile | WorkOut",
  description: "Sign in to WorkOut to review your progress and manage your workout account.",
};

export default function ProfileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
