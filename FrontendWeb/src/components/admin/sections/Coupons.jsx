import React, { useState, useEffect } from 'react';
import { Gift, Plus, Calendar, Percent, Hash, AlertTriangle, Key, Power, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Bttn';
import Modal from '../ui/Modale';
import { apiClient } from '../../../services/apiClient';
import { useTranslation } from 'react-i18next';

const Coupons = ({ showToast }) => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    code: '',
    typeReduction: 'POURCENTAGE',
    valeur: '',
    dateExpiration: '',
    limiteUtilisationsGlobales: '',
    limiteParUtilisateur: 1,
    montantMinimumCourse: 0
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/coupons');
      if (res.data.succes) {
        setCoupons(res.data.coupons);
      }
    } catch (error) {
      showToast('Erreur', 'Impossible de récupérer les coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const genererCodeAleatoire = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'TAKA';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.valeur || !formData.dateExpiration) {
      showToast('Attention', 'Veuillez remplir les champs obligatoires (code, valeur, expiration).', 'warning');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        code: formData.code,
        typeReduction: formData.typeReduction,
        valeur: Number(formData.valeur),
        dateExpiration: formData.dateExpiration,
        limiteUtilisationsGlobales: formData.limiteUtilisationsGlobales ? Number(formData.limiteUtilisationsGlobales) : null,
        limiteParUtilisateur: Number(formData.limiteParUtilisateur),
        conditions: {
            montantMinimumCourse: Number(formData.montantMinimumCourse)
        }
      };

      const res = await apiClient.post('/coupons', payload);
      if (res.data.succes) {
        showToast('Succès', 'Coupon créé avec succès !', 'success');
        setShowConfirmation(false);
        setShowModal(false);
        setFormData({
          code: '', typeReduction: 'POURCENTAGE', valeur: '', dateExpiration: '',
          limiteUtilisationsGlobales: '', limiteParUtilisateur: 1, montantMinimumCourse: 0
        });
        fetchCoupons();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Erreur lors de la création';
      showToast('Erreur', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatut = async (id, statutActuel) => {
    const nouveauStatut = statutActuel === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    try {
      const res = await apiClient.patch(`/coupons/${id}/statut`, { statut: nouveauStatut });
      if (res.data.succes) {
        showToast('Succès', `Coupon marqué comme ${nouveauStatut}.`, 'success');
        fetchCoupons();
      }
    } catch (error) {
      showToast('Erreur', 'Impossible de changer le statut', 'error');
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'ACTIF': return <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold shadow-sm">ACTIF</span>;
      case 'EXPIRE': return <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold shadow-sm">EXPIRÉ</span>;
      case 'INACTIF': return <span className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs font-bold shadow-sm">DÉSACTIVÉ</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Gift className="mr-3 text-primary-600" />
            Gestion des Promotions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Créez des codes promotionnels pour fidéliser vos passagers.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} variant="primary" icon={Plus}>
          Nouveau Code Promo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Codes</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{coupons.length}</h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Hash className="text-blue-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Codes Actifs</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {coupons.filter(c => c.statut === 'ACTIF').length}
                </h3>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <Gift className="text-green-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Utilisations Totales</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {coupons.reduce((acc, curr) => acc + (curr.utilisationsActuelles || 0), 0)}
                </h3>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <Users className="text-orange-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des coupons */}
      <Card>
        <CardHeader>
          <CardTitle>Codes Promotionnels Récents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">Chargement...</div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <Gift className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Aucun code promo créé pour le moment.</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowModal(true)}>Créer le premier code</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-4 font-semibold">Code Promo</th>
                    <th className="py-4 px-4 font-semibold">Réduction</th>
                    <th className="py-4 px-4 font-semibold">Expiration</th>
                    <th className="py-4 px-4 font-semibold">Utilisations</th>
                    <th className="py-4 px-4 font-semibold text-center">Statut</th>
                    <th className="py-4 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {coupons.map((coupon) => (
                    <motion.tr 
                      key={coupon._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg mr-3">
                            <Key className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white font-mono tracking-wide">{coupon.code}</p>
                            {coupon.conditions?.montantMinimumCourse > 0 && (
                              <p className="text-xs text-gray-500">Min. {coupon.conditions.montantMinimumCourse} GNF</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {coupon.typeReduction === 'POURCENTAGE' 
                            ? <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">{coupon.valeur}%</span>
                            : <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">{coupon.valeur} GNF</span>
                          }
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="w-4 h-4 mr-2 opacity-50" />
                          {format(new Date(coupon.dateExpiration), 'dd MMM yyyy', { locale: fr })}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2 max-w-[100px]">
                            <div 
                              className={`h-2.5 rounded-full ${coupon.utilisationsActuelles >= (coupon.limiteUtilisationsGlobales || 9999) ? 'bg-red-500' : 'bg-primary-600'}`} 
                              style={{ width: `${coupon.limiteUtilisationsGlobales ? Math.min((coupon.utilisationsActuelles / coupon.limiteUtilisationsGlobales) * 100, 100) : 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {coupon.utilisationsActuelles} {coupon.limiteUtilisationsGlobales ? `/ ${coupon.limiteUtilisationsGlobales}` : ''}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(coupon.statut)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {coupon.statut !== 'EXPIRE' && (
                          <button
                            onClick={() => toggleStatut(coupon._id, coupon.statut)}
                            className={`p-2 rounded-xl transition ${
                              coupon.statut === 'ACTIF' 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40' 
                                : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40'
                            }`}
                            title={coupon.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modale de création */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setShowConfirmation(false); }} title={showConfirmation ? "🎉 Confirmer le Coupon" : "✨ Nouveau Code Promotionnel"}>
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
                <span className="flex-1 text-center opacity-90 text-xs">Expire le<br/>{formData.dateExpiration ? format(new Date(formData.dateExpiration), 'dd/MM/yyyy') : ''}</span>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8 w-full">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowConfirmation(false)}>
                Modifier
              </Button>
              <Button type="button" variant="primary" className="flex-1 shadow-lg shadow-primary-500/30" onClick={confirmSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Confirmer !'}
              </Button>
            </div>
          </motion.div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Code Promo <span className="text-red-500">*</span></label>
              <div className="flex shadow-sm rounded-xl">
                <input 
                  type="text" 
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="EX: RAMADAN20"
                  className="flex-1 uppercase font-bold font-mono tracking-widest px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-r-0 border-gray-200 dark:border-gray-800 rounded-l-xl outline-none focus:border-primary-500 focus:ring-0 text-gray-900 dark:text-white transition-all"
                  required
                />
                <button 
                  type="button" 
                  onClick={genererCodeAleatoire}
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
                onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-gray-900 dark:text-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="px-6">
              Annuler
            </Button>
            <Button type="submit" variant="primary" className="px-8 shadow-lg shadow-primary-500/30">
              Continuer
            </Button>
          </div>
        </form>
        )}
      </Modal>

    </div>
  );
};

export default Coupons;
