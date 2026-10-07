import { apiClient, apiErrorMessage } from "./client";

export type ExerciseCategory = { name: string; count: number };
export type ExerciseBodyPart = {
  name: string;
  count: number;
  imageUrl: string;
  categories: ExerciseCategory[];
};

export type PublicExercise = {
  _id: string;
  title: string;
  description: string;
  bodyPart: string;
  category: string;
  muscles: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  durationMinutes: number;
  equipment: string[];
  imageUrl: string;
  videoUrl: string;
  instructions: string[];
};

export type ExerciseList = {
  items: PublicExercise[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

async function request<T>(path: string): Promise<T> {
  try {
    const response = await apiClient.get<{ data: T }>(path);
    return response.data.data;
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}

export function getExerciseBodyParts() {
  return request<ExerciseBodyPart[]>("/public/exercises/body-parts");
}

export function getPublicExercises(params: {
  bodyPart?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  return request<ExerciseList>(`/public/exercises?${query.toString()}`);
}

export async function getAllPublicExercises(params: {
  bodyPart?: string;
  category?: string;
  search?: string;
}) {
  const items: PublicExercise[] = [];
  let page = 1;
  let pages = 1;
  do {
    const result = await getPublicExercises({ ...params, page, limit: 100 });
    items.push(...result.items);
    pages = result.pagination.pages;
    page += 1;
  } while (page <= pages);
  return items;
}

export function getPublicExercise(id: string) {
  return request<PublicExercise>(`/public/exercises/${encodeURIComponent(id)}`);
}
