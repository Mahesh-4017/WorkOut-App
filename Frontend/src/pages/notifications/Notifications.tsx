import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import BottomTabBar from "../../components/BottomTabBar";
import { ROUTES } from "../../navigation/routes";
import { WORKOUT_ROUTES } from "../../navigation/workoutRoutes";
import { useTheme } from "../../theme/ThemeProvider";

const NOTIFICATIONS = [
  {
    id: "workout-reminder",
    title: "Your next workout is ready",
    message: "Keep your momentum going with a workout picked for you.",
    time: "Today",
    icon: "barbell-outline",
    route: WORKOUT_ROUTES.HUB,
  },
  {
    id: "weekly-progress",
    title: "Check in on your progress",
    message: "See how your recent workouts are adding up this week.",
    time: "Yesterday",
    icon: "stats-chart-outline",
    route: ROUTES.ANALYSIS,
  },
  {
    id: "schedule",
    title: "Plan your week",
    message: "Add a workout to your calendar and make time for movement.",
    time: "This week",
    icon: "calendar-outline",
    route: ROUTES.WORKOUTCALENDAR,
  },
];

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [readIds, setReadIds] = useState<string[]>([]);
  const unreadCount = NOTIFICATIONS.length - readIds.length;

  const markAllRead = () => setReadIds(NOTIFICATIONS.map(notification => notification.id));

  const openNotification = (id: string, route: string) => {
    setReadIds(current => current.includes(id) ? current : [...current, id]);
    navigation.navigate(route);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10}>
          <Ionicons name="arrow-back" size={21} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable
          onPress={markAllRead}
          disabled={unreadCount === 0}
          accessibilityRole="button"
          accessibilityLabel="Mark all notifications as read"
          style={styles.readAll}
        >
          <Text style={[styles.readAllText, unreadCount === 0 && styles.disabledText]}>
            Mark all read
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          {unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "You're all caught up"}
        </Text>
        {NOTIFICATIONS.map(notification => {
          const isRead = readIds.includes(notification.id);
          return (
            <Pressable
              key={notification.id}
              onPress={() => openNotification(notification.id, notification.route)}
              style={[styles.card, !isRead && styles.unreadCard]}
              accessibilityRole="button"
              accessibilityState={{ selected: !isRead }}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={notification.icon as any} size={21} color={theme.colors.primary} />
              </View>
              <View style={styles.copy}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{notification.title}</Text>
                  {!isRead ? <View style={styles.unreadDot} /> : null}
                </View>
                <Text style={styles.message}>{notification.message}</Text>
                <Text style={styles.time}>{notification.time}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
            </Pressable>
          );
        })}
      </ScrollView>

      <BottomTabBar activeTab="home" />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 12 },
    headerTitle: { flex: 1, color: theme.colors.text, fontSize: 18, fontFamily: theme.typography.fontFamilyBold },
    readAll: { paddingVertical: 8, paddingLeft: 10 },
    readAllText: { color: theme.colors.primary, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
    disabledText: { color: theme.colors.muted },
    content: { paddingHorizontal: 18, paddingBottom: 110 },
    subtitle: { color: theme.colors.muted, fontSize: 12, marginBottom: 12, fontFamily: theme.typography.fontFamily },
    card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 10, borderRadius: 14, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
    unreadCard: { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
    iconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surfaceAlt ?? theme.colors.border },
    copy: { flex: 1 },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    title: { flex: 1, color: theme.colors.text, fontSize: 13, fontFamily: theme.typography.fontFamilyBold },
    unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.primary },
    message: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3, fontFamily: theme.typography.fontFamily },
    time: { color: theme.colors.muted, fontSize: 10, marginTop: 6, fontFamily: theme.typography.fontFamilyMedium },
  });
