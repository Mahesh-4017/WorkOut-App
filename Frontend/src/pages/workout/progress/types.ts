export type ProgressNavigation = {
  goBack: () => void;
  navigate: (route: string, params?: Record<string, unknown>) => void;
};

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type ProgressRange = "Week" | "Month" | "Year";

export function rangeStart(range: ProgressRange, now = new Date()) {
  if (range === "Week") {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    date.setDate(date.getDate() - 6);
    return date.getTime();
  }
  if (range === "Month") return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return new Date(now.getFullYear(), 0, 1).getTime();
}

export function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function lastSevenDays<T extends { startedAt: string }>(items: T[], now = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index));
    const key = localDateKey(date);
    return {
      key,
      label: date.toLocaleDateString(undefined, { weekday: "narrow" }),
      items: items.filter(item => localDateKey(new Date(item.startedAt)) === key),
    };
  });
}
