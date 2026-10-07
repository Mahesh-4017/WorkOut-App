import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "workoutFavorites.v1";

type WorkoutContextValue = {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(FAVORITES_KEY)
      .then(raw => {
        if (!mounted || !raw) return;
        const stored: unknown = JSON.parse(raw);
        if (Array.isArray(stored) && stored.every(id => typeof id === "string")) {
          setFavorites(stored);
        } else {
          throw new Error("Saved workout favorites are not a list of IDs.");
        }
      })
      .catch(error => {
        console.error("Unable to load saved workout favorites.", error);
      })
      .finally(() => {
        if (mounted) setLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)).catch(error => {
      console.error("Unable to save workout favorites.", error);
    });
  }, [favorites, loaded]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(current =>
      current.includes(id)
        ? current.filter(favoriteId => favoriteId !== id)
        : [...current, id],
    );
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite: (id: string) => favorites.includes(id),
    }),
    [favorites, toggleFavorite],
  );

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkouts() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkouts must be used inside <WorkoutProvider>");
  }
  return context;
}
