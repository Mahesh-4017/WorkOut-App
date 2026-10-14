import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import BottomTabBar from "../../components/BottomTabBar";
import { useSchedule } from "../../data/ScheduleProvider";
import { toKey } from "../../data/classSchedule";
import { WORKOUT_ROUTES } from "../../navigation/workoutRoutes";
import { useTheme } from "../../theme/ThemeProvider";

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { scheduled, loading, refresh } = useSchedule();
  const styles = createStyles(theme);
  const [readIds, setReadIds] = useState<string[]>([]);
  const todayKey = toKey(new Date());
  const todayWorkouts = scheduled.filter(item => item.date === todayKey);
  const notifications = todayWorkouts.map(item => ({
      id: `today-workout-${item.id}-${item.date}`,
      title: "Today's workout",
      message: `Today, do your ${item.bodyPart || item.title} workout at ${item.time}.`,
      time: "Today",
      icon: "barbell-outline",
      route: item.bodyPart ? WORKOUT_ROUTES.SEARCH : WORKOUT_ROUTES.HUB,
      params: item.bodyPart ? { bodyPart: item.bodyPart, title: item.bodyPart } : undefined,
  }));
  const unreadCount = notifications.filter(notification => !readIds.includes(notification.id)).length;

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const markAllRead = () => setReadIds(notifications.map(notification => notification.id));

  const openNotification = (id: string, route: string, params?: object) => {
    setReadIds(current => current.includes(id) ? current : [...current, id]);
    navigation.navigate(route, params);
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
          {loading ? "Loading your schedule…" : unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "You're all caught up"}
        </Text>
        {notifications.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-outline" size={23} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No workout message for today</Text>
            <Text style={styles.emptyMessage}>When you schedule a workout for today, your reminder will appear here.</Text>
          </View>
        ) : null}
        {notifications.map(notification => {
          const isRead = readIds.includes(notification.id);
          return (
            <Pressable
              key={notification.id}
              onPress={() => openNotification(notification.id, notification.route, notification.params)}
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
    emptyState: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 40, borderRadius: 16, backgroundColor: theme.colors.card },
    emptyIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surface },
    emptyTitle: { color: theme.colors.text, fontSize: 14, marginTop: 14, fontFamily: theme.typography.fontFamilyBold },
    emptyMessage: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, textAlign: "center", marginTop: 6, fontFamily: theme.typography.fontFamily },
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
