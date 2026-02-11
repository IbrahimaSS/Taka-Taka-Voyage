import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../utils/cn';

export function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-9 w-16 items-center rounded-full border border-slate-200 bg-slate-100 p-1 shadow-sm',
        'dark:border-slate-700 dark:bg-slate-800',
        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950',
        className
      )}
      aria-label={`Basculer en mode ${isDark ? 'clair' : 'sombre'}`}
    >
      <span className="sr-only">Basculer le thème</span>

      <span
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition-transform duration-200',
          'dark:bg-slate-950 dark:text-slate-200',
          isDark ? 'translate-x-7' : 'translate-x-0'
        )}
      >
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
    </button>
  );
}
