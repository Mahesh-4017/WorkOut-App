import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NotificationSounds from "react-native-notification-sounds";
import { DailyPlan, PlannedWorkout } from "../api/schedule";
import {
  addDaysToDateKey,
  indiaDateKey,
  indiaTimestamp,
  indiaWeekday,
} from "./indiaTime";

type ReminderPlan = Pick<DailyPlan, "id" | "title" | "description" | "date" | "time" | "repeatDays">
  & Partial<Pick<DailyPlan, "reminderSoundUrl" | "reminderSoundTitle">>
  & Partial<Pick<PlannedWorkout, "bodyPart">>;

const CHANNEL_ID = "schedule-reminders";
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ALARM_SETTINGS_PROMPTED_KEY = "@workout/alarm-settings-prompted";

export async function schedulePlanReminder(
  plan: ReminderPlan | PlannedWorkout,
  kind: "workout" | "day",
  requestPermission = false,
) {
  const { default: notifee, ...notifeeTypes } = await import("@notifee/react-native");
  const settings = requestPermission
    ? await notifee.requestPermission()
    : await notifee.getNotificationSettings();
  const allowed = settings.authorizationStatus === notifeeTypes.AuthorizationStatus.AUTHORIZED
    || settings.authorizationStatus === notifeeTypes.AuthorizationStatus.PROVISIONAL;
  if (!allowed) {
    throw new Error("phone notifications are turned off. Enable notifications for WorkOut in your phone settings; the saved reminder will be retried when you return.");
  }
  if (Platform.OS === "android" && settings.android.alarm === notifeeTypes.AndroidNotificationSetting.DISABLED) {
    const alreadyPrompted = await AsyncStorage.getItem(ALARM_SETTINGS_PROMPTED_KEY);
    if (requestPermission && alreadyPrompted !== "true") {
      await AsyncStorage.setItem(ALARM_SETTINGS_PROMPTED_KEY, "true");
      await notifee.openAlarmPermissionSettings();
      throw new Error("Allow WorkOut under Alarms & reminders, then return to the app. Your saved reminder will be scheduled automatically.");
    }
    throw new Error("Alarms & reminders access is still off for WorkOut. Enable it in your phone’s app settings to receive scheduled reminders.");
  }

  const soundUrl = plan.reminderSoundUrl;
  const channelId = Platform.OS === "android" && soundUrl
    ? await NotificationSounds.createSoundChannel(soundUrl)
    : await notifee.createChannel({
      id: CHANNEL_ID,
      name: "Schedule reminders",
      importance: notifeeTypes.AndroidImportance.HIGH,
    });
  if (Platform.OS === "android" && await notifee.isChannelBlocked(channelId)) {
    throw new Error("the workout reminder notification channel is blocked. Enable it in WorkOut's notification settings; the saved reminder will be retried when you return.");
  }
  const repeatDays = plan.repeatDays ?? [];
  const workoutMessage = "bodyPart" in plan && plan.bodyPart
    ? `Today, do your ${plan.bodyPart} workout.`
    : `Today, do your ${plan.title}.`;
  const reminderTime = "reminderTime" in plan ? plan.reminderTime || plan.time : plan.time;
  const repeatDates = "repeatDates" in plan ? plan.repeatDates ?? [] : [];
  const schedule = repeatDates.length
    ? repeatDates.map(date => ({
        id: `${kind}-${plan.id}-${date}`,
        timestamp: indiaTimestamp(date, reminderTime),
        repeatFrequency: undefined,
        body: kind === "workout"
          ? workoutMessage
          : ("description" in plan && plan.description) || plan.title,
      }))
    : repeatDays.length
    ? repeatDays.map(day => ({
        id: `${kind}-${plan.id}-${day}`,
        timestamp: nextIndiaWeekdayTimestamp(plan.date, reminderTime, day),
        repeatFrequency: notifeeTypes.RepeatFrequency.WEEKLY,
        body: kind === "workout"
          ? workoutMessage
          : ("description" in plan && plan.description) || plan.title,
      }))
    : [{
        id: `${kind}-${plan.id}`,
        timestamp: indiaTimestamp(plan.date, reminderTime),
        repeatFrequency: undefined,
        body: kind === "workout"
          ? workoutMessage
          : ("description" in plan && plan.description) || plan.title,
      }];

  const futureSchedule = schedule.filter(item => item.timestamp > Date.now());
  if (!futureSchedule.length) {
    throw new Error("the reminder time has passed. Choose a future date and time.");
  }
  for (const item of futureSchedule) {
    await notifee.cancelNotification(item.id);
    await notifee.createTriggerNotification({
      id: item.id,
      title: kind === "workout" ? "Today's workout" : plan.title,
      body: item.body,
      data: { scheduleKind: kind, planId: plan.id },
      android: {
        channelId,
        pressAction: { id: "default" },
      },
    }, {
      type: notifeeTypes.TriggerType.TIMESTAMP,
      timestamp: item.timestamp,
      repeatFrequency: item.repeatFrequency,
      alarmManager: { type: notifeeTypes.AlarmType.SET_AND_ALLOW_WHILE_IDLE },
    });
  }
  const pendingIds = await notifee.getTriggerNotificationIds();
  if (futureSchedule.some(item => !pendingIds.includes(item.id))) {
    throw new Error("the phone did not keep the scheduled reminder. Check notification settings and try again.");
  }
  return true;
}

