import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { ALL_TABS } from './navTabsConfig';
import NavBadgeDot from './NavBadgeDot';

// Rail tablette réduit par défaut (icônes + tooltip au survol) avec un bouton pour l'agrandir
// à la demande (icône + libellé + sous-menu Historique en accordéon inline). Le sous-menu
// est toujours rendu en accordéon plutôt qu'en flyout latéral : un flyout positionné
// "left-full" à l'intérieur d'un conteneur "overflow-y-auto" se fait clipper par le
// navigateur (poser overflow sur un axe force l'autre à être calculé "auto" aussi), ce qui le
// rendait invisible malgré un code d'ouverture correct.
const TabletSidebarItem = ({ tab, isActive, activeTab, onTabChange, badgeCount, collapsed, onRequestExpand }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubItems = tab.subItems && tab.subItems.length > 0;
  const Icon = tab.icon;

  // Ouvre automatiquement le sous-menu si on arrive directement sur une de ses sous-pages
  // (ex. Locations), pour ne pas laisser l'utilisateur sans repère visuel de sa position.
  useEffect(() => {
    if (isActive && hasSubItems && !collapsed) setIsExpanded(true);
  }, [isActive, hasSubItems, collapsed]);

  const handleClick = () => {
    if (hasSubItems) {
      // Réduit : on agrandit d'abord le rail pour révéler le sous-menu proprement,
      // plutôt qu'un flyout étroit dans 72px.
      if (collapsed) onRequestExpand();
      else setIsExpanded((v) => !v);
      return;
    }
    onTabChange(tab.id);
  };

  return (
    <div className="w-full px-3 group/item relative">
      <button
        onClick={handleClick}
        title={collapsed ? t(`nav.${tab.id}`) : undefined}
        className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 ${collapsed ? 'justify-center' : ''} ${isActive
          ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
      >
        <span className="relative shrink-0">
          <Icon className="w-5 h-5" />
          <NavBadgeDot count={badgeCount} className="-top-1.5 -right-1.5" />
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 min-w-0 text-left truncate">{t(`nav.${tab.id}`)}</span>
            {hasSubItems && (
              <ChevronDown className={`w-4 h-4 shrink-0 opacity-70 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            )}
          </>
        )}
      </button>

      {/* Tooltip (mode réduit uniquement) */}
      {collapsed && (
        <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-lg bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-2.5 py-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 z-50">
          {t(`nav.${tab.id}`)}
        </span>
      )}

      {/* Sous-menu inline (Historique) - mode agrandi uniquement */}
      <AnimatePresence initial={false}>
        {hasSubItems && !collapsed && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="pl-11 pr-1 py-1 space-y-0.5">
              {tab.subItems.map((sub) => {
                const SubIcon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    onClick={() => { onTabChange(sub.id); setIsExpanded(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${activeTab === sub.id
                      ? 'text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    {SubIcon && <SubIcon className="w-4 h-4 mr-2.5 opacity-70 shrink-0" />}
                    <span className="truncate">{sub.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TabletSidebar = ({ activeTab, onTabChange, badges, collapsed, onToggleCollapsed }) => {
  const { t } = useTranslation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="hidden md:flex lg:hidden flex-col fixed left-0 top-20 bottom-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700/50 z-40 overflow-hidden"
    >
      <div className="flex-1 flex flex-col gap-1 py-4 overflow-y-auto scrollbar-thin">
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
              collapsed={collapsed}
              onRequestExpand={onToggleCollapsed}
            />
          );
        })}
      </div>

      {/* Bouton agrandir / réduire */}
      <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={onToggleCollapsed}
          title={collapsed ? t('nav.expand_sidebar', 'Agrandir') : t('nav.collapse_sidebar', 'Réduire')}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? <ChevronsRight className="w-5 h-5 shrink-0" /> : <ChevronsLeft className="w-5 h-5 shrink-0" />}
          {!collapsed && <span>{t('nav.collapse_sidebar', 'Réduire')}</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default TabletSidebar;
