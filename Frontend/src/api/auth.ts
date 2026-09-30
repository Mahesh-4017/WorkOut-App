import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./client";
import { OnboardingData } from "../utils/onboarding";

export type AppUser = OnboardingData & { id: string; name: string; email: string; createdAt?: string };
type AuthResponse = { data: { token: string; user: AppUser } };

export async function registerUser(payload: { name: string; email: string; password: string } & OnboardingData) {
  const response = await apiClient.post<AuthResponse>("/app/auth/register", payload, { timeout: 60000 });
  await AsyncStorage.setItem("token", response.data.data.token);
  return response.data.data.user;
}

export async function loginUser(email: string, password: string) {
  const response = await apiClient.post<AuthResponse>("/app/auth/login", { email, password }, { timeout: 60000 });
  await AsyncStorage.setItem("token", response.data.data.token);
  return response.data.data.user;
}

export async function requestPasswordReset(email: string) {
  await apiClient.post("/app/auth/forgot-password", { email }, { timeout: 30000 });
}

export async function getCurrentUser() {
  const response = await apiClient.get<{ data: { user: AppUser } }>("/app/auth/me");
  return response.data.data.user;
}

export async function logoutUser() {
  await AsyncStorage.removeItem("token");
}