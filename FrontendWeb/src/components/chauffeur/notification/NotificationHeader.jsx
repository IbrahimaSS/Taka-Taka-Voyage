import { motion } from 'framer-motion';
import { Bell, Sparkles, Timer, Maximize2, Minimize2 } from 'lucide-react';
import Button from '../../admin/ui/Bttn';
import Badge from '../../admin/ui/Badge';
import TimerCircle from './TimerCircle';

const NotificationHeader = ({
  currentRequest,
  totalSeconds,
  onTimeEnd,
  isExpandedFull,
  toggleExpandFull,
  tripRequests,
  expanded,
  setExpanded,
}) => (
  <div className="relative bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 px-4 sm:px-6 py-4">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shrink-0"
        >
          <Bell className="w-5 h-5 text-white" />
        </motion.div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-white font-bold text-base sm:text-lg truncate">
              {currentRequest.isRappel ? "Rappel trajet planifié" : "Nouvelle Course Disponible !"}
            </h3>
            <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Timer className="w-3 h-3 text-white/80 shrink-0" />
            <p className="text-white/90 text-sm">
              Expire dans{" "}
              <span className="font-bold">
                {Number(currentRequest.expiresIn ?? 60)}s
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <TimerCircle
          total={totalSeconds}
          remaining={currentRequest.expiresIn}
          onTimeEnd={onTimeEnd}
        />

        <Button
          variant="ghost"
          size="small"
          icon={isExpandedFull ? Minimize2 : Maximize2}
          onClick={toggleExpandFull}
          className="text-white hover:bg-white/20"
          tooltip={isExpandedFull ? "Réduire" : "Agrandir"}
        />
      </div>
    </div>

    {tripRequests?.length > 1 && (
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
      >
        <Badge
          variant="warning"
          size="sm"
          className="shadow-lg cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          +{tripRequests.length - 1} autres
        </Badge>
      </motion.div>
    )}
  </div>
);

export default NotificationHeader;
