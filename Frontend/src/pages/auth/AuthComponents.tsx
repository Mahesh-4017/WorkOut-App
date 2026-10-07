import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { responsiveFontSize } from "react-native-responsive-dimensions";

import { useTheme } from "../../theme/ThemeProvider";

/* ---------- Header: back arrow + title + menu ---------- */
export function AuthHeader({
  title,
  onBack,
  onMenu,
}: {
  title: string;
  onBack: () => void;
  onMenu?: () => void;
}) {
  const { theme } = useTheme();
  const styles = createSharedStyles(theme);
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.headerSide}>
        <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      {onMenu ? (
        <Pressable onPress={onMenu} hitSlop={12} style={styles.headerSideRight}>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={theme.colors.text}
          />
        </Pressable>
      ) : (
        <View style={styles.headerSideRight} />
      )}
    </View>
  );
}

/* ---------- Field with label inside the box ---------- */
type AuthFieldProps = TextInputProps & {
  label: string;
  secureToggle?: boolean;
  error?: boolean;
};

export function AuthField({
  label,
  secureToggle,
  error,
  style,
  ...inputProps
}: AuthFieldProps) {
  const { theme } = useTheme();
  const [hidden, setHidden] = useState(true);
  const styles = createSharedStyles(theme);

  return (
    <View
      style={[
        styles.field,
        error ? styles.fieldError : styles.fieldDefault,
      ]}
    >
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          {...inputProps}
          secureTextEntry={secureToggle ? hidden : inputProps.secureTextEntry}
          placeholderTextColor={theme.colors.icon}
          autoCapitalize={inputProps.autoCapitalize ?? "none"}
          autoCorrect={false}
          style={[styles.fieldInput, style]}
        />
      </View>
      {secureToggle ? (
        <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8}>
          <Ionicons
            name={hidden ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={theme.colors.icon}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

/* ---------- Lime main button ---------- */
export function AuthButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { theme } = useTheme();
  const styles = createSharedStyles(theme);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

/* ---------- White outlined social button ---------- */
export function SocialButton({
  icon,
  title,
  onPress,
  disabled,
}: {
  icon: string;
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { theme } = useTheme();
  const styles = createSharedStyles(theme);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.social,
        disabled && styles.disabled,
      ]}
    >
      <Ionicons name={icon as any} size={18} color={theme.colors.text} />
      <Text style={styles.socialText}>{title}</Text>
    </Pressable>
  );
}

/* ---------- Screen wrapper ---------- */
export function AuthSafeArea({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const styles = createSharedStyles(theme);
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      {children}
    </SafeAreaView>
  );
}

export function IconBadge({
  icon,
  background,
  size = 86,
  iconColor,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  background: string;
  size?: number;
  iconColor?: string;
}) {
  const { theme } = useTheme();
  const badgeStyles = StyleSheet.create({
    container: {
      alignSelf: "center",
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: background,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <View style={badgeStyles.container}>
      <Ionicons
        name={icon}
        size={size * 0.4}
        color={iconColor ?? theme.colors.text}
      />
    </View>
  );
}

export function InfoCard({ title, text }: { title: string; text: string }) {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    container: {
      borderRadius: 12,
      padding: 14,
      backgroundColor: theme.colors.statsBackground,
    },
    title: {
      fontSize: responsiveFontSize(1.5),
      fontWeight: "800",
      color: theme.colors.text,
    },
    text: {
      marginTop: 4,
      fontSize: responsiveFontSize(1.3),
      lineHeight: responsiveFontSize(1.9),
      color: theme.colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

export function OutlineButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    button: {
      height: 54,
      borderRadius: 27,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      fontSize: responsiveFontSize(1.7),
      fontWeight: "700",
      color: theme.colors.text,
    },
  });

  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const createSharedStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
  },
  headerSide: { width: 40, justifyContent: "center" },
  headerSideRight: { width: 40, alignItems: "flex-end", justifyContent: "center" },
  headerTitle: {
    flex: 1,
    fontSize: responsiveFontSize(2.2),
    fontWeight: "800",
    color: theme.colors.text,
  },

  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  fieldDefault: { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
  fieldError: { backgroundColor: theme.colors.card, borderColor: theme.colors.danger },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: responsiveFontSize(1.2), color: theme.colors.textSecondary },
  fieldInput: {
    paddingVertical: 2,
    paddingHorizontal: 0,
    fontSize: responsiveFontSize(1.7),
    fontWeight: "500",
    color: theme.colors.text,
  },

  button: {
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: responsiveFontSize(1.75), fontWeight: "700", color: theme.colors.onPrimary },
  disabled: { opacity: 0.5 },

  social: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  socialText: { fontSize: responsiveFontSize(1.6), fontWeight: "700", color: theme.colors.text },
});