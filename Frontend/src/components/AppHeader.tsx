import React from "react";
import { View, Text, Pressable } from "react-native";
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

  return (
    <View
      style={{
        height: 86,
        flexDirection: "row",
        alignItems: "flex-end",
        paddingBottom: 7,
        paddingHorizontal: 15,
        backgroundColor: theme.colors.background,
      }}
    >
      {/* Back Button */}
      <View
        style={{
          width: 40,
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        {showBack && (
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
          >
            <Text
              style={{
                fontFamily: theme.typography.fontFamily,
                fontSize: theme.typography.sizes.display,
                color: theme.colors.text,
                fontWeight: "400",
              }}
            >
              ‹
            </Text>
          </Pressable>
        )}
      </View>

      {/* Title + Description */}
      <View
        style={{
          flex: 1,
          paddingLeft: 10,
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontFamily: theme.typography.fontFamilyBold,
            fontSize: theme.typography.sizes.xl,
            fontWeight: theme.typography.weights.heavy,
            color: theme.colors.text,
            letterSpacing: -0.7,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Description */}
        {description && (
          <Text
            style={{
              marginTop: 1,
              fontFamily: theme.typography.fontFamily,
              fontSize: theme.typography.sizes.xs,
              fontWeight: theme.typography.weights.regular,
              color: theme.colors.text,
              opacity: 0.6,
            }}
            numberOfLines={1}
          >
            {description}
          </Text>
        )}
      </View>

      {/* Right Icon */}
      <View
        style={{
          width: 45,
          alignItems: "flex-end",
        }}

      >
        {rightIcon && (
  <Pressable
    onPress={onRightPress}
    hitSlop={10}
  >
    <View
      style={{
        width: responsiveWidth(11),
        height: responsiveScreenHeight(5),
        borderRadius: 13,
        backgroundColor: theme.colors.card,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text
        style={{
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.sizes.lg,
          color: theme.colors.icon,
        }}
      >
        {rightIcon}
      </Text>
    </View>
  </Pressable>
)}
      </View>
    </View>
  );
}
