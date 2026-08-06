import { IdCard, User, Car, Shield, CheckCircle, FileX, Clock, XCircle } from 'lucide-react';

// Types de documents
export const documentTypes = [
  { id: 'PERMIS', label: 'Permis de conduire', icon: IdCard, color: 'blue', required: true },
  { id: 'IDENTITE', label: "Carte d'identité", icon: User, color: 'purple', required: true },
  { id: 'CARTE_GRISE', label: 'Carte grise', icon: Car, color: 'green', required: true },
  { id: 'ASSURANCE', label: 'Assurance', icon: Shield, color: 'orange', required: true },
  { id: 'PHOTO_VEHICULE', label: 'Photo véhicule', icon: Car, color: 'red', required: true }
];

// Statuts de documents
export const statusTypes = [
  { id: 'VALIDE', label: 'Valide', icon: CheckCircle, color: 'success', bgColor: 'bg-green-50 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400' },
  { id: 'REFUSE', label: 'Rejeté', icon: FileX, color: 'error', bgColor: 'bg-red-50 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400' },
  { id: 'VERIFIER', label: 'En attente', icon: Clock, color: 'warning', bgColor: 'bg-yellow-50 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-400' },
  { id: 'EXPIRE', label: 'Expiré', icon: XCircle, color: 'error', bgColor: 'bg-red-100 dark:bg-red-900/40', textColor: 'text-red-800 dark:text-red-300' }
];

export const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  ...statusTypes.map(status => ({ value: status.id, label: status.label })),
];

export const completenessOptions = [
  { value: 'all', label: 'Tous' },
  { value: 'complete', label: 'Profil complet' },
  { value: 'incomplete', label: 'Profil incomplet' },
];
