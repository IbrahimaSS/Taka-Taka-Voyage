import { MapPin, Route, Target } from 'lucide-react';
import Badge from '../../admin/ui/Badge';
import { safeStr, safeNum } from './notificationHelpers';

const TripRouteDetails = ({ currentRequest }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between gap-2">
      <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 min-w-0">
        <Route className="w-5 h-5 text-blue-500 shrink-0" />
        <span className="truncate">Itinéraire détaillé</span>
      </h4>
      <Badge variant="outline" size="xs" className="shrink-0">
        {currentRequest.distance != null
          ? `${safeNum(currentRequest.distance, 0).toFixed(1)} km`
          : "—"}
      </Badge>
    </div>

    <div className="relative pl-10">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-red-500" />

      {/* départ */}
      <div className="flex items-start gap-4 mb-8">
        <div className="absolute left-3.5 -translate-x-1/2">
          <div className="w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-900/50 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0 pl-4">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
              DÉPART
            </p>
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {safeStr(currentRequest.pickupAddress)}
          </p>
        </div>
      </div>

      {/* destination */}
      <div className="flex items-start gap-4">
        <div className="absolute left-3.5 -translate-x-1/2">
          <div className="w-5 h-5 rounded-full bg-red-500 ring-4 ring-red-100 dark:ring-red-900/20 flex items-center justify-center">
            <Target className="w-2.5 h-2.5 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0 pl-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
              DESTINATION
            </p>
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {safeStr(currentRequest.destinationAddress)}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default TripRouteDetails;
