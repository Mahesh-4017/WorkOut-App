import AsyncStorage from "@react-native-async-storage/async-storage";

export type OnboardingData = {
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  goal?: string;
};

const KEY = "onboarding";

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
