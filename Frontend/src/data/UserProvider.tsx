import React, { createContext, useContext, useMemo, useState } from "react";

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

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState("Martin");
  const [email, setEmail] = useState("");
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);

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
          return [
            ...current,
            { exerciseId, completedAt: new Date().toISOString() },
          ];
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
