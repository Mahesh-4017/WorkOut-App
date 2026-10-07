import React from "react";
import { ThemeProvider } from "./src/theme/ThemeProvider";
import Navigation from "./src/navigation/Navigation";
import { UserProvider } from "./src/data/UserProvider";
import { AuthProvider } from "./src/context/AuthContext";
import { FoodProvider } from "./src/data/FoodProvider";
import { WorkoutProvider } from "./src/data/WorkoutProvider";
import { ScheduleProvider } from "./src/data/ScheduleProvider";
import { SessionProvider } from "./src/data/SessionProvider";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <FoodProvider>
            <WorkoutProvider>
              <ScheduleProvider>
                <SessionProvider>
                  <Navigation />
                </SessionProvider>
              </ScheduleProvider>
            </WorkoutProvider>
          </FoodProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}