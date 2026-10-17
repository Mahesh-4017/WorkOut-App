export const INDIA_TIMEZONE_OFFSET_MINUTES = 330;

const MINUTES_IN_MILLISECONDS = 60_000;

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function dateKeyParts(dateKey: string) {
  return dateKey.split("-").map(Number);
}

export function indiaDateKey(date = new Date()) {
  const indiaDate = new Date(date.getTime() + INDIA_TIMEZONE_OFFSET_MINUTES * MINUTES_IN_MILLISECONDS);
  return formatDateKey(indiaDate.getUTCFullYear(), indiaDate.getUTCMonth() + 1, indiaDate.getUTCDate());
}

export function addDaysToDateKey(dateKey: string, amount: number) {
  const [year, month, day] = dateKeyParts(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return formatDateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function indiaWeekday(dateKey: string) {
  const [year, month, day] = dateKeyParts(dateKey);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function indiaDateTime(dateKey: string, time: string) {
  const [year, month, day] = dateKeyParts(dateKey);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - INDIA_TIMEZONE_OFFSET_MINUTES * MINUTES_IN_MILLISECONDS);
}

export function indiaTimeFromDate(date: Date) {
  const indiaDate = new Date(date.getTime() + INDIA_TIMEZONE_OFFSET_MINUTES * MINUTES_IN_MILLISECONDS);
  return `${String(indiaDate.getUTCHours()).padStart(2, "0")}:${String(indiaDate.getUTCMinutes()).padStart(2, "0")}`;
}

export function indiaDateLabel(dateKey: string, today = indiaDateKey()) {
  if (dateKey === today) return "Today";
  if (dateKey === addDaysToDateKey(today, 1)) return "Tomorrow";
  const [year, month, day] = dateKeyParts(dateKey);
  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function indiaWeekdayLabel(dateKey: string) {
  const [year, month, day] = dateKeyParts(dateKey);
  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString(undefined, {
    weekday: "short",
    timeZone: "UTC",
  });
}

export function indiaLongDateLabel(dateKey: string) {
  const [year, month, day] = dateKeyParts(dateKey);
  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function indiaDayOfMonth(dateKey: string) {
  return dateKeyParts(dateKey)[2];
}

export function indiaTimestamp(dateKey: string, time: string) {
  return indiaDateTime(dateKey, time).getTime();
}
