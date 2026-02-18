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
    ArrowRight
} from "lucide-react";
import { isToday, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { tripService } from "../../services/tripService";

const RevenueDetailModal = ({ isOpen, onClose, ride, formatAmount, formatDate, getPaymentIcon, getPaymentLabel }) => {
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
                        Détails de la course
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
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">Passager</p>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
                                {ride.passager?.photo ? (
                                    <img src={getImageUrl(ride.passager.photo)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-7 h-7 text-blue-500" />
                                )}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{ride.passager?.nom || "Passager inconnu"}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(ride.date)}
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
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Point de départ</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{ride.depart}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Destination</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{ride.destination}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700">
                                <Navigation className="w-5 h-5 text-purple-500" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Distance</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{ride.distanceKm} km</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700">
                                <Clock className="w-5 h-5 text-amber-500" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Durée</p>
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
                                Type de paiement
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">{getPaymentLabel(ride.paymentMethod)}</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Montant total</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{formatAmount(ride.montantBrut)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Commission TakaTaka (10%)</span>
                                <span className="font-semibold text-red-500">-{formatAmount(ride.commission)}</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-base font-bold text-gray-900 dark:text-white">Votre gain net</span>
                                <span className="text-xl font-black text-green-600">{formatAmount(ride.net)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
                    >
                        Fermer les détails
                    </button>
                </div>
            </div>
        </div>
    );
};

const Revenues = ({ onToast, onModal }) => {
    const [selectedPeriod, setSelectedPeriod] = useState("today");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
    const [loading, setLoading] = useState(true);
    const [selectedRide, setSelectedRide] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // États pour les données
    const [revenueData, setRevenueData] = useState([]);
    const [summaryData, setSummaryData] = useState({
        daily: 0,
        weekly: 0,
        monthly: 0,
        paidRides: 0
    });

    // Fetch data
    useEffect(() => {
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

                if (listRes.data && listRes.data.succes) {
                    // Mapper les données du backend au format attendu par le composant
                    const formattedData = listRes.data.data.map((item) => ({
                        id: item.id,
                        date: item.date,
                        trajet: item.trajet,
                        depart: item.depart,
                        destination: item.destination,
                        distanceKm: item.distanceKm,
                        dureeMin: item.dureeMin,
                        passager: item.passager,
                        paymentMethod: mapPaymentMethod(item.modePaiement),
                        montantBrut: item.montantBrut || 0,
                        commission: item.commission || 0,
                        net: item.gainNet || 0
                    }));
                    setRevenueData(formattedData);
                }

            } catch (error) {
                console.error("Erreur lors du chargement des revenus", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper pour mapper les méthodes de paiement du backend
    const mapPaymentMethod = (backendMethod) => {
        if (!backendMethod) return "other";
        const method = backendMethod.toLowerCase();
        if (method.includes("espèce") || method.includes("cash")) return "cash";
        if (method.includes("mobile") || method.includes("orange") || method.includes("mtn")) return "mobile";
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
        return ride.paymentMethod === selectedPaymentMethod;
    });

    // Calculs pour les commissions sur les données FILTRÉES
    const totalCommission = filteredData.reduce((sum, ride) => sum + ride.commission, 0);
    const totalNet = filteredData.reduce((sum, ride) => sum + ride.net, 0);


    // Formater les montants
    const formatAmount = (amount) => {
        return (amount || 0).toLocaleString('fr-FR') + ' FG';
    };

    // Formater les dates
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Obtenir l'icône pour la méthode de paiement
    const getPaymentIcon = (method) => {
        switch (method) {
            case 'cash':
                return <Banknote className="w-4 h-4" />;
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
            case 'cash':
                return 'Espèces';
            case 'mobile':
                return 'Mobile Money';
            case 'card':
                return 'Carte';
            default:
                return 'Autre';
        }
    };

    const handleViewRide = (ride) => {
        setSelectedRide(ride);
        setShowDetailModal(true);
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
            />

            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-green-500" />
                        Espace Revenus
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Suivez vos gains et commissions</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8 text-gray-600 dark:text-gray-400 font-medium">
                    Chargement des revenus...
                </div>
            ) : (
                <>
                    {/* Cartes récapitulatives */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Revenus du jour</p>
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
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Revenus de la semaine</p>
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
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Revenus du mois</p>
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
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Courses payées (Auj.)</p>
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
                                    Commission appliquée
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Taux : <span className="font-bold text-orange-600 dark:text-orange-400">10%</span> par course
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Total des commissions (période sélectionnée) :{' '}
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
                                        Gain net chauffeur
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
                                <span className="font-medium text-gray-700 dark:text-gray-300">Filtrer par :</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Période :</span>
                                    <div className="flex gap-1">
                                        {["today", "week", "month"].map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setSelectedPeriod(p)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === p ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                            >
                                                {p === "today" ? "Aujourd'hui" : p === "week" ? "Cette semaine" : "Ce mois"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Paiement :</span>
                                    <div className="flex gap-1">
                                        {["all", "cash", "mobile", "card"].map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setSelectedPaymentMethod(m)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${selectedPaymentMethod === m ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                            >
                                                {m !== "all" && getPaymentIcon(m)}
                                                {m === "all" ? "Tous" : getPaymentLabel(m)}
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
                                <div className="col-span-2">Date</div>
                                <div className="col-span-3">Trajet</div>
                                <div className="col-span-2">Paiement</div>
                                <div className="col-span-2 text-right">Montant</div>
                                <div className="col-span-2 text-right">Net</div>
                                <div className="col-span-1 text-center">Actions</div>
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

                                            <div className="lg:col-span-2 font-black text-green-600 text-right">
                                                {formatAmount(ride.net)}
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
                                    Aucune donnée trouvée pour cette sélection
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

