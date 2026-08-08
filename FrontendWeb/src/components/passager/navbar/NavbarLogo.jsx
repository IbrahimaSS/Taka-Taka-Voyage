import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

const NavbarLogo = ({ platform }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center space-x-3 cursor-pointer shrink-0"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300">
        {platform.logo ? (
          <img src={platform.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
        ) : (
          <Car className="w-6 h-6 text-white" />
        )}
      </div>
      <div>
        <h1 className="text-lg sm:text-2xl font-bold uppercase bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
          {platform.name || 'TakaTaka'}
        </h1>
        <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">{platform.tagline || t('common.welcome')}</p>
      </div>
    </motion.div>
  );
};

export default NavbarLogo;
