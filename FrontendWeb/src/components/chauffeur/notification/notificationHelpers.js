export const safeStr = (v, fallback = "—") =>
  typeof v === "string" && v.trim() ? v.trim() : fallback;

export const safeNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const formatMinutesToHuman = (min) => {
  const m = safeNum(min, 0);
  if (!m) return "—";
  if (m < 60) return `${Math.round(m)} min`;
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  return r ? `${h}h ${r}m` : `${h}h`;
};
