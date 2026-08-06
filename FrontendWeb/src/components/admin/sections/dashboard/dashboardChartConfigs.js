import { chartConfigs } from '../../../../hooks/useCharts';

export const buildMonthlyRevenueConfig = (evolutionData, t, i18n) => {
  // Si pas de données, retour config par défaut
  if (!evolutionData) return chartConfigs.monthlyRevenue;

  // Pour éviter que le graphe "disparaisse" quand il n'y a qu'un point (un seul mois),
  // on va s'assurer d'avoir au moins les 6 derniers mois, même avec des 0.
  const last6Months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    // Calculer le mois de manière robuste
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const isoLabel = d.toISOString().substring(0, 7); // Format YYYY-MM pour la recherche

    // Label pour l'affichage (ex: "Jan 2024")
    const displayLabel = d.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      year: 'numeric'
    });

    const existingData = evolutionData.find(ed => ed.label === isoLabel);
    last6Months.push({
      label: displayLabel,
      revenus: existingData?.revenus || 0,
      commissions: existingData?.commissions || 0
    });
  }

  return {
    ...chartConfigs.monthlyRevenue,
    data: {
      labels: last6Months.map(d => d.label),
      datasets: [
        {
          ...chartConfigs.monthlyRevenue.data.datasets[0],
          label: t('payments.total_revenue') || 'Revenus Totaux',
          data: last6Months.map(d => d.revenus),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          ...chartConfigs.monthlyRevenue.data.datasets[0],
          label: t('payments.platform_commission') || 'Commissions Plateforme',
          data: last6Months.map(d => d.commissions),
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    }
  };
};

export const buildServiceDistributionConfig = (repartitionData) => {
  if (!repartitionData || repartitionData.length === 0) return chartConfigs.revenueDistribution;
  return {
    ...chartConfigs.revenueDistribution,
    data: {
      labels: repartitionData.map(d => d.type || 'Inconnu'),
      datasets: [{
        ...chartConfigs.revenueDistribution.data.datasets[0],
        data: repartitionData.map(d => d.montant)
      }]
    }
  };
};
