import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createDailyPlan,
  createPlannedWorkout,
  DailyPlan,
  deleteDailyPlan,
  deletePlannedWorkout,
  getDailyPlans,
  getPlannedWorkouts,
  PlannedWorkout,
} from "../api/schedule";
import { useAuth } from "../context/AuthContext";
import { addDays, CLASSES, toKey } from "./classSchedule";
import { PublicExercise } from "../api/exercises";
import { cancelPlanReminder, schedulePlanReminder } from "../utils/scheduleReminders";

type ScheduleContextValue = {
  scheduled: PlannedWorkout[];
  dayPlans: DailyPlan[];
  loading: boolean;
  error: string | null;
  add: (classId: string, date: string, time: string, repeatDays?: number[], reminderEnabled?: boolean) => Promise<void>;
  addExercise: (
    exercise: PublicExercise,
    date: string,
    time: string,
    durationMinutes: number,
    repeatDays?: number[],
    reminderEnabled?: boolean,
    repeatDates?: string[],
    reminderTime?: string,
  ) => Promise<boolean>;
  addBodyPartPlan: (
    bodyPart: string,
    date: string,
    time: string,
    durationMinutes: number,
    repeatDays?: number[],
    reminderEnabled?: boolean,
    repeatDates?: string[],
    reminderTime?: string,
    reminderSoundUrl?: string,
    reminderSoundTitle?: string,
  ) => Promise<boolean>;
  addDayPlan: (plan: Omit<DailyPlan, "id">) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
  removeDayPlan: (id: string) => Promise<void>;
  find: (classId: string, date: string) => PlannedWorkout | undefined;
  dates: Set<string>;
  refresh: () => Promise<void>;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);
const dateKeyOffset = 365;

