import React from "react";
import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Welcome from "../pages/welcome/Welcome";
import Splash from "../pages/welcome/Splash";
import Gender from "../pages/details/Gender";
import BodyInfo from "../pages/details/BodyInfo";
import Goal from "../pages/details/Goal";
import Details from "../pages/details/Details";
import { ROUTES } from "./routes";
import AppHeader from "../components/AppHeader";
import Workout from "../pages/workout/Workout";
import ActiveWorkout from "../pages/workout/ActiveWorkout";
import MainTabs from "./MainTabs";
import LoginScreen from "../pages/auth/Login";
import RegisterScreen from "../pages/auth/Register";
import ForgotPasswordScreen from "../pages/auth/ForgetPassword";
import VerifyOtpScreen from "../pages/auth/Verifyotp";
import NewPasswordScreen from "../pages/auth/Newpassword";
import PasswordResetSuccessScreen from "../pages/auth/Passwordresetsuccess";
import ExerciseDetailsScreen from "../components/ExerciseDetailsScreen";
import SplashScreen from "../pages/splash/Splash";
import Welcome_1 from "../pages/welcome/Welcome1";
import Welcome_2 from "../pages/welcome/Welcome2";
import Welcome_3 from "../pages/welcome/Welcome3";
import { exercises } from "../data/exercises";
import {
    EditGoalsScreen,
    GoalDetailScreen,
    HelpSupportScreen,
    LogoutScreen,
    SettingsScreen,
} from "../pages/profile/ProfileUtilityScreens";
import Dashboard from "../pages/profile/Dashboard";
import Permissions from "../pages/details/Permissions";
import RunningWelcome from "../pages/running/welcome/Welcome";
import RunningTabs from "../pages/running/RunningTabs";
import { FOOD_ROUTES } from "./foodRoutes";
import FoodWelcome from "../pages/meal/welcome/Welcome";
import FoodTabs from "../pages/meal/home/Home";
import ScanMealIntro from "../pages/meal/scan-meal/Scan";
import ScanCamera from "../pages/meal/scan-meal/ScanMeal";
import MealAnalysis from "../pages/meal/analysis/Analysis";
import FoodSearch from "../pages/meal/search/Search";
import AddFood from "../pages/meal/add-food/Add";
import NotificationsScreen from "../pages/notifications/Notifications";
import WorkoutHub from "../pages/workout/home/Home";
import WorkoutWelcome from "../pages/workout/welcome/Welcome";
import ExploreWorkouts from "../pages/workout/Explore/Explore";
import WorkoutCollections from "../pages/workout/collection/Collection";
import WorkoutSearch from "../pages/workout/search/Search";
import WorkoutFilters from "../pages/workout/filter/Filter";
import FavoriteWorkouts from "../pages/workout/favorite/Favorite";
import WorkoutDetails from "../pages/workout/details/WorkoutDetails";
import EquipmentSelection from "../pages/workout/details/EquipmentSelection";
import ExerciseDetails from "../pages/workout/details/ExerciseDetails";
import ExerciseInstructions from "../pages/workout/details/ExerciseInstructions";
import ExerciseVideo from "../pages/workout/details/ExerciseVideo";
import LibraryExerciseDetails from "../pages/workout/details/LibraryExerciseDetails";
import WorkoutSchedule from "../pages/workout/schedule/WorkoutSchedule";
import DateClasses from "../pages/workout/schedule/DateClasses";
import ClassDetails from "../pages/workout/schedule/ClassDetails";
import Instructors from "../pages/workout/schedule/Instructors";
import ActiveWorkoutSession from "../pages/workout/session/ActiveWorkout";
import PauseWorkout from "../pages/workout/session/PauseWorkout";
import WorkoutSummary from "../pages/workout/session/WorkoutSummary";
import WorkoutFeedback from "../pages/workout/session/WorkoutFeedback";
import WorkoutHistory from "../pages/workout/session/WorkoutHistory";
import {
    CaloriesProgressScreen,
    GoalProgressScreen,
    MonthlyReportScreen,
    OverallPerformanceScreen,
    PersonalRecordsScreen,
    ProgressOverviewScreen,
    SessionAdherenceScreen,
    StepsProgressScreen,
    WeightProgressScreen,
    WeeklyReportScreen,
    WorkoutStatisticsScreen,
} from "../pages/workout/progress";
import { WORKOUT_ROUTES } from "./workoutRoutes";
import { PROGRESS_ROUTES } from "./progressRoutes";

