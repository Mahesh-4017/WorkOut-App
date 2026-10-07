import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../theme/ThemeProvider";
import { ROUTES } from "../../navigation/routes";
import { apiErrorMessage } from "../../api/client";
import { AuthButton, AuthHeader, AuthSafeArea } from "./AuthComponents";
import { OtpPurpose, resendOtpRequest, verifyOtpRequest } from "./Otpservice";
import { useAuth } from "../../context/AuthContext";
import { getPostAuthRoute } from "../../utils/onboarding";

const CODE_LENGTH = 6;
const EXPIRY_SECONDS = 10 * 60;
const RESEND_COOLDOWN = 30;

/**
 * Navigate here with:
 *   navigation.navigate(ROUTES.VERIFY_OTP, { purpose: "verifyEmail", target: email })
 *   navigation.navigate(ROUTES.VERIFY_OTP, { purpose: "verifyPhone", target: phone })
 *   navigation.navigate(ROUTES.VERIFY_OTP, { purpose: "resetPassword", target: email })
 */
type Params = {
  purpose: OtpPurpose;
  target: string;
  phone?: string;
  continueToGender?: boolean;
};

const COPY = {
  verifyEmail: {
    header: "Email verification",
    title: "Check your inbox.",
    action: "verify your account",
    icon: "mail-outline",
    change: "Change email",
    noteTitle: "One more step",
    note: "Verifying your email keeps your progress safe and helps you recover your account.",
  },
  verifyPhone: {
    header: "Phone verification",
    title: "Check your messages.",
    action: "verify your phone number",
    icon: "chatbubble-ellipses-outline",
    change: "Change phone number",
    noteTitle: "One more step",
    note: "Verifying your number helps keep your account secure and easier to recover.",
  },
  resetPassword: {
    header: "Reset password",
    title: "Check your inbox.",
    action: "reset your password",
    icon: "key-outline",
    change: "Change email",
    noteTitle: "Almost there",
    note: "Enter the code to confirm it's you, then choose a new password.",
  },
} as const;

const formatTime = (total: number) => {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export default function VerifyOtpScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const {
    purpose = "verifyEmail",
    target = "",
    phone,
    continueToGender = false,
  } = (route.params ?? {}) as Partial<Params>;
  const copy = COPY[purpose];

  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(true);
  const [codeIssued, setCodeIssued] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sendFailed, setSendFailed] = useState(false);
  const [codeRejected, setCodeRejected] = useState(false);
  const [expiresIn, setExpiresIn] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate(ROUTES.LOGIN);
  }, [navigation]);

  useEffect(() => {
    let cancelled = false;
    setSendingCode(true);
    setCodeIssued(false);
    setErrorMessage("");
    setSendFailed(false);
    setCode("");

    resendOtpRequest(purpose, target).then(() => {
      if (cancelled) return;
      setSendingCode(false);
      setCodeIssued(true);
      setExpiresIn(EXPIRY_SECONDS);
      setCooldown(RESEND_COOLDOWN);
    }).catch(error => {
      if (cancelled) return;
      setSendingCode(false);
      setSendFailed(true);
      setErrorMessage(apiErrorMessage(error));
    });

    return () => {
      cancelled = true;
    };
  }, [purpose, target]);

  useEffect(() => {
    if (!codeIssued) return undefined;
    const id = setInterval(() => {
      setExpiresIn((v) => Math.max(0, v - 1));
      setCooldown((v) => Math.max(0, v - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [codeIssued]);

  const canVerify =
    codeIssued && code.length === CODE_LENGTH && expiresIn > 0 && !submitting;

  const handleChange = (text: string) => {
    setCode(text.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH));
    if (errorMessage) setErrorMessage("");
    setCodeRejected(false);
  };

  const handleVerify = useCallback(async () => {
    if (!canVerify) return;
    setSubmitting(true);
    setErrorMessage("");
    setCodeRejected(false);
    try {
      await verifyOtpRequest(purpose, target, code);

      if (purpose === "resetPassword") {
        navigation.navigate(ROUTES.RESET_PASSWORD, { target, code });
      } else if (purpose === "verifyEmail" && phone) {
        navigation.reset({
          index: 0,
          routes: [{
            name: ROUTES.VERIFY_OTP,
            params: { purpose: "verifyPhone", target: phone, continueToGender },
          }],
        });
      } else {
        const nextRoute = continueToGender
          ? ROUTES.GENDER
          : user ? await getPostAuthRoute(user) : ROUTES.LOGIN;
        navigation.reset({ index: 0, routes: [{ name: nextRoute }] });
      }
    } catch (error) {
      const message = apiErrorMessage(error);
      setErrorMessage(message);
      setCodeRejected(message.toLowerCase().includes("code"));
    } finally {
      setSubmitting(false);
    }
  }, [canVerify, purpose, target, phone, continueToGender, code, navigation, user]);

  const handleResend = async () => {
    if (cooldown > 0 || submitting || sendingCode) return;
    setSendingCode(true);
    setCodeIssued(false);
    setErrorMessage("");
    setSendFailed(false);
    try {
      await resendOtpRequest(purpose, target);
      setCode("");
      setSendingCode(false);
      setCodeIssued(true);
      setExpiresIn(EXPIRY_SECONDS);
      setCooldown(RESEND_COOLDOWN);
      inputRef.current?.focus();
    } catch (error) {
      setSendingCode(false);
      setSendFailed(true);
      setErrorMessage(apiErrorMessage(error));
      setCodeRejected(false);
    }
  };

  const activeIndex = Math.min(code.length, CODE_LENGTH - 1);

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
            title={copy.header}
            onBack={handleBack}
          />

          {/* Icon */}
          <View style={styles.iconCircle}>
            <Ionicons
              name={copy.icon as any}
              size={34}
              color={theme.colors.text}
            />
          </View>

          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>
            {sendFailed
              ? "We couldn't send a code to "
              : `Enter the ${CODE_LENGTH}-digit OTP sent to `}
            <Text style={styles.target}>{target}</Text>
            {sendFailed ? ". Tap Resend code to try again." : ` to ${copy.action}.`}
          </Text>

          {/* OTP boxes (tap anywhere to focus the hidden input) */}
          <Pressable
            onPress={() => inputRef.current?.focus()}
            style={styles.boxRow}
          >
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const isActive = focused && i === activeIndex && !submitting;
              return (
                <View
                  key={i}
                  style={[
                    styles.box,
                    isActive && styles.boxActive,
                    codeRejected && styles.boxError,
                  ]}
                >
                  <Text style={styles.boxText}>{code[i] ?? ""}</Text>
                </View>
              );
            })}

            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              autoFocus
              caretHidden
              style={styles.hiddenInput}
            />
          </Pressable>

          {/* Resend */}
          <Pressable
            onPress={handleResend}
            disabled={cooldown > 0 || sendingCode}
            style={styles.resend}
          >
            <Text
              style={[styles.resendText, cooldown > 0 && styles.resendTextDisabled]}
            >
              {sendingCode
                ? "Sending code…"
                : cooldown > 0
                  ? `Resend code in ${cooldown}s`
                  : "Resend code"}
            </Text>
          </Pressable>

          <Text style={styles.expiry}>
            {expiresIn > 0
              ? `Code expires in ${formatTime(expiresIn)}. Check spam if it hasn't arrived.`
              : "This code has expired. Request a new one."}
          </Text>

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          {/* Info card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{copy.noteTitle}</Text>
            <Text style={styles.infoText}>{copy.note}</Text>
          </View>

          <View style={styles.spacer} />

          {/* Bottom */}
          <AuthButton
            title={submitting ? "Verifying…" : "Verify"}
            onPress={handleVerify}
            disabled={!canVerify}
          />

          <Pressable
            onPress={handleBack}
            style={styles.changeLink}
          >
            <Text style={styles.changeText}>{copy.change}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthSafeArea>
  );
}

