import { useTranslation } from 'react-i18next';
import { Car } from 'lucide-react';

const PassengerFooter = ({ platform }) => {
  const { t } = useTranslation();

  return (
    <footer className="mt-12 py-12 bg-gradient-to-r from-gray-900 to-gray-800 dark:bg-gray-800/40 text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
                {platform.logo ? (
                  <img src={platform.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Car className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold uppercase bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                  {platform.name || 'TakaTaka'}
                </h2>
                <p className="text-gray-400 text-sm dark:text-gray-100">{platform.tagline || t('common.welcome')}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 justify-center">
            <a href="#" className="text-gray-400 hover:text-white transition-all hover:scale-105">{t('common.about')}</a>
            <a href="#" className="text-gray-400 hover:text-white transition-all hover:scale-105">{t('common.help')}</a>
            <a href="#" className="text-gray-400 hover:text-white transition-all hover:scale-105">{t('common.privacy')}</a>
            <a href="#" className="text-gray-400 hover:text-white transition-all hover:scale-105">{t('common.terms')}</a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 dark:border-gray-800/50 text-center">
          <p className="text-gray-500">© {new Date().getFullYear()} {platform.name || 'Taka Taka'}. {t('common.all_rights_reserved')}</p>
          <p className="text-gray-600 text-xs mt-2 uppercase tracking-widest">{t('common.availability')}</p>
        </div>
      </div>
    </footer>
  );
};

export default PassengerFooter;
