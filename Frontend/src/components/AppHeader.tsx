import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Header } from "@codeherence/react-native-header";
import { useSharedValue } from "react-native-reanimated";
import {
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { useTheme } from "../theme/ThemeProvider";

type AppHeaderProps = {
  title: string;
  description?: string;
  showBack?: boolean;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
};

export default function AppHeader({
  title,
  description,
  showBack = true,
  rightIcon,
  onRightPress,
  rightAccessibilityLabel = "Header action",
}: AppHeaderProps) {
  const navigation = useNavigation<NavigationProp<any>>();
  const { theme } = useTheme();
  const showNavBar = useSharedValue(1);
  const styles = StyleSheet.create({
    header: {
      minHeight: 70,
      backgroundColor: theme.colors.background,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 70,
    },
    backSlot: {
      width: showBack ? 42 : 0,
      alignItems: "flex-start",
      justifyContent: "center",
      overflow: "hidden",
    },
    iconButton: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 19,
      backgroundColor: theme.colors.surface,
    },
    titleGroup: { flex: 1, paddingLeft: showBack ? 9 : 0, minWidth: 0 },
    title: {
      fontFamily: theme.typography.fontFamilyBold,
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
    },
    description: {
      marginTop: 2,
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.regular,
      color: theme.colors.textSecondary,
    },
    rightIconButton: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 19,
      backgroundColor: theme.colors.card,
    },
  });

  return (
    <Header
      showNavBar={showNavBar}
      ignoreTopSafeArea
      headerStyle={styles.header}
      initialBorderColor={theme.colors.border}
      borderColor={theme.colors.border}
      headerLeft={
        <View style={styles.headerContent}>
          <View style={styles.backSlot}>
            {showBack ? (
              <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <View style={styles.iconButton}>
                  <Ionicons name="arrow-back" size={18} color={theme.colors.icon} />
                </View>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.titleGroup}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {description ? (
              <Text style={styles.description} numberOfLines={1}>{description}</Text>
            ) : null}
          </View>
        </View>
      }
      headerRight={rightIcon ? (
        <Pressable
          onPress={onRightPress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={rightAccessibilityLabel}
        >
          <View style={styles.rightIconButton}>{rightIcon}</View>
        </Pressable>
      ) : null}
    />
  );
}
