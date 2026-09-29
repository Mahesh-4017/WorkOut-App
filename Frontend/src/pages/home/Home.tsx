import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../theme/ThemeProvider";
import BottomTabBar from "../../components/BottomTabBar";
import { ROUTES } from "../../navigation/routes";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import React from "react";
import { useUser } from "../../data/UserProvider";
import { useAuth } from "../../context/AuthContext";
import { getFeaturedCards, ApiCard } from "../../api/cards";

// Responsive helpers based on a 375 x 812 reference phone.
// They keep your current design proportions while adapting to other screens.
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const rw = (value: number) =>
    responsiveWidth((value / BASE_WIDTH) * 100);

const rh = (value: number) =>
    responsiveHeight((value / BASE_HEIGHT) * 100);

const rf = (value: number) =>
    responsiveFontSize((value / BASE_HEIGHT) * 100);


export default function Home() {
    const navigation = useNavigation<any>();
    const { theme, isDark, toggleTheme } = useTheme();
    const { name, history } = useUser();
    const { user } = useAuth();
    const styles = createStyles(theme);
    const [today] = React.useState(() => new Date());
    const [featuredCards, setFeaturedCards] = React.useState<ApiCard[]>([]);
    const [cardsLoading, setCardsLoading] = React.useState(true);

    React.useEffect(() => {
        let mounted = true;
        getFeaturedCards(user?.gender)
            .then(cards => {
                if (mounted) setFeaturedCards(cards);
            })
            .catch(() => {
                if (mounted) setFeaturedCards([]);
            })
            .finally(() => {
                if (mounted) setCardsLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, [user?.gender]);

    const dates = React.useMemo(() => Array.from({ length: 14 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        return {
            day: date.toLocaleDateString(undefined, { weekday: "short" }),
            date: String(date.getDate()).padStart(2, "0"),
            dateString: date.toISOString().slice(0, 10),
            active: index === 0,
        };
    }), [today]);
    const todayLabel = today.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
    const monthLabel = today.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    const completion = Math.min(history.length / 5, 1);

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        {/* User */}
                        <View style={styles.userSection}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                                <View style={styles.onlineDot} />
                            </View>

                            <View style={styles.userInfo}>
                                <Text style={styles.welcomeText}>
                                    Welcome back 👋
                                </Text>

                                <Text style={styles.hello}>
                                    {name}
                                </Text>

                                <Text style={styles.today}>
                                    {todayLabel}
                                </Text>
                            </View>
                        </View>

                        {/* Header actions */}
                        <View style={styles.headerActions}>
                            {/* Theme toggle */}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.themeButton}
                                onPress={toggleTheme}
                            >
                                <Text style={styles.themeIcon}>
                                    {isDark ? "☀" : "☾"}
                                </Text>
                            </TouchableOpacity>

                            {/* Notification */}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.notification}
                                onPress={() =>
                                    navigation.navigate(ROUTES.LOGIN)
                                }
                            >
                                <Text style={styles.notificationIcon}>
                                    ♧
                                </Text>

                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationBadgeText}>
                                        3
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Daily Challenge */}
                    <View style={styles.challenge}>
                        <View style={styles.challengeText}>
                            <Text style={styles.challengeLabel}>DAILY CHALLENGE</Text>
                            <Text style={styles.challengeTitle}>Complete your workout</Text>
                            <Text style={styles.challengeSubtitle}>Before 09:00 AM</Text>

                            <View style={styles.challengeBottom}>
                                <View style={styles.challengePeople}>
                                    <View style={styles.miniAvatar}>
                                        <Text>👨🏻</Text>
                                    </View>
                                    <View style={styles.miniAvatar}>
                                        <Text>👩🏻</Text>
                                    </View>
                                    <View style={styles.miniAvatar}>
                                        <Text>👨🏽</Text>
                                    </View>
                                    <View style={styles.morePeople}>
                                        <Text style={styles.moreText}>+8</Text>
                                    </View>
                                </View>

                                <Text style={styles.challengeJoined}>Joined today</Text>
                            </View>
                        </View>

                        <Image
                            source={require("../../assets/challenge.png")}
                            style={styles.challengeImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Date selector */}
                    <View style={styles.datePickerContainer}>
                        <View style={styles.datePickerHeader}>
                            <Text style={styles.datePickerTitle}>Choose a day</Text>
                            <Text style={styles.datePickerMonth}>{monthLabel}</Text>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.dateScroll}
                            decelerationRate="fast"
                        >
                            {dates.map((item) => (
                                <TouchableOpacity
                                    key={item.date}
                                    activeOpacity={0.75}
                                    onPress={() =>
                                        navigation.navigate(ROUTES.WORKOUTCALENDAR, {
                                            selectedDate: item.dateString,
                                        })
                                    }
                                    style={[
                                        styles.dateItem,
                                        item.active && styles.dateItemActive,
                                    ]}
                                >
                                    <Text style={[styles.dateDay, item.active && styles.dateTextActive]}>
                                        {item.day}
                                    </Text>
                                    <Text style={[styles.dateNumber, item.active && styles.dateTextActive]}>
                                        {item.date}
                                    </Text>
                                    {item.active && <View style={styles.dateActiveDot} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Start Workout CTA */}
                    <TouchableOpacity
                        activeOpacity={0.88}
                        style={styles.startWorkoutCard}
                        onPress={() => navigation.navigate(ROUTES.WORKOUT)}
                    >
                        <View style={styles.startWorkoutContent}>
                            <View>
                                <Text style={styles.startWorkoutLabel}>READY TO TRAIN?</Text>
                                <Text style={styles.startWorkoutTitle}>Start Your Workout</Text>
                                <Text style={styles.startWorkoutSubtitle}>Let's crush your goals today</Text>
                            </View>

                            <View style={styles.startWorkoutArrow}>
                                <Text style={styles.startWorkoutArrowText}>→</Text>
                            </View>
                        </View>

                        <View style={styles.startWorkoutBottom}>
                            <View style={styles.workoutProgress}>
                                <View style={[styles.workoutProgressFill, { width: `${completion * 100}%` }]} />
                            </View>

                            <Text style={styles.workoutProgressText}>{Math.round(completion * 100)}% completed</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Published sessions from the Express API */}
                    <View style={styles.featuredHeader}>
                        <View>
                            <Text style={styles.programTitle}>Featured sessions</Text>
                            <Text style={styles.programSubtitle}>Fresh content from your library</Text>
                        </View>
                    </View>
                    {cardsLoading ? (
                        <Text style={styles.apiMessage}>Loading sessions...</Text>
                    ) : featuredCards.length === 0 ? (
                        <Text style={styles.apiMessage}>No featured sessions yet.</Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
                            {featuredCards.map(card => (
                                <TouchableOpacity
                                    key={card._id}
                                    activeOpacity={0.85}
                                    style={styles.featuredCard}
                                    onPress={() => Linking.openURL(card.videoUrl)}
                                >
                                    {card.thumbnailUrl ? (
                                        <Image source={{ uri: card.thumbnailUrl }} style={styles.featuredImage} />
                                    ) : (
                                        <View style={[styles.featuredImage, styles.featuredPlaceholder]}>
                                            <Text style={styles.featuredPlay}>▶</Text>
                                        </View>
                                    )}
                                    <Text numberOfLines={1} style={styles.featuredTitle}>{card.title}</Text>
                                    <Text numberOfLines={2} style={styles.featuredDescription}>{card.description}</Text>
                                    <Text numberOfLines={1} style={styles.featuredCategory}>{card.category} · {card.audience === "all" ? "Everyone" : card.audience}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                </ScrollView>

            </SafeAreaView>
        </View>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            paddingTop: 25,
        },

        safeArea: {
            flex: 1,
        },

        scrollContent: {
            paddingHorizontal: 18,
            paddingBottom: 118,
        },

        /* Header */

        header: {
            minHeight: 72,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
        },

        userSection: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },

        avatar: {
            width: responsiveWidth(10),
            height: responsiveHeight(4),
            borderRadius: 25,
            backgroundColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 11,
            elevation: 3,
        },

        avatarText: {
            color: theme.colors.onPrimary,
             fontSize: responsiveFontSize(3),
            fontWeight: "800",
        },

        onlineDot: {
            position: "absolute",
            width: rw(11),
            height: rh(11),
            borderRadius: 6,
            right: 0,
            bottom: 1,
            backgroundColor: theme.colors.success,
            borderWidth: 2,
            borderColor: theme.colors.background,
        },

        userInfo: {
            justifyContent: "center",
        },

        welcomeText: {
            color: theme.colors.muted,
            fontSize: rf(11),
            fontWeight: "500",
            marginBottom: 1,
        },

        hello: {
            color: theme.colors.text,
            fontSize: rf(16),
            fontWeight: "800",
            letterSpacing: 0.2,
        },

        today: {
            color: theme.colors.muted,
            fontSize: rf(10),
            marginTop: 3,
        },

        headerActions: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
        },

        themeButton: {
            width: rw(40),
            height: rh(40),
            borderRadius: 25,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: "center",
            justifyContent: "center",
        },

        themeIcon: {
            color: theme.colors.primary,
            fontSize: rf(15),
            fontWeight: "700",
        },

        notification: {
            width: rw(40),
            height: rh(40),
            borderRadius: 25,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
        },

        notificationIcon: {
            color: theme.colors.text,
            fontSize: rf(19),
        },

        notificationBadge: {
            position: "absolute",
            top: -6,
            right: -5,
            minWidth: rw(18),
            height: rh(18),
            paddingHorizontal: 3,
            borderRadius: 8,
            backgroundColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: theme.colors.background,
        },

        notificationBadgeText: {
            color: theme.colors.onPrimary,
            fontSize: rf(10),
            fontWeight: "800",
        },

        /* Challenge */

        challenge: { height: rh(120), borderRadius: 22, backgroundColor: theme.colors.primary, overflow: "visible", flexDirection: "row", marginBottom: 24, position: "relative", marginTop: 0 }, challengeText: { flex: 1, paddingLeft: 17, paddingTop: 15, paddingBottom: 9, zIndex: 2, }, challengeLabel: { color: theme.colors.primaryDark, fontSize: rf(9), fontWeight: "800", letterSpacing: 1, marginBottom: 5, }, challengeTitle: { color: theme.colors.onPrimary, fontSize: rf(18), lineHeight: 19, fontWeight: "800", maxWidth: 155, }, challengeSubtitle: { color: theme.colors.primaryDark, fontSize: rf(10), fontWeight: "600", marginTop: 5, }, challengeBottom: { flexDirection: "row", alignItems: "center", marginTop: 8, }, challengePeople: { flexDirection: "row", alignItems: "center", }, miniAvatar: { width: rw(25), height: rh(25), borderRadius: 15, backgroundColor: theme.colors.white, alignItems: "center", justifyContent: "center", marginRight: -8, borderWidth: 1, borderColor: theme.colors.primary, overflow: "hidden", }, morePeople: { width: rw(20), height: rh(20), borderRadius: 15, backgroundColor: theme.colors.onPrimary, alignItems: "center", justifyContent: "center", marginLeft: 1, }, moreText: { color: theme.colors.primary, fontSize: rf(8), fontWeight: "800", }, challengeJoined: { color: theme.colors.primaryDark, fontSize: rf(10), fontWeight: "600", marginLeft: 4, }, challengeImage: { width: rw(125), height: rh(140), position: "absolute", right: -7, bottom: 0 },
/* =========================
   Start Workout
========================= */

startWorkoutCard: {
    height: rh(125),
    borderRadius: rw(20),
    backgroundColor: theme.colors.icon,
    paddingHorizontal: rw(18),
    paddingVertical: rh(16),
    marginBottom: rh(25),
    overflow: "hidden",
},

startWorkoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
},

startWorkoutLabel: {
    color: theme.colors.primaryDark,
    fontSize: rf(8),
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: rh(4),
},

startWorkoutTitle: {
    color: theme.colors.onPrimary,
    fontSize: rf(18),
    fontWeight: "800",
},

startWorkoutSubtitle: {
    color: theme.colors.primaryDark,
    fontSize: rf(9),
    fontWeight: "600",
    marginTop: rh(4),
},

startWorkoutArrow: {
    width: rw(48),
    height: rh(48),
    borderRadius: rw(24),
    backgroundColor: theme.colors.onPrimary,
    alignItems: "center",
    justifyContent: "center",
},

startWorkoutArrowText: {
    color: theme.colors.primary,
    fontSize: rf(20),
    fontWeight: "800",
},

startWorkoutBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: rw(8),
},

workoutProgress: {
    flex: 1,
    height: rh(5),
    borderRadius: rh(3),
    backgroundColor: "rgba(255,255,255,0.35)",
    overflow: "hidden",
},

workoutProgressFill: {
    width: "0%",
    height: "100%",
    borderRadius: rh(3),
    backgroundColor: theme.colors.onPrimary,
},

workoutProgressText: {
    color: theme.colors.onPrimary,
    fontSize: rf(7),
    fontWeight: "700",
},
/* =========================
   Date Picker
========================= */

datePickerContainer: {
    marginBottom: 25,
},

datePickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
},

datePickerTitle: {
    color: theme.colors.text,
    fontSize: rf(14),
    fontWeight: "800",
},

datePickerMonth: {
    color: theme.colors.muted,
    fontSize: rf(9),
    fontWeight: "600",
},

dateScroll: {
    paddingRight: 18,
},

dateItem: {
    width: rw(48),
    height: rh(58),
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
},

dateItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    transform: [{ scale: 1.03 }],
},

