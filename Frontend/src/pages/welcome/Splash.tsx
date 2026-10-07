import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../navigation/routes";
import { useTheme } from "../../theme/ThemeProvider";
import { useUser } from "../../data/UserProvider";

export default function Splash() {
  const navigation = useNavigation<any>();
  const { restore } = useAuth();
  const { setUser } = useUser();
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, justifyContent: "center", alignItems: "center" },
  });
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      const onboardingDone = await AsyncStorage.getItem("onboardingDone");
      const restoredUser = token ? await restore() : null;
      if (restoredUser) setUser(restoredUser.name, restoredUser.email);
      const next = restoredUser ? ROUTES.HOME : onboardingDone ? ROUTES.LOGIN : ROUTES.WELCOME;
      navigation.reset({ index: 0, routes: [{ name: next }] });
    })();
  }, [navigation, restore]);
  return <View style={styles.screen}><ActivityIndicator color={theme.colors.primary} size="large" /></View>;
}
