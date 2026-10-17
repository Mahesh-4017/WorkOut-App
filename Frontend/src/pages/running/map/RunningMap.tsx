import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Region } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import WebView from "react-native-webview";
import type {
  AndroidWebViewProps,
  WebViewErrorEvent,
  WebViewMessageEvent,
} from "react-native-webview/lib/WebViewTypes";
import Ionicons from "@react-native-vector-icons/ionicons";

import { fmtClock, useElapsed, useSession } from "../../../data/SessionProvider";
import { useTheme } from "../../../theme/ThemeProvider";
import { MAPBOX_ACCESS_TOKEN } from "../../../config/mapbox";

type RunningMapWebViewHandle = { injectJavaScript: (script: string) => void };
const RunningMapWebView = WebView as React.ComponentType<
  AndroidWebViewProps & React.RefAttributes<RunningMapWebViewHandle>
>;

const DEFAULT_REGION: Region = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 20,
  longitudeDelta: 20,
};
const EMPTY_ROUTE: { lat: number; lng: number }[] = [];
type CompletedRun = {
  startedAt: number;
  seconds: number;
  distanceM: number;
  points: { lat: number; lng: number }[];
};
const mapTileUrl = MAPBOX_ACCESS_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`
  : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const mapAttribution = MAPBOX_ACCESS_TOKEN
  ? "&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
  : "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>";
const RUNNING_MAP_HTML = `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    <style>html,body,#map{height:100%;width:100%;margin:0;background:#e8e8e8}</style>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const map = L.map('map', { zoomControl: false }).setView([20.5937, 78.9629], 5);
      L.tileLayer(${JSON.stringify(mapTileUrl)}, {
        maxZoom: 19,
        tileSize: 256,
        attribution: ${JSON.stringify(mapAttribution)}
      }).addTo(map);
      let routeLine;
      let startMarker;
      let currentMarker;
      let routeKey;
      window.updateWorkoutMap = ({ points, center, tracking, completed, nextRouteKey }) => {
        if (routeKey !== nextRouteKey) {
          routeKey = nextRouteKey;
          [routeLine, startMarker, currentMarker].forEach(layer => {
            if (layer) map.removeLayer(layer);
          });
          routeLine = undefined;
          startMarker = undefined;
          currentMarker = undefined;
        }
        const latLngs = points.map(({ latitude, longitude }) => [latitude, longitude]);
        if (routeLine) routeLine.setLatLngs(latLngs);
        else if (latLngs.length) routeLine = L.polyline(latLngs, { color: '#6c4bd3', weight: 5 }).addTo(map);
        if (latLngs.length) {
          if (startMarker) startMarker.setLatLng(latLngs[0]);
          else startMarker = L.circleMarker(latLngs[0], { color: '#fff', fillColor: '#36a269', fillOpacity: 1, radius: 7 }).addTo(map);
          const current = latLngs[latLngs.length - 1];
          if (currentMarker) currentMarker.setLatLng(current);
          else currentMarker = L.circleMarker(current, { color: '#fff', fillColor: completed ? '#d84a4a' : '#6c4bd3', fillOpacity: 1, radius: 7 }).addTo(map);
          currentMarker.setStyle({ fillColor: completed ? '#d84a4a' : '#6c4bd3' });
        }
        if (center) map.setView([center.latitude, center.longitude], tracking ? 16 : 15);
      };
      window.ReactNativeWebView?.postMessage('ready');
    </script>
  </body>
</html>`;

export default function RunningMap() {
  const { theme } = useTheme();
  const { active, startSession, pause, resume, endSession, addPoint } = useSession();
  const styles = createStyles(theme);
  const elapsed = useElapsed();
  const mapRef = useRef<RunningMapWebViewHandle>(null);
  const initialLocateRequested = useRef(false);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [mapReady, setMapReady] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [completedRun, setCompletedRun] = useState<CompletedRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const running = active?.status === "running";
  const route = active?.points ?? completedRun?.points ?? EMPTY_ROUTE;
  const distanceKm = (active?.distanceM ?? completedRun?.distanceM ?? 0) / 1000;
  const durationSeconds = active ? elapsed : completedRun?.seconds ?? elapsed;
  const runCompleted = !active && completedRun !== null;
  const routeKey = active?.startedAt ?? completedRun?.startedAt ?? "none";
  const coordinates = route.map(point => ({ latitude: point.lat, longitude: point.lng }));

  useEffect(() => {
    if (!mapReady) return;
    const mapState = JSON.stringify({
      points: coordinates,
      center: region,
      tracking,
      completed: runCompleted,
      nextRouteKey: routeKey,
    });
    mapRef.current?.injectJavaScript(`window.updateWorkoutMap?.(${mapState}); true;`);
  }, [coordinates, mapReady, region, routeKey, runCompleted, tracking]);

  const requestLocationAccess = useCallback(async () => {
    const permission = Platform.OS === "ios"
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    let status = await check(permission);
    if (status !== RESULTS.GRANTED) status = await request(permission);
    if (status !== RESULTS.GRANTED) {
      setError("Allow location access to use the running map.");
      return false;
    }
    return true;
  }, []);

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
      setCompletedRun(null);
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
    if (!active) return;
    const finishedRun: CompletedRun = {
      startedAt: active.startedAt,
      seconds: Math.max(0, Math.round(elapsed)),
      distanceM: active.distanceM,
      points: [...active.points],
    };
    setTracking(false);
    try {
      await endSession();
      setCompletedRun(finishedRun);
      setError(null);
    } catch (saveError) {
      console.error("Unable to save the mapped running session.", saveError);
      setError(saveError instanceof Error ? saveError.message : "Could not save this run.");
    }
  };

  const centerOnLocation = useCallback(async () => {
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
  }, [requestLocationAccess]);

  useEffect(() => {
    if (!mapReady || initialLocateRequested.current) return;
    initialLocateRequested.current = true;
    centerOnLocation().catch(locationError => {
      console.error("Unable to center the running map on the user.", locationError);
      setError("Could not get your current location.");
    });
  }, [centerOnLocation, mapReady]);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.headerTitle}>Running Map</Text>
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
        <RunningMapWebView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          source={{ html: RUNNING_MAP_HTML }}
          javaScriptEnabled
          originWhitelist={["*"]}
          onMessage={(event: WebViewMessageEvent) => {
            if (event.nativeEvent.data === "ready") setMapReady(true);
          }}
          onError={(event: WebViewErrorEvent) => {
            console.error("Running map failed to load.", event.nativeEvent);
            setError("The map could not load. Check your internet connection and try again.");
          }}
        />
        <View style={styles.mapBadge}>
          <Ionicons name={tracking ? "navigate" : "map-outline"} size={15} color={theme.colors.primary} />
          <Text style={styles.mapBadgeText}>
            {runCompleted ? "Run complete" : tracking ? "GPS route recording" : "Ready to map your run"}
          </Text>
        </View>
        <View style={styles.bottomCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>DURATION</Text>
              <Text style={styles.statValue}>{fmtClock(durationSeconds)}</Text>
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
              <Text style={styles.primaryText}>{runCompleted ? "Start another run" : "Start mapped run"}</Text>
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
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 8 },
  headerTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 22,
    fontFamily: theme.typography.fontFamilyBold,
  },
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
