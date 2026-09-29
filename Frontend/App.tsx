import React from "react";
import { ThemeProvider } from "./src/theme/ThemeProvider";
import Navigation from "./src/navigation/Navigation";
import { UserProvider } from "./src/data/UserProvider";
import { AuthProvider } from "./src/context/AuthContext";

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </UserProvider>
    </ThemeProvider>
  );
}