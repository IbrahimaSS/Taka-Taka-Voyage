import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { cn } from '../../../utils/cn';

const MenuItem = ({
  icon: Icon,
  label,
  path,
  count,
  collapsed,
  onClick,
  subItems = [],
}) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const hasSubItems = !!(subItems && subItems.length);

  const to = path && path.length ? path : '.';

  const badge = useMemo(() => {
    if (count === null || count === undefined) return null;
    return (
      <span
        className={cn(
          'ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold',
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
        )}
      >
        {count}
      </span>
    );
  }, [count]);

  const handleClick = (e) => {
    if (hasSubItems && !collapsed) {
      e.preventDefault();
      setIsSubMenuOpen((v) => !v);
      return;
    }
    onClick?.();
  };

  const itemBase = cn(
    'group flex items-center gap-3 rounded-xl px-3 py-2.5 mx-2 text-sm font-medium',
    'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30'
  );

  const iconBase =
    'h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-transparent';

  return (
    <div className="w-full">
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            itemBase,
            collapsed && 'justify-center',
            isActive
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-sm'
              : 'text-gray-600 text-[15px] hover:bg-gray-200/90 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700/50 dark:hover:text-white'
          )
        }
        onClick={handleClick}
        end={!hasSubItems}
      >
        {({ isActive }) => (
          <>
            <span
              className={cn(
                iconBase,
                isActive
                  ? 'bg-white/15'
                  : 'bg-gray-100/70 text-gray-700 group-hover:bg-gray-200/70 dark:bg-gray-800/60 dark:text-gray-200 dark:group-hover:bg-gray-800'
              )}
            >
              <Icon className="h-5 w-5" />
            </span>

            {!collapsed && (
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <span className="truncate">{label}</span>
                <div className="flex items-center">
                  {badge}
                  {hasSubItems && (
                    <motion.span
                      animate={{ rotate: isSubMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.18 }}
                      className={cn(
                        'ml-2 inline-flex h-8 w-8 items-center justify-center rounded-lg',
                        isActive ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
                      )}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </NavLink>

      {/* Submenu */}
      <AnimatePresence initial={false}>
        {!collapsed && hasSubItems && isSubMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-2 mt-1 overflow-hidden"
          >
            <div className="pl-12 pr-2 pb-2 space-y-1">
              {subItems.map((subItem) => (
                <NavLink
                  key={subItem.path}
                  to={subItem.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-gray-300 text-gray-900 dark:bg-gray-900/40 dark:text-white'
                        : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/40 dark:hover:text-white'
                    )
                  }
                  onClick={onClick}
                  end
                >
                  <span className="truncate">{subItem.label}</span>
                  {subItem.count !== null && subItem.count !== undefined && (
                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      {subItem.count}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuItem;
