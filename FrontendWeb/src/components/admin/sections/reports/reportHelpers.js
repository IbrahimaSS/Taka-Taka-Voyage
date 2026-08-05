// Trouve le nom d'un passager/chauffeur dans differentes formes possibles d'objet backend
export const findNameInObject = (p, role = 'passager') => {
  const getFromObj = (obj) => {
    if (!obj || typeof obj !== 'object') return null;
    return obj.nomComplet || obj.fullName || obj.name ||
      (obj.prenom || obj.nom ? `${obj.prenom || ''} ${obj.nom || ''}`.trim() : null) ||
      (obj.firstName || obj.lastName ? `${obj.firstName || ''} ${obj.lastName || ''}`.trim() : null) ||
      (obj.utilisateur ? (obj.utilisateur.nomComplet || (obj.utilisateur.prenom || obj.utilisateur.nom ? `${obj.utilisateur.prenom || ''} ${obj.utilisateur.nom || ''}`.trim() : null)) : null);
  };

  const isRole = (r) => role.toLowerCase().includes(r);

  if (isRole('passager')) {
    return getFromObj(p.passager) ||
      getFromObj(p.reservation?.passager) ||
      getFromObj(p.trajet?.passager) ||
      getFromObj(p.client) ||
      p.nomPassager || p.passagerName ||
      (p.reservation && (p.reservation.nomPassager || p.reservation.passagerName)) ||
      (typeof p.passager === 'string' && p.passager.length > 3 ? p.passager : 'N/A');
  } else {
    return getFromObj(p.chauffeur) ||
      getFromObj(p.reservation?.chauffeur) ||
      getFromObj(p.trajet?.chauffeur) ||
      getFromObj(p.driver) ||
      p.nomChauffeur || p.chauffeurName ||
      (p.reservation && (p.reservation.nomChauffeur || p.reservation.chauffeurName)) ||
      (typeof p.chauffeur === 'string' && p.chauffeur.length > 3 ? p.chauffeur : 'N/A');
  }
};

export const getReportSize = (type, format) => {
  const base = type === 'financial' ? 450 : type === 'users' ? 280 : 350;
  const mult = format === 'pdf' ? 1.2 : format === 'csv' ? 0.3 : 0.8;
  return Math.round(base * mult);
};