export async function sendTestNotification() {
  const { default: notifee, ...notifeeTypes } = await import("@notifee/react-native");
  const settings = await notifee.requestPermission();
  const allowed = settings.authorizationStatus === notifeeTypes.AuthorizationStatus.AUTHORIZED
    || settings.authorizationStatus === notifeeTypes.AuthorizationStatus.PROVISIONAL;
  if (!allowed) {
    throw new Error("Phone notifications are turned off. Enable notifications for WorkOut in your phone settings, then try again.");
  }

  const channelId = await notifee.createChannel({
    id: "notification-test",
    name: "Notification test",
    importance: notifeeTypes.AndroidImportance.HIGH,
  });
  if (Platform.OS === "android" && await notifee.isChannelBlocked(channelId)) {
    throw new Error("The test notification channel is blocked. Enable it in WorkOut's phone notification settings, then try again.");
  }

  await notifee.displayNotification({
    id: "workout-notification-test",
    title: "Good morning!",
    body: "Your WorkOut phone notifications are working.",
    android: {
      channelId,
      pressAction: { id: "default" },
    },
    ios: {
      foregroundPresentationOptions: {
        banner: true,
        list: true,
        sound: true,
      },
    },
  });
}

export async function scheduleDailyStepsReminder(time: string, steps: number) {
  const { default: notifee, ...notifeeTypes } = await import("@notifee/react-native");
  const settings = await notifee.getNotificationSettings();
  const allowed = settings.authorizationStatus === notifeeTypes.AuthorizationStatus.AUTHORIZED
    || settings.authorizationStatus === notifeeTypes.AuthorizationStatus.PROVISIONAL;
  if (!allowed) {
    throw new Error("Phone notifications are turned off. Enable notifications for WorkOut to receive your daily steps update.");
  }

  const channelId = await notifee.createChannel({
    id: "daily-steps",
    name: "Daily steps",
    importance: notifeeTypes.AndroidImportance.DEFAULT,
  });
  if (Platform.OS === "android" && await notifee.isChannelBlocked(channelId)) {
    throw new Error("The daily steps notification channel is blocked in phone settings.");
  }

  const [hour, minute] = time.split(":").map(Number);
  const timestamp = new Date();
  timestamp.setHours(hour, minute, 0, 0);
  if (timestamp.getTime() <= Date.now()) timestamp.setDate(timestamp.getDate() + 1);
  await notifee.cancelNotification("daily-steps-summary");
  await notifee.createTriggerNotification({
    id: "daily-steps-summary",
    title: "Your steps today",
    body: `Your latest synced total is ${steps.toLocaleString()} steps. Keep moving toward your goal!`,
    android: {
      channelId,
      pressAction: { id: "default" },
    },
    ios: {
      foregroundPresentationOptions: { banner: true, list: true, sound: true },
    },
  }, {
    type: notifeeTypes.TriggerType.TIMESTAMP,
    timestamp: timestamp.getTime(),
    repeatFrequency: notifeeTypes.RepeatFrequency.DAILY,
    alarmManager: { type: notifeeTypes.AlarmType.SET_AND_ALLOW_WHILE_IDLE },
  });
  const pendingIds = await notifee.getTriggerNotificationIds();
  if (!pendingIds.includes("daily-steps-summary")) {
    throw new Error("The phone did not keep the daily steps reminder.");
  }
}

