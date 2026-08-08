import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { tripService } from '../../../services/tripService';

export const useTripsHistory = () => {
  const { t } = useTranslation();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedVehicleType] = useState('all');

  // Charger l'historique réel
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const { data } = await tripService.getPassengerHistory({
          page: currentPage,
          limit: 50 // Fetch enough for client-side filtering or handle server-side later
        });

        if (data.succes) {
          const formattedTrips = data.trajets.map(t_raw => ({
            id: t_raw._id,
            date: new Date(t_raw.createdAt).toLocaleString(undefined, {
              day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
            }),
            status: t_raw.statut === 'TERMINEE' ? 'completed' : 'cancelled',
            departure: t_raw.depart || (t_raw.pointDepart && t_raw.pointDepart.adresse) || (t_raw.reservation && t_raw.reservation.depart) || 'Non défini',
            destination: t_raw.destination || (t_raw.pointDestination && t_raw.pointDestination.adresse) || (t_raw.reservation && t_raw.reservation.destination) || 'Non défini',
            price: `${(t_raw.prix || t_raw.montantTotal || 0).toLocaleString()} GNF`,
            distance: String(t_raw.distanceKm || t_raw.distance || 0).includes('km') ? (t_raw.distanceKm || t_raw.distance || '0 km') : `${t_raw.distanceKm || t_raw.distance || 0} km`,
            rating: t_raw.note || t_raw.noteChauffeur || t_raw.chauffeur?.noteMoyenne || 0,
            driver: (() => {
              const driverCandidates = [t_raw.chauffeur, t_raw.driver, t_raw.reservation?.chauffeur, t_raw.reservation?.driver].filter(c => c && typeof c === 'object');

              // 1. NOM COMPLET (Fusion intelligente Prénom + Nom)
              let dName = '';
              let fName = '';
              let lName = '';
              let fullN = '';

              driverCandidates.forEach(c => {
                const u = c.utilisateur || c.user || c;
                if (u.prenom && !fName) fName = String(u.prenom).trim();
                if (u.nom && !lName) lName = String(u.nom).trim();
                if ((u.nomComplet || u.name || u.display_name) && !fullN) fullN = String(u.nomComplet || u.name || u.display_name).trim();
              });

              if (fullN && fullN.includes(' ')) dName = fullN;
              else if (fName && lName) dName = `${fName} ${lName}`;
              else dName = fullN || fName || lName || '';

              if (!dName || dName.length < 3) dName = t_raw.driverName || t_raw.chauffeurName || 'Chauffeur TakaTaka';

              // 2. TÉLÉPHONE (Scanner Nucléaire)
              let dPhone = '-';
              const pKeys = [
                'telephone', 'phone', 'tel', 'mobile', 'phoneNumber', 'num_tel',
                'driverPhone', 'chauffeurPhone', 'tel_chauffeur', 'driver_phone',
                'chauffeur_phone', 'whatsapp'
              ];

              const sObjects = [
                ...driverCandidates,
                ...driverCandidates.map(c => c.utilisateur || c.user),
                t_raw,
                t_raw.reservation,
                t_raw.reservation?.chauffeur,
                t_raw.reservation?.driver
              ].filter(o => o && typeof o === 'object');

              for (const obj of sObjects) {
                for (const k of pKeys) {
                  const val = obj[k];
                  if (val && String(val).trim().length > 3 && !['N/A', '-', 'NULL', 'UNDEFINED'].includes(String(val).toUpperCase().trim())) {
                    dPhone = String(val).trim();
                    break;
                  }
                }
                if (dPhone !== '-') break;
              }

              // 3. VÉHICULE — Priorité : profilVehicule (ChauffeurProfile) puis vehicule (Utilisateurs)
              let dVeh = 'Véhicule standard';
              const chauffeurObj = t_raw.chauffeur || t_raw.driver;
              if (chauffeurObj && typeof chauffeurObj === 'object') {
                // 1ère priorité : profilVehicule (données de ChauffeurProfile)
                const pv = chauffeurObj.profilVehicule;
                if (pv) {
                  const parts = [pv.marque, pv.modele].filter(Boolean).join(' ').trim();
                  if (parts.length > 1) {
                    dVeh = parts;
                  } else if (pv.couleur) {
                    dVeh = pv.couleur;
                  } else if (pv.type) {
                    dVeh = pv.type;
                  }
                }
                // 2ème priorité : vehicule (objet dans Utilisateurs)
                if (dVeh === 'Véhicule standard') {
                  const v = chauffeurObj.vehicule || chauffeurObj.vehicle;
                  if (v && typeof v === 'object') {
                    const parts = [v.marque, v.modele].filter(Boolean).join(' ').trim();
                    if (parts.length > 1) {
                      dVeh = parts;
                    } else if (v.couleur) {
                      dVeh = v.couleur;
                    } else if (v.type && v.type !== 'TAXI') {
                      dVeh = v.type;
                    }
                  }
                }
              }

              // 4. EMAIL
              let dEmail = '-';
              const eKeys = ['email', 'mail', 'courriel'];
              for (const obj of sObjects) {
                for (const k of eKeys) {
                  const val = obj[k];
                  if (val && typeof val === 'string' && val.includes('@')) {
                    dEmail = val.trim();
                    break;
                  }
                }
                if (dEmail !== '-') break;
              }

              // 5. NOTE RÉELLE du chauffeur pour ce trajet
              const driverRating = t_raw.chauffeur?.noteMoyenne
                ?? t_raw.driver?.noteMoyenne
                ?? t_raw.noteChauffeur
                ?? t_raw.note
                ?? 0;

              return {
                name: dName,
                vehicle: dVeh,
                rating: driverRating,
                phone: dPhone,
                email: dEmail,
                photo: driverCandidates[0]?.photoUrl || driverCandidates[0]?.utilisateur?.photoUrl
              };
            })(),
            payment: t_raw.paiement_methode || t_raw.paymentMethod || 'Espèces',
            duration: String(t_raw.dureeMin || t_raw.duree || t_raw.duration || 0).includes('min') ? (t_raw.dureeMin || t_raw.duree || t_raw.duration || '0 min') : `${t_raw.dureeMin || t_raw.duree || t_raw.duration || 0} min`,
            rawDate: t_raw.createdAt
          }));
          setTrips(formattedTrips);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentPage]); // Reload when page changes if server pagination used, here we fetch 50 and filter locally for now

  const statusFilters = [
    { id: 'all', label: t('history.status.all') },
    { id: 'completed', label: t('history.status.completed') },
    { id: 'cancelled', label: t('history.status.cancelled') },
    { id: 'pending', label: t('history.status.pending') },
  ];

  const sortedTrips = useMemo(() => {
    const sortableItems = [...trips];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'date') {
          aValue = new Date(a.date.split(',')[0]);
          bValue = new Date(b.date.split(',')[0]);
        }

        if (sortConfig.key === 'price') {
          aValue = parseInt(a.price.replace(/[^0-9]/g, ''));
          bValue = parseInt(b.price.replace(/[^0-9]/g, ''));
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [trips, sortConfig]);

  const filteredTrips = useMemo(() => {
    return sortedTrips.filter(trip => {
      const matchesSearch = searchTerm === '' ||
        trip.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.departure?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = activeFilter === 'all' || trip.status === activeFilter;
      const matchesVehicle = selectedVehicleType === 'all' ||
        trip.driver?.vehicle?.toLowerCase().includes(selectedVehicleType.toLowerCase());

      return matchesSearch && matchesStatus && matchesVehicle;
    });
  }, [sortedTrips, searchTerm, activeFilter, selectedVehicleType]);

  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrips = filteredTrips.slice(startIndex, endIndex);

  const stats = useMemo(() => {
    const total = filteredTrips.length;
    const completed = filteredTrips.filter(t => t.status === 'completed').length;
    const cancelled = filteredTrips.filter(t => t.status === 'cancelled').length;
    const totalDistance = filteredTrips.reduce((sum, trip) => sum + parseFloat(trip.distance || 0), 0);
    const totalCost = filteredTrips.reduce((sum, trip) => {
      return sum + parseInt(trip.price.replace(/[^0-9]/g, '') || 0);
    }, 0);
    const averageRating = filteredTrips.length > 0
      ? filteredTrips.reduce((sum, trip) => sum + (trip.rating || 0), 0) / filteredTrips.length
      : 0;

    return { total, completed, cancelled, totalDistance, totalCost, averageRating };
  }, [filteredTrips]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setActiveFilter('all');
    setSortConfig({ key: 'date', direction: 'desc' });
    toast.success(t('history.reset_filters'));
  };

  return {
    loading,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    activeFilter, setActiveFilter,
    searchTerm, setSearchTerm,
    sortConfig, requestSort,
    statusFilters,
    filteredTrips, currentTrips,
    totalPages, startIndex, endIndex,
    stats,
    resetFilters,
  };
};
