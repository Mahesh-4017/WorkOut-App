import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, Region, UrlTile } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import Ionicons from "@react-native-vector-icons/ionicons";

import { ScreenHeader } from "../data/Movementui";
import { fmtClock, useElapsed, useSession } from "../../../data/SessionProvider";
import { useTheme } from "../../../theme/ThemeProvider";
import { MAPBOX_ACCESS_TOKEN } from "../../../config/mapbox";

const DEFAULT_REGION: Region = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 20,
  longitudeDelta: 20,
};
const EMPTY_ROUTE: { lat: number; lng: number }[] = [];
const mapTileUrl = MAPBOX_ACCESS_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`
  : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export default function RunningMap() {
  const { theme } = useTheme();
  const { active, startSession, pause, resume, endSession, addPoint } = useSession();
  const styles = createStyles(theme);
  const elapsed = useElapsed();
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [locationPermission, setLocationPermission] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const running = active?.status === "running";
  const route = active?.points ?? EMPTY_ROUTE;
  const distanceKm = (active?.distanceM ?? 0) / 1000;
  const coordinates = route.map(point => ({ latitude: point.lat, longitude: point.lng }));

  const requestLocationAccess = async () => {
    const permission = Platform.OS === "ios"
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    let status = await check(permission);
    if (status !== RESULTS.GRANTED) status = await request(permission);
    if (status !== RESULTS.GRANTED) {
      setError("Allow location access to use the running map.");
      return false;
    }
    setLocationPermission(true);
    return true;
  };

  useEffect(() => {
    if (!tracking || !running) return;
    let watchId: number | undefined;
    let cancelled = false;

    const startLocationWatch = async () => {
      try {
        const permission = Platform.OS === "ios"
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        let status = await check(permission);
        if (status !== RESULTS.GRANTED) status = await request(permission);
        if (status !== RESULTS.GRANTED) {
          if (!cancelled) {
            setTracking(false);
            setError("Allow location access to record your route.");
          }
          return;
        }
        if (cancelled) return;
        setLocationPermission(true);
        watchId = Geolocation.watchPosition(
          position => {
            const { latitude, longitude, accuracy } = position.coords;
            addPoint({ lat: latitude, lng: longitude }, accuracy);
            setRegion(current => ({
              ...current,
              latitude,
              longitude,
              latitudeDelta: Math.min(current.latitudeDelta, 0.02),
              longitudeDelta: Math.min(current.longitudeDelta, 0.02),
            }));
          },
          locationError => {
            console.error("Running map location tracking failed.", locationError);
            if (!cancelled) {
              setTracking(false);
              setError("GPS is unavailable. Check location services and try again.");
            }
          },
          { enableHighAccuracy: true, distanceFilter: 5, interval: 3000, fastestInterval: 2000 },
        );
      } catch (locationError) {
        console.error("Unable to start running map location tracking.", locationError);
        if (!cancelled) {
          setTracking(false);
          setError("Could not start GPS tracking. Check your location permission.");
        }
      }
    };

    startLocationWatch();
    return () => {
      cancelled = true;
      if (watchId !== undefined) Geolocation.clearWatch(watchId);
    };
  }, [tracking, running, addPoint]);

  const startRoute = async () => {
    setError(null);
    try {
      if (!(await requestLocationAccess())) return;
      if (active && active.workoutId !== "manual-run") {
        setError("Finish your current workout before starting a mapped run.");
        return;
      }
      if (!active) {
        startSession({
          workoutId: "manual-run",
          title: "Running session",
          minutes: 1,
          estCalories: 0,
          moves: [],
        });
      } else if (active.status === "paused") {
        resume();
      }
      setTracking(true);
    } catch (locationError) {
      console.error("Unable to request running map location access.", locationError);
      setError("Could not request location access. Try again.");
    }
  };

  const finishRoute = async () => {
    setTracking(false);
    try {
      await endSession();
      setError(null);
    } catch (saveError) {
      console.error("Unable to save the mapped running session.", saveError);
      setError(saveError instanceof Error ? saveError.message : "Could not save this run.");
    }
  };

  const centerOnLocation = async () => {
    setError(null);
    try {
      if (!(await requestLocationAccess())) return;
    } catch (locationError) {
      console.error("Unable to request map location access.", locationError);
      setError("Could not request location access. Try again.");
      return;
    }
    Geolocation.getCurrentPosition(
      ({ coords }) => setRegion(current => ({
        ...current,
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      })),
      locationError => {
        console.error("Unable to locate the runner.", locationError);
        setError("Could not get your current location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <ScreenHeader title="Running Map" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Center map on my location"
          onPress={centerOnLocation}
          style={styles.locateButton}
        >
          <Ionicons name="locate-outline" size={21} color={theme.colors.primary} />
        </Pressable>
      </View>
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFill}
          mapType="none"
          initialRegion={region}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={locationPermission}
          showsMyLocationButton={Platform.OS === "android" && locationPermission}
          followsUserLocation={tracking}
          toolbarEnabled={false}
        >
          <UrlTile
            urlTemplate={mapTileUrl}
            maximumZ={19}
            tileSize={256}
          />
          {coordinates.length > 0 ? (
            <>
              <Polyline coordinates={coordinates} strokeColor={theme.colors.primary} strokeWidth={5} />
              <Marker coordinate={coordinates[0]} title="Start" pinColor={theme.colors.accent} />
              {coordinates.length > 1 ? (
                <Marker coordinate={coordinates[coordinates.length - 1]} title="Current position" />
              ) : null}
            </>
          ) : null}
        </MapView>
        <View style={styles.mapBadge}>
          <Ionicons name={tracking ? "navigate" : "map-outline"} size={15} color={theme.colors.primary} />
          <Text style={styles.mapBadgeText}>{tracking ? "GPS route recording" : "Ready to map your run"}</Text>
        </View>
        <View style={styles.bottomCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>DURATION</Text>
              <Text style={styles.statValue}>{fmtClock(elapsed)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>DISTANCE</Text>
              <Text style={styles.statValue}>{distanceKm.toFixed(2)} km</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>GPS POINTS</Text>
              <Text style={styles.statValue}>{route.length}</Text>
            </View>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {active ? (
            <View style={styles.actions}>
              <Pressable
                onPress={() => {
                  if (running) {
                    setTracking(false);
                    pause();
                  } else {
                    startRoute();
                  }
                }}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryText}>{running ? "Pause" : "Resume"}</Text>
              </Pressable>
              <Pressable onPress={finishRoute} style={styles.primaryButton}>
                <Text style={styles.primaryText}>Finish run</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={startRoute} style={styles.primaryButton}>
              <Ionicons name="play" size={17} color={theme.colors.onPrimary} />
              <Text style={styles.primaryText}>Start mapped run</Text>
            </Pressable>
          )}
          <Text style={styles.attribution}>
            {MAPBOX_ACCESS_TOKEN ? "© Mapbox · © OpenStreetMap contributors" : "Map data © OpenStreetMap contributors"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18 },
  locateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  mapContainer: { flex: 1, overflow: "hidden", borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  mapBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
  },
  mapBadgeText: { color: theme.colors.text, fontSize: 12, fontFamily: theme.typography.fontFamilyMedium },
  bottomCard: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  stat: { flex: 1, alignItems: "center" },
  statLabel: { color: theme.colors.muted, fontSize: 9, letterSpacing: 0.8, fontFamily: theme.typography.fontFamilyMedium },
  statValue: { color: theme.colors.text, fontSize: 16, marginTop: 5, fontFamily: theme.typography.fontFamilyBold },
  statDivider: { width: 1, height: 30, backgroundColor: theme.colors.border },
  error: { color: theme.colors.danger, fontSize: 12, marginBottom: 10, textAlign: "center", fontFamily: theme.typography.fontFamily },
  attribution: { color: theme.colors.muted, fontSize: 9, textAlign: "center", marginTop: 9, fontFamily: theme.typography.fontFamily },
  actions: { flexDirection: "row", gap: 10 },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
  },
  primaryText: { color: theme.colors.onPrimary, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryText: { color: theme.colors.text, fontSize: 14, fontFamily: theme.typography.fontFamilyBold },
});
