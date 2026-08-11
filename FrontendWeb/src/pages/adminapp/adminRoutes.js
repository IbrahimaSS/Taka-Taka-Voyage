import { lazy } from 'react';

// Dashboard (route index/"") reste eager dans AdminApp.jsx. Ces 16 sections
// ne sont affichees qu'une a la fois selon la route active - React.lazy les
// sort du chunk critique initial.
const Users = lazy(() => import('../../components/admin/sections/Passagers'));
const Drivers = lazy(() => import('../../components/admin/sections/Chauffeurs'));
const Trips = lazy(() => import('../../components/admin/sections/Trajets'));
const Payments = lazy(() => import('../../components/admin/sections/Payments'));
const Validations = lazy(() => import('../../components/admin/sections/Validations'));
const Disputes = lazy(() => import('../../components/admin/sections/Litiges'));
const Documents = lazy(() => import('../../components/admin/sections/Documents'));
const Reports = lazy(() => import('../../components/admin/sections/Reports'));
const Commissions = lazy(() => import('../../components/admin/sections/Commissions'));
const Settings = lazy(() => import('../../components/admin/sections/Settings'));
const ActivityLogs = lazy(() => import('../../components/admin/sections/ActivityLogs'));
const Guides = lazy(() => import('../../components/admin/sections/Guides'));
const Coupons = lazy(() => import('../../components/admin/sections/Coupons'));
const Transactions = lazy(() => import('../../components/admin/sections/Transactions'));
const GarageVirtuel = lazy(() => import('../../components/admin/sections/GarageVirtuel'));
const UserProfile = lazy(() => import('../../components/admin/profile/UserProfile'));

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
