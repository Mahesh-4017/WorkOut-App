import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";

import { useTheme } from "../../theme/ThemeProvider";
import { ROUTES } from "../../navigation/routes";
import { apiErrorMessage } from "../../api/client";
import { AppUser } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../data/UserProvider";
import { getPostAuthRoute } from "../../utils/onboarding";
import {
  AuthButton,
  AuthField,
  AuthHeader,
  AuthSafeArea,
  SocialButton,
} from "./AuthComponents";

type Mode = "email" | "phone";

export default function LoginScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const { setUser } = useUser();

  const [mode, setMode] = useState<Mode>("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const identifierValid =
    mode === "email"
      ? /\S+@\S+\.\S+/.test(identifier)
      : /^\+?[0-9\s-]{7,15}$/.test(identifier);
  const canSubmit = identifierValid && password.length >= 6 && !submitting;

  const goHome = async (user: AppUser) => {
    setUser(user.name, user.email);
    const nextRoute = await getPostAuthRoute(user);
    navigation.reset({ index: 0, routes: [{ name: nextRoute }] });
  };

  const run = async (action: () => Promise<any>) => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      const user = await action();
      if (!user) return;
      await goHome(user);
    } catch (error) {
      setErrorMessage(apiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = () => {
    if (!canSubmit) return;
    run(() => login(identifier.trim(), password));
  };

  return (
    <AuthSafeArea>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <AuthHeader title="Login" onBack={() => navigation.goBack()} />

          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.logoBox}>
<Image source={require("../../assets/logo.png")} style={styles.logo} />
            </View>
          </View>

          <Text style={styles.title}>Welcome back.</Text>
          <Text style={styles.subtitle}>Your next little win starts here.</Text>

          {/* Email / Phone tabs */}
          <View style={styles.tabs}>
            {(["email", "phone"] as Mode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => {
                  setMode(m);
                  setIdentifier("");
                }}
                style={styles.tab}
              >
                <Text
                  style={[styles.tabText, mode === m && styles.tabTextActive]}
                >
                  {m === "email" ? "Email" : "Phone"}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.fields}>
            <AuthField
              label={mode === "email" ? "Email / phone" : "Phone number"}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder={mode === "email" ? "you@example.com" : "+91 98765 43210"}
              keyboardType={mode === "email" ? "email-address" : "phone-pad"}
            />
            <AuthField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureToggle
            />
          </View>

          <Pressable
            onPress={() => navigation.navigate(ROUTES.FORGET)}
            style={styles.forgot}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <View style={styles.buttonWrap}>
            <AuthButton
              title={submitting ? "Logging in…" : "Login"}
              onPress={handleLogin}
              disabled={!canSubmit}
            />
          </View>

          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}

          <Text style={styles.orText}>or continue with</Text>

          <View style={styles.socials}>
            <SocialButton
              icon="logo-google"
              title="Continue with Google"
              onPress={() => run(loginWithGoogle)}
              disabled={submitting}
            />
            <SocialButton
              icon="logo-apple"
              title="Continue with Apple"
              onPress={() => run(loginWithApple)}
              disabled={submitting}
            />
          </View>

          <Text style={styles.privacy}>
            Your account. Your health. Always private.
          </Text>

          <View style={styles.spacer} />

          {/* Bottom link */}
          <Pressable
            onPress={() => navigation.navigate(ROUTES.REGISTER)}
            style={styles.bottomLink}
          >
            <Text style={styles.bottomText}>New here? Create account</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthSafeArea>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    keyboard: { flex: 1 },
    spacer: { flex: 1 },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: responsiveWidth(5),
      paddingBottom: 16,
    },
    brand: { alignItems: "center", marginTop: 8 },
    logoBox: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    logo: {
      width: 64,
      height: 64,
      resizeMode: "contain",
    },
    logoLetter: {
      fontSize: 38,
      fontWeight: "900",
      color: theme.colors.onPrimary,
      marginTop: -2,
    },
    brandName: {
      marginTop: 10,
      fontSize: responsiveFontSize(1.8),
      fontWeight: "800",
      color: theme.colors.text,
    },
    title: {
      marginTop: 20,
      fontSize: responsiveFontSize(3.2),
      fontWeight: "800",
      letterSpacing: -0.4,
      color: theme.colors.text,
    },
    subtitle: {
      marginTop: 6,
      fontSize: responsiveFontSize(1.5),
      color: theme.colors.textSecondary,
    },
    tabs: {
      flexDirection: "row",
      marginTop: 18,
      borderRadius: 12,
      backgroundColor: theme.colors.statsBackground,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    tab: { flex: 1, alignItems: "center", paddingVertical: 11 },
    tabText: {
      fontSize: responsiveFontSize(1.4),
      color: theme.colors.textSecondary,
    },
    tabTextActive: {
      color: theme.colors.text,
      fontWeight: "800",
      textDecorationLine: "underline",
    },
    fields: { marginTop: 14, gap: 12 },
    forgot: { alignSelf: "flex-start", marginTop: 12 },
    forgotText: {
      fontSize: responsiveFontSize(1.4),
      fontWeight: "700",
      color: theme.colors.accent,
    },
    buttonWrap: { marginTop: 18 },
    error: {
      marginTop: 12,
      textAlign: "center",
      color: theme.colors.danger,
    },
    orText: {
      marginTop: 16,
      textAlign: "center",
      fontSize: responsiveFontSize(1.3),
      color: theme.colors.textSecondary,
    },
    socials: { marginTop: 14, gap: 12 },
    privacy: {
      marginTop: 16,
      textAlign: "center",
      fontSize: responsiveFontSize(1.3),
      color: theme.colors.textSecondary,
    },
    bottomLink: { alignItems: "center", paddingTop: 24, paddingBottom: 4 },
    bottomText: {
      fontSize: responsiveFontSize(1.4),
      color: theme.colors.textSecondary,
    },
  });