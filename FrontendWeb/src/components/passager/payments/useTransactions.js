import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { BarChart3, CreditCard, RefreshCw, Gift, AlertCircle, Clock } from 'lucide-react';
import { tripService } from '../../../services/tripService';

export const useTransactions = () => {
  const { t, i18n } = useTranslation();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les paiements réels
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        // On récupère les paiements ET l'historique pour croiser les données (stratégie ultime)
        const [paymentsRes, historyRes] = await Promise.all([
          tripService.getPayments({ limit: 100 }),
          tripService.getPassengerHistory({ limit: 100 })
        ]);

        if (paymentsRes.data.succes) {
          const trips = historyRes.data.trajets || [];
          const formattedTransactions = paymentsRes.data.paiements.map(p => {
            const sameId = (id1, id2) => {
              if (!id1 || !id2) return false;
              const s1 = typeof id1 === 'object' ? (id1._id || id1.id || id1) : id1;
              const s2 = typeof id2 === 'object' ? (id2._id || id2.id || id2) : id2;
              return String(s1) === String(s2);
            };

            const relatedTrip = trips.find(t =>
              sameId(t._id, p.trajet) || sameId(t._id, p.reservation) ||
              sameId(t.reservation, p.reservation) || sameId(t.trajet, p.trajet) ||
              sameId(t._id, p.reservationId) || sameId(t.reservation?._id, p.reservation)
            );

            return {
              id: p._id,
              date: new Date(p.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US'),
              time: new Date(p.createdAt).toLocaleTimeString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
              type: (p.type === 'PAIEMENT_TRAJET' || p.reservation || p.trajet) ? 'Paiement trajet' : (p.type === 'RECHARGE' ? 'Recharge' : 'Autre'),
              amount: -(p.montantTotal || p.montant || 0),
              method: p.methode || p.method || p.paymentMethod || 'Espèces',
              status: (p.statut === 'PAYE' || p.status === 'success' || p.status === 'completed') ? 'completed' : (p.statut === 'ECHEC' ? 'failed' : 'pending'),
              reference: p.reference || `REF-${p._id.substring(0, 8)}`,
              details: (() => {
                const resObj = (p.reservation && typeof p.reservation === 'object') ? p.reservation : (p.trajet && typeof p.trajet === 'object' ? p.trajet : (relatedTrip || {}));

                // --- SCANNER CHAUFFEUR ULTRA-COMPLET (Version Nucléaire) ---
                const driverCandidates = [relatedTrip?.chauffeur, relatedTrip?.driver, p.chauffeur, p.driver, resObj.chauffeur, resObj.driver].filter(c => c && typeof c === 'object');

                // 1. Extraction du NOM (Fusion intelligente Prénom + Nom)
                let dName = '';
                let fName = ''; // Prénom
                let lName = ''; // Nom
                let fullN = ''; // Nom complet direct

                driverCandidates.forEach(c => {
                  const u = c.utilisateur || c.user || c;
                  if (u.prenom && !fName) fName = String(u.prenom).trim();
                  if (u.nom && !lName) lName = String(u.nom).trim();
                  if ((u.nomComplet || u.name || u.display_name) && !fullN) fullN = String(u.nomComplet || u.name || u.display_name).trim();
                });

                if (fullN && fullN.includes(' ')) dName = fullN;
                else if (fName && lName) dName = `${fName} ${lName}`;
                else dName = fullN || fName || lName || '';

                if (!dName || dName.length < 3) {
                  dName = p.driverName || p.chauffeurName || resObj.driverName || resObj.chauffeurName || relatedTrip?.driverName || 'Chauffeur TakaTaka';
                }

                // 2. Extraction du TÉLÉPHONE (Scan exhaustif total)
                let dPhone = '-';
                const phoneKeys = [
                  'telephone', 'phone', 'tel', 'mobile', 'phoneNumber', 'num_tel',
                  'driverPhone', 'chauffeurPhone', 'tel_chauffeur', 'driver_phone',
                  'chauffeur_phone', 'whatsapp', 'telChauffeur', 'numTelephone'
                ];

                const searchObjects = [
                  ...driverCandidates,
                  ...driverCandidates.map(c => c.utilisateur || c.user),
                  resObj,
                  p,
                  relatedTrip,
                  relatedTrip?.chauffeur,
                  relatedTrip?.driver
                ].filter(o => o && typeof o === 'object');

                for (const obj of searchObjects) {
                  for (const k of phoneKeys) {
                    const val = obj[k];
                    if (val && String(val).trim().length > 3 && !['N/A', '-', 'NULL', 'UNDEFINED'].includes(String(val).toUpperCase().trim())) {
                      dPhone = String(val).trim();
                      break;
                    }
                  }
                  if (dPhone !== '-') break;
                }

                // 3. Extraction du VÉHICULE — Priorité : profilVehicule (ChauffeurProfile)
                let dVeh = 'Véhicule standard';

                // 1ère priorité : profilVehicule depuis ChauffeurProfile (via relatedTrip enrichi)
                const chauffeurObjP = relatedTrip?.chauffeur || p.chauffeur;
                if (chauffeurObjP && typeof chauffeurObjP === 'object') {
                  const pv = chauffeurObjP.profilVehicule;
                  if (pv) {
                    const parts = [pv.marque, pv.modele].filter(Boolean).join(' ').trim();
                    if (parts.length > 1) dVeh = parts;
                    else if (pv.couleur) dVeh = pv.couleur;
                    else if (pv.type) dVeh = pv.type;
                  }
                }

                // 2ème priorité : vehicule object (Utilisateurs)
                if (dVeh === 'Véhicule standard') {
                  for (const c of driverCandidates) {
                    const v = c.vehicule || c.vehicle || resObj.vehicule || resObj.vehicle;
                    if (v && typeof v === 'object') {
                      const vStr = [v.marque, v.modele].filter(Boolean).join(' ').trim();
                      if (vStr.length > 2) { dVeh = vStr; break; }
                      else if (v.couleur) { dVeh = v.couleur; break; }
                      else if (v.type && v.type !== 'TAXI') { dVeh = v.type; break; }
                    } else if (typeof v === 'string' && v.trim().length > 2 && v.trim() !== 'TAXI') {
                      dVeh = v.trim(); break;
                    }
                  }
                }

                // 4. Extraction de L'EMAIL
                let dEmail = '-';
                const eKeys = ['email', 'mail', 'courriel'];
                for (const obj of searchObjects) {
                  for (const k of eKeys) {
                    const val = obj[k];
                    if (val && typeof val === 'string' && val.includes('@')) {
                      dEmail = val.trim();
                      break;
                    }
                  }
                  if (dEmail !== '-') break;
                }

                const dep = resObj.depart || resObj.pointDepart?.adresse || relatedTrip?.departure || 'Trajet TakaTaka';
                const dest = resObj.destination || resObj.pointDestination?.adresse || relatedTrip?.destination || 'Destination';
                const dist = resObj.distanceKm || resObj.distance || relatedTrip?.distanceKm || relatedTrip?.distance || '0';
                const dur = resObj.dureeMin || resObj.duree || resObj.duration || relatedTrip?.dureeMin || relatedTrip?.duration || '0';

                return {
                  driverName: dName,
                  vehicleInfo: dVeh,
                  driverPhone: dPhone,
                  driverEmail: dEmail,
                  route: `${dep} → ${dest}`,
                  distance: String(dist).includes('km') ? dist : `${dist} km`,
                  duration: String(dur).includes('min') ? dur : `${dur} min`
                };
              })()
            };
          });
          setTransactions(formattedTransactions);
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [i18n.language]);

  const filters = [
    { id: 'all', label: t('transactions.filters.all'), icon: BarChart3 },
    { id: 'payment', label: t('transactions.filters.payments'), icon: CreditCard },
    { id: 'refund', label: t('transactions.filters.refunds'), icon: RefreshCw },
    { id: 'cashback', label: t('transactions.filters.cashback'), icon: Gift },
    { id: 'failed', label: t('transactions.filters.failed'), icon: AlertCircle },
    { id: 'pending', label: t('transactions.filters.pending'), icon: Clock },
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = searchTerm === '' ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.method.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = activeFilter === 'all' ||
        (activeFilter === 'payment' && transaction.amount < 0) ||
        (activeFilter === 'refund' && transaction.type === 'Remboursement') ||
        (activeFilter === 'cashback' && transaction.type === 'Cashback') ||
        (activeFilter === 'failed' && transaction.status === 'failed') ||
        (activeFilter === 'pending' && transaction.status === 'pending');

      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, activeFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const stats = useMemo(() => {
    const total = filteredTransactions.length;
    const totalIncome = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netBalance = totalIncome - totalExpenses;
    const pendingTransactions = filteredTransactions.filter(t => t.status === 'pending').length;
    const failedTransactions = filteredTransactions.filter(t => t.status === 'failed').length;
    const averageTransaction = total > 0 ? (totalIncome + totalExpenses) / total : 0;

    return {
      total,
      totalIncome,
      totalExpenses,
      netBalance,
      pendingTransactions,
      failedTransactions,
      averageTransaction
    };
  }, [filteredTransactions]);

  const clearFilters = () => {
    setActiveFilter('all');
    setSearchTerm('');
    toast.success(t('transactions.messages.filters_reset'));
  };

  return {
    loading,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    activeFilter, setActiveFilter,
    searchTerm, setSearchTerm,
    filters,
    filteredTransactions, currentTransactions,
    totalPages, startIndex, endIndex,
    stats,
    clearFilters,
  };
};
