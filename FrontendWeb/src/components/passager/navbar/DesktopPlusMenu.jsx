import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, ChevronDown } from 'lucide-react';
import { SECONDARY_TABS, SECONDARY_TAB_IDS } from './navTabsConfig';
import NavBadgeDot from './NavBadgeDot';

const DesktopPlusMenu = ({ activeTab, onTabChange, badges }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const isActive = SECONDARY_TAB_IDS.includes(activeTab);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        title={t('nav.more', 'Plus')}
        className={`relative shrink-0 px-2.5 xl:px-5 py-3 text-sm font-medium rounded-lg transition-colors flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 ${isActive || isOpen ? 'text-green-600 dark:text-green-500 bg-white dark:bg-gray-800 shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
      >
        <span className="relative xl:mr-2">
          <MoreHorizontal className="w-4 h-4" />
          <NavBadgeDot count={badges.secondaryTotal} className="-top-1.5 -right-1.5" />
        </span>
        <span className="hidden xl:inline">{t('nav.more', 'Plus')}</span>
        <ChevronDown className={`hidden xl:block w-3.5 h-3.5 ml-1.5 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50"
          >
            {SECONDARY_TABS.map((tab) => {
              const Icon = tab.icon;
              const tabIsActive = activeTab === tab.id;
              const count = badges.perTab[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => { onTabChange(tab.id); setIsOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between ${tabIsActive
                    ? 'text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-green-600 dark:hover:text-green-500'
                    }`}
                >
                  <span className="flex items-center">
                    <Icon className="w-4 h-4 mr-3 opacity-70" />
                    {t(`nav.${tab.id}`)}
                  </span>
                  {count > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DesktopPlusMenu;
