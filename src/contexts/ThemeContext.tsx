import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme mode type
export type ThemeMode = 'light' | 'dark';

// Theme context interface
interface ThemeContextProps {
  mode: ThemeMode;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

// Create context with default values
export const ThemeContext = createContext<ThemeContextProps>({
  mode: 'light',
  toggleTheme: () => {},
  isDarkMode: false
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Get theme preference from localStorage or default to light
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode === 'dark' || savedMode === 'light') 
      ? savedMode 
      : 'light';
  });

  // Toggle between light and dark modes
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Derived boolean for convenience
  const isDarkMode = mode === 'dark';

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}; 