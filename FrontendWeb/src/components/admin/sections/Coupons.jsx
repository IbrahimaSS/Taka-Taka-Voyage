import React, { useState, useEffect } from 'react';
import { Gift, Plus } from 'lucide-react';
import { apiClient } from '../../../services/apiClient';
import CouponStatsCards from './coupons/CouponStatsCards';
import CouponsTable from './coupons/CouponsTable';
import CouponFormModal from './coupons/CouponFormModal';
import Button from '../ui/Bttn';

const Coupons = ({ showToast }) => {
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

      <CouponStatsCards coupons={coupons} />

      <CouponsTable
        coupons={coupons}
        loading={loading}
        onToggleStatut={toggleStatut}
        onCreateClick={() => setShowModal(true)}
      />

      <CouponFormModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setShowConfirmation(false); }}
        showConfirmation={showConfirmation}
        formData={formData}
        onInputChange={handleInputChange}
        onGenerateCode={genererCodeAleatoire}
        onSubmit={handleSubmit}
        onBackToForm={() => setShowConfirmation(false)}
        onConfirmSubmit={confirmSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Coupons;
