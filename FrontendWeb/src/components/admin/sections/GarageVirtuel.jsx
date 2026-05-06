import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Fuel,
  Users,
  Calendar,
  DollarSign,
  Loader2,
  X,
  Image as ImageIcon,
  Upload,
  ClipboardList
} from 'lucide-react';
import { locationService } from '../../../services/locationService';
import { getFullAssetURL } from '../../../utils/urlHelper';
import AdminButton from '../ui/Bttn';
import Modal from '../ui/Modale';
import ReservationsLocation from './ReservationsLocation';

const GarageVirtuel = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState('garage');
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('TOUS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const fileInputRef = React.useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // État pour le formulaire d'ajout/modification
  const [formData, setFormData] = useState({
    immatriculation: '',
    marque: '',
    modele: '',
    annee: new Date().getFullYear(),
    categorie: 'BERLINE',
    prix_jour: '',
    caution: '',
    statut: 'DISPONIBLE',
    photos: [], // On utilisera le premier index pour l'image principale
    caracteristiques: {
      nb_places: 5,
      climatisation: true,
      boite_auto: true,
      type_carburant: 'DIESEL'
    }
  });

  const [mainPhoto, setMainPhoto] = useState('');

  const fetchVehicules = async () => {
    setLoading(true);
    try {
      const res = await locationService.getVehicules();
      setVehicules(res.donnees || []);
    } catch (error) {
      showToast('Erreur', 'Impossible de charger la flotte', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicules();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'categorie') {
      if (value === 'AUTRE') {
        setIsCustomCategory(true);
      } else {
        setIsCustomCategory(false);
      }
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleChange = (name) => {
    const [parent, child] = name.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [child]: !prev[parent][child] }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      
      // Ajouter les champs de base au FormData
      Object.keys(formData).forEach(key => {
        if (key === 'caracteristiques') {
          fd.append(key, JSON.stringify(formData[key]));
        } else if (key !== 'photos') {
          fd.append(key, formData[key]);
        }
      });

      // Gérer la catégorie personnalisée
      if (isCustomCategory && customCategory) {
        fd.set('categorie', customCategory.toUpperCase());
      }

      // Ajouter le fichier si présent
      if (selectedFile) {
        fd.append('photo', selectedFile);
      } else if (formData.photos?.[0]) {
        // Garder l'ancienne photo si pas de nouvelle sélection
        // fd.append('photos', JSON.stringify(formData.photos));
      }

      if (selectedVehicule) {
        await locationService.modifierVehicule(selectedVehicule._id, fd);
        showToast('Succès', 'Véhicule mis à jour');
      } else {
        await locationService.ajouterVehicule(fd);
        showToast('Succès', 'Véhicule ajouté à la flotte');
      }
      setIsModalOpen(false);
      fetchVehicules();
    } catch (error) {
      showToast('Erreur', error.message || 'Une erreur est survenue', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer ce véhicule de la flotte ?')) {
      try {
        await locationService.supprimerVehicule(id);
        showToast('Succès', 'Véhicule supprimé');
        fetchVehicules();
      } catch (error) {
        showToast('Erreur', error.message || 'Impossible de supprimer', 'error');
      }
    }
  };

  const openForm = (vehicule = null) => {
    setIsCustomCategory(false);
    setCustomCategory('');
    setSelectedFile(null);
    if (vehicule) {
      setSelectedVehicule(vehicule);
      setFormData({
        immatriculation: vehicule.immatriculation,
        marque: vehicule.marque,
        modele: vehicule.modele,
        annee: vehicule.annee,
        categorie: vehicule.categorie,
        prix_jour: vehicule.prix_jour,
        caution: vehicule.caution,
        statut: vehicule.statut,
        photos: vehicule.photos || [],
        caracteristiques: vehicule.caracteristiques
      });
      setMainPhoto(vehicule.photos?.[0] || '');
    } else {
      setSelectedVehicule(null);
      setMainPhoto('');
      setFormData({
        immatriculation: '',
        marque: '',
        modele: '',
        annee: new Date().getFullYear(),
        categorie: 'BERLINE',
        prix_jour: '',
        caution: '',
        statut: 'DISPONIBLE',
        photos: [],
        caracteristiques: {
          nb_places: 5,
          climatisation: true,
          boite_auto: true,
          type_carburant: 'DIESEL'
        }
      });
    }
    setIsModalOpen(true);
  };

  const filteredItems = vehicules.filter(item => {
    const matchSearch = (item.marque + ' ' + item.modele + ' ' + item.immatriculation).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filterStatut === 'TOUS' || item.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  return (
    <div className="space-y-6">
      {/* Onglets Garage / Réservations */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
        <button
          onClick={() => setActiveTab('garage')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'garage'
              ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Car className="w-4 h-4" />
          Garage
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'reservations'
              ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Réservations
        </button>
      </div>

      {/* Contenu conditionnel */}
      {activeTab === 'reservations' ? (
        <ReservationsLocation showToast={showToast} />
      ) : (
      <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Car className="text-primary-600" />
            Garage Virtuel Baraka Trans
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Gérez votre flotte de véhicules et suivez leur disponibilité.
          </p>
        </div>
        <AdminButton 
          variant="perso" 
          icon={Plus} 
          onClick={() => openForm()}
        >
          Ajouter un véhicule
        </AdminButton>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          label="Flotte Totale" 
          value={vehicules.length} 
          icon={Car} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Disponibles" 
          value={vehicules.filter(v => v.statut === 'DISPONIBLE').length} 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
        />
        <StatCard 
          label="En Location" 
          value={vehicules.filter(v => v.statut === 'EN_LOCATION').length} 
          icon={Calendar} 
          color="bg-amber-500" 
        />
        <StatCard 
          label="Maintenance" 
          value={vehicules.filter(v => v.statut === 'MAINTENANCE').length} 
          icon={AlertCircle} 
          color="bg-rose-500" 
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Rechercher par immatriculation, marque..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm "
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="DISPONIBLE">Disponibles</option>
              <option value="EN_LOCATION">En Location</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary-600 animate-spin mb-4" />
            <p className="text-slate-500 animate-pulse">Chargement de la flotte...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">Véhicule</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Tarif (GNF/J)</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredItems.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-16 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                          {v.photos?.[0] ? (
                            <img src={getFullAssetURL(v.photos[0])} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Car size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {v.marque} {v.modele}
                          </p>
                          <p className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded inline-block mt-1">
                            {v.immatriculation}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {v.categorie}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-primary-600 dark:text-primary-400">
                        {new Intl.NumberFormat('fr-GN').format(v.prix_jour)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={v.statut} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openForm(v)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(v._id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Car size={48} className="opacity-20 mb-4" />
            <p>Aucun véhicule ne correspond à votre recherche</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedVehicule ? "Modifier le véhicule" : "Ajouter un véhicule"}
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-5">
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
                          setSelectedFile(file);
                          setMainPhoto(URL.createObjectURL(file));
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
            <Field label="Marque" name="marque" value={formData.marque} onChange={handleInputChange} required />
            <Field label="Modèle" name="modele" value={formData.modele} onChange={handleInputChange} required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Field label="Immatriculation" name="immatriculation" value={formData.immatriculation} onChange={handleInputChange} required />
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Catégorie</label>
              <select 
                name="categorie" 
                value={isCustomCategory ? 'AUTRE' : formData.categorie} 
                onChange={handleInputChange} 
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
                  onChange={(e) => setCustomCategory(e.target.value)}
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Prix / Jour (GNF)" name="prix_jour" type="number" value={formData.prix_jour} onChange={handleInputChange} required />
            <Field label="Caution (GNF)" name="caution" type="number" value={formData.caution} onChange={handleInputChange} required />
          </div>

          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-500 uppercase block">Caractéristiques</label>
             <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <Toggle 
                  label="Climatisation" 
                  checked={formData.caracteristiques.climatisation} 
                  onChange={() => handleToggleChange('caracteristiques.climatisation')} 
                />
                <Toggle 
                  label="Boîte Auto" 
                  checked={formData.caracteristiques.boite_auto} 
                  onChange={() => handleToggleChange('caracteristiques.boite_auto')} 
                />
                <div className="flex items-center gap-2">
                   <Users size={16} className="text-slate-400" />
                   <input 
                     type="number" 
                     name="caracteristiques.nb_places" 
                     value={formData.caracteristiques.nb_places} 
                     onChange={handleInputChange}
                     className="w-12 bg-transparent border-b border-slate-300 dark:border-slate-700 outline-none text-center"
                   />
                   <span className="text-xs text-slate-500">Places</span>
                </div>
             </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <AdminButton variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Annuler
            </AdminButton>
            <AdminButton variant="perso" className="flex-1" type="submit">
              {selectedVehicule ? "Mettre à jour" : "Ajouter au garage"}
            </AdminButton>
          </div>
        </form>
      </Modal>
      </>
      )}
    </div>
  );
};

// --- Sub-components ---

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
    <div className={`h-12 w-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center`}>
      <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    DISPONIBLE: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    EN_LOCATION: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    MAINTENANCE: 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
    RETIRE: 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

const Field = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
    <input 
      className="w-full border-b-2 border-slate-200 dark:border-slate-700 bg-transparent py-2 outline-none focus:border-primary-500 transition-colors text-slate-900 dark:text-white"
      {...props}
    />
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center gap-2 cursor-pointer" onClick={onChange}>
    <div className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
       <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'right-0.5' : 'left-0.5'}`} />
    </div>
    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{label}</span>
  </div>
);

export default GarageVirtuel;
