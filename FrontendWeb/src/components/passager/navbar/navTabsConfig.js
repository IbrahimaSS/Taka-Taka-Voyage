import {
  Home, History, CreditCard, Settings as SettingsIcon,
  Headphones, Car, Star, Calendar, Users, Wallet as WalletIcon,
} from 'lucide-react';

// Les 4 onglets consultés le plus souvent (boucle produit principale + réflexe de solde)
// restent visibles en permanence, quel que soit le mode. Le reste est regroupé sous "Plus"
// (sheet mobile, dropdown desktop, rail complet en icônes sur tablette).
export const PRIMARY_TABS = [
  { id: 'home', icon: Home },
  {
    id: 'history',
    icon: History,
    subItems: [
      { id: 'history_vtc', label: 'Taxi VTC', icon: Car },
      { id: 'history_rental', label: 'Locations', icon: Calendar },
      { id: 'history_covoiturage', label: 'Covoiturage', icon: Users },
    ],
  },
  { id: 'wallet', icon: WalletIcon },
  { id: 'planning', icon: Calendar },
];

// 'profile' n'est volontairement pas dans cette liste : le Profil se consulte
// depuis le Menu Profil (avatar), pas comme un onglet de navigation classique.
export const SECONDARY_TABS = [
  { id: 'payments', icon: CreditCard },
  { id: 'evaluations', icon: Star },
  { id: 'settings', icon: SettingsIcon },
  { id: 'support', icon: Headphones },
];

export const ALL_TABS = [...PRIMARY_TABS, ...SECONDARY_TABS];

export const PRIMARY_TAB_IDS = PRIMARY_TABS.map(t => t.id);
export const SECONDARY_TAB_IDS = SECONDARY_TABS.map(t => t.id);
