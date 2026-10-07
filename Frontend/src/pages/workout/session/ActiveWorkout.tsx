import React, { useEffect, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Circle, Polyline } from "react-native-svg";
import Geolocation from "@react-native-community/geolocation";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";

import { useTheme } from "../../../theme/ThemeProvider";
import { WORKOUT_ROUTES } from "../../../navigation/workoutRoutes";
import { fmtClock, useElapsed, useSession } from "../../../data/SessionProvider";
import { PrimaryButton } from "../../../components/OnboardingUI";
import { ScreenHeader, ACCENT } from "../../../components/MovementUI";
import { DARK_TEXT } from "../../../components/WorkoutUI";

const WIDTH = 300;
const HEIGHT = 230;
const PADDING = 22;

export default function ActiveWorkout() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { active, pause, nextMove, endSession, addPoint } = useSession();
  const seconds = useElapsed();
  const styles = createStyles(theme);
  const [gps, setGps] = useState(false);
  const running = active?.status === "running";

  useEffect(() => {
    if (!gps || !running) return;
    let watchId: number | undefined;
    let cancelled = false;

    const startTracking = async () => {
      try {
        const permission = Platform.OS === "ios"
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        let status = await check(permission);
        if (status !== RESULTS.GRANTED) status = await request(permission);
        if (status !== RESULTS.GRANTED) {
          if (!cancelled) {
            setGps(false);
            Alert.alert("Location permission needed", "Allow location access to track your workout route.");
          }
          return;
        }
        if (cancelled) return;
        watchId = Geolocation.watchPosition(
          position => addPoint(
            { lat: position.coords.latitude, lng: position.coords.longitude },
            position.coords.accuracy,
          ),
          error => {
            console.error("Workout location tracking failed.", error);
            if (!cancelled) {
              setGps(false);
              Alert.alert("GPS unavailable", "Route tracking stopped. You can continue your workout without GPS.");
            }
          },
          { enableHighAccuracy: true, distanceFilter: 5 },
        );
      } catch (error) {
        console.error("Unable to start workout location tracking.", error);
        if (!cancelled) {
          setGps(false);
          Alert.alert("GPS unavailable", "Route tracking could not be started.");
        }
      }
    };

    startTracking();
    return () => {
      cancelled = true;
      if (watchId !== undefined) Geolocation.clearWatch(watchId);
    };
  }, [gps, running, addPoint]);

  useEffect(() => {
    if (active?.status === "paused") navigation.navigate(WORKOUT_ROUTES.PAUSE);
  }, [active?.status, navigation]);

  if (!active) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScreenHeader title="Active Workout" />
        <Text style={styles.muted}>No workout in progress.</Text>
        <View style={styles.noSessionButton}>
          <PrimaryButton label="Explore workouts" onPress={() => navigation.navigate(WORKOUT_ROUTES.EXPLORE)} />
        </View>
      </SafeAreaView>
    );
  }

  const distanceKm = active.distanceM / 1000;
  const pace = distanceKm > 0.05 ? seconds / 60 / distanceKm : 0;
  const calories = Math.round((active.estCalories / Math.max(active.minutes, 1)) * (seconds / 60));
  const currentMove = active.moves[Math.min(active.done, active.moves.length - 1)];
  const isLastMove = active.done >= active.moves.length - 1;

  const points = active.points;
  let routeLine = "";
  let start = { x: 0, y: 0 };
  let end = { x: 0, y: 0 };
  if (points.length >= 2) {
    const latitudes = points.map(point => point.lat);
    const longitudes = points.map(point => point.lng);
    const minLat = Math.min(...latitudes);
    const minLng = Math.min(...longitudes);
    const longitudeScale = Math.cos((latitudes[0] * Math.PI) / 180);
    const spanX = Math.max((Math.max(...longitudes) - minLng) * longitudeScale, 1e-5);
    const spanY = Math.max(Math.max(...latitudes) - minLat, 1e-5);
    const scale = Math.min(
      (WIDTH - PADDING * 2) / spanX,
      (HEIGHT - PADDING * 2) / spanY,
    );
    const project = (point: { lat: number; lng: number }) => ({
      x: PADDING + (point.lng - minLng) * longitudeScale * scale,
      y: HEIGHT - PADDING - (point.lat - minLat) * scale,
    });
    const coordinates = points.map(project);
    routeLine = coordinates.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
    start = coordinates[0];
    end = coordinates[coordinates.length - 1];
  }

  const onNext = async () => {
    if (nextMove()) {
      try {
        await endSession();
        navigation.navigate(WORKOUT_ROUTES.SUMMARY);
      } catch (error) {
        Alert.alert("Unable to save workout", error instanceof Error ? error.message : "Please try again.");
      }
    }
  };

  const onPause = () => {
    pause();
    navigation.navigate(WORKOUT_ROUTES.PAUSE);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="Active Workout" />
      <View style={styles.map}>
        {points.length >= 2 ? (
          <Svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            <Polyline
              points={routeLine}
              fill="none"
              stroke={theme.colors.primary}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx={start.x} cy={start.y} r={6} fill={DARK_TEXT} />
            <Circle cx={end.x} cy={end.y} r={9} fill={ACCENT.purple} stroke="#fff" strokeWidth={3} />
          </Svg>
        ) : (
          <View style={styles.mapEmpty}>
            <Text style={styles.mapEmptyTitle}>{gps ? "Looking for GPS…" : "Indoor session"}</Text>
            <Text style={styles.mapEmptyText}>
              {gps ? "Your route will appear as you move." : "Turn on route tracking to map an outdoor session."}
            </Text>
          </View>
        )}
        <View style={styles.gpsRow}>
          <Text style={styles.gpsText}>Track route</Text>
          <Switch
            value={gps}
            onValueChange={setGps}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>DURATION</Text>
          <Text style={styles.statValue}>{fmtClock(seconds)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{pace > 0 ? "DISTANCE · PACE" : "DISTANCE"}</Text>
          <Text style={styles.statValue}>
            {distanceKm.toFixed(2)} km
            {pace > 0 ? <Text style={styles.statSub}>{`  ${fmtClock(pace * 60, false)}/km`}</Text> : null}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>EST. CAL</Text>
          <Text style={styles.statValue}>{calories}</Text>
        </View>
      </View>

      <View style={styles.moveCard}>
        <View style={styles.moveCopy}>
          <Text style={styles.moveLabel}>
            NOW · {Math.min(active.done + 1, active.moves.length)} OF {active.moves.length}
          </Text>
          <Text style={styles.moveName}>{currentMove?.name}</Text>
        </View>
        <Pressable onPress={onNext} style={styles.nextButton} accessibilityRole="button">
          <Text style={styles.nextText}>{isLastMove ? "Finish" : "Next move"}</Text>
        </Pressable>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton label="Pause workout" onPress={onPause} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 18 },
    muted: { color: theme.colors.muted, fontSize: 13, marginTop: 10, fontFamily: theme.typography.fontFamily },
    noSessionButton: { marginTop: 16 },
    map: { flex: 1, minHeight: 220, backgroundColor: "#DDEBDD", borderRadius: 18, overflow: "hidden", marginTop: 4 },
    mapEmpty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
    mapEmptyTitle: { color: DARK_TEXT, fontSize: 15, fontFamily: theme.typography.fontFamilyBold },
    mapEmptyText: { color: "rgba(27,31,26,0.65)", fontSize: 12, textAlign: "center", marginTop: 4, fontFamily: theme.typography.fontFamily },
    gpsRow: { position: "absolute", left: 12, bottom: 8, flexDirection: "row", alignItems: "center", gap: 8 },
    gpsText: { color: DARK_TEXT, fontSize: 11, fontFamily: theme.typography.fontFamilyMedium },
    stats: { flexDirection: "row", gap: 10, marginTop: 12 },
    stat: { flex: 1, backgroundColor: theme.colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.border },
    statLabel: { color: theme.colors.muted, fontSize: 9, letterSpacing: 0.6, fontFamily: theme.typography.fontFamilyMedium },
    statValue: { color: theme.colors.text, fontSize: 16, marginTop: 4, fontFamily: theme.typography.fontFamilyBold },
    statSub: { color: theme.colors.muted, fontSize: 10, fontFamily: theme.typography.fontFamily },
    moveCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#E3EDE0", borderRadius: 12, padding: 12, marginTop: 10 },
    moveCopy: { flex: 1 },
    moveLabel: { color: "rgba(27,31,26,0.6)", fontSize: 9, letterSpacing: 0.6, fontFamily: theme.typography.fontFamilyBold },
    moveName: { color: DARK_TEXT, fontSize: 14, marginTop: 2, fontFamily: theme.typography.fontFamilyBold },
    nextButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: "#fff" },
    nextText: { color: DARK_TEXT, fontSize: 12, fontFamily: theme.typography.fontFamilyBold },
    bottom: { paddingBottom: 16, paddingTop: 10 },
  });
