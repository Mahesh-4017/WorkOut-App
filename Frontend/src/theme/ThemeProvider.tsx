import React, {
    createContext,
    useContext,
    useMemo,
    useState,
} from "react";

import { useColorScheme } from "react-native";
import { lightTheme, darkTheme, AppTheme } from "./theme";

type ThemeContextType = {
    theme: AppTheme;
    isDark: boolean;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
    undefined
);

export const ThemeProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    // React Native automatically gives us the current system theme.
    const systemColorScheme = useColorScheme();

    // null fallback -> light
    const [isDark, setIsDark] = useState(
        systemColorScheme === "dark"
    );

    const theme = useMemo(
        () => (isDark ? darkTheme : lightTheme),
        [isDark]
    );

    const toggleTheme = () => {
        setIsDark((previous) => !previous);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                isDark,
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used inside ThemeProvider"
        );
    }

    return context;
};