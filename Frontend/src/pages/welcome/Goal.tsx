import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import ChoiceScreen from "../../components/ChoiceScreen";
import { saveOnboarding } from "../../utils/onboarding";
import { ROUTES } from "../../navigation/routes";

export default function Goal() {
  const navigation = useNavigation<any>();
  return <ChoiceScreen step="Step 3 of 3" title="What's your main goal?" options={[{ label: "Lose weight", value: "lose_weight" }, { label: "Build muscle", value: "build_muscle" }, { label: "Stay fit", value: "stay_fit" }, { label: "Improve health", value: "improve_health" }]} onBack={() => navigation.goBack()} onNext={async goal => { await saveOnboarding({ goal }); await AsyncStorage.setItem("onboardingDone", "true"); navigation.navigate(ROUTES.REGISTER); }} />;
}
