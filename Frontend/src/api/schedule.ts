import { apiClient, apiErrorMessage } from "./client";

export type PlannedWorkout = {
  id: string;
  exerciseId?: string;
  classId?: string;
  title: string;
  bodyPart: string;
  category: string;
  date: string;
  time: string;
  durationMinutes: number;
  repeatDays: number[];
  repeatDates: string[];
  reminderTime: string;
  reminderEnabled: boolean;
  reminderSoundUrl?: string;
  reminderSoundTitle?: string;
};

type PlannedWorkoutInput = Omit<PlannedWorkout, "id">;
type ScheduleResponse<T> = { data: T };

export type DailyPlan = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  repeatDays: number[];
  reminderEnabled: boolean;
};

type DailyPlanInput = Omit<DailyPlan, "id">;

export async function getPlannedWorkouts(timezoneOffsetMinutes = new Date().getTimezoneOffset()) {
  try {
    const response = await apiClient.get<ScheduleResponse<{ items: PlannedWorkout[] }>>(
      `/app/schedule?timezoneOffsetMinutes=${timezoneOffsetMinutes}`,
    );
    return response.data.data.items;
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}

export async function createPlannedWorkout(
  plan: PlannedWorkoutInput,
) {
  try {
    const response = await apiClient.post<ScheduleResponse<{ item: PlannedWorkout }>>("/app/schedule", {
      ...plan,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    });
    return response.data.data.item;
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}

export async function deletePlannedWorkout(id: string) {
  try {
    await apiClient.delete(`/app/schedule/${encodeURIComponent(id)}`);
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}

export async function getDailyPlans(timezoneOffsetMinutes = new Date().getTimezoneOffset()) {
  try {
    const response = await apiClient.get<ScheduleResponse<{ items: DailyPlan[] }>>(
      `/app/daily-plans?timezoneOffsetMinutes=${timezoneOffsetMinutes}`,
    );
    return response.data.data.items;
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}

export async function createDailyPlan(plan: DailyPlanInput) {
  try {
    const response = await apiClient.post<ScheduleResponse<{ item: DailyPlan }>>("/app/daily-plans", {
      ...plan,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    });
    return response.data.data.item;
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}

export async function deleteDailyPlan(id: string) {
  try {
    await apiClient.delete(`/app/daily-plans/${encodeURIComponent(id)}`);
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}
