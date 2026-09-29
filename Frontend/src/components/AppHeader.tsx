import React from "react";
import { View, Text, Pressable } from "react-native";
import {
  responsiveFontSize,
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
        height: 110,
        flexDirection: "row",
        alignItems: "flex-end",
        paddingBottom: 10,
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
                fontSize: 32,
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
            fontWeight: "800",
            color: theme.colors.text,
            fontSize: responsiveFontSize(3.4),
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
              fontSize: responsiveFontSize(1.5),
              fontWeight: "400",
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
          fontSize: responsiveFontSize(3),
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
