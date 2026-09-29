import { apiClient } from "./client";
import { AppUser } from "./auth";
import { OnboardingData } from "../utils/onboarding";

export async function updateUserProfile(data: Partial<OnboardingData> & { name?: string }) {
  const response = await apiClient.put<{ data: { user: AppUser } }>("/app/profile", data);
  return response.data.data.user;
}