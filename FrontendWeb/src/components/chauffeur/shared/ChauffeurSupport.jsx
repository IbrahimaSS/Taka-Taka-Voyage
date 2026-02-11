import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Headphones, Phone, Mail, MessageCircle, HelpCircle,
    FileText, ChevronDown, Upload, Send, MessageSquare,
    FileDown, ShieldCheck, Zap, DollarSign
} from 'lucide-react';

// Composants réutilisables
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';
import Badge from '../../admin/ui/Badge';
import Modal from '../../admin/ui/Modal';
import Tabs from '../../admin/ui/Tabs';

const ChauffeurSupport = () => {
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [activeTab, setActiveTab] = useState('faq');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const faqs = [
        {
            id: 1,
            question: "Comment sont calculés mes revenus ?",
            answer: "Vos revenus sont calculés en fonction de la distance parcourue, du temps de trajet et des éventuelles majorations en période de forte demande.",
            category: "finances"
        },
        {
            id: 2,
            question: "Comment mettre à jour mes documents ?",
            answer: "Allez dans votre profil, section 'Documents'. Vous pouvez y télécharger vos nouvelles pièces d'identité ou permis.",
            category: "compte"
        },
        {
            id: 3,
            question: "Que faire en cas de passager absent ?",
            answer: "Après 5 minutes d'attente au point de départ, vous pouvez annuler la course. Des frais d'attente vous seront automatiquement versés.",
            category: "courses"
        },
        {
            id: 4,
            question: "Comment fonctionne le parrainage ?",
            answer: "Invitez d'autres chauffeurs avec votre code unique et gagnez une commission sur leurs 10 premières courses.",
            category: "bonus"
        }
    ];

    const contactChannels = [
        {
            id: 1,
            name: 'Ligne Chauffeur Prioritaire',
            description: '+224 623 00 00 00',
            availability: '24h/24, 7j/7',
            icon: Phone,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            action: () => { }
        },
        {
            id: 2,
            name: 'Assistance par Chat',
            description: 'Réponse en moins de 5 min',
            availability: 'Disponible dans l\'app',
            icon: MessageCircle,
            color: 'text-primary-600',
            bgColor: 'bg-primary-100',
            action: () => { }
        }
    ];

    const tabs = [
        { id: 'faq', label: 'FAQ Chauffeur', icon: HelpCircle },
        { id: 'contact', label: 'Assistance Directe', icon: MessageSquare },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setShowSuccessModal(true);
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="space-y-8 p-1">
            <Card className="bg-gradient-to-r from-primary-600 to-indigo-700 text-white border-none shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Headphones className="w-48 h-48" />
                </div>
                <CardContent className="p-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-extrabold mb-2">Espace Support Chauffeur</h1>
                            <p className="text-primary-100 text-lg">Assistance prioritaire pour nos partenaires</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-center min-w-[120px]">
                                <p className="text-xs uppercase font-bold tracking-widest text-primary-100 mb-1">Status</p>
                                <div className="flex items-center justify-center font-bold">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                                    EN LIGNE
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === 'faq' ? (
                <Card className="surface">
                    <CardHeader><CardTitle>Questions Fréquentes</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {faqs.map((faq) => (
                            <div key={faq.id} className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden transition-all hover:border-primary-500/50">
                                <button
                                    className="w-full p-5 text-left flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 font-bold text-gray-900 dark:text-gray-100"
                                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                >
                                    <span className="flex items-center">
                                        <Badge variant="primary" size="xs" className="mr-3">{faq.category}</Badge>
                                        {faq.question}
                                    </span>
                                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedFaq === faq.id && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-6 pb-6 pt-2 text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                                        {faq.answer}
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="surface">
                        <CardHeader><CardTitle>Envoyer une requête</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Objet du message</label>
                                    <select className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20">
                                        <option>Problème de paiement / revenus</option>
                                        <option>Incident avec un passager</option>
                                        <option>Bug technique application</option>
                                        <option>Mise à jour de documents</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message détaillé</label>
                                    <textarea rows={4} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="Décrivez votre situation..."></textarea>
                                </div>
                                <Button variant="primary" fullWidth loading={isSubmitting} icon={Send}>Envoyer au support</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        {contactChannels.map(channel => (
                            <Card key={channel.id} className="surface transition-transform hover:-translate-y-1 cursor-pointer" onClick={channel.action}>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 ${channel.bgColor} rounded-2xl flex items-center justify-center`}>
                                            <channel.icon className={`w-7 h-7 ${channel.color}`} />
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-gray-900 dark:text-gray-100">{channel.name}</p>
                                            <p className="text-primary-600 dark:text-primary-400 font-bold">{channel.description}</p>
                                            <p className="text-xs text-gray-500">{channel.availability}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} size="sm">
                <div className="text-center p-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">C'est envoyé !</h3>
                    <p className="text-gray-600 mb-8">Un agent de support étudie votre demande en priorité.</p>
                    <Button variant="primary" fullWidth onClick={() => setShowSuccessModal(false)}>Fermer</Button>
                </div>
            </Modal>
        </div>
    );
};

const CheckCircle = ({ className }) => <ShieldCheck className={className} />;

export default ChauffeurSupport;
