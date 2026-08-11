// src/utils/formatNumber.js
// Formatage reutilisable de nombres pour l'affichage compact des statistiques
// (StatCard, etc.) : 1200 -> "1,2 k", 1500000 -> "1,5 M", 2300000000 -> "2,3 Md"

const parseNumeric = (value) => {
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

// Notation compacte locale (k / M / Md en fr-FR, K / M / B en en-US)
export const formatCompactNumber = (value, { locale = 'fr-FR', maximumFractionDigits = 1 } = {}) => {
  const num = parseNumeric(value);
  if (num === null) return typeof value === 'string' ? value : '';
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits,
  }).format(num);
};

// Valeur complete et lisible (separateurs de milliers), pour une infobulle
// affichant le montant exact derriere une valeur compactee
export const formatFullNumber = (value, { locale = 'fr-FR' } = {}) => {
  const num = parseNumeric(value);
  if (num === null) return typeof value === 'string' ? value : '';
  return new Intl.NumberFormat(locale).format(num);
};
