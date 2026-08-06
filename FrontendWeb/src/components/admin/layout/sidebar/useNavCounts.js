import { useState, useEffect } from 'react';
import { ROLES } from '../../../../config/navConfig';
import { adminService } from '../../../../services/adminService';
import { apiClient } from '../../../../services/apiClient';

export const useNavCounts = (role) => {
  const [navCounts, setNavCounts] = useState({});

  useEffect(() => {
    let mounted = true;
    const fetchDynamicCounts = async () => {
      if (role !== ROLES.ADMIN) return;
      try {
        const [dashRes, passRes, driverRes, valRes, docRes, litRes] = await Promise.all([
          adminService.getDashboardStats().catch(() => ({ data: {} })),
          adminService.getPassengerStats().catch(() => ({ data: {} })),
          adminService.getDriverStats().catch(() => ({ data: {} })),
          adminService.getValidationStats().catch(() => ({ data: {} })),
          adminService.getDocumentStats().catch(() => ({ data: {} })),
          apiClient.get('/admin/litiges/stats').catch(() => ({ data: {} })),
        ]);

        if (!mounted) return;

        // Dashboard: data.stats.{trajetsEffectues, passagersTotal, ...}
        const dash = dashRes.data?.stats || dashRes.data || {};
        // Passenger stats: data.stats.{utilisateursActifs, ...}
        const pass = passRes.data?.stats || {};
        // Driver stats: data.stats.{...}
        const driver = driverRes.data?.stats || {};
        // Validation stats: data.stats.{enAttente, ...}
        const val = valRes.data?.stats || {};
        // Document stats: data.stats.{...}
        const doc = docRes.data?.stats || {};
        // Litiges stats: data.cards.{ouverts, enCours, resolus, total}
        const lit = litRes.data?.cards || litRes.data?.stats || {};

        const totalPassagers = pass.utilisateursActifs || dash.passagersTotal || 0;
        const totalChauffeurs = driver.totalChauffeurs || driver.chauffeursActifs || dash.chauffeursActifs || dash.chauffeursTotal || 0;
        const totalTrajets = dash.trajetsEffectues || 0;
        const validationsEnAttente = val.enAttente || 0;
        const documentsEnAttente = doc.enAttente || 0;
        const litigesOuverts = lit.ouverts || lit.total || 0;

        setNavCounts({
          'trajets': totalTrajets,
          'utilisateurs': totalPassagers + totalChauffeurs,
          'utilisateurs_utilisateurs': totalPassagers,
          'utilisateurs_chauffeurs': totalChauffeurs,
          'validations': validationsEnAttente + documentsEnAttente,
          'validations_documents': documentsEnAttente,
          'validations_validations': validationsEnAttente,
          'litiges': litigesOuverts,
        });
      } catch (err) {
        console.error('Failed to load nav counts', err);
      }
    };
    fetchDynamicCounts();
    return () => { mounted = false; };
  }, [role]);

  return navCounts;
};
