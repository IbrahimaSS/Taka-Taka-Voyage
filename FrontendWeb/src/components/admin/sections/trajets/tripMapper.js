export const mapBackendTripToFrontend = (trip) => {
  const getStatus = (statut) => {
    switch (statut) {
      case 'TERMINEE': return 'completed';
      case 'EN_COURS': case 'ACCEPTEE': case 'ASSIGNEE': case 'ARRIVEE': return 'in-progress';
      case 'EN_ATTENTE': return 'pending';
      case 'ANNULEE': case 'ANNULEE_AVEC_FRAIS': return 'cancelled';
      default: return 'pending';
    }
  };

  const getVehicleType = (v, requested) => {
    if (v && (v.marque || v.modele)) return `${v.marque || ''} ${v.modele || ''}`.trim();
    if (v && v.type) return v.type;
    return requested || 'Standard';
  };

  return {
    id: trip.reference || `TR-${trip._id.slice(-6).toUpperCase()}`,
    _id: trip._id,
    time: new Date(trip.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    route: `${(trip.depart || '').split(',').slice(0, 2).join(', ').replace(' ! ', ', ')} - ${(trip.destination || '').split(',').slice(0, 2).join(', ').replace(' ! ', ', ')}`,
    distance: `${trip.distanceKm} km`,
    duration: `${trip.dureeMin} min`,
    passenger: {
      firstName: trip.passager?.prenom || '',
      lastName: trip.passager?.nom || '',
      name: trip.passager ? `${trip.passager.prenom} ${trip.passager.nom}` : 'Utilisateur supprimé',
      phone: trip.passager?.telephone || '-',
      email: trip.passager?.email || '-',
      rating: trip.passager?.noteMoyenne ?? 5,
      tripsCount: trip.passager?.nombreTrajets || 0,
      memberSince: trip.passager?.createdAt ? new Date(trip.passager.createdAt).toLocaleDateString() : '-',
      avatarColor: 'bg-emerald-100 text-emerald-600',
      photoUrl: trip.passager?.photoUrl
    },
    driver: trip.chauffeur ? {
      firstName: trip.chauffeur.prenom || '',
      lastName: trip.chauffeur.nom || '',
      name: `${trip.chauffeur.prenom} ${trip.chauffeur.nom}`,
      phone: trip.chauffeur.telephone,
      rating: trip.chauffeur.noteMoyenne ?? 5,
      vehicleType: (() => {
        const marque = trip.chauffeur.vehicule?.marque || '';
        const modele = trip.chauffeur.vehicule?.modele || '';
        if (!marque && !modele) return trip.typeVehicule || 'Standard';
        if (modele.toLowerCase().startsWith(marque.toLowerCase())) return modele;
        return `${marque} ${modele}`.trim();
      })(),
      yearsExperience: trip.chauffeur.valideLe ? Math.max(0, Math.floor((new Date() - new Date(trip.chauffeur.valideLe)) / (1000 * 60 * 60 * 24 * 365))) : 0,
      experienceStr: trip.chauffeur.valideLe ? (
        (() => {
          const diff = new Date() - new Date(trip.chauffeur.valideLe);
          const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
          if (months < 1) return "< 1 mois";
          if (months < 12) return `${months} mois`;
          return `${Math.floor(months / 12)} ans`;
        })()
      ) : '0 ans',
      completedTrips: trip.chauffeur.nombreTrajets || 0,
      avatarColor: 'bg-blue-100 text-blue-600',
      photoUrl: trip.chauffeur.photoUrl,
      vehicle: trip.chauffeur.vehicule
    } : {
      firstName: '',
      lastName: '',
      name: 'En attente...',
      phone: '-',
      rating: 0,
      vehicleType: '-',
      yearsExperience: 0,
      experienceStr: '0 ans',
      completedTrips: 0,
      avatarColor: 'bg-gray-100 text-gray-400'
    },
    vehicle: {
      type: trip.chauffeur?.vehicule?.type || trip.typeVehicule || 'Standard',
      model: trip.chauffeur?.vehicule?.modele || '-',
      plate: trip.chauffeur?.vehicule?.immatriculation || '-',
      color: trip.chauffeur?.vehicule?.couleur || '-',
      year: '-',
      capacity: trip.chauffeur?.vehicule?.places || 4,
      fuelType: '-',
      features: []
    },
    amount: `${(trip.prix || 0).toLocaleString()} GNF`,
    paymentMethod: trip.paiement?.methode || trip.paiement?.mode || 'CASH',
    status: getStatus(trip.statut),
    date: new Date(trip.createdAt).toISOString().split('T')[0],
    rawDate: new Date(trip.createdAt),
    startTime: new Date(trip.createdAt).toLocaleTimeString(),
    endTime: null,
    startLocation: {
      lat: (trip.departCoords?.coordinates?.[1] && trip.departCoords.coordinates[1] !== 0) ? trip.departCoords.coordinates[1] : 9.509, // Fallback Conakry
      lng: (trip.departCoords?.coordinates?.[0] && trip.departCoords.coordinates[0] !== 0) ? trip.departCoords.coordinates[0] : -13.712,
      address: trip.depart,
      city: 'Guinée',
      district: trip.depart,
      zone: '-'
    },
    endLocation: {
      lat: (trip.destinationCoords?.coordinates?.[1] && trip.destinationCoords.coordinates[1] !== 0) ? trip.destinationCoords.coordinates[1] : 9.509,
      lng: (trip.destinationCoords?.coordinates?.[0] && trip.destinationCoords.coordinates[0] !== 0) ? trip.destinationCoords.coordinates[0] : -13.712,
      address: trip.destination,
      city: 'Guinée',
      district: trip.destination,
      zone: '-'
    },
    distanceKm: trip.distanceKm,
    durationMin: trip.dureeMin,
    fareBreakdown: {
      base: Math.round((trip.prix || 0) * 0.20), // 20% estimé
      distance: Math.round((trip.prix || 0) * 0.60), // 60% estimé
      time: Math.round((trip.prix || 0) * 0.20), // 20% estimé
      total: trip.prix || 0,
      commission: Math.round((trip.prix || 0) * 0.15),
      platformFee: 0,
      driverEarnings: Math.round((trip.prix || 0) * 0.85)
    },
    rating: null,
    notes: '',
    archived: false,
    starred: false,
    createdAt: trip.createdAt,
    updatedAt: trip.createdAt,
    efficiency: 0,
    carbonSaved: '0 kg'
  };
};