function expandWorkoutPlans(plans: PlannedWorkout[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toKey(today);
  const instances: PlannedWorkout[] = [];

  for (const plan of plans) {
    if (plan.repeatDates?.length) {
      for (const key of plan.repeatDates) {
        if (key >= todayKey) instances.push({ ...plan, date: key });
      }
      continue;
    }
    if (!plan.repeatDays?.length) {
      if (plan.date >= todayKey) instances.push(plan);
      continue;
    }
    for (let offset = 0; offset <= dateKeyOffset; offset += 1) {
      const date = addDays(today, offset);
      const key = toKey(date);
      if (key >= plan.date && plan.repeatDays.includes(date.getDay())) {
        instances.push({ ...plan, date: key });
      }
    }
  }
  return instances.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<PlannedWorkout[]>([]);
  const [dayPlans, setDayPlans] = useState<DailyPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scheduled = useMemo(() => expandWorkoutPlans(workoutPlans), [workoutPlans]);

  const refresh = useCallback(async () => {
    if (!user) {
      setWorkoutPlans([]);
      setDayPlans([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [workouts, activities] = await Promise.all([getPlannedWorkouts(), getDailyPlans()]);
      setWorkoutPlans(workouts);
      setDayPlans(activities);
      const reminderResults = await Promise.allSettled([
        ...workouts.filter(plan => plan.reminderEnabled).map(plan => schedulePlanReminder(plan, "workout")),
        ...activities.filter(plan => plan.reminderEnabled).map(plan => schedulePlanReminder(plan, "day")),
      ]);
      if (reminderResults.some(result => result.status === "rejected")) {
        setError("Your schedule loaded, but one or more device reminders could not be restored.");
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your workout schedule.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const refreshAtMidnight = () => {
      refresh();
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timeout = setTimeout(refreshAtMidnight, nextMidnight.getTime() - now.getTime());
    };
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    timeout = setTimeout(refreshAtMidnight, nextMidnight.getTime() - now.getTime());
    return () => clearTimeout(timeout);
  }, [refresh]);

  const add = useCallback(async (
    classId: string,
    date: string,
    time: string,
    repeatDays: number[] = [],
    reminderEnabled = false,
  ) => {
    if (!user) {
      setError("Sign in to sync your workout schedule with your account.");
      return;
    }
    const classSession = CLASSES.find(item => item.id === classId);
    if (!classSession) {
      setError("This workout is no longer available to schedule.");
      return;
    }
    setError(null);
    try {
      const plan = await createPlannedWorkout({
        classId,
        title: classSession.title,
        bodyPart: classSession.tag,
        category: classSession.level,
        date,
        time,
        durationMinutes: classSession.minutes,
        repeatDays,
        repeatDates: [],
        reminderTime: time,
        reminderEnabled,
      });
      setWorkoutPlans(current => [...current, plan]);
      if (reminderEnabled) {
        try {
          const enabled = await schedulePlanReminder(plan, "workout", true);
          if (!enabled) setError("Workout saved, but notifications are disabled on this device.");
        } catch (reminderError) {
          setError(reminderError instanceof Error ? `Workout saved, but ${reminderError.message}` : "Workout saved, but its reminder could not be scheduled.");
        }
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this workout.");
    }
  }, [user]);

  const addExercise = useCallback(async (
    exercise: PublicExercise,
    date: string,
    time: string,
    durationMinutes: number,
    repeatDays: number[] = [],
    reminderEnabled = false,
    repeatDates: string[] = [],
    reminderTime = time,
  ): Promise<boolean> => {
    if (!user) {
      setError("Sign in to sync your workout schedule with your account.");
      return false;
    }
    setError(null);
    try {
      const plan = await createPlannedWorkout({
        exerciseId: exercise._id,
        title: exercise.title,
        bodyPart: exercise.bodyPart,
        category: exercise.category,
        date,
        time,
        durationMinutes,
        repeatDays,
        repeatDates,
        reminderTime,
        reminderEnabled,
      });
      setWorkoutPlans(current => [...current, plan]);
      if (reminderEnabled) {
        try {
          const enabled = await schedulePlanReminder(plan, "workout", true);
          if (!enabled) setError("Workout saved, but notifications are disabled on this device.");
        } catch (reminderError) {
          setError(reminderError instanceof Error ? `Workout saved, but ${reminderError.message}` : "Workout saved, but its reminder could not be scheduled.");
        }
      }
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this workout.");
      return false;
    }
  }, [user]);

  const addBodyPartPlan = useCallback(async (
    bodyPart: string,
    date: string,
    time: string,
    durationMinutes: number,
    repeatDays: number[] = [],
    reminderEnabled = false,
    repeatDates: string[] = [],
    reminderTime = time,
    reminderSoundUrl?: string,
    reminderSoundTitle?: string,
  ): Promise<boolean> => {
    if (!user) {
      setError("Sign in to sync your workout schedule with your account.");
      return false;
    }
    setError(null);
    try {
      const plan = await createPlannedWorkout({
        title: `${bodyPart} workout`,
        bodyPart,
        category: "Planned",
        date,
        time,
        durationMinutes,
        repeatDays,
        repeatDates,
        reminderTime,
        reminderSoundUrl,
        reminderSoundTitle,
        reminderEnabled,
      });
      setWorkoutPlans(current => [...current, plan]);
      if (reminderEnabled) {
        try {
          const enabled = await schedulePlanReminder(plan, "workout", true);
          if (!enabled) setError("Workout saved, but notifications are disabled on this device.");
        } catch (reminderError) {
          setError(reminderError instanceof Error ? `Workout saved, but ${reminderError.message}` : "Workout saved, but its reminder could not be scheduled.");
        }
      }
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this workout.");
      return false;
    }
  }, [user]);

  const addDayPlan = useCallback(async (planInput: Omit<DailyPlan, "id">): Promise<boolean> => {
    if (!user) {
      setError("Sign in to sync your day plan with your account.");
      return false;
    }
    setError(null);
    try {
      const plan = await createDailyPlan(planInput);
      setDayPlans(current => [...current, plan].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)));
      if (plan.reminderEnabled) {
        try {
          const enabled = await schedulePlanReminder(plan, "day", true);
          if (!enabled) setError("Plan saved, but notifications are disabled on this device.");
        } catch (reminderError) {
          setError(reminderError instanceof Error ? `Plan saved, but ${reminderError.message}` : "Plan saved, but its reminder could not be scheduled.");
        }
      }
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this day plan.");
      return false;
    }
  }, [user]);

  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await deletePlannedWorkout(id);
      const plan = workoutPlans.find(item => item.id === id);
      if (plan?.reminderEnabled) await cancelPlanReminder(id, "workout", plan.repeatDays, plan.repeatDates);
      setWorkoutPlans(current => current.filter(item => item.id !== id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove this workout.");
    }
  }, [workoutPlans]);

  const removeDayPlan = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteDailyPlan(id);
      const plan = dayPlans.find(item => item.id === id);
      if (plan?.reminderEnabled) await cancelPlanReminder(id, "day", plan.repeatDays);
      setDayPlans(current => current.filter(item => item.id !== id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove this planned activity.");
    }
  }, [dayPlans]);

  const value = useMemo<ScheduleContextValue>(() => ({
    scheduled,
    dayPlans,
    loading,
    error,
    add,
    addExercise,
    addBodyPartPlan,
    addDayPlan,
    remove,
    removeDayPlan,
    find: (classId, date) => scheduled.find(item => item.classId === classId && item.date === date),
    dates: new Set(scheduled.map(item => item.date)),
    refresh,
  }), [scheduled, dayPlans, loading, error, add, addExercise, addBodyPartPlan, addDayPlan, remove, removeDayPlan, refresh]);

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used inside <ScheduleProvider>");
  }
  return context;
}
