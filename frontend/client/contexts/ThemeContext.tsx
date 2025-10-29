import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, getStoredTheme, setTheme, toggleTheme as toggleThemeUtil } from '@/utils/theme';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const handleToggleTheme = () => {
    setThemeState(prev => toggleThemeUtil(prev));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, toggleTheme: handleToggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
