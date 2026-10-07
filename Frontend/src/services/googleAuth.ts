import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { loginWithGoogle } from "../api/auth";
import { GOOGLE_WEB_CLIENT_ID } from "../api/config";

let isConfigured = false;

export async function signInWithGoogle() {
  if (!GOOGLE_WEB_CLIENT_ID || GOOGLE_WEB_CLIENT_ID.startsWith("YOUR_")) {
    throw new Error("Google sign-in needs a Web OAuth client ID in src/api/config.ts.");
  }

  if (!isConfigured) {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
    isConfigured = true;
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return null;
    if (!response.data.idToken) throw new Error("Google did not return an ID token.");
    return await loginWithGoogle(response.data.idToken);
  } catch (error: any) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return null;
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services is not available or outdated on this device.");
      }
      if (error.code === "10" || error.message?.includes("DEVELOPER_ERROR")) {
        throw new Error(
          "Google Sign-In DEVELOPER_ERROR (code 10): Ensure the Android OAuth Client ID with package 'com.workoutapp.fitness' and SHA-1 certificate is added to Google Cloud Console."
        );
      }
    }
    throw error;
  }
}