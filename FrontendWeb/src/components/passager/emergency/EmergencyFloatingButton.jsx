import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import Button from '../../admin/ui/Bttn';

const EmergencyFloatingButton = ({ onClick }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="fixed bottom-28 right-8 z-40"
  >
    <Button
      variant="solid"
      size="large"
      className="!rounded-full !w-16 !h-16 !p-0 shadow-2xl hover:shadow-3xl relative !bg-red-600 hover:!bg-red-700 border-none text-white flex items-center justify-center transition-all"
      onClick={onClick}
      icon={Phone}
    >
      <span className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
        <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
      </span>
    </Button>
  </motion.div>
);

export default EmergencyFloatingButton;
