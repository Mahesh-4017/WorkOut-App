import { DailyPlan, PlannedWorkout } from "../api/schedule";

type ReminderPlan = Pick<DailyPlan, "id" | "title" | "description" | "date" | "time" | "repeatDays">;

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

  const channelId = await notifee.createChannel({
    id: CHANNEL_ID,
    name: "Schedule reminders",
    importance: notifeeTypes.AndroidImportance.HIGH,
  });
  const repeatDays = plan.repeatDays ?? [];
  const schedule = repeatDays.length
    ? repeatDays.map(day => ({
        id: `${kind}-${plan.id}-${day}`,
        timestamp: nextWeekdayTimestamp(plan.date, plan.time, day),
        repeatFrequency: notifeeTypes.RepeatFrequency.WEEKLY,
        body: `It's time for ${plan.title}${"description" in plan && plan.description ? ` — ${plan.description}` : ""}.`,
      }))
    : [{
        id: `${kind}-${plan.id}`,
        timestamp: new Date(`${plan.date}T${plan.time}:00`).getTime(),
        repeatFrequency: undefined,
        body: kind === "workout"
          ? `Your workout is ready: ${plan.title}.`
          : ("description" in plan && plan.description) || plan.title,
      }];

  for (const item of schedule) {
    if (item.timestamp <= Date.now()) return false;
    await notifee.cancelNotification(item.id);
    await notifee.createTriggerNotification({
      id: item.id,
      title: kind === "workout" ? "Workout reminder" : plan.title,
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

export async function cancelPlanReminder(planId: string, kind: "workout" | "day", repeatDays: number[] = []) {
  const { default: notifee } = await import("@notifee/react-native");
  const ids = repeatDays.length
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
