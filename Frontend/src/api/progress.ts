import { apiClient, apiErrorMessage } from "./client";

export type WorkoutSessionRecord = {
  id: string;
  workoutId: string;
  title: string;
  startedAt: string;
  seconds: number;
  calories: number;
  distanceKm: number;
  movesDone: number;
  movesTotal: number;
  setsDone: number;
  record?: string;
  rating?: number;
  effort?: number;
  feel?: string[];
  note?: string;
};

export type FitnessGoals = {
  weeklySessions?: number;
  targetWeightKg?: number;
  dailySteps?: number;
  dailyCalories?: number;
};

export type WeightRecord = {
  id: string;
  weightKg: number;
  recordedAt: string;
};

export type StepsRecord = {
  id: string;
  steps: number;
  recordedAt: string;
};

export type ProgressData = {
  sessions: WorkoutSessionRecord[];
  goals: FitnessGoals | null;
  weightEntries: WeightRecord[];
  stepEntries: StepsRecord[];
};

type ApiResult<T> = { data: T };

export async function getProgressData(): Promise<ProgressData> {
  try {
    const response = await apiClient.get<ApiResult<ProgressData>>("/app/progress");
    return response.data.data;
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}

export async function createWorkoutSession(
  session: Omit<WorkoutSessionRecord, "id" | "record" | "rating" | "effort" | "feel" | "note">,
): Promise<WorkoutSessionRecord> {
  try {
    const response = await apiClient.post<ApiResult<{ session: WorkoutSessionRecord }>>(
      "/app/progress/sessions",
      session,
    );
    return response.data.data.session;
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}

export async function updateWorkoutFeedback(
  id: string,
  feedback: Pick<WorkoutSessionRecord, "rating" | "effort" | "feel" | "note">,
): Promise<WorkoutSessionRecord> {
  try {
    const response = await apiClient.patch<ApiResult<{ session: WorkoutSessionRecord }>>(
      `/app/progress/sessions/${encodeURIComponent(id)}/feedback`,
      feedback,
    );
    return response.data.data.session;
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}

export async function saveFitnessGoals(goals: FitnessGoals): Promise<FitnessGoals> {
  try {
    const response = await apiClient.put<ApiResult<{ goals: FitnessGoals }>>(
      "/app/progress/goals",
      goals,
    );
    return response.data.data.goals;
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}

export async function addWeightRecord(weightKg: number): Promise<WeightRecord> {
  try {
    const response = await apiClient.post<ApiResult<{ entry: WeightRecord }>>(
      "/app/progress/weight",
      { weightKg },
    );
    return response.data.data.entry;
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}

export async function addStepsRecord(steps: number): Promise<StepsRecord> {
  try {
    const response = await apiClient.post<ApiResult<{ entry: StepsRecord }>>(
      "/app/progress/steps",
      { steps },
    );
    return response.data.data.entry;
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}
