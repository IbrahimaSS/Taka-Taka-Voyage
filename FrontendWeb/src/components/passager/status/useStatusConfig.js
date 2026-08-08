import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader, Car, Check, Navigation, X, Calendar } from 'lucide-react';

export const useStatusConfig = (status) => {
  const { t } = useTranslation();

  return useMemo(() => {
    const map = {
      searching: {
        title: t('status.searching.title'),
        description: t('status.searching.description'),
        icon: Loader,
        color: "green",
      },
      driver_found: {
        title: t('status.driver_found.title'),
        description: t('status.driver_found.description'),
        icon: Car,
        color: "green",
      },
      arrived: {
        title: t('status.arrived.title'),
        description: t('status.arrived.description'),
        icon: Check,
        color: "green",
      },
      en_route: {
        title: t('status.en_route.title'),
        description: t('status.en_route.description'),
        icon: Navigation,
        color: "green",
      },
      cancelled: {
        title: t('status.cancelled.title'),
        description: t('status.cancelled.description'),
        icon: X,
        color: "red",
      },
      scheduled: {
        title: t('status.scheduled.title'),
        description: t('status.scheduled.description'),
        icon: Calendar,
        color: "blue",
      },
      completed: {
        title: t('status.completed.title'),
        description: t('status.completed.description'),
        icon: Check,
        color: "green",
      },
    };
    return map[status] || map.searching;
  }, [status, t]);
};
