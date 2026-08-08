import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Globe } from 'lucide-react';
import { SECONDARY_TABS } from './navTabsConfig';
import NavBadgeDot from './NavBadgeDot';
import LanguageSwitcher from '../../common/LanguageSwitcher';

const MobileMoreSheet = ({ isOpen, onClose, activeTab, onTabChange, badges }) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="md:hidden fixed inset-x-0 bottom-0 z-[61] bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl border-t border-gray-200/50 dark:border-gray-700/50 pb-[env(safe-area-inset-bottom)]"
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t('nav.more', 'Plus')}</h3>
              <button
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 p-5 pb-8">
              {SECONDARY_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const count = badges.perTab[tab.id];
                return (
                  <button
                    key={tab.id}
                    onClick={() => { onTabChange(tab.id); onClose(); }}
                    className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-colors min-h-[88px] ${isActive
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                      }`}
                  >
                    <span className="relative">
                      <Icon className={`w-6 h-6 ${isActive ? 'text-green-600 dark:text-green-500' : 'text-gray-500 dark:text-gray-400'}`} />
                      <NavBadgeDot count={count} className="-top-2 -right-2.5" />
                    </span>
                    <span className={`text-xs font-medium text-center ${isActive ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
                      {t(`nav.${tab.id}`)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Langue (aussi modifiable depuis Paramètres) */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Globe className="w-4 h-4 mr-2 opacity-70" />
                {t('nav.language', 'Langue')}
              </span>
              {/* position="top" : cette ligne est collee au bord bas du sheet, une ouverture
                  vers le bas sortirait de l'ecran / serait coupee */}
              <LanguageSwitcher position="top" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMoreSheet;
