import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "workout-notification-read-ids-v1";

type NotificationContextValue = {
  readIds: string[];
  ready: boolean;
  error: string | null;
  markRead: (id: string) => Promise<void>;
  markAllRead: (ids: string[]) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [readIds, setReadIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readIdsRef = useRef(readIds);
  readIdsRef.current = readIds;

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(value => {
        if (!active || !value) return;
        const stored: unknown = JSON.parse(value);
        if (Array.isArray(stored) && stored.every(id => typeof id === "string")) {
          readIdsRef.current = stored;
          setReadIds(stored);
        } else {
          throw new Error("Saved notification read status is invalid.");
        }
      })
      .catch(loadError => {
        if (!active) return;
        const message = loadError instanceof Error ? loadError.message : "Unable to load saved notification status.";
        setError(message);
        console.error("Unable to load saved notification status.", loadError);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const persistReadIds = useCallback(async (nextIds: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
      readIdsRef.current = nextIds;
      setReadIds(nextIds);
      setError(null);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Unable to save notification read status.";
      setError(message);
      throw saveError;
    }
  }, []);

  const markRead = useCallback(async (id: string) => {
    if (readIdsRef.current.includes(id)) return;
    await persistReadIds([...readIdsRef.current, id]);
  }, [persistReadIds]);

  const markAllRead = useCallback(async (ids: string[]) => {
    const nextIds = [...new Set([...readIdsRef.current, ...ids])];
    if (nextIds.length === readIdsRef.current.length) return;
    await persistReadIds(nextIds);
  }, [persistReadIds]);

  const value = useMemo(
    () => ({ readIds, ready, error, markRead, markAllRead }),
    [readIds, ready, error, markRead, markAllRead],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used inside <NotificationProvider>.");
  return context;
}
