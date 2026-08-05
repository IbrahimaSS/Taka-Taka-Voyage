// Helper pour formater les montants en GNF
export const formatGNF = (value) => {
  if (value == null || isNaN(value)) return '0 GNF';
  return Number(value).toLocaleString('fr-FR') + ' GNF';
};

// Fonction utilitaire pour obtenir le libellé du service
export const getServiceLabel = (service, t) => {
  const config = {
    MOTO: t('commissions.moto_taxi'),
    TAXI: t('commissions.taxi'),
    VOITURE: t('commissions.private_car'),
    BUS: t('commissions.bus')
  };
  return config[service] || service;
};
