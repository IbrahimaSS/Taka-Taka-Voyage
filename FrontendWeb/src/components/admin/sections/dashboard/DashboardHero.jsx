import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

const DashboardHero = ({ user, t, i18n }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-500 to-blue-600 p-8 text-white shadow-lg"
    >
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
            <span className="text-sm font-medium opacity-90 tracking-wide uppercase">{t('dashboard.live_dashboard') || 'Tableau de Bord Live'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
            {t('dashboard.greeting') || 'Bonjour'}, <span className="text-amber-200">{user?.prenom || 'Admin'}</span>
          </h1>
          <p className="text-lg opacity-90 max-w-xl">
            {t('dashboard.welcome_msg') || "Voici ce qui se passe sur votre plateforme aujourd'hui."}
          </p>
        </div>
        <div className="hidden lg:block text-right">
          <div className="flex items-center justify-end gap-2 mb-2 opacity-80">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]"></div>
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
    </motion.div>
  );
};

export default DashboardHero;
