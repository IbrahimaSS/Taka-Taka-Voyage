import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { PRIMARY_TABS, SECONDARY_TAB_IDS } from './navTabsConfig';
import NavBadgeDot from './NavBadgeDot';

const MobileBottomNavItem = ({ tab, isActive, activeTab, onTabChange, count }) => {
  const { t } = useTranslation();
  const [showPopover, setShowPopover] = useState(false);
  const itemRef = useRef(null);
  const hasSubItems = tab.subItems && tab.subItems.length > 0;
  const Icon = tab.icon;

  useEffect(() => {
    if (!showPopover) return;
    const handleClickOutside = (event) => {
      if (itemRef.current && !itemRef.current.contains(event.target)) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPopover]);

  return (
    <div ref={itemRef} className="relative">
      <button
        onClick={() => hasSubItems ? setShowPopover((v) => !v) : onTabChange(tab.id)}
        className="relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-xl"
      >
        {isActive && (
          <motion.span
            layoutId="mobile-nav-active"
            className="absolute inset-0 bg-green-50 dark:bg-green-900/20 rounded-xl"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative">
          <Icon className={`w-5 h-5 transition-transform ${isActive ? 'text-green-600 dark:text-green-500 scale-110' : 'text-gray-500 dark:text-gray-400'}`} />
          <NavBadgeDot count={count} className="-top-1.5 -right-2" />
        </span>
        <span className={`relative text-[10px] mt-1 font-medium ${isActive ? 'text-green-600 dark:text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {t(`nav.${tab.id}`)}
        </span>
      </button>

      {/* Popover sous-menu (Historique) - s'ouvre au-dessus du bouton, la barre etant collee en bas */}
      <AnimatePresence>
        {hasSubItems && showPopover && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50"
          >
            {tab.subItems.map((sub) => {
              const SubIcon = sub.icon;
              return (
                <button
                  key={sub.id}
                  onClick={() => { onTabChange(sub.id); setShowPopover(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center ${activeTab === sub.id
                    ? 'text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  {SubIcon && <SubIcon className="w-4 h-4 mr-3 opacity-70 shrink-0" />}
                  {sub.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileBottomNav = ({ activeTab, onTabChange, badges, onOpenMore }) => {
  const { t } = useTranslation();
  const isMoreActive = SECONDARY_TAB_IDS.includes(activeTab);

  return (
    <div className="md:hidden fixed bottom-1 inset-x-4 z-50">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-2xl px-2 py-2">
        <div className="flex justify-around items-center">
          {PRIMARY_TABS.map((tab) => {
            const hasSubItems = tab.subItems && tab.subItems.length > 0;
            const isActive = activeTab === tab.id || (hasSubItems && tab.subItems.some(s => s.id === activeTab));
            return (
              <MobileBottomNavItem
                key={tab.id}
                tab={tab}
                isActive={isActive}
                activeTab={activeTab}
                onTabChange={onTabChange}
                count={badges.perTab[tab.id]}
              />
            );
          })}

          <button
            onClick={onOpenMore}
            className="relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-xl"
          >
            {isMoreActive && (
              <motion.span
                layoutId="mobile-nav-active"
                className="absolute inset-0 bg-green-50 dark:bg-green-900/20 rounded-xl"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">
              <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'text-green-600 dark:text-green-500 scale-110' : 'text-gray-500 dark:text-gray-400'}`} />
              <NavBadgeDot count={badges.secondaryTotal} className="-top-1.5 -right-2" />
            </span>
            <span className={`relative text-[10px] mt-1 font-medium ${isMoreActive ? 'text-green-600 dark:text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {t('nav.more', 'Plus')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
