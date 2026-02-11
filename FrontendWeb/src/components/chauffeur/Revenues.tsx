import React, { useState } from "react";
import { DollarSign, Calendar, TrendingUp, Car, Filter, Download, Wallet, CreditCard, Smartphone, Banknote } from "lucide-react";

const Revenus = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");

  // Données des revenus
  const revenueData = [
    { id: 1, date: "2024-12-18", trajet: "Conakry → Matoto", paymentMethod: "mobile", montantBrut: 10000, commission: 1500, net: 8500 },
    { id: 2, date: "2024-12-18", trajet: "Hamdallaye → Kipé", paymentMethod: "cash", montantBrut: 7000, commission: 700, net: 6300 },
    { id: 3, date: "2024-12-17", trajet: "Gare → Ratoma", paymentMethod: "mobile", montantBrut: 8500, commission: 1275, net: 7225 },
    { id: 4, date: "2024-12-17", trajet: "Kipé → Cameroun", paymentMethod: "card", montantBrut: 15000, commission: 2250, net: 12750 },
    { id: 5, date: "2024-12-16", trajet: "Bambeto → Minière", paymentMethod: "cash", montantBrut: 6000, commission: 600, net: 5400 },
    { id: 6, date: "2024-12-16", trajet: "Taouyah → Coleah", paymentMethod: "mobile", montantBrut: 9000, commission: 1350, net: 7650 },
    { id: 7, date: "2024-12-15", trajet: "Cosa → Lansanaya", paymentMethod: "cash", montantBrut: 8000, commission: 800, net: 7200 },
    { id: 8, date: "2024-12-14", trajet: "Bonfi → Gbessia", paymentMethod: "mobile", montantBrut: 11000, commission: 1650, net: 9350 },
    { id: 9, date: "2024-12-14", trajet: "Matoto → Centre-ville", paymentMethod: "card", montantBrut: 12000, commission: 1800, net: 10200 },
    { id: 10, date: "2024-12-13", trajet: "Kipe → Simbaya", paymentMethod: "cash", montantBrut: 9500, commission: 950, net: 8550 },
  ];

  // Données récapitulatives
  const summaryData = {
    daily: 51000,
    weekly: 320000,
    monthly: 1250000,
    paidRides: 48
  };

  // Filtrage des données
  const filteredData = revenueData.filter(ride => {
    // Filtre par période (simplifié pour l'exemple)
    if (selectedPeriod === "today") {
      return ride.date === "2024-12-18";
    } else if (selectedPeriod === "week") {
      // Semaine courante (18-12 au 24-12)
      const rideDate = new Date(ride.date);
      const startOfWeek = new Date("2024-12-18");
      const endOfWeek = new Date("2024-12-24");
      return rideDate >= startOfWeek && rideDate <= endOfWeek;
    } else if (selectedPeriod === "month") {
      // Mois de décembre
      const rideDate = new Date(ride.date);
      return rideDate.getMonth() === 11; // Décembre (0-indexed)
    }
    return true;
  }).filter(ride => {
    // Filtre par méthode de paiement
    if (selectedPaymentMethod === "all") return true;
    return ride.paymentMethod === selectedPaymentMethod;
  });

  // Calculs pour les commissions
  const totalCommission = filteredData.reduce((sum, ride) => sum + ride.commission, 0);
  const totalNet = filteredData.reduce((sum, ride) => sum + ride.net, 0);

 // Formater les montants
const formatAmount = (amount: number): string => {
  return amount.toLocaleString('fr-FR') + ' FC';
};

// Formater les dates
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  });
};

// Obtenir l'icône pour la méthode de paiement
const getPaymentIcon = (method: string) => {
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
const getPaymentLabel = (method: string): string => {
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


  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
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

      {/* Cartes récapitulatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenus du jour */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
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

        {/* Revenus de la semaine */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
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

        {/* Revenus du mois */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
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

        {/* Courses payées */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Courses payées</p>
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
            {/* Filtres de période */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Période :</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedPeriod("today")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === "today" ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={() => setSelectedPeriod("week")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === "week" ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Cette semaine
                </button>
                <button
                  onClick={() => setSelectedPeriod("month")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === "month" ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Ce mois
                </button>
              </div>
            </div>

            {/* Filtres de méthode de paiement */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Paiement :</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedPaymentMethod("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedPaymentMethod === "all" ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setSelectedPaymentMethod("cash")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${selectedPaymentMethod === "cash" ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  <Banknote className="w-3 h-3" />
                  Espèces
                </button>
                <button
                  onClick={() => setSelectedPaymentMethod("mobile")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${selectedPaymentMethod === "mobile" ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  <Smartphone className="w-3 h-3" />
                  Mobile
                </button>
                <button
                  onClick={() => setSelectedPaymentMethod("card")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${selectedPaymentMethod === "card" ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  <CreditCard className="w-3 h-3" />
                  Carte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

     {/* Tableau des revenus */}
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

  {/* En-tête */}
  <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-4">
    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700 dark:text-gray-300">
      <div className="col-span-2">Date</div>
      <div className="col-span-3">Trajet</div>
      <div className="col-span-2">Mode de paiement</div>
      <div className="col-span-2">Montant brut</div>
      <div className="col-span-2">Commission</div>
      <div className="col-span-1">Gain net</div>
    </div>
  </div>

  {/* Corps */}
  <div className="divide-y divide-gray-200 dark:divide-gray-700">
    {filteredData.length > 0 ? (
      filteredData.map((ride) => (
        <div
          key={ride.id}
          className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="grid grid-cols-12 gap-4 items-center text-sm">

            {/* Date */}
            <div className="col-span-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(ride.date)}
              </span>
            </div>

            {/* Trajet */}
            <div className="col-span-3 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {ride.trajet}
                </p>
                <p className="text-xs text-gray-500">ID: {ride.id}</p>
              </div>
            </div>

            {/* Mode de paiement */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {getPaymentIcon(ride.paymentMethod)}
                <span className="font-medium text-gray-900 dark:text-white">
                  {getPaymentLabel(ride.paymentMethod)}
                </span>
              </div>
            </div>

            {/* Montant brut */}
            <div className="col-span-2 font-medium text-gray-900 dark:text-white">
              {formatAmount(ride.montantBrut)}
            </div>

            {/* Commission */}
            <div className="col-span-2">
              <span className="font-medium text-red-600">
                -{formatAmount(ride.commission)}
              </span>
            </div>

            {/* Gain net */}
            <div className="col-span-1 font-bold text-green-600">
              {formatAmount(ride.net)}
            </div>

          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-12 text-gray-500">
        Aucune donnée
      </div>
    )}
  </div>
</div>

      {/* Section Retrait */}
      {/* <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-lg border border-green-200 dark:border-green-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-500" />
              Retrait des gains
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Les retraits sont disponibles à partir de <span className="font-bold text-green-600 dark:text-green-400">20 000 FC</span>.
              Votre solde actuel est de <span className="font-bold text-green-600 dark:text-green-400">{formatAmount(185000)}</span>.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Les retraits sont traités sous 24-48 heures ouvrables.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
              <Download className="w-5 h-5" />
              Demander un retrait
            </button>
            <button className="px-6 py-2 border border-green-500 text-green-500 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors text-sm font-medium">
              Voir l'historique des retraits
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Revenus;