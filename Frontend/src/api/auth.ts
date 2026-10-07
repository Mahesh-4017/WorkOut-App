import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { apiClient } from "./client";
import { OnboardingData } from "../utils/onboarding";

export type AppUser = OnboardingData & { id: string; name: string; email: string; phone?: string; emailVerified?: boolean; phoneVerified?: boolean; createdAt?: string };
type AuthResponse = { data: { token: string; user: AppUser } };

export async function registerUser(payload: { name: string; email: string; password: string; phone?: string } & OnboardingData) {
  const response = await apiClient.post<AuthResponse>("/app/auth/register", payload);
  await AsyncStorage.setItem("token", response.data.data.token);
  return response.data.data.user;
}

export async function loginUser(email: string, password: string) {
  const response = await apiClient.post<AuthResponse>("/app/auth/login", { email, password });
  await AsyncStorage.setItem("token", response.data.data.token);
  return response.data.data.user;
}

export async function loginWithGoogle(idToken: string) {
  const response = await apiClient.post<AuthResponse>("/app/auth/google", { idToken });
  await AsyncStorage.setItem("token", response.data.data.token);
  return response.data.data.user;
}

export async function loginWithApple(idToken: string, nonce: string, name?: string) {
  const response = await apiClient.post<AuthResponse>("/app/auth/apple", { idToken, nonce, name });
  await AsyncStorage.setItem("token", response.data.data.token);
  return response.data.data.user;
}

export async function getCurrentUser() {
  const response = await apiClient.get<{ data: { user: AppUser } }>("/app/auth/me");
  return response.data.data.user;
}

export async function logoutUser() {
  await GoogleSignin.signOut().catch(() => undefined);
  await AsyncStorage.removeItem("token");
}