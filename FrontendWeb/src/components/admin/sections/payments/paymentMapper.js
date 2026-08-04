// Helper de mappage pour adapter les données backend au format frontend
export const mapBackendPaymentToFrontend = (p) => {
  const r = p.reservation || {};
  const passager = r.passager || {};
  const chauffeur = r.chauffeur || {};

  // Formatage montant
  const formatMoney = (amount) => `${(amount || 0).toLocaleString('fr-FR')} GNF`;

  // Mapping statut
  const getStatus = (s) => {
    switch (s) {
      case 'PAYE': return 'paid';
      case 'EN_ATTENTE': return 'pending';
      case 'ECHOUE': return 'failed';
      case 'REMBOURSE': return 'refunded';
      case 'ANNULE': return 'failed';
      default: return 'pending';
    }
  };

  // Mapping methode
  const getMethod = (m) => {
    if (!m) return 'cash';
    const lower = m.toLowerCase();
    if (lower.includes('orange')) return 'orange';
    if (lower.includes('mtn')) return 'mtn';
    if (lower.includes('wave')) return 'wave';
    if (lower.includes('carte') || lower.includes('card')) return 'card';
    if (lower === 'cash' || lower === 'especes' || lower === 'espèces') return 'cash';
    return 'cash';
  };

  const method = getMethod(p.methode);
  const status = getStatus(p.statut);
  const dateObj = new Date(p.createdAt);

  // Montants numériques bruts pour calculs
  const montantTotal = p.montantTotal || 0;
  const commissionPlateforme = p.commissionPlateforme || 0;
  const montantChauffeur = p.montantChauffeur || 0;
  const commissionRate = montantTotal > 0 ? Math.round((commissionPlateforme / montantTotal) * 100) : 20;

  return {
    id: `PAY-${p._id.slice(-6).toUpperCase()}`,
    _id: p._id,
    transactionId: p.transactionId || `TXN-${p._id.slice(-8).toUpperCase()}`,
    passenger: {
      name: passager.nomComplet || (passager.nom ? `${passager.prenom || ''} ${passager.nom}`.trim() : 'Utilisateur Client'),
      phone: passager.telephone || passager.phone || passager.mobile || passager.tel || (passager.utilisateur && (passager.utilisateur.telephone || passager.utilisateur.phone)) || '-',
      email: passager.email || (passager.utilisateur && passager.utilisateur.email) || '-',
      rating: passager.noteMoyenne ? passager.noteMoyenne.toFixed(1) : '-',
      photo: passager.photoUrl || null
    },
    driver: {
      name: chauffeur.nom ? `${chauffeur.prenom || ''} ${chauffeur.nom}`.trim() : 'Chauffeur',
      phone: chauffeur.telephone || '-',
      email: chauffeur.email || '-',
      rating: chauffeur.noteMoyenne ? chauffeur.noteMoyenne.toFixed(1) : '-',
      vehicle: chauffeur.vehicule
        ? (typeof chauffeur.vehicule === 'object'
          ? `${chauffeur.vehicule.marque || ''} ${chauffeur.vehicule.modele || ''}`.trim() || chauffeur.vehicule.marque || chauffeur.vehicule.modele || r.typeVehicule || '-'
          : chauffeur.vehicule)
        : (r.typeVehicule || '-'),
      account: chauffeur.email || chauffeur.telephone || '-',
      photo: chauffeur.photoUrl || null
    },
    trip: {
      id: r._id ? `TR-${r._id.slice(-6).toUpperCase()}` : 'TR-UNKNOWN',
      route: r.depart && r.destination ? `${r.depart.split(',')[0]} → ${r.destination.split(',')[0]}` : 'Trajet inconnu',
      distance: r.distanceKm ? `${r.distanceKm} km` : '-',
      duration: r.dureeMin ? `${r.dureeMin} min` : '-',
      date: dateObj.toLocaleDateString('fr-FR'),
      vehicleType: r.typeVehicule || '-'
    },
    amount: formatMoney(montantTotal),
    rawAmount: montantTotal,
    commission: formatMoney(commissionPlateforme),
    rawCommission: commissionPlateforme,
    netAmount: formatMoney(montantChauffeur),
    rawNetAmount: montantChauffeur,
    commissionRate: `${commissionRate}%`,
    fees: {
      platform: formatMoney(commissionPlateforme),
      processing: formatMoney(0)
    },
    method,
    methodRaw: p.methode || 'CASH',
    status,
    statusRaw: p.statut,
    rawDate: dateObj,
    date: dateObj.toLocaleDateString('fr-FR'),
    time: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    processedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleString('fr-FR') : null,
    reference: (r.paiement && r.paiement.reference) || p.reference || '-',
    invoiceGenerated: status === 'paid',
    invoiceNumber: `INV-${dateObj.getFullYear()}-${p._id.slice(-6).toUpperCase()}`,
    refundable: status === 'paid',
    archived: false,
    passengerId: passager._id,
    driverId: chauffeur._id
  };
};
