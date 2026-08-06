import { useState, useEffect } from 'react';
import { adminService } from '../../../../services/adminService';

export const useDashboardData = ({ showToast, t }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evolutionData, setEvolutionData] = useState(null);
  const [repartitionData, setRepartitionData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          adminService.getDashboardStats(),
          adminService.getRecentTrips(),
          adminService.getMonthlyRevenue({ periode: 6, mode: 'mensuel' }),
          adminService.getRevenueByVehicleType()
        ]);

        const [statsRes, tripsRes, evolutionRes, repartitionRes] = results;

        if (statsRes.status === 'fulfilled' && statsRes.value.data.succes) {
          setDashboardData(statsRes.value.data.stats);
        }

        if (tripsRes.status === 'fulfilled' && tripsRes.value.data.succes) {
          setTrips(tripsRes.value.data.trajets || []);
        }

        if (evolutionRes.status === 'fulfilled' && evolutionRes.value.data.succes) {
          setEvolutionData(evolutionRes.value.data.evolution);
        }

        if (repartitionRes.status === 'fulfilled' && repartitionRes.value.data.succes) {
          setRepartitionData(repartitionRes.value.data.repartition);
        } else if (repartitionRes.status === 'rejected') {
          console.error("Erreur répartition:", repartitionRes.reason);
        }
      } catch (error) {
        showToast(t('common.error') || 'Erreur', t('dashboard.error_loading') || 'Impossible de charger les données du tableau de bord', 'error');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast, t]);

  return { dashboardData, trips, loading, evolutionData, repartitionData };
};
