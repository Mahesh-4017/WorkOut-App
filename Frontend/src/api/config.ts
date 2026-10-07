import { Platform } from "react-native";

// Live production backend on Render
export const LIVE_API_BASE_URL = "https://workout-app-g3ag.onrender.com/api";

// Local development URLs
export const LOCAL_API_BASE_URL = Platform.OS === "android"
  ? "http://10.0.2.2:5001/api"
  : "http://localhost:5001/api";

// Mobile app requests use the deployed backend by default.
export const API_BASE_URL = LIVE_API_BASE_URL;

// Set this to the Web OAuth client ID used by the backend's GOOGLE_CLIENT_ID.
export const GOOGLE_WEB_CLIENT_ID = "950589369071-jb0vm7vaeb54cee4ecfudp0k9u9hjap6.apps.googleusercontent.com";

export const APPLE_ANDROID_CLIENT_ID = "YOUR_APPLE_SERVICE_ID";
export const APPLE_REDIRECT_URI = "https://workout-app-g3ag.onrender.com/api/app/auth/apple/callback";

