import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Moon, Sun, Gift } from 'lucide-react';
import LanguageSwitcher from '../../common/LanguageSwitcher';

const NavbarQuickActions = ({
  isTripInProgress, onNavigateToTracking,
  theme, isDark, onToggleTheme,
  walletBalance, onOpenWallet,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Bouton "Suivi actif" */}
      {isTripInProgress && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          <button
            onClick={onNavigateToTracking}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-3 py-2 rounded-lg flex items-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Navigation className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t('nav.live_tracking')}</span>
            <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs animate-pulse">
              ●
            </span>
          </button>
        </motion.div>
      )}

      {/* Language Switcher (masqué sur mobile, accessible depuis les Paramètres) */}
      <div className="hidden sm:block">
        <LanguageSwitcher />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={onToggleTheme}
        className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
        title={isDark ? t('settings.light_mode') : t('settings.dark_mode')}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-600" />
            )}
          </motion.div>
        </AnimatePresence>
      </button>

      {/* Wallet Quick Look (Dynamic Balance) */}
      <button
        onClick={onOpenWallet}
        className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-all shrink-0"
      >
        <Gift className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
          {walletBalance.toLocaleString()} GNF
        </span>
      </button>
    </>
  );
};

export default NavbarQuickActions;
