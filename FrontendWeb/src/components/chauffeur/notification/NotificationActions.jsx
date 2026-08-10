import { X, Check } from 'lucide-react';
import Button from '../../admin/ui/Bttn';

const NotificationActions = ({ currentRequest, isAccepting, onReject, onAccept, onDismiss }) => (
  <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
    {currentRequest.isRappel ? (
      <Button
        variant="primary"
        size="large"
        className="w-full h-14 sm:h-16 text-lg font-bold rounded-2xl shadow-xl shadow-blue-500/20"
        onClick={() => onDismiss(currentRequest.id)}
      >
        C'est noté !
      </Button>
    ) : (
      <div className="flex gap-3 sm:gap-4">
        <Button
          variant="danger"
          size="large"
          icon={X}
          onClick={() => onReject(currentRequest.id)}
          className="flex-1 h-14 sm:h-16 text-base sm:text-lg font-bold rounded-2xl shadow-xl shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300"
          disabled={isAccepting}
        >
          Ignorer
        </Button>

        <Button
          variant="primary"
          size="large"
          icon={Check}
          onClick={() => onAccept(currentRequest.id)}
          className="flex-[2] h-14 sm:h-16 text-base sm:text-lg font-bold rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 relative overflow-hidden group"
          disabled={isAccepting}
        >
          {isAccepting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Acceptation...</span>
            </div>
          ) : (
            "Accepter"
          )}
        </Button>
      </div>
    )}
  </div>
);

export default NotificationActions;
