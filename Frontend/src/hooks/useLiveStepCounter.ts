import { useEffect, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
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

    const start = async () => {
      if (Platform.OS === "android" && Number(Platform.Version) >= 29) {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
          {
            title: "Allow step counting",
            message: "WorkOut uses your phone's motion sensor to count your daily steps.",
            buttonPositive: "Allow",
            buttonNegative: "Not now",
          },
        );
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          if (mounted) {
            setStatus("permission-denied");
            setError("Allow physical activity access to count steps.");
          }
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

    start()
      .catch(startError => {
        console.error("Unable to start the live step counter.", startError);
        if (mounted) {
          setStatus("error");
          setError(startError instanceof Error ? startError.message : "Unable to start step counting.");
        }
      });

    return () => {
      mounted = false;
      subscription?.remove();
      stopStepCounterUpdate();
      if (liveSteps > savedSteps) saveTotal(liveSteps);
    };
  }, [enabled]);

  return { steps, status, error };
}
