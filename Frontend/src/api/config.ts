import { Platform } from "react-native";

// Android emulator: 10.0.2.2 points back to the development machine.
// For a physical device, replace the host with your Mac's LAN IP.
export const API_BASE_URL = Platform.OS === "android"
  ? "http://10.0.2.2:5001/api"
  : "http://localhost:5001/api";
