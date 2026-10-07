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
};

type ScheduleResponse<T> = { data: T };

export async function getPlannedWorkouts() {
  try {
    const response = await apiClient.get<ScheduleResponse<{ items: PlannedWorkout[] }>>("/app/schedule");
    return response.data.data.items;
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}

export async function createPlannedWorkout(
  plan: Omit<PlannedWorkout, "id">,
) {
  try {
    const response = await apiClient.post<ScheduleResponse<{ item: PlannedWorkout }>>("/app/schedule", plan);
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
