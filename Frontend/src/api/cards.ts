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

export async function getPublicCards(page = 1, limit = 12, category?: string, gender?: string) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) query.set("category", category);
  if (gender) query.set("gender", gender);
  const response = await apiClient.get<{ data: { items: ApiCard[]; pagination: { page: number; pages: number; total: number } } }>(`/public/cards?${query.toString()}`);
  return response.data.data;
}

export async function getAllPublicCards(gender?: string) {
  const items: ApiCard[] = [];
  let page = 1;
  let pages = 1;
  do {
    const query = new URLSearchParams({ page: String(page), limit: "100" });
    if (gender) query.set("gender", gender);
    const response = await apiClient.get<{
      data: { items: ApiCard[]; pagination: { page: number; pages: number; total: number } };
    }>(`/public/cards?${query.toString()}`);
    items.push(...response.data.data.items);
    pages = response.data.data.pagination.pages;
    page += 1;
  } while (page <= pages);
  return items;
}

export async function getFeaturedCards(gender?: string) {
  const query = new URLSearchParams({ featured: "true", limit: "6", ...(gender ? { gender } : {}) });
  const response = await apiClient.get<{ data: { items: ApiCard[] } }>(`/public/cards?${query.toString()}`);
  return response.data.data.items;
}