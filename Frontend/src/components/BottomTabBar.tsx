import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../theme/ThemeProvider";
import { ROUTES } from "../navigation/routes";
import { WORKOUT_ROUTES } from "../navigation/workoutRoutes";

// Internal names kept compatible with existing screens
// (activeTab="calendar" | "analysis" | "profile" still work).
type TabName = "home" | "workout" | "calendar" | "analysis" | "profile";
type WorkoutTabName = "welcome" | "hub" | "explore" | "favorites";
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

type TabItem = {
    name: TabName;
    label: string;
    route: string;
    icon: IoniconName;
    activeIcon: IoniconName;
};

type BottomTabBarProps = {
    activeTab: TabName;
    onTabPress?: (tab: TabName) => void;
    variant?: "main" | "workout";
    workoutActiveTab?: WorkoutTabName;
};

const TABS: TabItem[] = [
    { name: "home", label: "Home", route: ROUTES.HOME, icon: "home-outline", activeIcon: "home" },
    { name: "workout", label: "Exercises", route: WORKOUT_ROUTES.WELCOME, icon: "barbell-outline", activeIcon: "barbell" },
    { name: "calendar", label: "Activity", route: ROUTES.WORKOUTCALENDAR, icon: "pulse-outline", activeIcon: "pulse" },
    { name: "analysis", label: "Progress", route: ROUTES.ANALYSIS, icon: "stats-chart-outline", activeIcon: "stats-chart" },
    { name: "profile", label: "More", route: ROUTES.PROFILE, icon: "ellipsis-horizontal-circle-outline", activeIcon: "ellipsis-horizontal-circle" },
];

const WORKOUT_TABS: (TabItem & { workoutName: WorkoutTabName })[] = [
    { name: "workout", workoutName: "welcome", label: "Welcome", route: WORKOUT_ROUTES.WELCOME, icon: "sparkles-outline", activeIcon: "sparkles" },
    { name: "workout", workoutName: "hub", label: "Workout", route: WORKOUT_ROUTES.HUB, icon: "barbell-outline", activeIcon: "barbell" },
    { name: "workout", workoutName: "explore", label: "Explore", route: WORKOUT_ROUTES.EXPLORE, icon: "search-outline", activeIcon: "search" },
    { name: "workout", workoutName: "favorites", label: "Saved", route: WORKOUT_ROUTES.FAVORITES, icon: "heart-outline", activeIcon: "heart" },
];

const BottomTabBar = ({
    activeTab,
    onTabPress,
    variant = "main",
    workoutActiveTab,
}: BottomTabBarProps) => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const tabs = variant === "workout" ? WORKOUT_TABS : TABS;

    return (
        <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            {tabs.map(tab => {
                const selected = variant === "workout"
                    ? "workoutName" in tab && tab.workoutName === workoutActiveTab
                    : tab.name === activeTab;
                return (
                <TabButton
                    key={tab.route}
                    tab={tab}
                    active={selected}
                    styles={styles}
                    theme={theme}
                    onPress={() => {
                        if (variant === "workout") {
                            if (!selected) navigation.navigate(tab.route);
                            return;
                        }
                        if (onTabPress) {
                            onTabPress(tab.name);
                            return;
                        }
                        if (activeTab !== tab.name) navigation.navigate(tab.route);
                    }}
                />
                );
            })}
        </View>
    );
};

function TabButton({
    tab,
    active,
    styles,
    theme,
    onPress,
}: {
    tab: TabItem;
    active: boolean;
    styles: any;
    theme: any;
    onPress: () => void;
}) {
    // 0 = inactive, 1 = active. The pill and the press feedback both
    // run on native-driver transforms/opacity only.
    const progress = useRef(new Animated.Value(active ? 1 : 0)).current;
    const pressScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(progress, {
            toValue: active ? 1 : 0,
            useNativeDriver: true,
            tension: 180,
            friction: 14,
        }).start();
    }, [active, progress]);

    const pressTo = (toValue: number) =>
        Animated.spring(pressScale, { toValue, useNativeDriver: true, speed: 30, bounciness: 6 }).start();

    const pillScaleX = progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

    return (
        <Pressable
            style={styles.item}
            onPress={onPress}
            onPressIn={() => pressTo(0.92)}
            onPressOut={() => pressTo(1)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
        >
            <Animated.View style={[styles.itemInner, { transform: [{ scale: pressScale }] }]}>
                <View style={styles.iconWrap}>
                    <Animated.View
                        pointerEvents="none"
                        style={[styles.pill, { opacity: progress, transform: [{ scaleX: pillScaleX }] }]}
                    />
                    <Ionicons
                        name={active ? tab.activeIcon : tab.icon}
                        size={21}
                        color={active ? theme.colors.onPrimary : theme.colors.icon}
                    />
                </View>
                <Text
                    numberOfLines={1}
                    style={[styles.label, active && styles.labelActive]}
                >
                    {tab.label}
                </Text>
            </Animated.View>
        </Pressable>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        bar: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: "row",
            paddingTop: 8,
            paddingHorizontal: 6,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            elevation: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
        },

        item: { flex: 1, alignItems: "center" },
        itemInner: { alignItems: "center", minWidth: 56 },

        iconWrap: {
            width: 56,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
        },

        pill: {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            borderRadius: 15,
            backgroundColor: theme.colors.primary,
        },

        label: {
            marginTop: 3,
            fontSize: 10,
            fontFamily: theme.typography.fontFamilyMedium,
            color: theme.colors.icon,
        },

        labelActive: {
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamilyBold,
        },
    });

export default BottomTabBar;