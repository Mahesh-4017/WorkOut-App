import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../theme/ThemeProvider";
import { useUser } from "../../data/UserProvider";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage, warmUpApi } from "../../api/client";
import { clearOnboarding, getOnboarding } from "../../utils/onboarding";
import { ROUTES } from "../../navigation/routes";

export default function RegisterScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { setUser } = useUser();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [waitingForServer, setWaitingForServer] = useState(false);

  useEffect(() => {
    void warmUpApi();
  }, []);

  useEffect(() => {
    if (!submitting) {
      setWaitingForServer(false);
      return;
    }
    const timeout = setTimeout(() => setWaitingForServer(true), 3000);
    return () => clearTimeout(timeout);
  }, [submitting]);

  const nameValid = name.trim().length > 1;
  const emailValid = /\S+@\S+\.\S+/.test(email);
  const passwordValid = password.length >= 6;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const canSubmit =
    nameValid &&
    emailValid &&
    passwordValid &&
    passwordsMatch &&
    agreedToTerms &&
    !submitting;

  const handleRegister = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMessage("");
    try {
      const onboarding = await getOnboarding();
      const user = await register({ name: name.trim(), email: email.trim(), password, ...onboarding });
      setUser(user.name, user.email);
      navigation.reset({ index: 0, routes: [{ name: ROUTES.HOME }] });
      void clearOnboarding().catch(() => undefined);
    } catch (error) {
      setErrorMessage(apiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: responsiveWidth(6),
          paddingTop: responsiveWidth(14),
          paddingBottom: 32,
        }}
      >
        {/* Back */}
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
        </Pressable>
        {errorMessage ? (
          <Text style={{ marginTop: 12, color: "#E5484D", textAlign: "center" }}>
            {errorMessage}
          </Text>
        ) : null}

        <Text
          style={{
            marginTop: 22,
            fontSize: responsiveFontSize(3.2),
            fontWeight: "900",
            color: theme.colors.text,
          }}
        >
          Create account
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontSize: responsiveFontSize(1.6),
            color: theme.colors.text,
            opacity: 0.55,
          }}
        >
          Start your journey to a stronger you.
        </Text>

        {/* Name */}
        <View style={{ marginTop: 30 }}>
          <Text style={styles(theme).label}>Full name</Text>
          <View style={styles(theme).inputRow}>
            <Ionicons
              name="person-outline"
              size={18}
              color={theme.colors.icon}
            />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Alex Carter"
              placeholderTextColor={theme.colors.icon}
              autoCapitalize="words"
              style={styles(theme).input}
            />
          </View>
        </View>

        {/* Email */}
        <View style={{ marginTop: 18 }}>
          <Text style={styles(theme).label}>Email</Text>
          <View style={styles(theme).inputRow}>
            <Ionicons name="mail-outline" size={18} color={theme.colors.icon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.icon}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles(theme).input}
            />
          </View>
        </View>

        {/* Password */}
        <View style={{ marginTop: 18 }}>
          <Text style={styles(theme).label}>Password</Text>
          <View style={styles(theme).inputRow}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={theme.colors.icon}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor={theme.colors.icon}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword}
              style={styles(theme).input}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={theme.colors.icon}
              />
            </Pressable>
          </View>
        </View>

        {/* Confirm password */}
        <View style={{ marginTop: 18 }}>
          <Text style={styles(theme).label}>Confirm password</Text>
          <View
            style={[
              styles(theme).inputRow,
              confirmPassword.length > 0 && !passwordsMatch
                ? { borderColor: "#E5484D" }
                : null,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={theme.colors.icon}
            />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              placeholderTextColor={theme.colors.icon}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword}
              style={styles(theme).input}
            />
          </View>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <Text
              style={{
                marginTop: 6,
                fontSize: responsiveFontSize(1.25),
                color: "#E5484D",
              }}
            >
              Passwords don&apos;t match
            </Text>
          )}
        </View>

        {/* Terms checkbox */}
        <Pressable
          onPress={() => setAgreedToTerms((v) => !v)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: agreedToTerms
                ? theme.colors.primary
                : theme.colors.border,
              backgroundColor: agreedToTerms
                ? theme.colors.primary
                : "transparent",
            }}
          >
            {agreedToTerms && (
              <Ionicons name="checkmark" size={13} color={theme.colors.onPrimary} />
            )}
          </View>
          <Text
            style={{
              marginLeft: 10,
              flex: 1,
              fontSize: responsiveFontSize(1.4),
              color: theme.colors.text,
              opacity: 0.7,
            }}
          >
            I agree to the Terms of Service and Privacy Policy
          </Text>
        </Pressable>

        {/* Register button */}
        <Pressable
          onPress={handleRegister}
          disabled={!canSubmit}
          style={{
            marginTop: 26,
            height: 54,
            borderRadius: 27,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primary,
            opacity: canSubmit ? 1 : 0.5,
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(1.75),
              fontWeight: "700",
              color: theme.colors.onPrimary,
            }}
          >
            {submitting ? waitingForServer ? "Waking server…" : "Creating account…" : "Create Account"}
          </Text>
        </Pressable>

        {/* Divider */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 28 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
          <Text
            style={{
              marginHorizontal: 12,
              fontSize: responsiveFontSize(1.3),
              color: theme.colors.text,
              opacity: 0.45,
            }}
          >
            or continue with
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
        </View>

        {/* Social buttons */}
        <View style={{ flexDirection: "row", marginTop: 20, gap: 12 }}>
          <Pressable style={styles(theme).socialButton}>
            <Ionicons name="logo-google" size={18} color={theme.colors.text} />
            <Text style={styles(theme).socialLabel}>Google</Text>
          </Pressable>

          <Pressable style={styles(theme).socialButton}>
            <Ionicons name="logo-apple" size={19} color={theme.colors.text} />
            <Text style={styles(theme).socialLabel}>Apple</Text>
          </Pressable>
        </View>

        {/* Login link */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 32,
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(1.5),
              color: theme.colors.text,
              opacity: 0.6,
            }}
          >
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text
              style={{
                fontSize: responsiveFontSize(1.5),
                fontWeight: "700",
                color: theme.colors.icon,
              }}
            >
              Log In
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme: any) => ({
  label: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: "700" as const,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: responsiveFontSize(1.6),
    color: theme.colors.text,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row" as const,
    height: 48,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  socialLabel: {
    marginLeft: 8,
    fontSize: responsiveFontSize(1.5),
    fontWeight: "600" as const,
    color: theme.colors.text,
  },
});