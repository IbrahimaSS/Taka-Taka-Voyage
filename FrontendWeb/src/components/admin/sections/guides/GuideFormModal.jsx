import { Upload } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Bttn';

const GuideFormModal = ({
  isOpen, onClose, currentGuide, formData, onFieldChange, categories,
  selectedFile, onFileChange, onSubmit, isSubmitting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={currentGuide ? "Modifier le guide" : "Ajouter un nouveau guide"}
      size="md"
    >
      <form onSubmit={onSubmit} className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Titre du document *</label>
            <input
              type="text"
              required
              value={formData.titre}
              onChange={(e) => onFieldChange('titre', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              placeholder="Ex: Guide d'utilisation Passager"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description courte *</label>
            <textarea
              required
              rows="2"
              value={formData.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              placeholder="Décrivez brièvement le contenu du document"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Catégorie *</label>
            <select
              required
              value={formData.categorie}
              onChange={(e) => onFieldChange('categorie', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            >
              {categories.filter(c => c.id !== 'ALL').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Ordre d'affichage</label>
            <input
              type="number"
              value={formData.ordre}
              onChange={(e) => onFieldChange('ordre', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Fichier PDF {currentGuide ? "(Optionnel si inchangé)" : "*"}</label>
            <div className="relative">
              <input
                type="file"
                id="guideFile"
                accept="application/pdf"
                onChange={(e) => onFileChange(e.target.files[0])}
                className="hidden"
              />
              <label
                htmlFor="guideFile"
                className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all"
              >
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedFile ? selectedFile.name : "Cliquez pour sélectionner le PDF"}
                </span>
                <span className="text-xs text-slate-400 mt-1">PDF uniquement, Max 20 Mo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="perso"
            fullWidth
            loading={isSubmitting}
          >
            {currentGuide ? "Mettre à jour" : "Créer le guide"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GuideFormModal;
