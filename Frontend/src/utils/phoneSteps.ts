import { Platform } from "react-native";
import AppleHealthKit from "react-native-health";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HEALTH_CONNECT_STEPS_PERMISSION = { accessType: "read" as const, recordType: "Steps" as const };
const CONNECTED_PHONE_STEPS_KEY = "@workout/phone-steps-connected";

function dayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function initializeHealthKit() {
  return new Promise<void>((resolve, reject) => {
    AppleHealthKit.initHealthKit({
      permissions: {
        read: [AppleHealthKit.Constants.Permissions.Steps],
        write: [],
      },
    }, error => error ? reject(new Error(error)) : resolve());
  });
}

export async function connectPhoneSteps() {
  if (Platform.OS === "ios") {
    await initializeHealthKit();
    await AsyncStorage.setItem(CONNECTED_PHONE_STEPS_KEY, "true");
    return;
  }
  if (Platform.OS !== "android") {
    throw new Error("Automatic phone step sync is available on Android and iPhone only.");
  }

  const healthConnect = await import("react-native-health-connect");
  const initialized = await healthConnect.initialize();
  if (!initialized) {
    throw new Error("Health Connect is unavailable. Install or enable Health Connect, then try again.");
  }
  const granted = await healthConnect.requestPermission([HEALTH_CONNECT_STEPS_PERMISSION]);
  if (!granted.some(permission => permission.accessType === "read" && permission.recordType === "Steps")) {
    throw new Error("Allow WorkOut to read step data in Health Connect to sync your steps.");
  }
  await AsyncStorage.setItem(CONNECTED_PHONE_STEPS_KEY, "true");
}

export async function readTodayPhoneSteps() {
  const { start, end } = dayRange();
  if (Platform.OS === "ios") {
    await initializeHealthKit();
    return new Promise<number>((resolve, reject) => {
      AppleHealthKit.getStepCount({ startDate: start, endDate: end }, (error, result) => {
        if (error) {
          reject(new Error(typeof error === "string" ? error : "Unable to read steps from Apple Health."));
          return;
        }
        resolve(Math.max(0, Math.round(Number(result.value) || 0)));
      });
    });
  }
  if (Platform.OS !== "android") {
    throw new Error("Automatic phone step sync is available on Android and iPhone only.");
  }

  const healthConnect = await import("react-native-health-connect");
  const initialized = await healthConnect.initialize();
  if (!initialized) {
    throw new Error("Health Connect is unavailable. Install or enable Health Connect, then try again.");
  }
  const granted = await healthConnect.getGrantedPermissions();
  if (!granted.some(permission => permission.accessType === "read" && permission.recordType === "Steps")) {
    throw new Error("Connect Health Connect to allow WorkOut to read your steps.");
  }
  const result = await healthConnect.aggregateRecord<"Steps">({
    recordType: "Steps",
    timeRangeFilter: { operator: "between", startTime: start, endTime: end },
  });
  return Math.max(0, Math.round(result.COUNT_TOTAL || 0));
}
