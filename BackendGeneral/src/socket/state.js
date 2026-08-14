// Anti double accept (mémoire)
// ⚠️ TODO [PRODUCTION] : Ces locks mémoire sont perdus au redémarrage du serveur
// et ne fonctionnent pas en multi-instance. → Migrer vers Redis (SET/GET) pour
// un lock distribué fiable en production.
const coursesPrises = new Set();   // reservationId acceptée (lock mémoire)
const courseChauffeur = new Map(); // reservationId -> socket.id chauffeur
const socketToReservations = new Map(); // socket.id -> Set(reservationId)
const lastKnownPositions = new Map(); // reservationId -> { lat, lng, heading, speed, timestamp }

function trackReservationForSocket(socketId, reservationId) {
  if (!socketToReservations.has(socketId)) socketToReservations.set(socketId, new Set());
  socketToReservations.get(socketId).add(String(reservationId));
}

function untrackReservationForSocket(socketId, reservationId) {
  const set = socketToReservations.get(socketId);
  if (!set) return;
  set.delete(String(reservationId));
  if (set.size === 0) socketToReservations.delete(socketId);
}

function releaseReservationLock(reservationId) {
  const rid = String(reservationId);
  coursesPrises.delete(rid);
  lastKnownPositions.delete(rid);
  const sId = courseChauffeur.get(rid);
  courseChauffeur.delete(rid);
  if (sId) untrackReservationForSocket(sId, rid);
}

module.exports = {
  coursesPrises,
  courseChauffeur,
  socketToReservations,
  lastKnownPositions,
  trackReservationForSocket,
  untrackReservationForSocket,
  releaseReservationLock,
};
