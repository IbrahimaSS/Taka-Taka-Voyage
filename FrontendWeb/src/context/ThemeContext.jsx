import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

function getSystemPrefersDark() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) {}
  return getSystemPrefersDark() ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  // If the user hasn't explicitly chosen a theme, follow the system preference.
  useEffect(() => {
    let mql;
    try {
      const saved = localStorage.getItem('theme');
      const isExplicit = saved === 'light' || saved === 'dark';
      if (isExplicit) return;

      if (typeof window !== 'undefined' && window.matchMedia) {
        mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => setThemeState(mql.matches ? 'dark' : 'light');
        handler();

        if (mql.addEventListener) mql.addEventListener('change', handler);
        else mql.addListener(handler);

        return () => {
          if (mql.removeEventListener) mql.removeEventListener('change', handler);
          else mql.removeListener(handler);
        };
      }
    } catch (e) {}

    return undefined;
  }, []);

  // Apply theme class on <html> (Tailwind darkMode: 'class').
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;

    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
  }, [theme]);

  const value = useMemo(() => {
    const setTheme = (next) => {
      if (next !== 'light' && next !== 'dark') return;
      setThemeState(next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) {}
    };

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    return {
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
