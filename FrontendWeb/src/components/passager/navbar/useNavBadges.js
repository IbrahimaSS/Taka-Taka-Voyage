import { useMemo } from 'react';
import { useNotificationCenter, NOTIFICATION_CATEGORIES } from '../../../context/NotificationContext';
import { SECONDARY_TAB_IDS } from './navTabsConfig';

// Fait correspondre chaque catégorie de notification à l'onglet où l'utilisateur
// irait naturellement pour la traiter. Basé sur les catégories réellement émises
// aujourd'hui côté Passager (TRIP, PAYMENT, MODERATION dans PassengerContext.jsx).
const CATEGORY_TO_TAB = {
  [NOTIFICATION_CATEGORIES.TRIP]: 'history',
  [NOTIFICATION_CATEGORIES.PAYMENT]: 'payments',
  [NOTIFICATION_CATEGORIES.FINANCIAL]: 'wallet',
  [NOTIFICATION_CATEGORIES.REVIEW]: 'evaluations',
  [NOTIFICATION_CATEGORIES.ACCOUNT]: 'profile',
  [NOTIFICATION_CATEGORIES.MODERATION]: 'support',
  // SYSTEM et EMERGENCY restent visibles uniquement via la cloche de notifications :
  // pas de tab dédié auquel les rattacher sans induire l'utilisateur en erreur.
};

// Calcule un badge par onglet (nombre de notifications non lues) + un total agrégé
// pour les onglets regroupés sous "Plus", afin qu'une notification importante ne soit
// jamais ratée simplement parce que son onglet est masqué.
export const useNavBadges = () => {
  const { notifications } = useNotificationCenter();

  return useMemo(() => {
    const perTab = {};
    for (const n of notifications) {
      if (n.isRead) continue;
      const tabId = CATEGORY_TO_TAB[n.category];
      if (!tabId) continue;
      perTab[tabId] = (perTab[tabId] || 0) + 1;
    }

    const secondaryTotal = SECONDARY_TAB_IDS.reduce((sum, id) => sum + (perTab[id] || 0), 0);

    return { perTab, secondaryTotal };
  }, [notifications]);
};
