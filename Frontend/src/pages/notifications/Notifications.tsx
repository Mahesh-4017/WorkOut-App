import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import BottomTabBar from "../../components/BottomTabBar";
import { useSchedule } from "../../data/ScheduleProvider";
import { useNotifications } from "../../data/NotificationProvider";
import { toKey } from "../../data/classSchedule";
import { WORKOUT_ROUTES } from "../../navigation/workoutRoutes";
import { useTheme } from "../../theme/ThemeProvider";
import { sendTestNotification } from "../../utils/scheduleReminders";
import { useSession } from "../../data/SessionProvider";

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { scheduled, dayPlans, loading, refresh } = useSchedule();
  const { goals, saveGoals } = useSession();
  const {
    readIds,
    ready: notificationStatusReady,
    error: notificationStatusError,
    markRead,
    markAllRead,
  } = useNotifications();
  const styles = createStyles(theme);
  const [sendingTest, setSendingTest] = React.useState(false);
  const [testMessage, setTestMessage] = React.useState<string | null>(null);
  const [stepReminderTime, setStepReminderTime] = React.useState(goals?.dailyStepsReminderTime ?? "20:00");
  const [savingStepReminder, setSavingStepReminder] = React.useState(false);
  const todayKey = toKey(new Date());
  const todayWorkouts = scheduled.filter(item => item.date === todayKey);
  const todayPersonalPlans = dayPlans.filter(plan => plan.repeatDays.length
    ? todayKey >= plan.date && plan.repeatDays.includes(new Date(`${todayKey}T12:00:00`).getDay())
    : plan.date === todayKey);
  const notifications = [
    ...todayWorkouts.map(item => ({
      id: `today-workout-${item.id}-${item.date}`,
      title: "Today's workout",
      message: `Today, do your ${item.bodyPart || item.title} workout at ${item.time}.`,
      time: "Today",
      icon: "barbell-outline",
      route: item.bodyPart ? WORKOUT_ROUTES.SEARCH : WORKOUT_ROUTES.HUB,
      params: item.bodyPart ? { bodyPart: item.bodyPart, title: item.bodyPart } : undefined,
    })),
    ...todayPersonalPlans.map(plan => ({
      id: `today-day-${plan.id}-${todayKey}`,
      title: plan.title,
      message: `${plan.description ? `${plan.description} · ` : ""}Today at ${plan.time}.`,
      time: "Today",
      icon: "calendar-outline",
      route: WORKOUT_ROUTES.PLANNER,
      params: { mode: "day", date: todayKey },
    })),
  ];
  const unreadCount = notifications.filter(notification => !readIds.includes(notification.id)).length;

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleMarkAllRead = async () => {
    try {
      await markAllRead(notifications.map(notification => notification.id));
    } catch (saveError) {
      Alert.alert(
        "Unable to update notifications",
        saveError instanceof Error ? saveError.message : "Please try again.",
      );
    }
  };

  const openNotification = async (id: string, route: string, params?: object) => {
    try {
      await markRead(id);
      navigation.navigate(route, params);
    } catch (saveError) {
      Alert.alert(
        "Unable to mark notification as read",
        saveError instanceof Error ? saveError.message : "Please try again.",
      );
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    setTestMessage(null);
    try {
      await sendTestNotification();
      setTestMessage("Test sent. Check your phone’s notification shade.");
    } catch (sendError) {
      Alert.alert(
        "Test notification failed",
        sendError instanceof Error ? sendError.message : "Unable to send a test notification.",
      );
    } finally {
      setSendingTest(false);
    }
  };

  React.useEffect(() => {
    setStepReminderTime(goals?.dailyStepsReminderTime ?? "20:00");
  }, [goals?.dailyStepsReminderTime]);

  const saveStepReminder = async () => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(stepReminderTime)) {
      Alert.alert("Invalid time", "Enter a time in 24-hour format, for example 20:00.");
      return;
    }
    setSavingStepReminder(true);
    try {
      await saveGoals({ dailyStepsReminderTime: stepReminderTime });
      Alert.alert("Reminder saved", `Your daily step update is set for ${stepReminderTime}.`);
    } catch (saveError) {
      Alert.alert("Unable to save reminder", saveError instanceof Error ? saveError.message : "Please try again.");
    } finally {
      setSavingStepReminder(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10}>
          <Ionicons name="arrow-back" size={21} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0 || !notificationStatusReady}
          accessibilityRole="button"
          accessibilityLabel="Mark all notifications as read"
          style={styles.readAll}
        >
          <Text style={[styles.readAllText, (unreadCount === 0 || !notificationStatusReady) && styles.disabledText]}>
            Mark all read
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={handleSendTest}
          disabled={sendingTest}
          style={[styles.testButton, sendingTest && styles.disabledButton]}
          accessibilityRole="button"
        >
          <Ionicons name="notifications-outline" size={18} color={theme.colors.onPrimary} />
          <Text style={styles.testButtonText}>{sendingTest ? "Sending test…" : "Send test notification"}</Text>
        </Pressable>
        {testMessage ? <Text style={styles.testMessage}>{testMessage}</Text> : null}
        <View style={styles.stepsReminder}>
          <View style={styles.stepsReminderTitleRow}>
            <Ionicons name="footsteps-outline" size={19} color={theme.colors.primary} />
            <Text style={styles.stepsReminderTitle}>Daily steps notification</Text>
          </View>
          <Text style={styles.stepsReminderDescription}>Get your latest synced phone step total once a day.</Text>
          <View style={styles.stepsReminderActions}>
            <TextInput
              value={stepReminderTime}
              onChangeText={setStepReminderTime}
              style={styles.timeInput}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              accessibilityLabel="Daily steps reminder time"
            />
            <Pressable
              onPress={saveStepReminder}
              disabled={savingStepReminder}
              style={[styles.saveReminderButton, savingStepReminder && styles.disabledButton]}
              accessibilityRole="button"
            >
              <Text style={styles.saveReminderText}>{savingStepReminder ? "Saving…" : "Save time"}</Text>
            </Pressable>
          </View>
        </View>
        <Pressable
          onPress={() => navigation.navigate(WORKOUT_ROUTES.PLANNER, { mode: "day" })}
          style={styles.personalPlanButton}
          accessibilityRole="button"
        >
          <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.personalPlanText}>Add a personal day plan</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
        </Pressable>
        <Text style={styles.subtitle}>
          {!notificationStatusReady
            ? "Loading notification status…"
            : loading
              ? "Loading your schedule…"
              : unreadCount
                ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                : "You're all caught up"}
        </Text>
        {notificationStatusError ? (
          <Text accessibilityRole="alert" style={styles.error}>{notificationStatusError}</Text>
        ) : null}
        {notifications.length === 0 && !loading && notificationStatusReady ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-outline" size={23} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No workout message for today</Text>
            <Text style={styles.emptyMessage}>When you schedule a workout for today, your reminder will appear here.</Text>
          </View>
        ) : null}
        {notificationStatusReady ? notifications.map(notification => {
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
        }) : null}
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
    testButton: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8, borderRadius: 12, backgroundColor: theme.colors.primary },
    testButtonText: { color: theme.colors.onPrimary, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    disabledButton: { opacity: 0.6 },
    testMessage: { color: theme.colors.primary, fontSize: 11, marginBottom: 10, fontFamily: theme.typography.fontFamilyMedium },
    stepsReminder: { padding: 13, marginBottom: 12, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
    stepsReminderTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    stepsReminderTitle: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    stepsReminderDescription: { color: theme.colors.muted, fontSize: 10, marginTop: 5, fontFamily: theme.typography.fontFamily },
    stepsReminderActions: { flexDirection: "row", gap: 8, marginTop: 10 },
    timeInput: { flex: 1, minHeight: 40, paddingHorizontal: 10, borderRadius: 9, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.surface, fontSize: 12, fontFamily: theme.typography.fontFamily },
    saveReminderButton: { minWidth: 88, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, borderRadius: 9, backgroundColor: theme.colors.primary },
    saveReminderText: { color: theme.colors.onPrimary, fontSize: 11, fontFamily: theme.typography.fontFamilyBold },
    personalPlanButton: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 12, marginBottom: 12, borderRadius: 11, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
    personalPlanText: { flex: 1, color: theme.colors.text, fontSize: 11, fontFamily: theme.typography.fontFamilyBold },
    error: { color: "#B42318", fontSize: 11, marginBottom: 10, fontFamily: theme.typography.fontFamily },
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
