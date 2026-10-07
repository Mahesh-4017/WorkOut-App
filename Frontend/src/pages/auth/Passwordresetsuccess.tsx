import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  responsiveFontSize,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useTheme } from "../../theme/ThemeProvider";
import { ROUTES } from "../../navigation/routes";
import {
  AuthButton,
  AuthHeader,
  AuthSafeArea,
  IconBadge,
  InfoCard,
} from "./AuthComponents";

export default function PasswordResetSuccessScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { target = "" } = (route.params ?? {}) as { target?: string };

  const goToLogin = () =>
    navigation.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] });

  return (
    <AuthSafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <AuthHeader title="Password reset success" onBack={goToLogin} />

        <View style={styles.badgeWrap}>
          <IconBadge
            icon="checkmark-circle-outline"
            background={theme.colors.primary}
            iconColor={theme.colors.onPrimary}
          />
        </View>

        <Text style={styles.title}>Password updated.</Text>
        <Text style={styles.subtitle}>
          You&apos;re all set. Log in with your new password and get back to
          your next little win.
        </Text>

        <View style={styles.card}>
          <InfoCard
            title="Your account is secure"
            text={`A confirmation has been sent to ${target}. Your goals and workout history are untouched.`}
          />
        </View>

        <View style={styles.spacer} />

        <AuthButton title="Back to Login" onPress={goToLogin} />
      </ScrollView>
    </AuthSafeArea>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
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
    card: { marginTop: 18 },
  });