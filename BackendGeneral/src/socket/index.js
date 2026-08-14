const { checkPlannedReminders } = require("./plannedReminders");
const { registerPresenceHandlers } = require("./presenceHandlers");
const { registerCourseHandlers } = require("./courseHandlers");
const { registerPaiementHandlers } = require("./paiementHandlers");
const { registerTrackingHandlers } = require("./trackingHandlers");
const { registerTaxiPartageHandlers } = require("./taxiPartageHandlers");

module.exports = (io) => {
  // Lancer le timer de rappel toutes les 5 minutes
  setInterval(() => checkPlannedReminders(io), 5 * 60 * 1000);

  io.on("connection", (socket) => {
    registerPresenceHandlers(io, socket);
    registerCourseHandlers(io, socket);
    registerPaiementHandlers(io, socket);
    registerTrackingHandlers(io, socket);
    registerTaxiPartageHandlers(io, socket);

    console.log(`🚕 [TAXI_PARTAGE] Écouteurs backend-driven activés pour socket ${socket.id}`);
  });
};
