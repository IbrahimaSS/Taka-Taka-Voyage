import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreVertical, Sun, Moon, QrCode } from 'lucide-react';

// Regroupe Theme + Scanner QR derriere un seul bouton sur les tres petits
// ecrans (< sm), ou la rangee d'icones du Header ne tient plus a plat.
// Au-dela de sm, Theme et QR restent affiches individuellement (inchange).
const MoreActionsDropdown = ({ theme, toggleTheme, showQrScanner, onOpenScanner }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onDocDown = (e) => {
      if (open && !e.target.closest('.more-actions-container')) setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [open]);

  return (
    <div className="relative more-actions-container sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl surface hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 ring-primary"
        aria-label="Plus d'actions"
      >
        <MoreVertical className="h-5 w-5 text-slate-700 dark:text-slate-200" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden p-1"
          >
            <button
              type="button"
              onClick={() => { toggleTheme(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />}
              {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </button>

            {showQrScanner && (
              <button
                type="button"
                onClick={() => { onOpenScanner(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <QrCode className="h-4 w-4" />
                Scanner un QR Code
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoreActionsDropdown;
