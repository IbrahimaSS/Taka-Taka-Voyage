import { CheckCircle, Route, Clock, XCircle } from 'lucide-react';
import { getFullAssetURL } from '../../../../utils/urlHelper';

export const getStatusBadge = (status, t) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";

  switch (status) {
    case 'TERMINEE':
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700`}>
          <CheckCircle className="w-3 h-3 mr-1" /> {t('trips.status.completed') || 'Terminé'}
        </span>
      );
    case 'EN_COURS':
      return (
        <span className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800`}>
          <Route className="w-3 h-3 mr-1" /> {t('trips.status.in_progress') || 'En cours'}
        </span>
      );
    case 'EN_ATTENTE':
      return (
        <span className={`${baseClasses} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800`}>
          <Clock className="w-3 h-3 mr-1" /> {t('trips.status.pending') || 'En attente'}
        </span>
      );
    case 'ACCEPTEE':
      return (
        <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800`}>
          {t('trips.status.accepted') || 'Accepté'}
        </span>
      );
    case 'ARRIVEE':
      return (
        <span className={`${baseClasses} bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800`}>
          {t('trips.status.arrived') || 'Arrivé'}
        </span>
      );
    case 'ANNULEE':
    case 'ANNULEE_AVEC_FRAIS':
      return (
        <span className={`${baseClasses} bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800`}>
          <XCircle className="w-3 h-3 mr-1" /> {t('trips.status.cancelled') || 'Annulé'}
        </span>
      );
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}>{status}</span>;
  }
};

export const getMethodBadge = (method) => {
  const baseClasses = "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase";

  const getMethod = (m) => {
    if (!m) return 'cash';
    const lower = m.toLowerCase();
    if (lower.includes('orange')) return 'orange';
    if (lower.includes('mtn')) return 'mtn';
    if (lower.includes('wave')) return 'wave';
    if (lower.includes('carte') || lower.includes('card')) return 'card';
    if (lower.includes('mobile') || lower.includes('money')) return 'orange'; // Fallback visuel
    if (lower.includes('portefeuille') || lower.includes('wallet')) return 'card';
    return 'cash';
  };

  const m = getMethod(method);

  switch (m) {
    case 'orange':
      return <span className={`${baseClasses} bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800`}>Orange Money</span>;
    case 'mtn':
      return <span className={`${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800`}>MTN Money</span>;
    case 'card':
      return <span className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800`}>Carte</span>;
    default:
      return <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800`}>Espèces</span>;
  }
};

export const getServiceLabel = (service, t) => {
  if (!service) return '-';
  const s = service.toUpperCase();
  if (s === 'MOTO' || s === 'MOTO_TAXI') return t('services.moto_taxi') || 'Moto-taxi';
  if (s === 'TAXI' || s === 'TAXI_PARTAGE') return t('services.taxi_partage') || 'Taxi partagé';
  if (s === 'VOITURE' || s === 'VOITURE_PRIVEE' || s === 'PARTICULIER') return t('services.voiture_privee') || 'Voiture privée';
  if (s === 'BUS') return 'Bus';
  return service;
};

export const getAvatarUrl = (path) => getFullAssetURL(path);

export const getInitials = (user) => {
  if (!user) return '?';
  const first = user.prenom?.charAt(0) || '';
  const last = user.nom?.charAt(0) || '';
  return (first + last).toUpperCase() || '?';
};

export const formatVehicle = (vehicule, requestedType, t) => {
  // 1. Essayer de constuire la chaine complète (Marque Modele Plaque)
  if (vehicule) {
    const marque = vehicule.marque || '';
    const modele = vehicule.modele || '';
    const plaque = vehicule.immatriculation || '';

    if (marque || modele) {
      return `${marque} ${modele} ${plaque ? `• ${plaque}` : ''}`.trim();
    }

    // 2. Sinon, utiliser le type générique du véhicule du chauffeur (ex: MOTO)
    if (vehicule.type) return vehicule.type;
  }

  // 3. En dernier recours, utiliser le type de véhicule demandé lors de la réservation
  return requestedType || t('dashboard.vehicle_not_specified') || 'Véhicule non renseigné';
};
