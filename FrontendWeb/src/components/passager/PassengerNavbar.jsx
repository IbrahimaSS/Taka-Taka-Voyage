import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';

import { useWalletBalance } from './navbar/useWalletBalance';
import { useNavBadges } from './navbar/useNavBadges';
import NavbarLogo from './navbar/NavbarLogo';
import DesktopNavTabs from './navbar/DesktopNavTabs';
import TabletSidebar from './navbar/TabletSidebar';
import NavbarQuickActions from './navbar/NavbarQuickActions';
import NotificationsMenu from './navbar/NotificationsMenu';
import ProfileMenu from './navbar/ProfileMenu';
import MobileBottomNav from './navbar/MobileBottomNav';
import MobileMoreSheet from './navbar/MobileMoreSheet';

const PassengerNavbar = ({
  activeTab,
  onTabChange,
  isTripInProgress = false,
  onNavigateToTracking,
  tabletSidebarCollapsed,
  onToggleTabletSidebar,
}) => {
  const { settings } = useSettings();
  const platform = settings?.platform || {};
  const { theme, toggleTheme, isDark } = useTheme();
  const walletBalance = useWalletBalance();
  const badges = useNavBadges();
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-800  backdrop-blur-lg shadow-sm border-b-2   border-gray-200/30 dark:border-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <NavbarLogo platform={platform} />

            <DesktopNavTabs activeTab={activeTab} onTabChange={onTabChange} badges={badges} />

            {/* User Actions */}
            <div className="flex items-center justify-end space-x-1.5 md:space-x-3 shrink-0">
              <NavbarQuickActions
                isTripInProgress={isTripInProgress}
                onNavigateToTracking={onNavigateToTracking}
                theme={theme}
                isDark={isDark}
                onToggleTheme={toggleTheme}
                walletBalance={walletBalance}
                onOpenWallet={() => onTabChange('wallet')}
              />

              <NotificationsMenu />

              {/* Profile Menu */}
              <ProfileMenu onTabChange={onTabChange} badges={badges} />
            </div>
          </div>
        </div>
      </nav>

      <TabletSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        badges={badges}
        collapsed={tabletSidebarCollapsed}
        onToggleCollapsed={onToggleTabletSidebar}
      />

      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        badges={badges}
        onOpenMore={() => setShowMoreSheet(true)}
      />
      <MobileMoreSheet
        isOpen={showMoreSheet}
        onClose={() => setShowMoreSheet(false)}
        activeTab={activeTab}
        onTabChange={onTabChange}
        badges={badges}
      />
    </>
  );
};

export default PassengerNavbar;
