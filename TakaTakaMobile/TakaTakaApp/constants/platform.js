/**
 * Constantes de la plateforme Taka-Taka Voyage (alignées avec le web).
 * Une seule source pour le nom, la commission et les libellés métier.
 */

export const PLATFORM = {
  name: 'Taka-Taka Voyage',
  shortName: 'Taka Taka',
  tagline: 'Déplacements intelligents en Guinée',
  version: '1.0.0',

  /** Commission plateforme (reste 80 % au chauffeur) */
  commissionRatePercent: 20,
  driverSharePercent: 80,

  /** Documents KYC chauffeur (obligatoires) */
  driverDocuments: [
    { id: 'license', label: 'Permis de Conduire', icon: 'document' },
    { id: 'carte_grise', label: 'Carte Grise', icon: 'car' },
    { id: 'assurance', label: 'Assurance', icon: 'shield-checkmark' },
    { id: 'piece_identite', label: "Pièce d'identité", icon: 'id-card' },
  ],

  /** Types de course passager (alignés doc web) */
  rideTypes: {
    immediate: { id: 'now', label: 'Course immédiate', shortLabel: 'Immédiat', icon: 'flash' },
    scheduled: { id: 'later', label: 'Course planifiée', shortLabel: 'Planifié', icon: 'time' },
    shared: { id: 'shared', label: 'Taxi-partage', shortLabel: 'Partagé', icon: 'people' },
  },

  /** Modes de paiement (doc web) */
  paymentModes: {
    cash: { id: 'cash', label: 'Espèces' },
    digital: { id: 'digital', label: 'Paiement digital' },
  },
};
