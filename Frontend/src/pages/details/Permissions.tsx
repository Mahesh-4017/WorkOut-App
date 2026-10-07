import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { PERMISSIONS, request, requestNotifications } from "react-native-permissions";
import { SafeAreaView } from "react-native-safe-area-context";

import { completePermissionsOnboarding } from "../../utils/onboarding";
import { ROUTES } from "../../navigation/routes";
import { useTheme } from "../../theme/ThemeProvider";
import { OnboardingHeader, PrimaryButton } from "./Onboardingui";

type Key = "notifications" | "health" | "camera" | "location";

const ITEMS: { key: Key; icon: string; title: string; description: string }[] = [
  { key: "notifications", icon: "🔔", title: "Notifications · Optional", description: "Workout reminders and goal celebrations." },
  { key: "health", icon: "♡", title: "Health / activity data · Optional", description: "Connect Health Connect to sync steps, workouts and active calories." },
  { key: "camera", icon: "📷", title: "Camera · For meal scanning", description: "Required only to scan meals. You can log food manually without camera access." },
  { key: "location", icon: "📍", title: "Location · Optional", description: "Only for route-based outdoor activities. No location needed for indoor workouts." },
];

export default function Permissions() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const s = createStyles(theme);
  const [requesting, setRequesting] = useState(false);
  const [choices, setChoices] = useState<Record<Key, boolean>>({
    notifications: true,
    health: true,
    camera: false,
    location: false,
  });

  const toggle = (k: Key) => setChoices(c => ({ ...c, [k]: !c[k] }));

  const finish = async (useChoices: boolean) => {
    if (requesting) return;
    setRequesting(true);
    try {
      if (useChoices) {
        const ios = Platform.OS === "ios";
        if (choices.notifications) await requestNotifications(["alert", "badge", "sound"]);
        if (choices.camera) await request(ios ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA);
        if (choices.location) await request(ios ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (choices.health) {
          // react-native-permissions can't grant HealthKit / Health Connect.
          // Hook up your health library here, e.g. react-native-health (iOS)
          // or react-native-health-connect (Android) -> requestPermission([...]).
        }
      }
      await completePermissionsOnboarding();
      navigation.reset({ index: 0, routes: [{ name: ROUTES.HOME }] });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <SafeAreaView style={s.screen}>
      <OnboardingHeader title="Permissions" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Your health. Your choice.</Text>
        <Text style={s.subtitle}>Choose what to connect. We'll ask for system permission when you enable a feature.</Text>

        {ITEMS.map(item => (
          <View key={item.key} style={s.row}>
            <Text style={s.icon}>{item.icon}</Text>
            <View style={s.rowText}>
              <Text style={s.rowTitle}>{item.title}</Text>
              <Text style={s.rowDesc}>{item.description}</Text>
            </View>
            <Switch
              value={choices[item.key]}
              onValueChange={() => toggle(item.key)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.onPrimary ?? "#fff"}
              accessibilityLabel={item.title}
            />
          </View>
        ))}

        <Text style={s.note}>No optional permission is required to use the app. Manage access anytime in Settings.</Text>
      </ScrollView>

      <View style={s.actions}>
        <PrimaryButton label={requesting ? "Please wait…" : "Continue with my choices"} onPress={() => finish(true)} disabled={requesting} />
        <Pressable accessibilityRole="button" disabled={requesting} onPress={() => finish(false)} style={s.secondary}>
          <Text style={s.secondaryText}>Not now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 20 },
    scroll: { paddingTop: 20, paddingBottom: 16 },
    title: { color: theme.colors.text, fontSize: 24, lineHeight: 30, fontFamily: theme.typography.fontFamilyBold },
    subtitle: { color: theme.colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 16, fontFamily: theme.typography.fontFamily },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },
    icon: { width: 28, fontSize: 16, color: theme.colors.text },
    rowText: { flex: 1, paddingHorizontal: 8 },
    rowTitle: { color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    rowDesc: { color: theme.colors.muted, fontSize: 11, lineHeight: 15, marginTop: 2, fontFamily: theme.typography.fontFamily },
    note: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 6, fontFamily: theme.typography.fontFamily },
    actions: { gap: 8, paddingBottom: 16, paddingTop: 8 },
    secondary: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    secondaryText: { color: theme.colors.text, fontSize: 15, fontFamily: theme.typography.fontFamilyMedium },
  });