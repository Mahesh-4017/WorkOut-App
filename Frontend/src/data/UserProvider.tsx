import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type WorkoutHistoryItem = {
  exerciseId: string;
  completedAt: string;
};

type UserContextValue = {
  name: string;
  email: string;
  setUser: (name: string, email: string) => void;
  history: WorkoutHistoryItem[];
  addHistory: (exerciseId: string) => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);
const HISTORY_KEY = "workout-history";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState("Martin");
  const [email, setEmail] = useState("");
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then(value => {
      if (value) setHistory(JSON.parse(value));
    }).catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({
      name,
      email,
      setUser: (nextName: string, nextEmail: string) => {
        setName(nextName.trim());
        setEmail(nextEmail.trim());
      },
      history,
      addHistory: (exerciseId: string) => {
        setHistory(current => {
          if (current.some(item => item.exerciseId === exerciseId)) {
            return current;
          }
          const nextHistory = [
            ...current,
            { exerciseId, completedAt: new Date().toISOString() },
          ];
          AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory)).catch(() => undefined);
          return nextHistory;
        });
      },
    }),
    [email, history, name]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }
  return context;
}
