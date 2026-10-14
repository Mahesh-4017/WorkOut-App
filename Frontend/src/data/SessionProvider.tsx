import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import notifee, { EventType } from "@notifee/react-native";
import {
  addStepsRecord,
  addWeightRecord,
  createWorkoutSession,
  FitnessGoals,
  getProgressData,
  saveFitnessGoals,
  StepsRecord,
  updateWorkoutFeedback,
  WeightRecord,
  WorkoutSessionRecord,
} from "../api/progress";
import { useAuth } from "../context/AuthContext";
import { connectPhoneSteps, readTodayPhoneSteps } from "../utils/phoneSteps";
import {
  cancelActiveTimerNotification,
  cancelDailyStepsReminder,
  createTimerNotificationActions,
  scheduleDailyStepsReminder,
  showActiveTimerNotification,
} from "../utils/scheduleReminders";

export type HistoryEntry = WorkoutSessionRecord;

export type Feedback = Pick<HistoryEntry, "rating" | "effort" | "feel" | "note">;
export type Point = { lat: number; lng: number };

type StartInput = {
  workoutId: string;
  title: string;
  minutes: number;
  estCalories: number;
  moves: { name: string; sets: number }[];
};

type Active = StartInput & {
  startedAt: number;
  status: "running" | "paused";
  baseMs: number;
  resumedAt: number | null;
  done: number;
  distanceM: number;
  points: Point[];
};

type Ctx = {
  active: Active | null;
  history: HistoryEntry[];
  goals: FitnessGoals | null;
  weightEntries: WeightRecord[];
  stepEntries: StepsRecord[];
  loading: boolean;
  error: string | null;
  lastSummary: HistoryEntry | null;
  startSession: (input: StartInput) => void;
  pause: () => void;
  resume: () => void;
  nextMove: () => boolean;
  addPoint: (point: Point, accuracy?: number) => void;
  endSession: () => Promise<HistoryEntry | null>;
  markExerciseDone: (exercise: { id: string; title: string; durationMinutes: number }) => Promise<boolean>;
  saveFeedback: (id: string, feedback: Feedback) => Promise<void>;
  saveGoals: (goals: FitnessGoals) => Promise<void>;
  addWeight: (weightKg: number) => Promise<void>;
  addSteps: (steps: number) => Promise<void>;
  syncPhoneSteps: (connect?: boolean) => Promise<number>;
  refreshProgress: () => Promise<void>;
  elapsedSeconds: () => number;
};

const SessionContext = createContext<Ctx | null>(null);
const ACTIVE_SESSION_KEY = "@workout/active-session";
const CONNECTED_PHONE_STEPS_KEY = "@workout/phone-steps-connected";
const PENDING_TIMER_ACTION_KEY = "@workout/pending-timer-action";

const meters = (a: Point, b: Point) => {
  const radius = 6371000;
  const radians = (value: number) => (value * Math.PI) / 180;
  const latDelta = radians(b.lat - a.lat);
  const lngDelta = radians(b.lng - a.lng);
  const value =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(lngDelta / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(value));
};

const localDayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const fmtClock = (seconds: number, hours = true) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hour = Math.floor(safeSeconds / 3600);
  const minute = Math.floor((safeSeconds % 3600) / 60);
  const remainder = safeSeconds % 60;
  const padded = (value: number) => String(value).padStart(2, "0");
  return hours
    ? `${padded(hour)}:${padded(minute)}:${padded(remainder)}`
    : `${padded(hour * 60 + minute)}:${padded(remainder)}`;
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const authenticatedUserId = user?.id;
  const [active, setActive] = useState<Active | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [goals, setGoals] = useState<FitnessGoals | null>(null);
  const [weightEntries, setWeightEntries] = useState<WeightRecord[]>([]);
  const [stepEntries, setStepEntries] = useState<StepsRecord[]>([]);
  const [lastSummary, setLastSummary] = useState<HistoryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const activeRef = useRef<Active | null>(null);
  const historyRef = useRef(history);
  activeRef.current = active;
  historyRef.current = history;

  const refreshProgress = useCallback(async () => {
    if (!authenticatedUserId) {
      historyRef.current = [];
      setHistory([]);
      setGoals(null);
      setWeightEntries([]);
      setStepEntries([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const progress = await getProgressData();
      historyRef.current = progress.sessions;
      setHistory(progress.sessions);
      setGoals(progress.goals);
      setWeightEntries(progress.weightEntries);
      setStepEntries(progress.stepEntries);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load progress data.";
      setError(message);
      throw loadError;
    } finally {
      setLoading(false);
    }
  }, [authenticatedUserId]);

  useEffect(() => {
    if (!authenticatedUserId) {
      refreshProgress().catch(loadError => {
        console.error("Unable to clear progress for signed-out user.", loadError);
      });
      return;
    }
    refreshProgress().catch(() => undefined);
  }, [authenticatedUserId, refreshProgress]);

  const setCurrentActive = useCallback((next: Active | null) => {
    activeRef.current = next;
    setActive(next);
    const persist = next
      ? AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(next))
      : AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    persist.catch(storageError => {
      console.error("Unable to persist active workout state.", storageError);
      setError("Your active timer could not be saved on this device.");
    });
  }, []);

  const elapsedSeconds = useCallback(() => {
    const session = activeRef.current;
    if (!session) return 0;
    return (session.baseMs + (session.resumedAt ? Date.now() - session.resumedAt : 0)) / 1000;
  }, []);

  const startSession = useCallback((input: StartInput) => {
    const now = Date.now();
    setCurrentActive({
      ...input,
      startedAt: now,
      status: "running",
      baseMs: 0,
      resumedAt: now,
      done: 0,
      distanceM: 0,
      points: [],
    });
  }, [setCurrentActive]);

  const pause = useCallback(() => {
    const session = activeRef.current;
    if (!session || session.status !== "running") return;
    setCurrentActive({
      ...session,
      status: "paused",
      baseMs: session.baseMs + (Date.now() - (session.resumedAt ?? Date.now())),
      resumedAt: null,
    });
  }, [setCurrentActive]);

  const resume = useCallback(() => {
    const session = activeRef.current;
    if (!session || session.status !== "paused") return;
    setCurrentActive({ ...session, status: "running", resumedAt: Date.now() });
  }, [setCurrentActive]);

  const nextMove = useCallback(() => {
    const session = activeRef.current;
    if (!session) return false;
    const done = Math.min(session.done + 1, session.moves.length);
    setCurrentActive({ ...session, done });
    return done >= session.moves.length;
  }, [setCurrentActive]);

  const addPoint = useCallback((point: Point, accuracy = 0) => {
    const session = activeRef.current;
    if (!session || session.status !== "running" || accuracy > 50) return;
    const last = session.points[session.points.length - 1];
    const distance = last ? meters(last, point) : 0;
    if (last && (distance < 3 || distance > 150)) return;
    setCurrentActive({
      ...session,
      points: [...session.points, point],
      distanceM: session.distanceM + distance,
    });
  }, [setCurrentActive]);

  const syncPhoneSteps = useCallback(async (connect = false) => {
    if (connect) {
      await connectPhoneSteps();
      await AsyncStorage.setItem(CONNECTED_PHONE_STEPS_KEY, "true");
    }
    const steps = await readTodayPhoneSteps();
    setError(null);
    try {
      const entry = await addStepsRecord(steps);
      setStepEntries(current => [
        entry,
        ...current.filter(item => item.recordedAt.slice(0, 10) !== entry.recordedAt.slice(0, 10)),
      ]);
      if (goals?.dailyStepsReminderTime) {
        await scheduleDailyStepsReminder(goals.dailyStepsReminderTime, steps);
      }
      return steps;
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Unable to sync today's phone steps.");
      throw syncError;
    }
  }, [goals?.dailyStepsReminderTime]);

  const endSession = useCallback(async (): Promise<HistoryEntry | null> => {
    const session = activeRef.current;
    if (!session) return null;

    setError(null);
    try {
      const seconds = Math.round(elapsedSeconds());
      const calories = Math.round(
        (session.estCalories / Math.max(session.minutes, 1)) * (seconds / 60),
      );
      const setsDone = session.moves
        .slice(0, session.done)
        .reduce((total, move) => total + move.sets, 0);
      const entry = await createWorkoutSession({
        workoutId: session.workoutId,
        title: session.title,
        startedAt: new Date(session.startedAt).toISOString(),
        seconds,
        calories,
        distanceKm: Math.round(session.distanceM / 10) / 100,
        movesDone: session.done,
        movesTotal: session.moves.length,
        setsDone,
      });
      const nextHistory = [entry, ...historyRef.current];
      historyRef.current = nextHistory;
      setHistory(nextHistory);
      setLastSummary(entry);
      setCurrentActive(null);
      return entry;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save workout session.");
      throw saveError;
    }
  }, [elapsedSeconds, setCurrentActive]);

  const handleTimerAction = useCallback(async (action: string | undefined) => {
    if (action === "pause") pause();
    else if (action === "resume") resume();
    else if (action === "stop") {
      await endSession();
    }
  }, [endSession, pause, resume]);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(ACTIVE_SESSION_KEY).then(value => {
      if (!mounted) return;
      if (value) {
        const saved: unknown = JSON.parse(value);
        if (
          typeof saved === "object"
          && saved !== null
          && "startedAt" in saved
          && "status" in saved
          && "moves" in saved
          && typeof saved.startedAt === "number"
          && (saved.status === "running" || saved.status === "paused")
          && Array.isArray(saved.moves)
        ) {
          setCurrentActive(saved as Active);
        } else {
          setError("The saved active timer could not be restored.");
          AsyncStorage.removeItem(ACTIVE_SESSION_KEY).catch(storageError => {
            console.error("Unable to remove invalid active session state.", storageError);
          });
        }
      }
      setSessionReady(true);
    }).catch(storageError => {
      console.error("Unable to restore active workout state.", storageError);
      if (mounted) {
        setError("Unable to restore the active workout timer.");
        setSessionReady(true);
      }
    });
    return () => { mounted = false; };
  }, [setCurrentActive]);

  useEffect(() => notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.ACTION_PRESS) {
      handleTimerAction(detail.pressAction?.id).catch(actionError => {
        console.error("Unable to handle workout notification action.", actionError);
        setError(actionError instanceof Error ? actionError.message : "Unable to control the active timer.");
      });
    }
  }), [handleTimerAction]);

  useEffect(() => {
    if (!sessionReady) return;
    const processPendingAction = async () => {
      const action = await AsyncStorage.getItem(PENDING_TIMER_ACTION_KEY);
      if (!action) return;
      await AsyncStorage.removeItem(PENDING_TIMER_ACTION_KEY);
      await handleTimerAction(action);
    };
    processPendingAction().catch(actionError => {
      console.error("Unable to process pending timer action.", actionError);
      setError(actionError instanceof Error ? actionError.message : "Unable to control the active timer.");
    });
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") {
        processPendingAction().catch(actionError => {
          console.error("Unable to process pending timer action.", actionError);
          setError(actionError instanceof Error ? actionError.message : "Unable to control the active timer.");
        });
      }
    });
    return () => subscription.remove();
  }, [handleTimerAction, sessionReady]);

  useEffect(() => {
    if (!sessionReady || !active) {
      if (sessionReady) {
        cancelActiveTimerNotification().catch(notificationError => {
          console.error("Unable to clear active timer notification.", notificationError);
        });
      }
      return;
    }
    const updateNotification = () => {
      createTimerNotificationActions(active.status)
        .then(() => showActiveTimerNotification({
          title: active.title,
          status: active.status,
          startedAt: active.startedAt,
          elapsedSeconds: elapsedSeconds(),
        }))
        .catch(notificationError => {
          console.error("Unable to update active timer notification.", notificationError);
          setError(notificationError instanceof Error ? notificationError.message : "Unable to update the active timer notification.");
        });
    };
    updateNotification();
    if (active.status !== "running") return;
    const interval = setInterval(updateNotification, 30_000);
    return () => clearInterval(interval);
  }, [active, elapsedSeconds, sessionReady]);

  useEffect(() => {
    if (!authenticatedUserId) return;
    let mounted = true;
    const syncIfConnected = async () => {
      const connected = await AsyncStorage.getItem(CONNECTED_PHONE_STEPS_KEY);
      if (mounted && connected === "true") await syncPhoneSteps();
    };
    syncIfConnected().catch(syncError => {
      console.error("Unable to sync phone step total.", syncError);
      if (mounted) setError(syncError instanceof Error ? syncError.message : "Unable to sync today's phone steps.");
    });
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") {
        syncIfConnected().catch(syncError => {
          console.error("Unable to sync phone step total.", syncError);
          setError(syncError instanceof Error ? syncError.message : "Unable to sync today's phone steps.");
        });
      }
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [authenticatedUserId, syncPhoneSteps]);

  const markExerciseDone = useCallback(async (exercise: { id: string; title: string; durationMinutes: number }) => {
    const startedAt = new Date();
    const exerciseWorkoutId = `exercise:${exercise.id}`;
    const alreadyLoggedToday = historyRef.current.some(entry =>
      entry.workoutId === exerciseWorkoutId
      && localDayKey(new Date(entry.startedAt)) === localDayKey(startedAt),
    );
    if (alreadyLoggedToday) return false;

    setError(null);
    try {
      const entry = await createWorkoutSession({
        workoutId: exerciseWorkoutId,
        title: exercise.title,
        startedAt: startedAt.toISOString(),
        seconds: Math.max(0, Math.round(exercise.durationMinutes * 60)),
        calories: 0,
        distanceKm: 0,
        movesDone: 1,
        movesTotal: 1,
        setsDone: 0,
      });
      const nextHistory = [entry, ...historyRef.current];
      historyRef.current = nextHistory;
      setHistory(nextHistory);
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save exercise completion.");
      throw saveError;
    }
  }, []);

  const saveFeedback = useCallback(async (id: string, feedback: Feedback) => {
    setError(null);
    try {
      const saved = await updateWorkoutFeedback(id, feedback);
      const nextHistory = historyRef.current.map(entry => entry.id === id ? saved : entry);
      historyRef.current = nextHistory;
      setHistory(nextHistory);
      setLastSummary(current => current && current.id === id ? saved : current);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save workout feedback.");
      throw saveError;
    }
  }, []);

  const updateGoals = useCallback(async (nextGoals: FitnessGoals) => {
    setError(null);
    try {
      const saved = await saveFitnessGoals(nextGoals);
      setGoals(saved);
      if (saved.dailyStepsReminderTime) {
        const todayKey = localDayKey(new Date());
        const todaySteps = stepEntries.find(entry => localDayKey(new Date(entry.recordedAt)) === todayKey)?.steps ?? 0;
        await scheduleDailyStepsReminder(saved.dailyStepsReminderTime, todaySteps);
      } else if (Object.prototype.hasOwnProperty.call(nextGoals, "dailyStepsReminderTime")) {
        await cancelDailyStepsReminder();
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save fitness goals.");
      throw saveError;
    }
  }, [stepEntries]);

  const addWeight = useCallback(async (weightKg: number) => {
    setError(null);
    try {
      const entry = await addWeightRecord(weightKg);
      setWeightEntries(current => [entry, ...current]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save weight entry.");
      throw saveError;
    }
  }, []);

  const addSteps = useCallback(async (steps: number) => {
    setError(null);
    try {
      const entry = await addStepsRecord(steps);
      setStepEntries(current => [
        entry,
        ...current.filter(item => item.recordedAt.slice(0, 10) !== entry.recordedAt.slice(0, 10)),
      ]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save step entry.");
      throw saveError;
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      active,
      history,
      goals,
      weightEntries,
      stepEntries,
      loading,
      error,
      lastSummary,
      startSession,
      pause,
      resume,
      nextMove,
      addPoint,
      endSession,
      markExerciseDone,
      saveFeedback,
      saveGoals: updateGoals,
      addWeight,
      addSteps,
      syncPhoneSteps,
      refreshProgress,
      elapsedSeconds,
    }),
    [
      active,
      history,
      goals,
      weightEntries,
      stepEntries,
      loading,
      error,
      lastSummary,
      startSession,
      pause,
      resume,
      nextMove,
      addPoint,
      endSession,
      markExerciseDone,
      saveFeedback,
      updateGoals,
      addWeight,
      addSteps,
      syncPhoneSteps,
      refreshProgress,
      elapsedSeconds,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside <SessionProvider>");
  return context;
}

export function useElapsed() {
  const { active, elapsedSeconds } = useSession();
  const [seconds, setSeconds] = useState(() => elapsedSeconds());
  const isRunning = active?.status === "running";
  const startedAt = active?.startedAt;

  useEffect(() => {
    setSeconds(elapsedSeconds());
    if (!isRunning) return;
    const interval = setInterval(() => setSeconds(elapsedSeconds()), 1000);
    return () => clearInterval(interval);
  }, [isRunning, startedAt, elapsedSeconds]);

  return seconds;
}
