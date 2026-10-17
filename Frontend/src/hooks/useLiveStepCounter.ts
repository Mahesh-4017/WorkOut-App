import { useEffect, useRef, useState } from "react";
import { AppState, PermissionsAndroid, Platform } from "react-native";
import {
  createStepCountFilter,
  isStepCountingSupported,
  startStepCounterUpdate,
  stopStepCounterUpdate,
} from "react-native-step-counter-newarch";

const SAVE_STEP_BATCH_SIZE = 100;

type StepCounterStatus =
  | "checking"
  | "tracking"
  | "unsupported"
  | "permission-denied"
  | "error";

export function useLiveStepCounter(
  initialSteps: number,
  saveDailySteps: (steps: number) => Promise<void>,
  enabled = true,
) {
  const initialStepsRef = useRef(Math.max(0, Math.floor(initialSteps)));
  const saveDailyStepsRef = useRef(saveDailySteps);
  saveDailyStepsRef.current = saveDailySteps;
  const [steps, setSteps] = useState(initialStepsRef.current);
  const [status, setStatus] = useState<StepCounterStatus>("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      initialStepsRef.current = Math.max(0, Math.floor(initialSteps));
    }
  }, [enabled, initialSteps]);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    let liveSteps = 0;
    let queuedSteps = 0;
    let savedSteps = 0;
    let saveQueue = Promise.resolve();
    let subscription: ReturnType<typeof startStepCounterUpdate> | undefined;
    let launchTimer: ReturnType<typeof setTimeout> | undefined;
    let startRequested = false;

    const saveTotal = (count: number) => {
      if (count <= queuedSteps) return;
      queuedSteps = count;
      const dailyTotal = initialStepsRef.current + count;
      saveQueue = saveQueue
        .then(() => saveDailyStepsRef.current(dailyTotal))
        .then(() => {
          savedSteps = Math.max(savedSteps, count);
        })
        .catch(saveError => {
          queuedSteps = savedSteps;
          console.error("Unable to save live step count.", saveError);
          if (mounted) {
            setError(saveError instanceof Error ? saveError.message : "Unable to save today's steps.");
          }
        });
    };

    const requestActivityRecognitionPermission = async (attempt = 0): Promise<string | null> => {
      if (!mounted || AppState.currentState !== "active") return null;
      try {
        return await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
          {
            title: "Allow step counting",
            message: "WorkOut uses your phone's motion sensor to count your daily steps.",
            buttonPositive: "Allow",
            buttonNegative: "Not now",
          },
        );
      } catch (permissionError) {
        const activityUnavailable =
          permissionError instanceof Error &&
          /not attached to an Activity/i.test(permissionError.message);
        if (!activityUnavailable || attempt >= 2 || AppState.currentState !== "active") {
          throw permissionError;
        }

        await new Promise<void>(resolve => setTimeout(resolve, 300));
        if (AppState.currentState !== "active") return null;
        return requestActivityRecognitionPermission(attempt + 1);
      }
    };

    const start = async () => {
      if (Platform.OS === "android" && Number(Platform.Version) >= 29) {
        const permission = await requestActivityRecognitionPermission();
        if (!mounted || permission === null) {
          if (mounted && AppState.currentState !== "active") startRequested = false;
          return;
        }
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          setStatus("permission-denied");
          setError("Allow physical activity access to count steps.");
          return;
        }
      }

      const capability = await isStepCountingSupported();
      if (!mounted) return;
      if (Platform.OS === "ios" && !capability.supported) {
        setStatus("unsupported");
        setError("Step counting is not available on this device.");
        return;
      }
      if (Platform.OS === "android" && (!capability.granted || !capability.supported)) {
        setStatus("unsupported");
        setError(
          capability.granted
            ? "This device does not provide a step-counting sensor."
            : "Allow physical activity access to count steps.",
        );
        return;
      }

      const filterStepCount = createStepCountFilter();
      subscription = startStepCounterUpdate(new Date(), data => {
        const filtered = filterStepCount(data);
        if (!filtered || !mounted) return;

        liveSteps = Math.max(liveSteps, Math.floor(filtered.steps));
        setSteps(initialStepsRef.current + liveSteps);
        setStatus("tracking");
        setError(null);

        if (liveSteps - queuedSteps >= SAVE_STEP_BATCH_SIZE) {
          saveTotal(liveSteps);
        }
      });

      if (mounted) {
        setStatus(Platform.OS === "ios" && !capability.granted ? "permission-denied" : "tracking");
        if (Platform.OS === "ios" && !capability.granted) {
          setError("Allow Motion & Fitness access to count steps.");
        }
      }

    };

    const scheduleStart = () => {
      if (!mounted || startRequested || launchTimer || AppState.currentState !== "active") return;
      launchTimer = setTimeout(() => {
        launchTimer = undefined;
        if (!mounted || AppState.currentState !== "active") return;
        startRequested = true;
        start().catch(startError => {
          if (!mounted) return;
          console.error("Unable to start the live step counter.", startError);
          setStatus("error");
          setError(startError instanceof Error ? startError.message : "Unable to start step counting.");
        });
      }, 300);
    };

    const appStateSubscription = AppState.addEventListener("change", state => {
      if (state === "active") {
        scheduleStart();
      } else if (launchTimer) {
        clearTimeout(launchTimer);
        launchTimer = undefined;
      }
    });
    scheduleStart();

    return () => {
      mounted = false;
      appStateSubscription.remove();
      if (launchTimer) clearTimeout(launchTimer);
      subscription?.remove();
      stopStepCounterUpdate();
      if (liveSteps > savedSteps) saveTotal(liveSteps);
    };
  }, [enabled]);

  return { steps, status, error };
}
