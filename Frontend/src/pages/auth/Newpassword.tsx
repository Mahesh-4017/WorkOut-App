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
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useTheme } from "../../theme/ThemeProvider";
import { ROUTES } from "../../navigation/routes";
import { apiErrorMessage } from "../../api/client";
import {
  AuthButton,
  AuthField,
  AuthHeader,
  AuthSafeArea,
  IconBadge,
} from "./AuthComponents";
import { resetPasswordRequest } from "./Otpservice";

function Rule({ met, label }: { met: boolean; label: string }) {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      backgroundColor: met ? theme.colors.statsBackground : theme.colors.card,
      borderColor: theme.colors.border,
    },
    label: { fontSize: responsiveFontSize(1.5), fontWeight: "700", color: theme.colors.text },
  });
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Ionicons
        name={met ? "checkmark" : "ellipse-outline"}
        size={met ? 18 : 14}
        color={met ? theme.colors.text : theme.colors.icon}
      />
    </View>
  );
}

export default function NewPasswordScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { target = "", code = "" } = (route.params ?? {}) as {
    target?: string;
    code?: string;
  };

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const lengthOk = password.length >= 8;
  const symbolOk = /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
  const matches = confirm.length > 0 && password === confirm;
  const canSubmit = lengthOk && symbolOk && matches && !submitting;

  const handleSave = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMessage("");
    try {
      await resetPasswordRequest(target, code, password);
      navigation.reset({
        index: 0,
        routes: [{ name: ROUTES.PASSWORD_RESET_SUCCESS, params: { target } }],
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
            title="New password"
            onBack={() => navigation.goBack()}
          />

          <View style={styles.badgeWrap}>
            <IconBadge
              icon="lock-closed-outline"
              background={theme.colors.statsBackground}
            />
          </View>

          <Text style={styles.title}>A fresh start.</Text>
          <Text style={styles.subtitle}>
            Choose a strong password you haven&apos;t used for this account
            before.
          </Text>

          <View style={styles.fields}>
            <AuthField
              label="New password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureToggle
            />
            <AuthField
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="••••••••"
              secureToggle
              error={confirm.length > 0 && !matches}
            />
          </View>

          <View style={styles.rules}>
            <Rule met={lengthOk} label="At least 8 characters" />
            <Rule met={symbolOk} label="Number and symbol included" />
          </View>

          <Text style={styles.hint}>
            Other devices will be signed out after you save.
          </Text>

          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}

          <View style={styles.spacer} />

          <AuthButton
            title={submitting ? "Saving…" : "Save new password"}
            onPress={handleSave}
            disabled={!canSubmit}
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
    fields: { marginTop: 18, gap: 12 },
    rules: { marginTop: 14, gap: 10 },
    hint: {
      marginTop: 12,
      fontSize: responsiveFontSize(1.2),
      color: theme.colors.textSecondary,
    },
    error: {
      marginTop: 10,
      fontSize: responsiveFontSize(1.4),
      color: theme.colors.danger,
    },
  });