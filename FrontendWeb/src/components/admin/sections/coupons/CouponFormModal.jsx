import { motion } from 'framer-motion';
import { Gift, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '../../ui/Modal';
import Button from '../../ui/Bttn';

const CouponFormModal = ({
  isOpen, onClose, showConfirmation, formData, onInputChange, onGenerateCode,
  onSubmit, onBackToForm, onConfirmSubmit, isSubmitting,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={showConfirmation ? "🎉 Confirmer le Coupon" : "✨ Nouveau Code Promotionnel"}>
      {showConfirmation ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-6 px-2"
        >
          <div className="w-full max-w-sm bg-gradient-to-br from-primary-500 to-secondary-600 rounded-3xl p-8 text-white shadow-xl shadow-primary-500/20 text-center relative overflow-hidden">
            <Gift className="w-16 h-16 mx-auto mb-4 opacity-90 drop-shadow-md" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-3">Taka-Taka Privilège</h3>
            <div className="text-3xl font-black tracking-widest mb-6 bg-white/20 py-4 rounded-xl border border-white/30 backdrop-blur-md shadow-inner">
              {formData.code}
            </div>
            <div className="flex justify-between items-center text-sm font-bold bg-black/20 p-3.5 rounded-xl">
              <span className="flex-1 text-center">{formData.typeReduction === 'POURCENTAGE' ? `${formData.valeur} %` : `${formData.valeur} GNF`}</span>
              <span className="opacity-30">|</span>
              <span className="flex-1 text-center opacity-90 text-xs">Expire le<br />{formData.dateExpiration ? format(new Date(formData.dateExpiration), 'dd/MM/yyyy') : ''}</span>
            </div>
          </div>

          <div className="flex gap-4 mt-8 w-full">
            <Button type="button" variant="secondary" className="flex-1" onClick={onBackToForm}>
              Modifier
            </Button>
            <Button type="button" variant="primary" className="flex-1 shadow-lg shadow-primary-500/30" onClick={onConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Confirmer !'}
            </Button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6 mt-2">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Code Promo <span className="text-red-500">*</span></label>
              <div className="flex shadow-sm rounded-xl">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={onInputChange}
                  placeholder="EX: RAMADAN20"
                  className="flex-1 uppercase font-bold font-mono tracking-widest px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-r-0 border-gray-200 dark:border-gray-800 rounded-l-xl outline-none focus:border-primary-500 focus:ring-0 text-gray-900 dark:text-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={onGenerateCode}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-800 rounded-r-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Générer
                </button>
              </div>
            </div>

            {/* Type et Valeur */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Type de réduction <span className="text-red-500">*</span></label>
              <select
                name="typeReduction"
                value={formData.typeReduction}
                onChange={onInputChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-gray-900 dark:text-white transition-all shadow-sm"
              >
                <option value="POURCENTAGE">Pourcentage (%)</option>
                <option value="MONTANT_FIXE">Montant Fixe (GNF)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Valeur <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="number"
                  name="valeur"
                  min="1"
                  value={formData.valeur}
                  onChange={onInputChange}
                  placeholder={formData.typeReduction === 'POURCENTAGE' ? 'Ex: 15' : 'Ex: 10000'}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-gray-900 dark:text-white transition-all shadow-sm"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 font-bold">
                  {formData.typeReduction === 'POURCENTAGE' ? '%' : 'GNF'}
                </div>
              </div>
            </div>

            {/* Expiration et Limites */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 truncate">Date d'expiration <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="dateExpiration"
                min={new Date().toISOString().split('T')[0]} // Pas de dates passées
                value={formData.dateExpiration}
                onChange={onInputChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-gray-900 dark:text-white transition-all shadow-sm"
                required
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 truncate">
                Limite globale
                <span className="text-xs text-primary-500 font-medium ml-1.5">(Optionnel)</span>
              </label>
              <input
                type="number"
                name="limiteUtilisationsGlobales"
                min="1"
                value={formData.limiteUtilisationsGlobales}
                onChange={onInputChange}
                placeholder="Illimité si vide"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-gray-900 dark:text-white transition-all shadow-sm"
              />
            </div>

            {/* Conditions Avancées */}
            <div className="col-span-1 md:col-span-2 mt-2 pt-6 border-t border-gray-200 dark:border-gray-800/80">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 mr-2 text-warning-500" /> Garde-fous (Sécurité)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 truncate">Limite par passager</label>
                  <input
                    type="number"
                    name="limiteParUtilisateur"
                    min="1"
                    value={formData.limiteParUtilisateur}
                    onChange={onInputChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-gray-900 dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 truncate">Prix minimum (GNF)</label>
                  <input
                    type="number"
                    name="montantMinimumCourse"
                    min="0"
                    value={formData.montantMinimumCourse}
                    onChange={onInputChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-gray-900 dark:text-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="secondary" onClick={onClose} className="px-6">
              Annuler
            </Button>
            <Button type="submit" variant="primary" className="px-8 shadow-lg shadow-primary-500/30">
              Continuer
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default CouponFormModal;
