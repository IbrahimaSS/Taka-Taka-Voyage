import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_TABS } from './navTabsConfig';
import NavBadgeDot from './NavBadgeDot';

const TabletSidebarItem = ({ tab, isActive, onTabChange, badgeCount, activeTab }) => {
  const { t } = useTranslation();
  const [showFlyout, setShowFlyout] = useState(false);
  const itemRef = useRef(null);
  const hasSubItems = tab.subItems && tab.subItems.length > 0;
  const Icon = tab.icon;

  useEffect(() => {
    if (!showFlyout) return;
    const handleClickOutside = (event) => {
      if (itemRef.current && !itemRef.current.contains(event.target)) {
        setShowFlyout(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFlyout]);

  return (
    <div ref={itemRef} className="relative group">
      <button
        onClick={() => hasSubItems ? setShowFlyout((v) => !v) : onTabChange(tab.id)}
        className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 ${isActive
          ? 'bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        aria-label={t(`nav.${tab.id}`)}
      >
        <Icon className="w-5 h-5" />
        <NavBadgeDot count={badgeCount} className="-top-1 -right-1" />
      </button>

      {/* Tooltip (souris/trackpad) */}
      <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-lg bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
        {t(`nav.${tab.id}`)}
      </span>

      {/* Flyout sous-menu (Historique) */}
      <AnimatePresence>
        {hasSubItems && showFlyout && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-0 ml-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50"
          >
            {tab.subItems.map((sub) => {
              const SubIcon = sub.icon;
              return (
                <button
                  key={sub.id}
                  onClick={() => { onTabChange(sub.id); setShowFlyout(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center ${activeTab === sub.id
                    ? 'text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  {SubIcon && <SubIcon className="w-4 h-4 mr-3 opacity-70" />}
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

const TabletSidebar = ({ activeTab, onTabChange, badges }) => {
  return (
    <aside className="hidden md:flex lg:hidden flex-col items-center fixed left-0 top-20 bottom-0 w-[72px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700/50 z-40 py-6 gap-2 overflow-y-auto">
      {ALL_TABS.map((tab) => {
        const isActive = activeTab === tab.id || (tab.subItems && tab.subItems.some(s => s.id === activeTab));
        return (
          <TabletSidebarItem
            key={tab.id}
            tab={tab}
            isActive={isActive}
            activeTab={activeTab}
            onTabChange={onTabChange}
            badgeCount={badges.perTab[tab.id]}
          />
        );
      })}
    </aside>
  );
};

export default TabletSidebar;
