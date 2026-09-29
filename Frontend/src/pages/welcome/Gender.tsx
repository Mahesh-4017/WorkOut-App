import React from "react";
import { useNavigation } from "@react-navigation/native";
import ChoiceScreen from "../../components/ChoiceScreen";
import { saveOnboarding } from "../../utils/onboarding";
import { ROUTES } from "../../navigation/routes";

export default function Gender() {
  const navigation = useNavigation<any>();
  return <ChoiceScreen step="Step 1 of 3" title="What's your gender?" options={[{ label: "Male", value: "male" }, { label: "Female", value: "female" }, { label: "Other", value: "other" }]} onBack={() => navigation.goBack()} onNext={async gender => { await saveOnboarding({ gender }); navigation.navigate(ROUTES.BODY_INFO); }} />;
}
