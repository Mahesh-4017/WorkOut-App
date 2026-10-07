import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  responsiveScreenHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
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
};

export default function AppHeader({
  title,
  description,
  showBack = true,
  rightIcon,
  onRightPress,
}: AppHeaderProps) {
  const navigation = useNavigation<NavigationProp<any>>();
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    header: { height: 86, flexDirection: "row", alignItems: "flex-end", paddingBottom: 7, paddingHorizontal: 15, backgroundColor: theme.colors.background },
    backSlot: { width: 40, alignItems: "flex-start", justifyContent: "center" },
    backText: { fontFamily: theme.typography.fontFamily, fontSize: theme.typography.sizes.display, color: theme.colors.text, fontWeight: "400" },
    titleGroup: { flex: 1, paddingLeft: 10 },
    title: { fontFamily: theme.typography.fontFamilyBold, fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.heavy, color: theme.colors.text },
    description: { marginTop: 1, fontFamily: theme.typography.fontFamily, fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.regular, color: theme.colors.textSecondary },
    rightSlot: { width: 45, alignItems: "flex-end" },
    rightButton: { width: responsiveWidth(11), height: responsiveScreenHeight(5), borderRadius: 12, backgroundColor: theme.colors.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.colors.border },
    rightText: { fontFamily: theme.typography.fontFamily, fontSize: theme.typography.sizes.lg, color: theme.colors.icon },
  });

  return (
    <View style={styles.header}>
      {/* Back Button */}
      <View style={styles.backSlot}>
        {showBack && (
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </Pressable>
        )}
      </View>

      {/* Title + Description */}
      <View style={styles.titleGroup}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {/* Description */}
        {description && (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>

      {/* Right Icon */}
      <View style={styles.rightSlot}>
        {rightIcon && (
  <Pressable
    onPress={onRightPress}
    hitSlop={10}
  >
    <View style={styles.rightButton}>
      <Text style={styles.rightText}>
        {rightIcon}
      </Text>
    </View>
  </Pressable>
)}
      </View>
    </View>
  );
}
