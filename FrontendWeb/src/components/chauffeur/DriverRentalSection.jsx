// src/components/chauffeur/DriverRentalSection.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, Sparkles, Crown, Truck, Bus, Gauge, Loader2, Users, Fuel } from 'lucide-react';
import { locationService } from '../../services/locationService';
import { getFullAssetURL } from '../../utils/urlHelper';
import ReservationLocationModal from '../home/ReservationLocationModal';
import Card, { CardContent } from '../admin/ui/Card';
import Button from '../admin/ui/Bttn';
import Badge from '../admin/ui/Badge';

const flotteCategories = [
  { id: 'TOUS', label: 'Tous', icon: Sparkles },
  { id: 'VIP', label: 'VIP', icon: Crown },
  { id: 'SUV', label: 'SUV', icon: Car },
  { id: 'BERLINE', label: 'Berline', icon: Car },
  { id: 'ÉCONOMIQUE', label: 'Économique', icon: Gauge },
  { id: 'PICK-UP 4X4', label: '4x4', icon: Truck },
  { id: 'BUS', label: 'Bus', icon: Bus },
];

const categoryStyles = {
  VIP: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  SUV: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  BERLINE: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
  ÉCONOMIQUE: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  BUS: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
};

const formatPrix = (prix) => new Intl.NumberFormat('fr-GN').format(prix || 0);

const DriverRentalSection = ({ onToast }) => {
  const [vehiculesFlotte, setVehiculesFlotte] = useState([]);
  const [loadingFlotte, setLoadingFlotte] = useState(false);
  const [activeFlotteCategory, setActiveFlotteCategory] = useState('TOUS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState(null);

  useEffect(() => {
    fetchFlotte();
  }, []);

  const fetchFlotte = async () => {
    try {
      setLoadingFlotte(true);
      const res = await locationService.getVehiculesPublics();
      setVehiculesFlotte(res.donnees || []);
    } catch (error) {
      onToast?.("Erreur lors du chargement de la flotte", "error");
    } finally {
      setLoadingFlotte(false);
    }
  };

  const filteredFlotte = vehiculesFlotte.filter(v => 
    activeFlotteCategory === 'TOUS' || v.categorie === activeFlotteCategory
  );

  return (
    <div className="space-y-6">
      {/* Filtres Catégories */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {flotteCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFlotteCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all whitespace-nowrap font-bold text-sm ${
              activeFlotteCategory === cat.id
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {loadingFlotte ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
          <p className="text-slate-500">Chargement des véhicules disponibles...</p>
        </div>
      ) : filteredFlotte.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200">
          <Car className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">Aucun véhicule disponible dans cette catégorie</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFlotte.map((v) => (
            <motion.div
              key={v._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card hoverable className="overflow-hidden border-none shadow-xl bg-white dark:bg-slate-800 group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getFullAssetURL(v.photos?.[0])}
                    alt={v.marque}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="perso" className={categoryStyles[v.categorie] || 'bg-slate-500/20'}>
                      {v.categorie}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {v.marque} {v.modele}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">{v.immatriculation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-emerald-600">{formatPrix(v.prix_jour)}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">par jour</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl text-center">
                      <Users className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{v.caracteristiques?.nb_places || 5} pers</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl text-center">
                      <Fuel className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{v.caracteristiques?.type_carburant || 'DIESEL'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl text-center">
                      <Gauge className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{v.caracteristiques?.boite_auto ? 'AUTO' : 'MANUEL'}</p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-bold shadow-lg shadow-emerald-500/20"
                    onClick={() => {
                      setSelectedVehicule(v);
                      setIsModalOpen(true);
                    }}
                  >
                    Réserver pour travailler
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {isModalOpen && selectedVehicule && (
        <ReservationLocationModal
          vehicule={selectedVehicule}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            onToast?.("Demande de location envoyée !", "success");
          }}
        />
      )}
    </div>
  );
};

export default DriverRentalSection;
