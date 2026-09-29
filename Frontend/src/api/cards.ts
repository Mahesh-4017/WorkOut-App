import { apiClient } from "./client";

export type ApiCard = {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category: string;
  audience: "all" | "male" | "female";
  tags: string[];
  status: "published";
  isFeatured: boolean;
};

export async function getPublicCards(page = 1, limit = 12) {
  const response = await apiClient.get<{ data: { items: ApiCard[]; pagination: { page: number; pages: number; total: number } } }>(`/public/cards?page=${page}&limit=${limit}`);
  return response.data.data;
}

export async function getFeaturedCards(gender?: string) {
  const query = new URLSearchParams({ featured: "true", limit: "6", ...(gender ? { gender } : {}) });
  const response = await apiClient.get<{ data: { items: ApiCard[] } }>(`/public/cards?${query.toString()}`);
  return response.data.data.items;
}