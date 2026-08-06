import Users from '../../components/admin/sections/Passagers';
import Drivers from '../../components/admin/sections/Chauffeurs';
import Trips from '../../components/admin/sections/Trajets';
import Payments from '../../components/admin/sections/Payments';
import Validations from '../../components/admin/sections/Validations';
import Disputes from '../../components/admin/sections/Litiges';
import Documents from '../../components/admin/sections/Documents';
import Reports from '../../components/admin/sections/Reports';
import Commissions from '../../components/admin/sections/Commissions';
import Settings from '../../components/admin/sections/Settings';
import ActivityLogs from '../../components/admin/sections/ActivityLogs';
import Guides from '../../components/admin/sections/Guides';
import Coupons from '../../components/admin/sections/Coupons';
import Transactions from '../../components/admin/sections/Transactions';
import GarageVirtuel from '../../components/admin/sections/GarageVirtuel';
import UserProfile from '../../components/admin/profile/UserProfile';

// Routes admin (hors index/"" qui pointent toutes deux vers Dashboard, gerees a part)
export const adminRoutes = [
  { path: 'utilisateurs', Component: Users },
  { path: 'chauffeurs', Component: Drivers },
  { path: 'trajets', Component: Trips },
  { path: 'paiements', Component: Payments },
  { path: 'validations', Component: Validations },
  { path: 'litiges', Component: Disputes },
  { path: 'promotions', Component: Coupons },
  { path: 'documents', Component: Documents },
  { path: 'rapports', Component: Reports },
  { path: 'commissions', Component: Commissions },
  { path: 'parametres', Component: Settings },
  { path: 'logs', Component: ActivityLogs },
  { path: 'guides', Component: Guides },
  { path: 'transactions', Component: Transactions },
  { path: 'locations', Component: GarageVirtuel },
  { path: 'profil', Component: UserProfile },
];
