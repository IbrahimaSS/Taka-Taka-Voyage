/**
 * TripNotificationToast.jsx
 * Notification visuelle moderne pour nouvelles demandes de courses
 */

import { AnimatePresence, motion } from "framer-motion";
import { Calendar } from "lucide-react";

import { useTripNotification } from "./notification/useTripNotification";
import NotificationHeader from "./notification/NotificationHeader";
import PassengerInfoCard from "./notification/PassengerInfoCard";
import TripRouteDetails from "./notification/TripRouteDetails";
import TripStatsGrid from "./notification/TripStatsGrid";
import NotificationActions from "./notification/NotificationActions";

const TripNotificationToast = () => {
  const {
    tripRequests,
    currentRequest,
    expanded,
    setExpanded,
    vibration,
    isScrollable,
    showScrollIndicator,
    isExpandedFull,
    isAccepting,
    contentRef,
    totalSeconds,
    handleScroll,
    handleAccept,
    handleReject,
    handleDismiss,
    handleTimeEnd,
    toggleExpandFull,
  } = useTripNotification();

  if (!currentRequest) return null;

  return (
    <AnimatePresence>
      {currentRequest && (
        <motion.div
          key={currentRequest.id}
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            x: vibration ? ["0%", "-1%", "1%", "-1%", "0%"] : "0%",
          }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            x: { duration: 0.3, times: [0, 0.2, 0.4, 0.6, 1] },
          }}
          className={`fixed ${isExpandedFull ? "inset-2" : "top-4 left-1/2"
            } z-[9999] w-[95%] max-w-xl ${isExpandedFull ? "h-[95vh]" : ""
            } transform ${isExpandedFull ? "" : "-translate-x-1/2"} bg-gray-50 dark:bg-gray-800`}
          style={{ perspective: 1000 }}
        >
          <motion.div
            whileHover={{ y: isExpandedFull ? 0 : -4 }}
            className={`relative group ${isExpandedFull ? "h-full" : ""}`}
          >
            {/* lueur */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 blur-3xl rounded-3xl -z-10 opacity-50" />

            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm ${isExpandedFull ? "h-full flex flex-col" : ""
                }`}
            >
              <NotificationHeader
                currentRequest={currentRequest}
                totalSeconds={totalSeconds}
                onTimeEnd={handleTimeEnd}
                isExpandedFull={isExpandedFull}
                toggleExpandFull={toggleExpandFull}
                tripRequests={tripRequests}
                expanded={expanded}
                setExpanded={setExpanded}
              />

              {/* contenu */}
              <div
                ref={contentRef}
                onScroll={handleScroll}
                className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent ${isExpandedFull
                  ? "max-h-[calc(100vh-180px)]"
                  : "max-h-[60vh]"
                  }`}
              >
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Indicateur Course Planifiée */}
                  {currentRequest.typeCourse === "PLANIFIEE" && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="w-5 h-5 text-blue-500 shrink-0" />
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate">
                          COURSE PLANIFIÉE
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {new Date(currentRequest.datePlanifiee).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                          à {new Date(currentRequest.datePlanifiee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )}

                  <PassengerInfoCard currentRequest={currentRequest} />

                  <TripRouteDetails currentRequest={currentRequest} />

                  <TripStatsGrid currentRequest={currentRequest} />

                  {/* indicateur de scroll */}
                  {showScrollIndicator && isScrollable && (
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                      Faites défiler pour voir plus ↓
                    </div>
                  )}
                </div>
              </div>

              <NotificationActions
                currentRequest={currentRequest}
                isAccepting={isAccepting}
                onReject={handleReject}
                onAccept={handleAccept}
                onDismiss={handleDismiss}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TripNotificationToast;
