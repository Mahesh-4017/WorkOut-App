import AsyncStorage from "@react-native-async-storage/async-storage";
import { ROUTES } from "../navigation/routes";

export type OnboardingData = {
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  goal?: string;
};

const KEY = "onboarding";
const PERMISSIONS_DONE_KEY = "permissionsOnboardingDone";

export function getNextProfileRoute(user: OnboardingData): string {
  if (!user.gender) return ROUTES.GENDER;
  if (!user.age || !user.height || !user.weight) return ROUTES.BODY_INFO;
  if (!user.goal) return ROUTES.GOAL;
  return ROUTES.PERMISSIONS;
}

export async function getPostAuthRoute(user: OnboardingData): Promise<string> {
  const nextProfileRoute = getNextProfileRoute(user);
  if (nextProfileRoute !== ROUTES.PERMISSIONS) return nextProfileRoute;
  const permissionsDone = await AsyncStorage.getItem(PERMISSIONS_DONE_KEY);
  return permissionsDone === "true" ? ROUTES.HOME : ROUTES.PERMISSIONS;
}

export async function completePermissionsOnboarding() {
  await AsyncStorage.setItem(PERMISSIONS_DONE_KEY, "true");
}

export async function saveOnboarding(data: OnboardingData) {
  const old = JSON.parse((await AsyncStorage.getItem(KEY)) || "{}");
  await AsyncStorage.setItem(KEY, JSON.stringify({ ...old, ...data }));
}

export async function getOnboarding(): Promise<OnboardingData> {
  return JSON.parse((await AsyncStorage.getItem(KEY)) || "{}");
}

export async function clearOnboarding() {
  await AsyncStorage.removeItem(KEY);
}
