import React from "react";
import { useNavigation } from "@react-navigation/native";
import ChoiceScreen from "../../components/ChoiceScreen";
import { saveOnboarding } from "../../utils/onboarding";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../api/user";
import { ROUTES } from "../../navigation/routes";

export default function Gender() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  return <ChoiceScreen step="Step 1 of 3" title="What's your gender?" options={[{ label: "Male", value: "male" }, { label: "Female", value: "female" }, { label: "Other", value: "other" }]} onBack={() => navigation.goBack()} onNext={async gender => { await saveOnboarding({ gender }); if (user) await updateUserProfile({ gender }); navigation.navigate(ROUTES.BODY_INFO); }} />;
}
