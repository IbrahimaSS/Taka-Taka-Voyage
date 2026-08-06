import { motion } from 'framer-motion';
import { UserCheck, Phone, Calendar, Eye } from 'lucide-react';
import Badge from '../../ui/Badge';
import Button from '../../ui/Bttn';
import { getFullAssetURL } from '../../../../utils/urlHelper';

const PendingDriverCard = ({ driver, onViewDetails }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border border-gray-200 dark:border-gray-900 rounded-xl p-5 hover:border-green-300 transition-all shadow-sm hover:shadow-lg duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start">
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center mr-4 overflow-hidden`}>
            {driver.photoUrl ? (
              <img src={getFullAssetURL(driver.photoUrl)} className="w-full h-full object-cover" />
            ) : (
              <UserCheck className="text-white" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-100">{driver.name}</h4>
            <div className="flex items-center mt-1 flex-wrap gap-2">
              <Badge className='bg-gray-200 dark:bg-gray-800' size="xs">
                {driver.type}
              </Badge>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Phone className="text-gray-400 dark:text-gray-500 mr-1 w-4 h-4" />
                {driver.phone}
              </div>
            </div>
          </div>
        </div>
        <Badge
          className={driver.status === 'EN_ATTENTE' ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}
          size="sm"
        >
          {driver.status}
        </Badge>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="inline w-4 h-4 mr-1" />
          Inscrit le {driver.joinDate}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="small"
            icon={Eye}
            onClick={() => onViewDetails(driver)}
          >
            Vérifier docs
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PendingDriverCard;
