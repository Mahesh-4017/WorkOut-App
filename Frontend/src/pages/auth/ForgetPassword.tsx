import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
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
import {
  AuthButton,
  AuthField,
  AuthHeader,
  AuthSafeArea,
  IconBadge,
  InfoCard,
  OutlineButton,
} from "./AuthComponents";

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit = emailValid;

  const handleSendCode = () => {
    if (!canSubmit) return;
    navigation.navigate(ROUTES.VERIFY_OTP, {
      purpose: "resetPassword",
      target: email.trim(),
    });
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
            title="Forgot password"
            onBack={() => navigation.goBack()}
          />

          <View style={styles.badgeWrap}>
            <IconBadge
              icon="key-outline"
              background={theme.colors.panelWarm}
            />
          </View>

          <Text style={styles.title}>Let&apos;s get you back in.</Text>
          <Text style={styles.subtitle}>
            Enter the email linked to your account. We&apos;ll send a 6-digit
            code to reset your password.
          </Text>

          <View style={styles.field}>
            <AuthField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.card}>
            <InfoCard
              title="Your progress is safe"
              text="Resetting your password won't change your workouts, goals or health history."
            />
          </View>

          <View style={styles.spacer} />

          <AuthButton
            title="Send reset code"
            onPress={handleSendCode}
            disabled={!canSubmit}
          />
          <View style={styles.buttonGap} />
          <OutlineButton
            title="Back to Login"
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthSafeArea>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    keyboard: { flex: 1 },
    spacer: { flex: 1, minHeight: 24 },
    buttonGap: { height: 12 },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: responsiveWidth(5),
      paddingBottom: 16,
    },
    badgeWrap: { marginTop: 18 },
    title: {
      marginTop: 24,
      fontSize: responsiveFontSize(3.2),
      fontWeight: "800",
      letterSpacing: -0.4,
      color: theme.colors.text,
    },
    subtitle: {
      marginTop: 8,
      fontSize: responsiveFontSize(1.5),
      lineHeight: responsiveFontSize(2.2),
      color: theme.colors.textSecondary,
    },
    field: { marginTop: 18 },
    card: { marginTop: 14 },
    error: {
      marginTop: 10,
      fontSize: responsiveFontSize(1.4),
      color: theme.colors.danger,
    },
  });