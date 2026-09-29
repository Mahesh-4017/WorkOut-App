import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Animated,
    Easing,
} from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";

import { useTheme } from "../theme/ThemeProvider";
import { ROUTES } from "../navigation/routes";

type TabName = "home" | "calendar" | "analysis" | "profile";
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

type BottomTabBarProps = {
    activeTab: TabName;
    onTabPress?: (tab: TabName) => void;
};

const BottomTabBar = ({ activeTab, onTabPress }: BottomTabBarProps) => {
    const navigation = useNavigation<any>();

    const { theme } = useTheme();
    const styles = createStyles(theme);

    const tabs: Array<{
        name: TabName;
        label: string;
        route: string;
        icon: IoniconName;
        activeIcon: IoniconName;
    }> = [
        {
            name: "home" as TabName,
            label: "Home",
            route: ROUTES.HOME,
            icon: "home-outline",
            activeIcon: "home",
        },
        {
            name: "calendar" as TabName,
            label: "Calendar",
            route: ROUTES.WORKOUTCALENDAR,
            icon: "calendar-outline",
            activeIcon: "calendar",
        },
        {
            name: "analysis" as TabName,
            label: "Analysis",
            route: ROUTES.ANALYSIS,
            icon: "stats-chart-outline",
            activeIcon: "stats-chart",
        },
        {
            name: "profile" as TabName,
            label: "Profile",
            route: ROUTES.PROFILE,
            icon: "person-outline",
            activeIcon: "person",
        },
    ];

    return (
        <View style={styles.bottomNav}>
            {tabs.map((tab) => (
                <AnimatedTab
                    key={tab.name}
                    tab={tab}
                    active={activeTab === tab.name}
                    styles={styles}
                    theme={theme}
                    onPress={() => {
                        if (onTabPress) {
                            onTabPress(tab.name);
                            return;
                        }
                        navigation.navigate(tab.route);
                    }}
                />
            ))}
        </View>
    );
};

function AnimatedTab({
    tab,
    active,
    styles,
    theme,
    onPress,
}: {
    tab: {
        name: TabName;
        label: string;
        route: string;
        icon: IoniconName;
        activeIcon: IoniconName;
    };
    active: boolean;
    styles: any;
    theme: any;
    onPress: () => void;
}) {
    // Single driver (0 = inactive, 1 = active) — every visual property
    // (pill width/opacity, icon color, label reveal, lift) derives from
    // this one value so everything animates in lockstep, no drift.
    const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

    // Separate driver just for the press-down "tap" feedback.
    const pressScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(progress, {
            toValue: active ? 1 : 0,
            useNativeDriver: false, // color/width interpolation needs JS driver
            tension: 180,
            friction: 14,
        }).start();
    }, [active, progress]);

    const handlePressIn = () => {
        Animated.spring(pressScale, {
            toValue: 0.9,
            useNativeDriver: false,
            speed: 40,
            bounciness: 6,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(pressScale, {
            toValue: 1,
            useNativeDriver: false,
            speed: 14,
            bounciness: 9,
        }).start();
    };

    const lift = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -3],
    });

    const iconScale = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.06],
    });

    const iconColor = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.icon, theme.colors.onPrimary],
    });

    const pillOpacity = progress.interpolate({
        inputRange: [0, 0.4, 1],
        outputRange: [0, 0.6, 1],
    });

    const pillScaleX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 1],
    });

    const labelColor = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.icon, theme.colors.onPrimary],
    });

    const labelWeight = active ? "700" : "500";

    return (
        <Pressable
            style={styles.navItem}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            hitSlop={8}
        >
            <Animated.View
                style={[
                    styles.navContent,
                    {
                        transform: [
                            { translateY: lift },
                            { scale: pressScale },
                        ],
                    },
                ]}
            >
                {/* Pill background — scales in from the icon's center,
                    fades in, rather than snapping on. */}
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.pill,
                        {
                            opacity: pillOpacity,
                            transform: [{ scaleX: pillScaleX }],
                            backgroundColor: theme.colors.primary,
                        },
                    ]}
                />

                {/* ICON */}
                <Animated.View
                    style={[
                        styles.iconContainer,
                        { transform: [{ scale: iconScale }] },
                    ]}
                >
                    <Ionicons
                        name={active ? tab.activeIcon : tab.icon}
                        size={22}
                        color={active ? theme.colors.onPrimary : theme.colors.icon}
                    />
                </Animated.View>

                {active && (
                    <Text style={styles.navLabel}>{tab.label}</Text>
                )}
            </Animated.View>
        </Pressable>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        bottomNav: {
            position: "absolute",
            left: 18,
            right: 18,
            bottom: 10,
            height: 62,
            borderRadius: 31,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            elevation: 10,
            shadowColor: theme.colors.black,
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.14,
            shadowRadius: 12,
        },

        navItem: {
            flex: 1,
            height: 62,
            alignItems: "center",
            justifyContent: "center",
        },

        navContent: {
            height: 42,
            paddingHorizontal: 12,
            borderRadius: 21,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
        },

        pill: {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            borderRadius: 21,
        },

        iconContainer: {
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: "center",
            justifyContent: "center",
        },

        labelContainer: {
            overflow: "hidden",
            justifyContent: "center",
        },

        navLabel: {
            fontFamily: theme.typography.fontFamilyMedium,
            color: theme.colors.onPrimary,
            fontSize: theme.typography.sizes.xs,
            fontWeight: theme.typography.weights.bold,
            marginLeft: 5,
        },
    });

export default BottomTabBar;