import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';

import { useWalletBalance } from './navbar/useWalletBalance';
import NavbarLogo from './navbar/NavbarLogo';
import DesktopNavTabs from './navbar/DesktopNavTabs';
import NavbarQuickActions from './navbar/NavbarQuickActions';
import NotificationsMenu from './navbar/NotificationsMenu';
import ProfileMenu from './navbar/ProfileMenu';
import MobileBottomNav from './navbar/MobileBottomNav';

const PassengerNavbar = ({
  activeTab,
  onTabChange,
  tabs,
  isTripInProgress = false,
  onNavigateToTracking
}) => {
  const { settings } = useSettings();
  const platform = settings?.platform || {};
  const { theme, toggleTheme, isDark } = useTheme();
  const walletBalance = useWalletBalance();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-800  backdrop-blur-lg shadow-sm border-b-2   border-gray-200/30 dark:border-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20">
          <NavbarLogo platform={platform} />

          <DesktopNavTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

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

            <ProfileMenu tabs={tabs} onTabChange={onTabChange} />
          </div>
        </div>
      </div>

      <MobileBottomNav tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
    </nav>
  );
};

export default PassengerNavbar;