dateDay: {
    color: theme.colors.muted,
    fontSize: rf(8),
    fontWeight: "600",
    marginBottom: 5,
},

dateNumber: {
    color: theme.colors.text,
    fontSize: rf(15),
    fontWeight: "800",
},

dateTextActive: {
    color: theme.colors.onPrimary,
},

dateActiveDot: {
    width: rw(4),
    height: rh(4),
    borderRadius: 2,
    backgroundColor: theme.colors.onPrimary,
    marginTop: 4,
},
        /* Section */

        programHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, }, programTitle: { color: theme.colors.text, fontSize: rf(15), fontWeight: "800", letterSpacing: -0.2, }, programSubtitle: { color: theme.colors.muted, fontSize: rf(10), marginTop: 3, }, seeAllButton: { height: rh(30), paddingHorizontal: 10, borderRadius: 15, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, flexDirection: "row", alignItems: "center", justifyContent: "center", }, seeAll: { color: theme.colors.text, fontSize: rf(7), fontWeight: "700", }, seeAllArrow: { color: theme.colors.primary, fontSize: rf(11), fontWeight: "800", marginLeft: 5, },

        
categoryRow: {
    paddingBottom: 14,
    paddingRight: 18,
},

category: {
    minWidth: rw(58),
    height: rh(30),
    paddingHorizontal: 13,
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
},

categoryActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    flexDirection: "row",
},

categoryText: {
    color: theme.colors.textSecondary,
    fontSize: rf(9),
    fontWeight: "600",
},

categoryTextActive: {
    color: theme.colors.onPrimary,
    fontWeight: "800",
},

categoryDot: {
    width: rw(4),
    height: rh(4),
    borderRadius: 2,
    backgroundColor: theme.colors.onPrimary,
    marginLeft: 6,
},

        /* Workout cards */
workoutCard: {
    width: "48%",
    marginBottom: 18,
},

workoutImageContainer: {
    height: rh(125),
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: theme.colors.card,
    position: "relative",
},

workoutImage: {
    width: "100%",
    height: "100%",
},

imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
    opacity: 0.28,
},

workoutInfo: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
},

infoBadge: {
    minHeight: 21,
    paddingHorizontal: 7,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.48)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
},

infoIcon: {
    color: theme.colors.white,
    fontSize: rf(8),
    marginRight: 3,
},

infoText: {
    color: theme.colors.white,
    fontSize: rf(6.5),
    fontWeight: "700",
},

playButton: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: rw(38),
    height: rh(38),
    marginLeft: -19,
    marginTop: -19,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
},

playIcon: {
    color: theme.colors.onPrimary,
    fontSize: rf(11),
    marginLeft: 2,
},

workoutDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
},

workoutText: {
    flex: 1,
    paddingRight: 5,
},

workoutTitle: {
    color: theme.colors.text,
    fontSize: rf(10),
    fontWeight: "800",
},

workoutSubtitle: {
    color: theme.colors.muted,
    fontSize: rf(7),
    marginTop: 3,
},

cardArrow: {
    width: rw(25),
    height: rh(25),
    borderRadius: 13,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
},

cardArrowText: {
    color: theme.colors.primary,
    fontSize: rf(11),
    fontWeight: "800",
},
workoutGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 2,
},

featuredHeader: {
    marginTop: 24,
    marginBottom: 12,
},

apiMessage: {
    color: theme.colors.textSecondary,
    fontSize: rf(9),
    marginBottom: 6,
},

featuredRow: {
    paddingBottom: 4,
},

featuredCard: {
    width: rw(178),
    marginRight: 12,
},

featuredImage: {
    width: "100%",
    height: rh(90),
    borderRadius: 14,
    backgroundColor: theme.colors.card,
},

featuredPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
},

featuredPlay: {
    color: theme.colors.primary,
    fontSize: rf(16),
},

featuredTitle: {
    color: theme.colors.text,
    fontSize: rf(9),
    fontWeight: "800",
    marginTop: 7,
},

featuredCategory: {
    color: theme.colors.muted,
    fontSize: rf(7),
    marginTop: 2,
},

featuredDescription: {
    color: theme.colors.textSecondary,
    fontSize: rf(7.5),
    lineHeight: rf(10),
    marginTop: 4,
},
        
    });