const RootStack = createNativeStackNavigator({
    initialRouteName: ROUTES.SPLASH_SCREEN,

    screens: {
        [ROUTES.SPLASH_SCREEN]: {
            screen: SplashScreen,
            options: { headerShown: false },
        },
        [ROUTES.SPLASH]: {
            screen: Splash,
            options: { headerShown: false },
        },
        [ROUTES.WELCOME_1]: {
            screen: Welcome_1,
            options: { headerShown: false },
        },
        [ROUTES.WELCOME_2]: {
            screen: Welcome_2,
            options: { headerShown: false },
        },
        [ROUTES.WELCOME_3]: {
            screen: Welcome_3,
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

        [ROUTES.PERMISSIONS]: {
            screen: Permissions,
            options: { headerShown: false },
        },

        [ROUTES.HOME]: {
            screen: MainTabs,
            initialParams: { tab: "home" },
            options: { headerShown: false },
        },

        [ROUTES.RUNNING]: {
            screen: RunningWelcome,
            options: { headerShown: false },
        },

        [ROUTES.RUNNING_HOME]: {
            screen: RunningTabs,
            options: { headerShown: false },
        },

        [FOOD_ROUTES.WELCOME]: {
            screen: FoodWelcome,
            options: { headerShown: false },
        },

        [FOOD_ROUTES.HOME]: {
            screen: FoodTabs,
            options: { headerShown: false },
        },

        [FOOD_ROUTES.SCAN_INTRO]: {
            screen: ScanMealIntro,
            options: { headerShown: false },
        },

        [FOOD_ROUTES.SCAN_CAMERA]: {
            screen: ScanCamera,
            options: { headerShown: false },
        },

        [FOOD_ROUTES.MEAL_ANALYSIS]: {
            screen: MealAnalysis,
            options: { headerShown: false },
        },

        [FOOD_ROUTES.FOOD_SEARCH]: {
            screen: FoodSearch,
            options: { headerShown: false },
        },

        [FOOD_ROUTES.ADD_FOOD]: {
            screen: AddFood,
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
        [ROUTES.VERIFY_OTP]: {
            screen: VerifyOtpScreen,
            options: { headerShown: false },
        },
        [ROUTES.RESET_PASSWORD]: {
            screen: NewPasswordScreen,
            options: { headerShown: false },
        },
        [ROUTES.PASSWORD_RESET_SUCCESS]: {
            screen: PasswordResetSuccessScreen,
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
                header: () => (
                    <AppHeader
                        title="Today's Workout"
                        showBack={true}
                    />
                ),
            },
        },

        [ROUTES.ACTIVE_WORKOUT]: {
            screen: ActiveWorkout,
            options: { headerShown: false },
        },

        [ROUTES.PROFILE]: {
            screen: MainTabs,
            initialParams: { tab: "profile" },
            options: { headerShown: false },
        },

        [ROUTES.DASHBOARD]: {
            screen: Dashboard,
            options: { headerShown: false },
        },

        [ROUTES.LOGOUT]: {
            screen: LogoutScreen,
            options: { headerShown: false },
        },

        [ROUTES.NOTIFICATIONS]: {
            screen: NotificationsScreen,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.WELCOME]: {
            screen: WorkoutWelcome,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.HUB]: {
            screen: WorkoutHub,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.EXPLORE]: {
            screen: ExploreWorkouts,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.COLLECTIONS]: {
            screen: WorkoutCollections,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.SEARCH]: {
            screen: WorkoutSearch,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.FILTERS]: {
            screen: WorkoutFilters,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.FAVORITES]: {
            screen: FavoriteWorkouts,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.DETAILS]: {
            screen: WorkoutDetails,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.EQUIPMENT]: {
            screen: EquipmentSelection,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.EXERCISE]: {
            screen: ExerciseDetails,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.LIBRARY_EXERCISE]: {
            screen: LibraryExerciseDetails,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.INSTRUCTIONS]: {
            screen: ExerciseInstructions,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.VIDEO]: {
            screen: ExerciseVideo,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.SCHEDULE]: {
            screen: WorkoutSchedule,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.DATE_CLASSES]: {
            screen: DateClasses,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.CLASS_DETAILS]: {
            screen: ClassDetails,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.INSTRUCTORS]: {
            screen: Instructors,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.ACTIVE]: {
            screen: ActiveWorkoutSession,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.PAUSE]: {
            screen: PauseWorkout,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.SUMMARY]: {
            screen: WorkoutSummary,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.FEEDBACK]: {
            screen: WorkoutFeedback,
            options: { headerShown: false },
        },

        [WORKOUT_ROUTES.HISTORY]: {
            screen: WorkoutHistory,
            options: { headerShown: false },
        },

        [PROGRESS_ROUTES.OVERVIEW]: {
            screen: ProgressOverviewScreen,
            options: { headerShown: false },
        },

        [PROGRESS_ROUTES.GOAL]: {
            screen: GoalProgressScreen,
            options: { headerShown: false },
        },

        [PROGRESS_ROUTES.WEIGHT]: {
            screen: WeightProgressScreen,
            options: { headerShown: false },
        },

        [PROGRESS_ROUTES.STEPS]: {
            screen: StepsProgressScreen,
            options: { headerShown: false },
        },

        [PROGRESS_ROUTES.CALORIES]: {
            screen: CaloriesProgressScreen,
            options: { headerShown: false },
        },

        [PROGRESS_ROUTES.WORKOUT_STATISTICS]: {
            screen: WorkoutStatisticsScreen,
            options: { headerShown: false },
        },

        [PROGRESS_ROUTES.PERSONAL_RECORDS]: {
            screen: PersonalRecordsScreen,
            options: { headerShown: false },
        },

        [PROGRESS_ROUTES.ADHERENCE]: {
            screen: SessionAdherenceScreen,
            options: { headerShown: false },
        },

        [PROGRESS_ROUTES.OVERALL]: {
            screen: OverallPerformanceScreen,
            options: { headerShown: false },
        },

        [PROGRESS_ROUTES.WEEKLY_REPORT]: {
            screen: WeeklyReportScreen,
            options: { headerShown: false },
        },

        [PROGRESS_ROUTES.MONTHLY_REPORT]: {
            screen: MonthlyReportScreen,
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