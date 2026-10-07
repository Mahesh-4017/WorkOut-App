import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPlannedWorkout, deletePlannedWorkout, getPlannedWorkouts, PlannedWorkout } from "../api/schedule";
import { useAuth } from "../context/AuthContext";
import { CLASSES } from "./classSchedule";
import { PublicExercise } from "../api/exercises";

type ScheduleContextValue = {
  scheduled: PlannedWorkout[];
  loading: boolean;
  error: string | null;
  add: (classId: string, date: string, time: string) => Promise<void>;
  addExercise: (exercise: PublicExercise, date: string, time: string, durationMinutes: number) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
  find: (classId: string, date: string) => PlannedWorkout | undefined;
  dates: Set<string>;
  refresh: () => Promise<void>;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [scheduled, setScheduled] = useState<PlannedWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setScheduled([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setScheduled(await getPlannedWorkouts());
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

  const add = useCallback(async (classId: string, date: string, time: string) => {
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
      });
      setScheduled(current => [...current, plan].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this workout.");
    }
  }, [user]);

  const addExercise = useCallback(async (
    exercise: PublicExercise,
    date: string,
    time: string,
    durationMinutes: number,
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
      });
      setScheduled(current => [...current, plan].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)));
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this workout.");
      return false;
    }
  }, [user]);

  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await deletePlannedWorkout(id);
      setScheduled(current => current.filter(item => item.id !== id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove this workout.");
    }
  }, []);

  const value = useMemo<ScheduleContextValue>(() => ({
    scheduled,
    loading,
    error,
    add,
    addExercise,
    remove,
    find: (classId, date) => scheduled.find(item => item.classId === classId && item.date === date),
    dates: new Set(scheduled.map(item => item.date)),
    refresh,
  }), [scheduled, loading, error, add, addExercise, remove, refresh]);

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used inside <ScheduleProvider>");
  }
  return context;
}
