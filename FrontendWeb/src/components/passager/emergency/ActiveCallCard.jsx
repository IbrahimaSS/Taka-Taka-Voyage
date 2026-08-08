import { motion } from 'framer-motion';
import { Phone, PhoneOff, Loader2 } from 'lucide-react';
import Button from '../../admin/ui/Bttn';
import Card, { CardContent } from '../../admin/ui/Card';

const ActiveCallCard = ({ callingService, isLogging, onStopCall }) => (
  <motion.div
    key="calling"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
  >
    <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse" />
      <CardContent className="p-10 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mb-8 relative">
          <Phone className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-pulse rotate-12" />
          <div className="absolute -inset-4 rounded-full bg-blue-400/20 animate-ping" />
          <div className="absolute -inset-8 rounded-full bg-blue-300/10 animate-ping [animation-delay:0.5s]" />
        </div>

        <h3 className="text-2xl font-black text-blue-900 dark:text-blue-100 mb-2">📞 Appel en cours...</h3>
        <div className="space-y-1 mb-8">
          <p className="text-lg font-bold text-blue-800 dark:text-blue-300">Service : {callingService?.name}</p>
          <p className="text-blue-600 dark:text-blue-400 font-mono tracking-widest">{callingService?.number}</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-[200px]">
          <Button
            variant="danger"
            fullWidth
            className="!rounded-2xl !py-4 shadow-lg shadow-red-500/20"
            icon={PhoneOff}
            onClick={onStopCall}
          >
            Raccrocher
          </Button>
          {isLogging && (
            <div className="flex items-center justify-center gap-2 text-xs text-blue-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Enregistrement du log...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default ActiveCallCard;
