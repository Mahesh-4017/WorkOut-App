import "react-native-get-random-values";
import { appleAuth, appleAuthAndroid } from "@invertase/react-native-apple-authentication";
import { Platform } from "react-native";
import { v4 as uuid } from "uuid";
import { loginWithApple } from "../api/auth";
import { APPLE_ANDROID_CLIENT_ID, APPLE_REDIRECT_URI } from "../api/config";

export async function signInWithApple() {
  const nonce = uuid();
  let idToken: string | null | undefined;
  let name: string | undefined;

  try {
    if (Platform.OS === "ios") {
      if (!appleAuth.isSupported) throw new Error("Sign in with Apple requires iOS 13 or later.");
      const response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        nonce,
      });
      idToken = response.identityToken;
      name = [response.fullName?.givenName, response.fullName?.middleName, response.fullName?.familyName]
        .filter(Boolean)
        .join(" ");
    } else if (Platform.OS === "android") {
      if (!appleAuthAndroid.isSupported) throw new Error("Sign in with Apple is not supported on this Android version.");
      if (!APPLE_ANDROID_CLIENT_ID || APPLE_ANDROID_CLIENT_ID.startsWith("YOUR_")) {
        throw new Error("Configure the Apple Service ID in src/api/config.ts before signing in on Android.");
      }
      appleAuthAndroid.configure({
        clientId: APPLE_ANDROID_CLIENT_ID,
        redirectUri: APPLE_REDIRECT_URI,
        responseType: appleAuthAndroid.ResponseType.ID_TOKEN,
        scope: appleAuthAndroid.Scope.ALL,
        nonce,
        state: uuid(),
      });
      const response = await appleAuthAndroid.signIn();
      idToken = response.id_token;
      name = [response.user?.name?.firstName, response.user?.name?.lastName].filter(Boolean).join(" ");
    } else {
      throw new Error("Sign in with Apple is not supported on this platform.");
    }
  } catch (error) {
    const errorCode = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
    const wasCancelled = Platform.OS === "ios"
      ? errorCode === appleAuth.Error.CANCELED
      : errorCode === appleAuthAndroid.Error.SIGNIN_CANCELLED;
    if (wasCancelled) return null;
    throw error;
  }

  if (!idToken) throw new Error("Apple did not return an identity token.");
  return loginWithApple(idToken, nonce, name);
}