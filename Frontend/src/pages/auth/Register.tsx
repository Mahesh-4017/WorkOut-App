import React, { useState } from "react";
import {
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
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../theme/ThemeProvider";
import { useUser } from "../../data/UserProvider";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage } from "../../api/client";
import { clearOnboarding, getOnboarding } from "../../utils/onboarding";
import { ROUTES } from "../../navigation/routes";
import {
  AuthButton,
  AuthField,
  AuthHeader,
  AuthSafeArea,
} from "./AuthComponents";

export default function RegisterScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const { setUser } = useUser();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const nameValid = name.trim().length > 1;
  const emailValid = /\S+@\S+\.\S+/.test(email);
  // Matches the hint: 8+ characters, a number and a symbol
  const passwordValid =
    password.length >= 8 && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

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
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        ...onboarding,
      });
      await clearOnboarding();
      setUser(user.name, user.email);
      navigation.reset({
        index: 0,
        routes: [{
          name: ROUTES.VERIFY_OTP,
          params: {
            purpose: "verifyEmail",
            target: user.email,
            phone: user.phone,
            continueToGender: true,
          },
        }],
      });
    } catch (error) {
      setErrorMessage(apiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
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
          <AuthHeader
            title="Create account"
            onBack={() => navigation.goBack()}
          />

          <Text style={styles.title}>Make room for you.</Text>
          <Text style={styles.subtitle}>
            Start your journey with a free account.
          </Text>

          <View style={styles.fields}>
            <AuthField
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Alex Morgan"
              autoCapitalize="words"
            />
            <AuthField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
            />
            <AuthField
              label="Phone number (optional)"
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 555 123 4567"
              keyboardType="phone-pad"
            />
            <AuthField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureToggle
            />
            <AuthField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureToggle
              error={confirmPassword.length > 0 && !passwordsMatch}
            />
          </View>

          <Text style={styles.hint}>
            Use at least 8 characters, a number and a symbol.
          </Text>

          {/* Terms */}
          <Pressable
            onPress={() => setAgreedToTerms((v) => !v)}
            style={styles.terms}
          >
            <View
              style={[
                styles.checkbox,
                agreedToTerms && styles.checkboxChecked,
              ]}
            >
              {agreedToTerms ? (
                <Ionicons
                  name="checkmark"
                  size={13}
                  color={theme.colors.onPrimary}
                />
              ) : null}
            </View>
            <Text style={styles.termsText}>
              I agree to the Terms &amp; privacy policy.
            </Text>
          </Pressable>

          <Text style={styles.control}>
            You control your data and can delete your account anytime.
          </Text>

          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}

          <View style={styles.spacer} />

          {/* Bottom */}
          <AuthButton
            title={submitting ? "Creating account…" : "Create account"}
            onPress={handleRegister}
            disabled={!canSubmit}
          />

          <Pressable
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
            style={styles.bottomLink}
          >
            <Text style={styles.bottomText}>Already have an account? Login</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthSafeArea>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    keyboard: { flex: 1 },
    spacer: { flex: 1, minHeight: 24 },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: responsiveWidth(5),
      paddingBottom: 16,
    },
    title: {
      marginTop: 14,
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
    fields: { marginTop: 18, gap: 12 },
    hint: {
      marginTop: 12,
      fontSize: responsiveFontSize(1.2),
      color: theme.colors.textSecondary,
    },
    terms: { flexDirection: "row", alignItems: "center", marginTop: 14 },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: theme.colors.primaryDark ?? theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    termsText: {
      marginLeft: 10,
      fontSize: responsiveFontSize(1.4),
      color: theme.colors.text,
    },
    control: {
      marginTop: 10,
      fontSize: responsiveFontSize(1.2),
      color: theme.colors.textSecondary,
    },
    error: {
      marginTop: 12,
      textAlign: "center",
      color: theme.colors.danger,
    },
    bottomLink: { alignItems: "center", paddingTop: 16, paddingBottom: 4 },
    bottomText: {
      fontSize: responsiveFontSize(1.4),
      color: theme.colors.textSecondary,
    },
  });