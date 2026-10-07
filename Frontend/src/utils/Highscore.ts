import AsyncStorage from "@react-native-async-storage/async-storage";

const HIGH_SCORE_KEY = "highScoreSteps";
const WELCOME_SEEN_KEY = "welcomeSeen";

export async function getHighScore(): Promise<number> {
  return Number(await AsyncStorage.getItem(HIGH_SCORE_KEY)) || 0;
}

/** Call this whenever your step counter updates. Returns true on a new record. */
export async function updateHighScore(steps: number): Promise<boolean> {
  const best = await getHighScore();
  if (steps > best) {
    await AsyncStorage.setItem(HIGH_SCORE_KEY, String(Math.round(steps)));
    return true;
  }
  return false;
}

export async function hasSeenWelcome(): Promise<boolean> {
  return (await AsyncStorage.getItem(WELCOME_SEEN_KEY)) === "true";
}

export async function markWelcomeSeen(): Promise<void> {
  await AsyncStorage.setItem(WELCOME_SEEN_KEY, "true");
}