import React from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../navigation/routes";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

export default function Welcome() {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            <Image
                source={require("../../assets/Welcome.png")}
                style={styles.backgroundImage}
                resizeMode="cover"
            />

            <View style={styles.overlay} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <View style={styles.bottomContent}>
                        <Text style={styles.title}>
                            {"Care for\nYour Health\nCompanion"}
                        </Text>

                        <Text style={styles.description}>
                            {"Your health is your greatest asset—nurture\nit with mindful choices, regular activity, and\nbalanced habits."}
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.button}
                            onPress={() => navigation.navigate(ROUTES.GENDER)}
                        >
                            <Text style={styles.buttonText}>Get Started</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.secondaryButton}
                            onPress={() => navigation.navigate(ROUTES.LOGIN)}
                        >
                            <Text style={styles.secondaryButtonText}>I already have an account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111111",
    },
    backgroundImage: {
        width: responsiveWidth(100),
        height: responsiveHeight(100),
        position: "absolute",
    },
    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(0, 0, 0, 0.30)",
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: "flex-end",
        paddingHorizontal: 22,
        paddingBottom: 20,
    },
    bottomContent: {
        paddingBottom: 5,
    },
    title: {
        color: "#FFFFFF",
        fontSize: responsiveFontSize(4),
        lineHeight: 34,
        fontWeight: "800",
        letterSpacing: -0.7,
        marginBottom: 18,
    },
    description: {
        color: "rgba(255, 255, 255, 0.78)",
        fontSize: responsiveFontSize(2),
        lineHeight: 20,
        fontWeight: "400",
        marginBottom: 22,
    },
    button: {
        height: responsiveHeight(5),
        width: responsiveWidth(90),
        borderRadius: 25,
        backgroundColor: "#A8F52E",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "#111111",
        fontSize: responsiveFontSize(2),
        fontWeight: "700",
    },
    secondaryButton: {
        alignItems: "center",
        justifyContent: "center",
        minHeight: responsiveHeight(5),
        marginTop: 10,
    },
    secondaryButtonText: {
        color: "#FFFFFF",
        fontSize: responsiveFontSize(1.7),
        fontWeight: "700",
    },
});