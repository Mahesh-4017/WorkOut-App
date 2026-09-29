import { Platform } from "react-native";

// Live production backend on Render
export const LIVE_API_BASE_URL = "https://workout-app-g3ag.onrender.com/api";

// Local development URLs
export const LOCAL_API_BASE_URL = Platform.OS === "android"
  ? "http://10.0.2.2:5001/api"
  : "http://localhost:5001/api";

// Active API URL (switched to live Render backend)
export const API_BASE_URL = LIVE_API_BASE_URL;

