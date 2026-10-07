import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { FOOD_ROUTES } from "../../../navigation/foodRoutes";
import { useTheme } from "../../../theme/ThemeProvider";
import { OnboardingHeader, PrimaryButton } from "../../../components/OnboardingUI";

export default function FoodWelcome() {
	const navigation = useNavigation<any>();
	const { theme } = useTheme();
	const styles = createStyles(theme);

	const openDiary = () => navigation.replace(FOOD_ROUTES.HOME, { tab: "diary" });

	return (
		<SafeAreaView style={styles.screen}>
			<OnboardingHeader title="Food & nutrition" onBack={() => navigation.goBack()} />
			<View style={styles.content}>
				<View style={styles.iconCircle}>
					<Ionicons name="nutrition-outline" size={42} color={theme.colors.onPrimary} />
				</View>
				<Text style={styles.eyebrow}>YOUR FOOD SPACE</Text>
				<Text style={styles.title}>Eat with more clarity.</Text>
				<Text style={styles.description}>
					Keep a simple meal diary, see your daily macros, and scan a plate for a quick nutrition estimate.
				</Text>

				<View style={styles.featureList}>
					<View style={styles.featureRow}>
						<Ionicons name="restaurant-outline" size={19} color={theme.colors.primaryDark} />
						<Text style={styles.featureText}>Meals and calories in one daily view</Text>
					</View>
					<View style={styles.featureRow}>
						<Ionicons name="scan-outline" size={19} color={theme.colors.primaryDark} />
						<Text style={styles.featureText}>Photo-based meal estimates</Text>
					</View>
					<View style={styles.featureRow}>
						<Ionicons name="water-outline" size={19} color={theme.colors.primaryDark} />
						<Text style={styles.featureText}>A separate hydration tracker</Text>
					</View>
				</View>

				<Text style={styles.note}>Photo estimates are approximate. You can review and edit every result.</Text>
			</View>
			<View style={styles.actions}>
				<PrimaryButton label="Open food diary" onPress={openDiary} />
				<Pressable onPress={() => navigation.navigate(FOOD_ROUTES.SCAN_INTRO)} style={styles.secondary} accessibilityRole="button">
					<Text style={styles.secondaryText}>Scan a meal</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}

const createStyles = (theme: any) =>
	StyleSheet.create({
		screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 22, paddingBottom: 18 },
		content: { flex: 1, justifyContent: "center" },
		iconCircle: {
			width: 86,
			height: 86,
			borderRadius: 43,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: theme.colors.primary,
			marginBottom: 22,
		},
		eyebrow: { color: theme.colors.primaryDark, fontSize: 11, fontFamily: theme.typography.fontFamilyBold },
		title: { color: theme.colors.text, fontSize: 30, lineHeight: 36, marginTop: 8, fontFamily: theme.typography.fontFamilyBold },
		description: { color: theme.colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8, fontFamily: theme.typography.fontFamily },
		featureList: { gap: 16, marginTop: 28 },
		featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
		featureText: { flex: 1, color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyMedium },
		note: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 24, fontFamily: theme.typography.fontFamily },
		actions: { gap: 8 },
		secondary: { minHeight: 48, alignItems: "center", justifyContent: "center" },
		secondaryText: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
	});
