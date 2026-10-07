import React, { useEffect, useRef, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { launchImageLibrary } from "react-native-image-picker";

import { FOOD_ROUTES } from "../../../navigation/foodRoutes";

export default function ScanCamera() {
  const navigation = useNavigation<any>();
  const focused = useIsFocused();
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const shoot = async () => {
    if (busy || !camera.current) return;
    setBusy(true);
    try {
      const photo = await camera.current.takePhoto({ flash: "off" });
      navigation.navigate(FOOD_ROUTES.MEAL_ANALYSIS, { uri: `file://${photo.path}` });
    } catch {
      Alert.alert("Couldn't take the photo", "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const chooseFromGallery = async () => {
    try {
      const response = await launchImageLibrary({ mediaType: "photo", selectionLimit: 1, quality: 0.9 });
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Couldn't open gallery", response.errorMessage ?? "Please try again.");
        return;
      }

      const asset = response.assets?.[0];
      if (!asset?.uri) {
        Alert.alert("Couldn't use this photo", "Choose another image and try again.");
        return;
      }
      navigation.navigate(FOOD_ROUTES.MEAL_ANALYSIS, { uri: asset.uri, mimeType: asset.type });
    } catch {
      Alert.alert("Couldn't open gallery", "Please try again.");
    }
  };

  const help = () =>
    Alert.alert("Tips", "Keep the whole meal inside the frame, use good lighting and hold the phone steady.");

  return (
    <View style={s.screen}>
      {hasPermission && device ? (
        <Camera ref={camera} style={StyleSheet.absoluteFill} device={device} isActive={focused} photo />
      ) : (
        <View style={s.noCam}>
          <Text style={s.noCamText}>{hasPermission ? "No camera found." : "Camera access is needed to scan meals."}</Text>
          {!hasPermission ? (
            <Pressable onPress={() => Linking.openSettings()} style={s.settingsBtn}>
              <Text style={s.settingsText}>Open settings</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      <SafeAreaView style={s.top} edges={["top"]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Close">
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>
        <Pressable onPress={help} hitSlop={12} accessibilityLabel="Help">
          <Ionicons name="help-circle-outline" size={26} color="#fff" />
        </Pressable>
      </SafeAreaView>

      <View style={s.center} pointerEvents="none">
        <View style={s.frame} />
      </View>

      <SafeAreaView style={s.bottom} edges={["bottom"]}>
        <Text style={s.hint}>Fit the whole meal inside the frame</Text>
        <View style={s.controls}>
          <Pressable onPress={chooseFromGallery} disabled={busy} style={s.galleryButton} accessibilityRole="button">
            <Ionicons name="images-outline" size={19} color="#fff" />
            <Text style={s.galleryText}>Gallery</Text>
          </Pressable>
          <Pressable onPress={shoot} disabled={busy || !hasPermission} style={s.shutterOuter} accessibilityLabel="Take photo">
            <View style={[s.shutterInner, busy && { opacity: 0.5 }]} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  noCam: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", padding: 32 },
  noCamText: { color: "#fff", textAlign: "center", fontSize: 14 },
  settingsBtn: { marginTop: 14, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: "#B6F23A" },
  settingsText: { color: "#111", fontWeight: "700" },
  top: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 8 },
  center: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  frame: { width: 280, height: 280, borderRadius: 18, borderWidth: 2, borderColor: "rgba(255,255,255,0.9)" },
  bottom: { position: "absolute", bottom: 0, left: 0, right: 0, alignItems: "center", paddingBottom: 16 },
  hint: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginBottom: 18 },
  controls: { width: "100%", height: 74, alignItems: "center", justifyContent: "center" },
  galleryButton: { position: "absolute", left: 24, height: 44, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.7)", backgroundColor: "rgba(0,0,0,0.45)" },
  galleryText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  shutterOuter: { width: 74, height: 74, borderRadius: 37, borderWidth: 4, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#fff" },
});