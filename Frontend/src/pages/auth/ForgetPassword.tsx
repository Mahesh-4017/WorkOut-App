import React, { useState } from "react";
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

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit = emailValid && !submitting;

  const handleSendLink = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Wire up your real password-reset call here.
      // await sendPasswordResetEmail(email);
      setSent(true);
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

        {!sent ? (
          <>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                marginTop: 22,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={theme.colors.icon}
              />
            </View>

            <Text
              style={{
                marginTop: 22,
                fontSize: responsiveFontSize(3),
                fontWeight: "900",
                color: theme.colors.text,
              }}
            >
              Forgot password?
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontSize: responsiveFontSize(1.6),
                color: theme.colors.text,
                opacity: 0.55,
              }}
            >
              Enter the email on your account and we&apos;ll send you a link
              to reset your password.
            </Text>

            {/* Email */}
            <View style={{ marginTop: 30 }}>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.4),
                  fontWeight: "700",
                  color: theme.colors.text,
                  opacity: 0.7,
                  marginBottom: 8,
                }}
              >
                Email
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  height: 52,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  backgroundColor: theme.colors.card,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={theme.colors.icon}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.colors.icon}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    fontSize: responsiveFontSize(1.6),
                    color: theme.colors.text,
                  }}
                />
              </View>
            </View>

            {/* Send link */}
            <Pressable
              onPress={handleSendLink}
              disabled={!canSubmit}
              style={{
                marginTop: 28,
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
                {submitting ? "Sending…" : "Send Reset Link"}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Confirmation state */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                marginTop: 30,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.primary,
              }}
            >
              <Ionicons
                name="checkmark"
                size={28}
                color={theme.colors.onPrimary}
              />
            </View>

            <Text
              style={{
                marginTop: 22,
                fontSize: responsiveFontSize(2.6),
                fontWeight: "900",
                color: theme.colors.text,
              }}
            >
              Check your email
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontSize: responsiveFontSize(1.6),
                color: theme.colors.text,
                opacity: 0.6,
              }}
            >
              We&apos;ve sent a password reset link to{" "}
              <Text style={{ fontWeight: "700", color: theme.colors.text }}>
                {email}
              </Text>
              . Follow the link to set a new password.
            </Text>

            <Pressable
              onPress={handleSendLink}
              disabled={submitting}
              style={{ marginTop: 20 }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(1.45),
                  fontWeight: "700",
                  color: theme.colors.icon,
                }}
              >
                Didn&apos;t get it? Resend link
              </Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("Login")}
              style={{
                marginTop: 28,
                height: 54,
                borderRadius: 27,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(1.7),
                  fontWeight: "700",
                  color: theme.colors.text,
                }}
              >
                Back to Log In
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}