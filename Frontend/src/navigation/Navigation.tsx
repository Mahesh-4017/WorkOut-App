import React from "react";
import { View, Text } from "react-native";
import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Welcome from "../pages/welcome/Welcome";
import Splash from "../pages/welcome/Splash";
import Gender from "../pages/welcome/Gender";
import BodyInfo from "../pages/welcome/BodyInfo";
import Goal from "../pages/welcome/Goal";
import Details from "../pages/details/Details";
import WorkoutCalendar from "../pages/Calendar/WorkoutCalendar";
import { ROUTES } from "./routes";
import AppHeader from "../components/AppHeader";
import Workout from "../pages/workout/Workout";
import MainTabs from "./MainTabs";
import LoginScreen from "../pages/auth/Login";
import RegisterScreen from "../pages/auth/Register";
import ForgotPasswordScreen from "../pages/auth/ForgetPassword";
import ExerciseDetailsScreen from "../components/ExerciseDetailsScreen";
import { exercises } from "../data/exercises";
import {
    EditGoalsScreen,
    GoalDetailScreen,
    HelpSupportScreen,
    SettingsScreen,
} from "../pages/profile/ProfileUtilityScreens";

const PlaceholderScreen = ({ routeName }: { routeName: string }) => (
    <View
        style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
        }}
    >
        <Text style={{ color: "#111111", fontSize: 24, fontWeight: "700" }}>
            {routeName}
        </Text>
    </View>
);

const RootStack = createNativeStackNavigator({
    initialRouteName: ROUTES.SPLASH,

    screens: {
        [ROUTES.SPLASH]: {
            screen: Splash,
            options: { headerShown: false },
        },

        [ROUTES.WELCOME]: {
            screen: Welcome,
            options: { headerShown: false },
        },

        [ROUTES.GENDER]: {
            screen: Gender,
            options: { headerShown: false },
        },

        [ROUTES.BODY_INFO]: {
            screen: BodyInfo,
            options: { headerShown: false },
        },

        [ROUTES.GOAL]: {
            screen: Goal,
            options: { headerShown: false },
        },

        [ROUTES.HOME]: {
            screen: MainTabs,
            initialParams: { tab: "home" },
            options: { headerShown: false },
        },

        [ROUTES.ANALYSIS]: {
            screen: MainTabs,
            initialParams: { tab: "analysis" },
            options: { headerShown: false },
        },

        [ROUTES.DETAILS]: {
            screen: Details,
            options: { headerShown: false },
        },

        [ROUTES.LOGIN]: {
            screen: LoginScreen,
            options: { headerShown: false },
        },

        [ROUTES.REGISTER]: {
            screen: RegisterScreen,
            options: { headerShown: false },
        },

        [ROUTES.FORGET]: {
            screen: ForgotPasswordScreen,
            options: { headerShown: false },
        },

        [ROUTES.WORKOUTCALENDAR]: {
            screen: MainTabs,
            initialParams: { tab: "calendar" },
            options: { headerShown: false },
        },

        [ROUTES.EXERCISE_DETAIL]: {
            screen: ExerciseDetailsScreen,
            options: {
                headerShown: true,
                header: ({ route }) => {
                    const exerciseId = (
                        route.params as { exerciseId?: string } | undefined
                    )?.exerciseId;
                    const exercise = exercises.find(
                        item => item.id === exerciseId
                    );

                    return (
                        <AppHeader
                            title={exercise?.name ?? "Exercise"}
                            showBack={true}
                        />
                    );
                },
            },
        },


        [ROUTES.WORKOUT]: {
            screen: Workout,
            options: {
                headerShown: true,
                header: ({ navigation }) => (
                    <AppHeader
                        title="Today's Workout"
                        showBack={true}
                    />
                ),
            },
        },

        [ROUTES.ACTIVE_WORKOUT]: {
            screen: () => <PlaceholderScreen routeName={ROUTES.ACTIVE_WORKOUT} />,
            options: { headerShown: false },
        },

        [ROUTES.PROFILE]: {
            screen: MainTabs,
            initialParams: { tab: "profile" },
            options: { headerShown: false },
        },

        [ROUTES.NOTIFICATIONS]: {
            screen: () => <PlaceholderScreen routeName={ROUTES.NOTIFICATIONS} />,
            options: { headerShown: false },
        },

        [ROUTES.SETTINGS]: {
            screen: SettingsScreen,
            options: { headerShown: false },
        },

        [ROUTES.HELP_SUPPORT]: {
            screen: HelpSupportScreen,
            options: { headerShown: false },
        },

        [ROUTES.EDIT_GOALS]: {
            screen: EditGoalsScreen,
            options: { headerShown: false },
        },

        [ROUTES.GOAL_DETAIL]: {
            screen: GoalDetailScreen,
            options: { headerShown: false },
        },
    },
});

const Navigation = createStaticNavigation(RootStack);

export default Navigation;