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
import RegisterScreen from "./Register";
import { ROUTES } from "../../navigation/routes";
import { apiErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../data/UserProvider";

export default function LoginScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const { setUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit = emailValid && password.length >= 6 && !submitting;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMessage("");
    try {
      const user = await login(email.trim(), password);
      setUser(user.name, user.email);
      navigation.reset({ index: 0, routes: [{ name: ROUTES.HOME }] });
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
          paddingTop: responsiveWidth(18),
          paddingBottom: 32,
        }}
      >
        {/* Brand */}
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primary,
          }}
        >
          <Ionicons name="fitness" size={26} color={theme.colors.onPrimary} />
        </View>

        <Text
          style={{
            marginTop: 24,
            fontSize: responsiveFontSize(3.2),
            fontWeight: "900",
            color: theme.colors.text,
          }}
        >
          Welcome back
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontSize: responsiveFontSize(1.6),
            color: theme.colors.text,
            opacity: 0.55,
          }}
        >
          Log in to keep your streak going.
        </Text>

        {/* Email */}
        <View style={{ marginTop: 34 }}>
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
            <Ionicons name="mail-outline" size={18} color={theme.colors.icon} />
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

        {/* Password */}
        <View style={{ marginTop: 18 }}>
          <Text
            style={{
              fontSize: responsiveFontSize(1.4),
              fontWeight: "700",
              color: theme.colors.text,
              opacity: 0.7,
              marginBottom: 8,
            }}
          >
            Password
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
              name="lock-closed-outline"
              size={18}
              color={theme.colors.icon}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.icon}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword}
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: responsiveFontSize(1.6),
                color: theme.colors.text,
              }}
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

        {/* Forgot password */}
        <Pressable
          onPress={() => navigation.navigate(ROUTES.FORGET)}
          style={{ alignSelf: "flex-end", marginTop: 12 }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(1.4),
              fontWeight: "700",
              color: theme.colors.icon,
            }}
          >
            Forgot password?
          </Text>
        </Pressable>

        {/* Login button */}
        <Pressable
          onPress={handleLogin}
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
            {submitting ? "Logging in…" : "Log In"}
          </Text>
        </Pressable>
        {errorMessage ? (
          <Text style={{ marginTop: 12, color: theme.colors.danger, textAlign: "center" }}>
            {errorMessage}
          </Text>
        ) : null}

        {/* Divider */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 30,
          }}
        >
          <View
            style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }}
          />
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
          <View
            style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }}
          />
        </View>

        {/* Social buttons */}
        <View style={{ flexDirection: "row", marginTop: 20, gap: 12 }}>
          <Pressable
            style={{
              flex: 1,
              flexDirection: "row",
              height: 48,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Ionicons name="logo-google" size={18} color={theme.colors.text} />
            <Text
              style={{
                marginLeft: 8,
                fontSize: responsiveFontSize(1.5),
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
              Google
            </Text>
          </Pressable>

          <Pressable
            style={{
              flex: 1,
              flexDirection: "row",
              height: 48,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Ionicons name="logo-apple" size={19} color={theme.colors.text} />
            <Text
              style={{
                marginLeft: 8,
                fontSize: responsiveFontSize(1.5),
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
              Apple
            </Text>
          </Pressable>
        </View>

        {/* Sign up */}
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
            Don&apos;t have an account?{" "}
          </Text>
          <Pressable onPress={() =>  navigation.navigate(ROUTES.REGISTER)}>
            <Text
              style={{
                fontSize: responsiveFontSize(1.5),
                fontWeight: "700",
                color: theme.colors.icon,
              }}
            >
              Sign Up
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}