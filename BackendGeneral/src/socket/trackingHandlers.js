const { lastKnownPositions } = require("./state");

function registerTrackingHandlers(io, socket) {
  // ────────────────────────────────────────────────
  // 3) Position chauffeur
  // ────────────────────────────────────────────────
  socket.on("position:update", (data = {}) => {
    const { reservationId, groupeId, lat, lng, heading = 0, speed = 0, isSimulation } = data;

    if ((!reservationId && !groupeId) || lat == null || lng == null) {
      return;
    }

    // Si c'est un taxi partagé (via groupeId), on diffuse à tout le groupe
    if (groupeId) {
      console.log(`📡 [SOCKET] Broadcast position vers GROUPE_${groupeId} (Sim:${!!isSimulation})`);
      io.to(`GROUPE_${String(groupeId)}`).emit("position:chauffeur", {
        ...data,
        timestamp: Date.now(),
      });
    }

    // Toujours diffuser à la room de réservation spécifique
    if (reservationId) {
      const rid = String(reservationId);
      lastKnownPositions.set(rid, { ...data, timestamp: Date.now() });

      console.log(`📡 [SOCKET] Broadcast position vers RESERVATION_${rid} (Sim:${!!isSimulation})`);
      io.to(`RESERVATION_${rid}`).emit("position:chauffeur", {
        ...data,
        reservationId: rid,
        timestamp: Date.now(),
      });
    }
  });
}

module.exports = { registerTrackingHandlers };
