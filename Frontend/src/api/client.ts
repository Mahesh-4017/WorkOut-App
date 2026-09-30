import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./config";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

let warmupPromise: Promise<void> | null = null;

export function warmUpApi() {
  if (!warmupPromise) {
    warmupPromise = apiClient.get("/health", { timeout: 60000 })
      .then(() => undefined)
      .catch(() => {
        warmupPromise = null;
      });
  }
  return warmupPromise;
}

apiClient.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) await AsyncStorage.removeItem("token");
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.data?.message || "Network request failed";
  return error instanceof Error ? error.message : "Something went wrong";
}