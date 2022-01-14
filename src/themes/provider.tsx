import { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as UIThemeProvider } from 'evergreen-ui';
import useLocalStorage from 'use-local-storage';
import themes from '.';

interface ThemeProviderProps {}

export const ThemeContext = createContext<{ theme: ThemeName; setTheme: (theme: ThemeName) => void; }>({ theme: 'light', setTheme: () => {} })

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: React.PropsWithChildren<ThemeProviderProps>) => {
    const [theme, setTheme] = useLocalStorage<ThemeName>('qiwi-dashboard.theme', 'light', { syncData: true });

    const currentTheme = useMemo(() => themes[theme], [theme]);

    return <ThemeContext.Provider value={{ theme, setTheme }}>
        <UIThemeProvider value={currentTheme}>
            {children}
        </UIThemeProvider>
    </ThemeContext.Provider>
}