export async function cancelDailyStepsReminder() {
  const { default: notifee } = await import("@notifee/react-native");
  await notifee.cancelNotification("daily-steps-summary");
}

export async function showActiveTimerNotification(input: {
  title: string;
  status: "running" | "paused";
  startedAt: number;
  elapsedSeconds: number;
}) {
  const { default: notifee, ...notifeeTypes } = await import("@notifee/react-native");
  const channelId = await notifee.createChannel({
    id: "active-workout",
    name: "Active workout timer",
    importance: notifeeTypes.AndroidImportance.LOW,
  });
  const running = input.status === "running";
  const elapsed = Math.max(0, Math.floor(input.elapsedSeconds));
  const categoryId = `active-workout-timer-${input.status}`;
  const notification = {
    id: "active-workout-timer",
    title: input.title,
    body: running ? "Workout in progress" : `Paused · ${elapsed}s elapsed`,
    android: {
      channelId,
      ongoing: true,
      onlyAlertOnce: true,
      showChronometer: running,
      timestamp: running ? Date.now() - elapsed * 1000 : undefined,
      pressAction: { id: "default", launchActivity: "default" },
      actions: [
        {
          title: running ? "Pause" : "Resume",
          pressAction: {
            id: running ? "pause" : "resume",
            launchActivity: "default",
          },
        },
        {
          title: "Stop & save",
          pressAction: { id: "stop", launchActivity: "default" },
        },
      ],
    },
    ios: {
      categoryId,
      foregroundPresentationOptions: { banner: true, list: true, sound: false },
    },
  };
  await notifee.displayNotification(notification);
}

export async function cancelActiveTimerNotification() {
  const { default: notifee } = await import("@notifee/react-native");
  await notifee.cancelNotification("active-workout-timer");
}

export async function createTimerNotificationActions(status: "running" | "paused") {
  const { default: notifee } = await import("@notifee/react-native");
  const running = status === "running";
  await notifee.setNotificationCategories([
    {
      id: `active-workout-timer-${status}`,
      actions: [
        { id: running ? "pause" : "resume", title: running ? "Pause" : "Resume", foreground: true },
        { id: "stop", title: "Stop & save", foreground: true, destructive: true },
      ],
    },
  ]);
}

export async function cancelPlanReminder(
  planId: string,
  kind: "workout" | "day",
  repeatDays: number[] = [],
  repeatDates: string[] = [],
) {
  const { default: notifee } = await import("@notifee/react-native");
  const ids = repeatDates.length
    ? repeatDates.map(date => `${kind}-${planId}-${date}`)
    : repeatDays.length
    ? repeatDays.map(day => `${kind}-${planId}-${day}`)
    : [`${kind}-${planId}`];
  await Promise.all(ids.map(id => notifee.cancelNotification(id)));
}

function nextIndiaWeekdayTimestamp(startDate: string, time: string, weekday: number) {
  const today = indiaDateKey();
  const baseDate = startDate > today ? startDate : today;
  const offset = (weekday - indiaWeekday(baseDate) + 7) % 7;
  let date = addDaysToDateKey(baseDate, offset);
  let timestamp = indiaTimestamp(date, time);
  if (timestamp <= Date.now()) {
    date = addDaysToDateKey(date, 7);
    timestamp = indiaTimestamp(date, time);
  }
  return timestamp;
}

export function weekdayName(day: number) {
  return WEEKDAYS[day] ?? "day";
}
