import { Platform } from "react-native";

export type PublicCard = {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
  status: "published";
  isFeatured: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// Android emulators reach the host machine through 10.0.2.2.
const API_BASE_URL = Platform.OS === "android"
  ? "http://10.0.2.2:5001/api"
  : "http://localhost:5001/api";

export async function fetchFeaturedCards(): Promise<PublicCard[]> {
  const response = await fetch(`${API_BASE_URL}/public/cards?featured=true&limit=6`);
  if (!response.ok) throw new Error("Unable to load featured sessions");
  const payload = await response.json() as ApiResponse<{ items: PublicCard[] }>;
  return payload.data.items;
}

export async function loginAdmin(email: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json() as Partial<ApiResponse<unknown>>;
  if (!response.ok) throw new Error(payload.message || "Unable to log in");
}
