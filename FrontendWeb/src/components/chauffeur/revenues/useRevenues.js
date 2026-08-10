import { useState, useEffect } from 'react';
import { isToday, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { tripService } from '../../../services/tripService';
import { mapPaymentMethod } from './paymentMethodUtils';

export const useRevenues = ({ onToast, t, i18n }) => {
    const [selectedPeriod, setSelectedPeriod] = useState("today");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
    const [loading, setLoading] = useState(true);
    const [selectedRide, setSelectedRide] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);

    // États pour les données
    const [revenueData, setRevenueData] = useState([]);
    const [summaryData, setSummaryData] = useState({
        daily: 0,
        weekly: 0,
        monthly: 0,
        paidRides: 0
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, listRes] = await Promise.all([
                tripService.getDriverRevenueStats(),
                tripService.getDriverRevenueList()
            ]);

            if (statsRes.data && statsRes.data.succes) {
                setSummaryData({
                    daily: statsRes.data.data.revenusJour || 0,
                    weekly: statsRes.data.data.revenusSemaine || 0,
                    monthly: statsRes.data.data.revenusMois || 0,
                    paidRides: statsRes.data.data.coursesPayees || 0
                });
            }

            // Mapper les données du backend au format attendu par le composant
            const formattedData = listRes.data.data.map((item) => {
                // RECHERCHE PASSAGER EXHAUSTIVE
                const pObj = item.passager || item.reservation?.passager || item.client || item.passenger || {};
                const uObj = pObj.utilisateur || pObj.user || {};

                // Fallbacks pour le nom
                const name = pObj.nomComplet ||
                    (pObj.prenom || pObj.nom ? [pObj.prenom, pObj.nom].filter(Boolean).join(' ') : null) ||
                    pObj.name || pObj.display_name ||
                    item.nomPassager || item.passagerName || item.passengerName ||
                    item.reservation?.passager?.nomComplet ||
                    (item.reservation?.passager?.prenom ? `${item.reservation.passager.prenom} ${item.reservation.passager.nom}` : null) ||
                    'Passager TakaTaka';

                // Fallbacks pour le téléphone
                const phone = pObj.telephone || pObj.phone || pObj.mobile || pObj.tel ||
                    uObj.telephone || uObj.phone ||
                    item.telephonePassager || item.telPassager || item.passagerTelephone || item.passengerPhone ||
                    item.reservation?.passager?.telephone || item.reservation?.passager?.utilisateur?.telephone ||
                    item.reservation?.telephonePassager || item.reservation?.passagerPhone ||
                    item.reservation?.passagerId?.telephone || item.reservation?.passagerId?.utilisateur?.telephone ||
                    '-';

                // Fallbacks pour l'email
                const email = pObj.email || uObj.email ||
                    item.emailPassager || item.passagerEmail || item.passengerEmail ||
                    item.reservation?.passager?.email || item.reservation?.passager?.utilisateur?.email ||
                    item.reservation?.emailPassager ||
                    item.reservation?.passagerId?.email || item.reservation?.passagerId?.utilisateur?.email ||
                    '-';

                return {
                    id: item.id || item._id,
                    date: item.date || item.createdAt,
                    trajet: item.trajet || `${item.depart} - ${item.destination}`,
                    depart: item.depart,
                    destination: item.destination,
                    distanceKm: item.distanceKm,
                    dureeMin: item.dureeMin,
                    passager: { ...pObj, name, phone, email }, // On stocke l'objet enrichi
                    telephonePassager: phone, // Pour compatibilité
                    emailPassager: email,
                    paymentMethod: mapPaymentMethod(item.modePaiement || item.paiement?.methode),
                    montantBrut: item.montantBrut || item.prix || item.montant || 0,
                    commission: item.commission || 0,
                    net: item.gainNet || (item.prix ? item.prix * 0.9 : 0) || 0,
                    verse: item.verse || false,
                    verseLe: item.verseLe || null,
                    reservation: item.reservation // On garde la résa pour d'autres besoins
                };
            });
            setRevenueData(formattedData);

        } catch (error) {
            console.error("Erreur lors du chargement des revenus", error);
            if (onToast) onToast(t('revenues.loading_error'), "error");
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on mount
    useEffect(() => {
        fetchData();

        // Ecouter l'événement global de versement pour refresh sans F5
        const handleRevenueRefresh = () => {
            console.log("🔄 [REVENUES] Refreshing due to admin payout event");
            fetchData();
        };

        window.addEventListener('chauffeur:revenu_mis_a_jour', handleRevenueRefresh);
        return () => window.removeEventListener('chauffeur:revenu_mis_a_jour', handleRevenueRefresh);
    }, []);

    // Filtrage des données
    const filteredData = revenueData.filter(ride => {
        if (!ride.date) return false;
        const rideDate = parseISO(ride.date);
        const today = new Date();

        // Filtre par période
        if (selectedPeriod === "today") {
            return isToday(rideDate);
        } else if (selectedPeriod === "week") {
            return isWithinInterval(rideDate, {
                start: startOfWeek(today, { weekStartsOn: 1 }), // Lundi
                end: endOfWeek(today, { weekStartsOn: 1 })
            });
        } else if (selectedPeriod === "month") {
            return isWithinInterval(rideDate, {
                start: startOfMonth(today),
                end: endOfMonth(today)
            });
        }
        return true;
    }).filter(ride => {
        // Filtre par méthode de paiement
        if (selectedPaymentMethod === "all") return true;
        if (selectedPaymentMethod === "mobile") {
            return ["mobile", "orange", "mtn"].includes(ride.paymentMethod);
        }
        return ride.paymentMethod === selectedPaymentMethod;
    });

    // Calculs pour les commissions sur les données FILTRÉES
    const totalCommission = filteredData.reduce((sum, ride) => sum + ride.commission, 0);
    const totalNet = filteredData.reduce((sum, ride) => sum + ride.net, 0);

    // Formater les montants
    const formatAmount = (amount) => {
        return (amount || 0).toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR') + ' FG';
    };

    // Formater les dates
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleViewRide = (ride) => {
        setSelectedRide(ride);
        setShowDetailModal(true);
        setShowReceipt(false);
    };

    return {
        selectedPeriod,
        setSelectedPeriod,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        loading,
        selectedRide,
        showDetailModal,
        setShowDetailModal,
        showReceipt,
        setShowReceipt,
        summaryData,
        filteredData,
        totalCommission,
        totalNet,
        formatAmount,
        formatDate,
        handleViewRide,
    };
};
