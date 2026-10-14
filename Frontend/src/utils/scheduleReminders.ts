import { Platform } from "react-native";
import NotificationSounds from "react-native-notification-sounds";
import { DailyPlan, PlannedWorkout } from "../api/schedule";

type ReminderPlan = Pick<DailyPlan, "id" | "title" | "description" | "date" | "time" | "repeatDays">
  & Partial<Pick<PlannedWorkout, "bodyPart">>;

const CHANNEL_ID = "schedule-reminders";
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
    if (requestPermission) await notifee.openAlarmPermissionSettings();
    throw new Error("Android's Alarms & reminders access is off for WorkOut. Allow it in the settings that opened, then return to WorkOut; your saved reminder will be scheduled automatically.");
  }

  const soundUrl = "reminderSoundUrl" in plan ? plan.reminderSoundUrl : undefined;
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
        timestamp: new Date(`${date}T${reminderTime}:00`).getTime(),
        repeatFrequency: undefined,
        body: kind === "workout"
          ? workoutMessage
          : ("description" in plan && plan.description) || plan.title,
      }))
    : repeatDays.length
    ? repeatDays.map(day => ({
        id: `${kind}-${plan.id}-${day}`,
        timestamp: nextWeekdayTimestamp(plan.date, reminderTime, day),
        repeatFrequency: notifeeTypes.RepeatFrequency.WEEKLY,
        body: kind === "workout"
          ? workoutMessage
          : ("description" in plan && plan.description) || plan.title,
      }))
    : [{
        id: `${kind}-${plan.id}`,
        timestamp: new Date(`${plan.date}T${reminderTime}:00`).getTime(),
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

export async function openReminderNotificationSettings() {
  const { default: notifee, ...notifeeTypes } = await import("@notifee/react-native");
  if (Platform.OS === "android") {
    const settings = await notifee.getNotificationSettings();
    if (settings.android.alarm === notifeeTypes.AndroidNotificationSetting.DISABLED) {
      await notifee.openAlarmPermissionSettings();
      return;
    }
  }
  await notifee.openNotificationSettings();
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

function nextWeekdayTimestamp(startDate: string, time: string, weekday: number) {
  const [year, month, day] = startDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const [hour, minute] = time.split(":").map(Number);
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + ((weekday - date.getDay() + 7) % 7));
  if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 7);
  return date.getTime();
}

export function weekdayName(day: number) {
  return WEEKDAYS[day] ?? "day";
}
