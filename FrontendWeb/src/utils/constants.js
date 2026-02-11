// src/utils/constants.js
export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 80;

export const STATUS_COLORS = {
  active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  inactive: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  suspended: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  pending: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  online: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  offline: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
  busy: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
};

export const VEHICLE_TYPES = {
  moto: { label: 'Moto-taxi', color: 'bg-blue-100 text-blue-700' },
  taxi: { label: 'Taxi partagé', color: 'bg-green-100 text-green-700' },
  car: { label: 'Voiture privée', color: 'bg-purple-100 text-purple-700' },
};

export const PAYMENT_METHODS = {
  cash: { label: 'Espèces', icon: 'money-bill', color: 'bg-green-100 text-green-500' },
  orange: { label: 'Orange Money', icon: 'mobile-alt', color: 'bg-orange-100 text-orange-500' },
  mtn: { label: 'MTN Mobile Money', icon: 'sim-card', color: 'bg-yellow-100 text-yellow-500' },
};