const BOX_GAP = 8;

const createStyles = (theme: any) =>
  StyleSheet.create({
    scroll: {
      flexGrow: 1,
      paddingHorizontal: responsiveWidth(5),
      paddingBottom: 16,
    },
    iconCircle: {
      alignSelf: "center",
      marginTop: 18,
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor: theme.colors.panel,
      alignItems: "center",
      justifyContent: "center",
    },
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
    target: {
      color: theme.colors.text,
      fontWeight: "600",
    },

    boxRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 18,
      gap: BOX_GAP,
    },
    box: {
      flex: 1,
      height: responsiveWidth(13),
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    boxActive: {
      borderColor: theme.colors.primary,
      borderWidth: 1.5,
    },
    boxError: {
      borderColor: theme.colors.danger,
    },
    boxText: {
      fontSize: responsiveFontSize(2.6),
      fontWeight: "800",
      color: theme.colors.text,
    },
    hiddenInput: {
      ...StyleSheet.absoluteFill,
      opacity: 0.01,
    },

    resend: { alignSelf: "flex-start", marginTop: 12 },
    resendText: {
      fontSize: responsiveFontSize(1.4),
      fontWeight: "700",
      color: theme.colors.accent,
    },
    resendTextDisabled: { opacity: 0.5 },
    expiry: {
      marginTop: 10,
      fontSize: responsiveFontSize(1.2),
      color: theme.colors.textSecondary,
    },
    error: {
      marginTop: 10,
      fontSize: responsiveFontSize(1.4),
      color: theme.colors.danger,
    },

    infoCard: {
      marginTop: 18,
      borderRadius: 12,
      padding: 14,
      backgroundColor: theme.colors.statsBackground,
    },
    infoTitle: {
      fontSize: responsiveFontSize(1.5),
      fontWeight: "800",
      color: theme.colors.text,
    },
    infoText: {
      marginTop: 4,
      fontSize: responsiveFontSize(1.3),
      lineHeight: responsiveFontSize(1.9),
      color: theme.colors.textSecondary,
    },

    changeLink: { alignItems: "center", paddingTop: 16, paddingBottom: 4 },
    keyboard: { flex: 1 },
    spacer: { flex: 1, minHeight: 24 },
    changeText: {
      fontSize: responsiveFontSize(1.4),
      color: theme.colors.textSecondary,
    },
  });