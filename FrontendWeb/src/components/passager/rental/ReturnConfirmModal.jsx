import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';

const ReturnConfirmModal = ({ show, onCancel, onConfirm }) => (
  <AnimatePresence>
    {show && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onCancel}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>

            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              Confirmer le retour ?
            </h3>

            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium leading-relaxed">
              Voulez-vous signaler que vous avez rendu le véhicule ?
              <br className="hidden sm:block" />
              <span className="text-xs mt-2 inline-block text-amber-500 bg-amber-50 dark:bg-amber-900/10 px-3 py-1 rounded-full">
                L'administrateur devra valider pour clôturer la location.
              </span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Oui, je confirme <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default ReturnConfirmModal;
