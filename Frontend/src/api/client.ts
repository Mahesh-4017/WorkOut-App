import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./config";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

export function resolveApiMediaUrl(url: string): string;
export function resolveApiMediaUrl(url?: undefined): undefined;
export function resolveApiMediaUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${backendOrigin}${url.startsWith("/") ? url : `/${url}`}`;
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
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return "Server is waking up (cold start). Please wait 10 seconds and try again.";
    }
    if (!error.response) {
      return "Unable to reach server. Please check your internet connection.";
    }
    const responseData: unknown = error.response?.data;
    if (typeof responseData === "string") return responseData;
    if (responseData && typeof responseData === "object" && "message" in responseData) {
      const message = responseData.message;
      if (typeof message === "string") {
        if ("errors" in responseData && Array.isArray(responseData.errors)) {
          const details = responseData.errors
            .map((entry: unknown) => {
              if (!entry || typeof entry !== "object" || !("msg" in entry)) return null;
              const detail = typeof entry.msg === "string" ? entry.msg : null;
              const path = "path" in entry && typeof entry.path === "string" && entry.path
                ? entry.path
                : "param" in entry && typeof entry.param === "string" && entry.param
                  ? entry.param
                  : null;
              return detail ? `${path ? `${path}: ` : ""}${detail}` : null;
            })
            .filter((detail): detail is string => detail !== null);
          if (details.length) return `${message}: ${[...new Set(details)].join("; ")}`;
        }
        return message;
      }
    }
    return "Server error. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong";
}