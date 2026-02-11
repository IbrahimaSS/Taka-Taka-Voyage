import L from 'leaflet';

// Leaflet default marker icons don't always resolve correctly with bundlers.
// We point them to the official CDN once (safe to call multiple times).
let _configured = false;

export function ensureLeafletIcons() {
  if (_configured) return;
  _configured = true;

  try {
    // Fix default marker icons.
    // eslint-disable-next-line no-underscore-dangle
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  } catch (e) {
    // ignore
  }
}

/**
 * Taka-Taka Premium Marker Icons
 * Standardized across all modules (Admin, Passenger, Chauffeur)
 */
export const leafletIcons = {
  // Point de départ (Pickup)
  start: L.divIcon({
    html: `
      <div class="relative">
        <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-[3px] border-white shadow-xl flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase tracking-wider text-white bg-emerald-600 px-2 py-0.5 rounded shadow-sm border border-white/20">
          Départ
        </div>
      </div>
    `,
    className: 'ttk-marker-start',
    iconSize: [40, 48],
    iconAnchor: [20, 40],
  }),

  // Destination (Dropoff)
  end: L.divIcon({
    html: `
      <div class="relative">
        <div class="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full border-[3px] border-white shadow-xl flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase tracking-wider text-white bg-rose-600 px-2 py-0.5 rounded shadow-sm border border-white/20">
          Arrivée
        </div>
      </div>
    `,
    className: 'ttk-marker-end',
    iconSize: [40, 48],
    iconAnchor: [20, 40],
  }),

  // Chauffeur (Vehicule)
  driver: L.divIcon({
    html: `
      <div class="relative">
        <div class="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-emerald-500 dark:to-blue-600 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl flex items-center justify-center overflow-hidden">
          <div class="absolute inset-0 bg-emerald-500/20 animate-pulse"></div>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="relative z-10">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <path d="M9 17h6"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
        <div class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-ping"></div>
      </div>
    `,
    className: 'ttk-marker-driver',
    iconSize: [56, 56],
    iconAnchor: [28, 56],
  }),

  // Passager (User Location)
  user: L.divIcon({
    html: `
      <div class="relative">
        <div class="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-3 border-white dark:border-gray-800 shadow-xl flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="absolute inset-0 w-11 h-11 rounded-full bg-blue-500/30 animate-ping"></div>
      </div>
    `,
    className: 'ttk-marker-user',
    iconSize: [44, 44],
    iconAnchor: [22, 44],
  }),
};
