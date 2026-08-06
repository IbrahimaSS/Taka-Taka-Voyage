import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Upload, AlertCircle, Users } from 'lucide-react';
import Modal from '../../ui/Modal';
import AdminButton from '../../ui/Bttn';
import { getFullAssetURL } from '../../../../utils/urlHelper';
import { Field, Toggle } from './GarageUI';

const VehicleFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onInputChange,
  onToggleChange,
  onSubmit,
  isCustomCategory,
  customCategory,
  onCustomCategoryChange,
  mainPhoto,
  selectedFile,
  onFileSelected
}) => {
  const fileInputRef = useRef(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Modifier le véhicule" : "Ajouter un véhicule"}
    >
      <form onSubmit={onSubmit} className="p-4 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase block">Photo du véhicule</label>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div
              className="w-full md:w-40 h-28 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden group relative"
            >
              {mainPhoto ? (
                <img
                  src={mainPhoto.startsWith('blob:') ? mainPhoto : getFullAssetURL(mainPhoto)}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <ImageIcon size={24} />
                  <span className="text-[10px]">Aperçu</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    onFileSelected(file);
                  }
                }}
              />
            </div>
            <div className="flex-1 w-full space-y-3">
              <AdminButton
                type="button"
                variant="outline"
                size="small"
                icon={Upload}
                onClick={() => fileInputRef.current?.click()}
              >
                Ajouter une photo
              </AdminButton>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                  {selectedFile ? selectedFile.name : (mainPhoto ? 'Image actuelle' : 'Aucun fichier')}
                </p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <AlertCircle size={10} />
                  Format JPG, PNG (Max 5Mo).
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Marque" name="marque" value={formData.marque} onChange={onInputChange} required />
          <Field label="Modèle" name="modele" value={formData.modele} onChange={onInputChange} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Immatriculation" name="immatriculation" value={formData.immatriculation} onChange={onInputChange} required />
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Catégorie</label>
            <select
              name="categorie"
              value={isCustomCategory ? 'AUTRE' : formData.categorie}
              onChange={onInputChange}
              className="w-full border-b-2 border-slate-200 dark:border-slate-700 bg-transparent py-2 outline-none focus:border-primary-500"
            >
              <option value="VIP">VIP</option>
              <option value="SUV">SUV</option>
              <option value="BERLINE">BERLINE</option>
              <option value="ÉCONOMIQUE">ÉCONOMIQUE</option>
              <option value="PICK-UP 4X4">PICK-UP 4X4</option>
              <option value="MINIBUS SCOLAIRE">MINIBUS SCOLAIRE</option>
              <option value="BUS">BUS</option>
              <option value="AUTRE">AUTRE (Saisir...)</option>
            </select>
          </div>
        </div>

        <AnimatePresence>
          {isCustomCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Field
                label="Nom de la catégorie personnalisée"
                placeholder="Ex: TAXI BROUSSE, MINEX..."
                value={customCategory}
                onChange={(e) => onCustomCategoryChange(e.target.value)}
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Prix / Jour (GNF)" name="prix_jour" type="number" value={formData.prix_jour} onChange={onInputChange} required />
          <Field label="Caution (GNF)" name="caution" type="number" value={formData.caution} onChange={onInputChange} required />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase block">Caractéristiques</label>
          <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <Toggle
              label="Climatisation"
              checked={formData.caracteristiques.climatisation}
              onChange={() => onToggleChange('caracteristiques.climatisation')}
            />
            <Toggle
              label="Boîte Auto"
              checked={formData.caracteristiques.boite_auto}
              onChange={() => onToggleChange('caracteristiques.boite_auto')}
            />
            <div className="flex items-center gap-2">
              <Users size={16} className="text-slate-400" />
              <input
                type="number"
                name="caracteristiques.nb_places"
                value={formData.caracteristiques.nb_places}
                onChange={onInputChange}
                className="w-12 bg-transparent border-b border-slate-300 dark:border-slate-700 outline-none text-center"
              />
              <span className="text-xs text-slate-500">Places</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <AdminButton variant="outline" className="flex-1" onClick={onClose}>
            Annuler
          </AdminButton>
          <AdminButton variant="perso" className="flex-1" type="submit">
            {isEditing ? "Mettre à jour" : "Ajouter au garage"}
          </AdminButton>
        </div>
      </form>
    </Modal>
  );
};

export default VehicleFormModal;
