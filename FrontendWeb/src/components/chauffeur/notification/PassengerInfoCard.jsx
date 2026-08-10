import { motion } from 'framer-motion';
import { User, Award, Star, Phone } from 'lucide-react';
import Button from '../../admin/ui/Bttn';
import Badge from '../../admin/ui/Badge';
import { safeStr, safeNum } from './notificationHelpers';

const PassengerInfoCard = ({ currentRequest }) => (
  <div className="flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl">
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg">
          <User className="w-6 h-6 text-white" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center"
        >
          <Award className="w-3 h-3 text-white" />
        </motion.div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="font-bold text-gray-900 dark:text-white text-lg truncate">
            {safeStr(currentRequest.passengerName, "Passager")}
          </p>
          <Badge variant="primary" size="xs" className="shrink-0">
            PREMIUM
          </Badge>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold">
              {safeNum(currentRequest.passengerRating, 5).toFixed(1)}
            </span>
            <span className="text-gray-500 text-xs">
              (500+ voyages)
            </span>
          </div>
        </div>
      </div>
    </div>

    {!!currentRequest.passengerPhone && (
      <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm shrink-0">
        <Button
          variant="ghost"
          size="xs"
          icon={Phone}
          onClick={(e) => {
            e.stopPropagation();
            window.open(`tel:${currentRequest.passengerPhone}`, "_blank");
          }}
          className="text-blue-600 dark:text-blue-400"
        >
          Appeler
        </Button>
      </div>
    )}
  </div>
);

export default PassengerInfoCard;
