import React, { useState, useEffect } from "react";
import {
    DollarSign,
    Calendar,
    TrendingUp,
    Car,
    Filter,
    Wallet,
    CreditCard,
    Smartphone,
    Banknote,
    Eye,
    X,
    MapPin,
    User,
    Clock,
    Navigation,
    ArrowRight,
    CheckCircle2,
    Hourglass,
    Mail
} from "lucide-react";
import { isToday, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { tripService } from "../../services/tripService";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { Printer } from "lucide-react";
import PremiumInvoice from "../admin/ui/PremiumInvoice";

const RevenueDetailModal = ({ isOpen, onClose, ride, formatAmount, formatDate, getPaymentIcon, getPaymentLabel, onShowReceipt }) => {
    const { t } = useTranslation();
    if (!isOpen || !ride) return null;

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${baseUrl}${path}`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        {t('revenues.details_title')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Passager Section */}
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">{t('revenues.passenger')}</p>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
                                {ride.passager?.photo ? (
                                    <img src={getImageUrl(ride.passager.photo)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-7 h-7 text-blue-500" />
                                )}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {ride.passager?.name || t('revenues.unknown_passenger')}
                                </h4>
                                <div className="space-y-1 mt-1">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(ride.date)}
                                    </div>
                                    {(ride.passager?.telephone || ride.telephonePassager || ride.passager?.phone || ride.passager?.utilisateur?.telephone) && (
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                            <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                                            {ride.passager?.telephone || ride.telephonePassager || ride.passager?.phone || ride.passager?.utilisateur?.telephone}
                                        </div>
                                    )}
                                    {(ride.passager?.email || ride.emailPassager || ride.passager?.utilisateur?.email) && (
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                            <Mail className="w-3.5 h-3.5 text-blue-500" />
                                            {ride.passager?.email || ride.emailPassager || ride.passager?.utilisateur?.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trajet Section */}
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center gap-1">
                                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                                </div>
                                <div className="w-0.5 h-10 bg-gray-200 dark:bg-gray-700 dotted border-l-2 border-dashed" />
                                <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-full text-red-500">
                                    <MapPin className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="flex-1 space-y-6">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('revenues.pickup')}</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{ride.depart}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('revenues.destination')}</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{ride.destination}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700">
                                <Navigation className="w-5 h-5 text-purple-500" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">{t('revenues.distance')}</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{ride.distanceKm} km</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700">
                                <Clock className="w-5 h-5 text-amber-500" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">{t('revenues.duration')}</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{ride.dureeMin} min</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Finance Section */}
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                {getPaymentIcon(ride.paymentMethod)}
                                {t('revenues.payment_type')}
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">{getPaymentLabel(ride.paymentMethod)}</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('revenues.total_amount')}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{formatAmount(ride.montantBrut)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('revenues.commission_takataka')}</span>
                                <span className="font-semibold text-red-500">-{formatAmount(ride.commission)}</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-base font-bold text-gray-900 dark:text-white">{t('revenues.net_earning')}</span>
                                <span className="text-xl font-black text-green-600">{formatAmount(ride.net)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Statut du versement */}
                    <div className={`rounded-2xl p-4 border ${ride.verse
                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                        }`}>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">{t('revenues.payout_status')}</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {ride.verse
                                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    : <Hourglass className="w-5 h-5 text-amber-600" />
                                }
                                <span className={`font-bold ${ride.verse
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-amber-700 dark:text-amber-400'
                                    }`}>
                                    {ride.verse ? t('revenues.paid') : t('revenues.pending')}
                                </span>
                            </div>
                            {ride.verse && ride.verseLe && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                    {new Date(ride.verseLe).toLocaleDateString('fr-FR', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                    <button
                        onClick={onShowReceipt}
                        className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Printer className="w-5 h-5" />
                        {t('revenues.receipt')}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600"
                    >
                        {t('revenues.close_details')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Revenues = ({ onToast, onModal }) => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
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

        // ✅ Suggestion 1: Ecouter l'événement global de versement pour refresh sans F5
        const handleRevenueRefresh = () => {
            console.log("🔄 [REVENUES] Refreshing due to admin payout event");
            fetchData();
        };

        window.addEventListener('chauffeur:revenu_mis_a_jour', handleRevenueRefresh);
        return () => window.removeEventListener('chauffeur:revenu_mis_a_jour', handleRevenueRefresh);
    }, []);

    // Helper pour mapper les méthodes de paiement du backend
    const mapPaymentMethod = (backendMethod) => {
        if (!backendMethod) return "other";
        const method = backendMethod.toLowerCase();
        if (method.includes("espèce") || method.includes("cash")) return "cash";
        if (method.includes("orange")) return "orange";
        if (method.includes("mtn")) return "mtn";
        if (method.includes("mobile")) return "mobile";
        if (method.includes("carte")) return "card";
        return "other";
    };

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

    // Obtenir l'icône pour la méthode de paiement
    const getPaymentIcon = (method) => {
        const iconClass = "w-6 h-6 rounded-md object-contain shadow-sm flex-shrink-0";
        switch (method) {
            case 'orange':
                return (
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Orange_Money_logo.svg/120px-Orange_Money_logo.svg.png"
                        alt=""
                        className={iconClass}
                        onError={(e) => {
                            e.target.src = "https://ui-avatars.com/api/?name=OM&background=FF7900&color=fff&font-size=0.5&bold=true";
                            e.target.onerror = null;
                        }}
                    />
                );
            case 'mtn':
                return (
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/MTN_Mobile_Money_Logo.svg/120px-MTN_Mobile_Money_Logo.svg.png"
                        alt=""
                        className={iconClass}
                        onError={(e) => {
                            e.target.src = "https://ui-avatars.com/api/?name=MTN&background=FFCC00&color=000&font-size=0.45&bold=true";
                            e.target.onerror = null;
                        }}
                    />
                );
            case 'cash':
                return (
                    <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-sm border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                        <Banknote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                );
            case 'mobile':
                return <Smartphone className="w-4 h-4" />;
            case 'card':
                return <CreditCard className="w-4 h-4" />;
            default:
                return <Wallet className="w-4 h-4" />;
        }
    };

    // Obtenir le libellé pour la méthode de paiement
    const getPaymentLabel = (method) => {
        switch (method) {
            case 'orange':
                return "Orange Money";
            case 'mtn':
                return "MTN Mobile Money";
            case 'cash':
                return t('revenues.cash');
            case 'mobile':
                return t('revenues.mobile');
            case 'card':
                return t('revenues.card');
            default:
                return t('revenues.other');
        }
    };

    const handleViewRide = (ride) => {
        setSelectedRide(ride);
        setShowDetailModal(true);
        setShowReceipt(false);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            <RevenueDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                ride={selectedRide}
                formatAmount={formatAmount}
                formatDate={formatDate}
                getPaymentIcon={getPaymentIcon}
                getPaymentLabel={getPaymentLabel}
                onShowReceipt={() => {
                    setShowReceipt(true);
                    setShowDetailModal(false);
                }}
            />

            {showReceipt && selectedRide && (
                <PremiumInvoice
                    payment={{
                        invoiceNumber: `INV-${(selectedRide.id || '').substring(0, 8).toUpperCase() || '000'}`,
                        date: formatDate(selectedRide.date),
                        transactionId: null,
                        status: (selectedRide.verse === true || selectedRide.verse === 'true') ? 'paid' : 'pending',
                        method: selectedRide.paymentMethod || 'cash',
                        amount: formatAmount(selectedRide.montantBrut),
                        passenger: {
                            name: selectedRide.passager?.name || t('revenues.unknown_passenger'),
                            phone: selectedRide.passager?.phone || selectedRide.telephonePassager || '-',
                            email: selectedRide.passager?.email || selectedRide.emailPassager || '-'
                        },
                        driver: {
                            name: user ? [user.prenom, user.nom].filter(Boolean).join(' ').trim() || (t('common.me') || 'Vous') : (t('common.me') || 'Vous'),
                            vehicle: user?.vehicule?.modele || user?.vehicule?.marque || user?.vehicule || (t('common.my_vehicle') || 'Votre véhicule'),
                            phone: user?.telephone || user?.phone || '-',
                            email: user?.email || '-'
                        },
                        trip: {
                            route: `${selectedRide.depart} → ${selectedRide.destination}`,
                            distance: `${selectedRide.distanceKm || '-'} km`,
                            duration: `${selectedRide.dureeMin || '-'} min`
                        },
                        fees: {
                            platform: formatAmount(selectedRide.commission)
                        }
                    }}
                    onClose={() => setShowReceipt(false)}
                />
            )}

            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-green-500" />
                        {t('revenues.title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">{t('revenues.subtitle')}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8 text-gray-600 dark:text-gray-400 font-medium">
                    {t('revenues.loading')}
                </div>
            ) : (
                <>
                    {/* Cartes récapitulatives */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('revenues.daily')}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                        {formatAmount(summaryData.daily)}
                                    </h3>
                                </div>
                                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-green-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('revenues.weekly')}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                        {formatAmount(summaryData.weekly)}
                                    </h3>
                                </div>
                                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('revenues.monthly')}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                        {formatAmount(summaryData.monthly)}
                                    </h3>
                                </div>
                                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-purple-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('revenues.paid_rides')}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                        {summaryData.paidRides}
                                    </h3>
                                </div>
                                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                                    <Car className="w-6 h-6 text-orange-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Commission */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800 p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-orange-500" />
                                    {t('revenues.commission_applied')}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {t('revenues.rate')} : <span className="font-bold text-orange-600 dark:text-orange-400">10%</span> par course
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {t('revenues.total_commissions')} :{' '}
                                    <span className="font-bold text-red-600 dark:text-red-400">
                                        {formatAmount(totalCommission)}
                                    </span>
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {formatAmount(totalNet)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {t('revenues.net_gain')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">{t('revenues.filters_label')}</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('revenues.period')}</span>
                                    <div className="flex gap-1">
                                        {["today", "week", "month"].map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setSelectedPeriod(p)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === p ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                            >
                                                {p === "today" ? t('revenues.today') : p === "week" ? t('revenues.this_week') : t('revenues.this_month')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('revenues.payment')}</span>
                                    <div className="flex gap-1">
                                        {["all", "cash", "orange", "mtn", "card"].map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setSelectedPaymentMethod(m)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${selectedPaymentMethod === m ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                            >
                                                {m !== "all" && getPaymentIcon(m)}
                                                {m === "all" ? t('revenues.all') : getPaymentLabel(m)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tableau des revenus */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="hidden lg:block border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-4">
                            <div className="grid grid-cols-12 gap-4 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                <div className="col-span-2">{t('revenues.date')}</div>
                                <div className="col-span-3">{t('revenues.trip')}</div>
                                <div className="col-span-2">{t('revenues.payment')}</div>
                                <div className="col-span-2 text-right">{t('revenues.amount')}</div>
                                <div className="col-span-2 text-right">{t('revenues.net')}</div>
                                <div className="col-span-1 text-center">{t('revenues.actions')}</div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredData.length > 0 ? (
                                filteredData.map((ride) => (
                                    <div key={ride.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 items-center text-sm">
                                            <div className="lg:col-span-2 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-900 dark:text-white">{formatDate(ride.date.split('T')[0])}</span>
                                            </div>

                                            <div className="lg:col-span-3">
                                                <div className="flex items-center gap-2">
                                                    <Car className="w-4 h-4 text-blue-500" />
                                                    <span className="font-bold text-gray-900 dark:text-white line-clamp-1">{ride.trajet}</span>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-2">
                                                <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full w-fit">
                                                    {getPaymentIcon(ride.paymentMethod)}
                                                    <span className="font-bold text-gray-900 dark:text-white text-[10px] uppercase">
                                                        {getPaymentLabel(ride.paymentMethod)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-2 font-medium text-gray-500 text-right hidden lg:block">
                                                {formatAmount(ride.montantBrut)}
                                            </div>

                                            <div className="lg:col-span-2 text-right">
                                                <p className="font-black text-green-600">{formatAmount(ride.net)}</p>
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${ride.verse
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                    }`}>
                                                    {ride.verse
                                                        ? <><CheckCircle2 className="w-3 h-3" /> {t('revenues.paid')}</>
                                                        : <><Hourglass className="w-3 h-3" /> {t('revenues.pending')}</>
                                                    }
                                                </span>
                                            </div>

                                            <div className="lg:col-span-1 flex justify-center">
                                                <button
                                                    onClick={() => handleViewRide(ride)}
                                                    className="p-2.5 bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-gray-500 dark:text-gray-400 italic">
                                    {t('revenues.no_data')}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Revenues;

