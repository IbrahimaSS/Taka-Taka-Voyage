import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Send, X, MessageSquare, Info, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { litigeService } from '../../services/litigeService';
import Modal from '../admin/ui/Modal';
import Button from '../admin/ui/Bttn';
import Card, { CardContent } from '../admin/ui/Card';

const DisputeReportingModal = ({ isOpen, onClose, reservationId, role }) => {
    const [formData, setFormData] = useState({
        type: '',
        description: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const disputeTypes = [
        { id: "PAIEMENT", label: "Problème de paiement" },
        { id: "COMPORTEMENT", label: "Comportement inapproprié" },
        { id: "TRAJET", label: "Problème d'itinéraire" },
        { id: "ACCIDENT", label: "Accident / Incident" },
        { id: "AGRESSION", label: "Harcèlement / Agression" },
        { id: "AUTRE", label: "Autre motif" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.type || !formData.description) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        if (!reservationId) {
            toast.error("Aucune course sélectionnée");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await litigeService.creerLitige({
                reservation: reservationId,
                type: formData.type,
                description: formData.description
            });

            if (response.data.succes) {
                toast.success("Litige signalé avec succès. L'administrateur a été notifié.");
                setFormData({ type: '', description: '' });
                onClose();
            } else {
                toast.error(response.data.message || "Erreur lors du signalement");
            }
        } catch (error) {
            console.error("Erreur signalement litige:", error);
            toast.error(error.response?.data?.message || "Une erreur est survenue");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="md"
        >
            <div className="space-y-6">
                <div className="flex items-center space-x-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Signaler un litige</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Course #{reservationId?.slice(-6).toUpperCase() || '---'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Type de litige <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {disputeTypes.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: type.id })}
                                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${formData.type === type.id
                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 shadow-sm'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description des faits <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            placeholder="Veuillez décrire précisément ce qui s'est passé..."
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                            required
                        />
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div className="flex items-start space-x-3">
                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Un litige signalé est définitif. Notre équipe examinera les données du trajet (position, messages, historique) pour résoudre le conflit de manière équitable.
                            </p>
                        </div>
                    </div>

                    <div className="flex space-x-4 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={onClose}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={isSubmitting}
                            icon={Send}
                            className="!bg-amber-600 hover:!bg-amber-700 border-none"
                        >
                            Envoyer le signalement
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default DisputeReportingModal;
