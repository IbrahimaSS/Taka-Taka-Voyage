import { useState, useEffect } from 'react';
import { Car, Plus, CheckCircle2, AlertCircle, Calendar, ClipboardList } from 'lucide-react';
import { locationService } from '../../../services/locationService';
import AdminButton from '../ui/Bttn';
import ReservationsLocation from './ReservationsLocation';
import { StatCard } from './garagevirtuel/GarageUI';
import GarageFilterBar from './garagevirtuel/GarageFilterBar';
import VehiclesTable from './garagevirtuel/VehiclesTable';
import VehicleFormModal from './garagevirtuel/VehicleFormModal';

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
      <GarageFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatut={filterStatut}
        onFilterStatutChange={setFilterStatut}
      />

      {/* Vehicles Table */}
      <VehiclesTable
        items={filteredItems}
        loading={loading}
        onEdit={openForm}
        onDelete={handleDelete}
      />

      {/* Modal Form */}
      <VehicleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditing={!!selectedVehicule}
        formData={formData}
        onInputChange={handleInputChange}
        onToggleChange={handleToggleChange}
        onSubmit={handleSubmit}
        isCustomCategory={isCustomCategory}
        customCategory={customCategory}
        onCustomCategoryChange={setCustomCategory}
        mainPhoto={mainPhoto}
        selectedFile={selectedFile}
        onFileSelected={(file) => {
          setSelectedFile(file);
          setMainPhoto(URL.createObjectURL(file));
        }}
      />
      </>
      )}
    </div>
  );
};

export default GarageVirtuel;
