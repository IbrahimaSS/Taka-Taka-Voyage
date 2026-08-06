import { CheckCircle, Clock, RefreshCw, XCircle, Ban } from 'lucide-react';

export const getStatusBadge = (statut, t) => {
  switch (statut) {
    case 'ACTIF':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
          {t('common.active') || 'Actif'}
        </span>
      );
    case 'INACTIF':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>
          {t('common.inactive') || 'Inactif'}
        </span>
      );
    case 'SUSPENDU':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
          {t('common.suspended') || 'Suspendu'}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          {statut}
        </span>
      );
  }
};

export const getVerificationBadge = (verifie, t) => {
  if (verifie) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        <CheckCircle className="w-3 h-3 mr-1" />
        {t('drivers.status_verified') || 'Vérifié'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
      <Clock className="w-3 h-3 mr-1" />
      {t('drivers.status_pending') || 'En attente'}
    </span>
  );
};

export const getTypeBadge = (type, t) => {
  const colors = {
    'Moto-taxi': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    'Taxi partagé': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
    'Voiture privée': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400',
  };

  const typeLabel = type === 'Moto-taxi' ? (t('services.moto_taxi') || 'Moto-taxi') :
    type === 'Taxi partagé' ? (t('services.taxi_partage') || 'Taxi partagé') :
      type === 'Voiture privée' ? (t('services.voiture_privee') || 'Voiture privée') : type;

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'}`}>
      {typeLabel}
    </span>
  );
};

export const getDocBadge = (status, t) => {
  switch (status) {
    case 'VALIDE':
      return (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-3 transition-all hover:shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-tight">{t('common.status_valid_caps') || 'VALIDE'}</span>
          </div>
        </div>
      );
    case 'EXPIRE':
      return (
        <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30 rounded-lg p-3 transition-all hover:shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-tight">{t('common.status_expired_caps') || 'EXPIRÉ'}</span>
          </div>
        </div>
      );
    case 'VERIFIER':
      return (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 transition-all hover:shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            <span className="text-[10px] font-bold tracking-tight">{t('common.status_in_progress_caps') || 'EN COURS'}</span>
          </div>
        </div>
      );
    case 'REFUSE':
      return (
        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-lg p-3 transition-all hover:shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-tight">{t('common.status_refused_caps') || 'REFUSÉ'}</span>
          </div>
        </div>
      );
    default:
      return (
        <div className="bg-gray-50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-800/50 rounded-lg p-3">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Ban className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-tight uppercase">{t('common.missing') || 'Manquant'}</span>
          </div>
        </div>
      );
  }
};
