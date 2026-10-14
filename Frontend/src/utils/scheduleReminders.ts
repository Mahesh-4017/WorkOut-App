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
  if (!allowed) return false;

  const soundUrl = "reminderSoundUrl" in plan ? plan.reminderSoundUrl : undefined;
  const channelId = Platform.OS === "android" && soundUrl
    ? await NotificationSounds.createSoundChannel(soundUrl)
    : await notifee.createChannel({
      id: CHANNEL_ID,
      name: "Schedule reminders",
      importance: notifeeTypes.AndroidImportance.HIGH,
    });
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
  if (!futureSchedule.length) return false;
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
  return true;
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
