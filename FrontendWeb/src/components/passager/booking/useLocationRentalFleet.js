import { useState, useEffect } from 'react';
import { locationService } from '../../../services/locationService';

export const useLocationRentalFleet = (serviceMode) => {
  const [vehiculesFlotte, setVehiculesFlotte] = useState([]);
  const [loadingFlotte, setLoadingFlotte] = useState(false);
  const [activeFlotteCategory, setActiveFlotteCategory] = useState('TOUS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState(null);

  // Charger la flotte quand on passe en mode location
  useEffect(() => {
    if (serviceMode === 'location' && vehiculesFlotte.length === 0) {
      setLoadingFlotte(true);
      locationService.getVehiculesPublics()
        .then(res => {
          if (res.donnees) {
            const enriched = res.donnees.map(v => ({
              ...v,
              note: v.note || (4.5 + Math.random() * 0.5).toFixed(1)
            }));
            setVehiculesFlotte(enriched);
          }
        })
        .catch(err => console.error('Erreur chargement flotte:', err))
        .finally(() => setLoadingFlotte(false));
    }
  }, [serviceMode]);

  const vehiculesFiltres = activeFlotteCategory === 'TOUS'
    ? vehiculesFlotte
    : vehiculesFlotte.filter(v => v.categorie === activeFlotteCategory);

  const handleReserverVehicule = (vehicule) => {
    setSelectedVehicule(vehicule);
    setIsModalOpen(true);
  };

  return {
    vehiculesFiltres,
    loadingFlotte,
    activeFlotteCategory,
    setActiveFlotteCategory,
    isModalOpen,
    setIsModalOpen,
    selectedVehicule,
    handleReserverVehicule,
  };
};
