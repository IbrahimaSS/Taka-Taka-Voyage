import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Phone, Mail, MessageCircle, HelpCircle, FileText, ChevronDown, Upload, Send, MessageSquare, FileDown } from 'lucide-react';

// Composants réutilisables
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import Button from '../admin/ui/Bttn';
import Badge from '../admin/ui/Badge';
import Modal from '../admin/ui/Modal';
import Tabs from '../admin/ui/Tabs';
import Progress from '../admin/ui/Progress';

const Support = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    attachDetails: false,
  });
  const [activeTab, setActiveTab] = useState('faq');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const faqs = [
    {
      id: 1,
      question: "Comment annuler un trajet ?",
      answer: "Vous pouvez annuler un trajet dans les 5 minutes suivant sa réservation sans frais. Passé ce délai, des frais d'annulation peuvent s'appliquer.",
      category: "trajets"
    },
    {
      id: 2,
      question: "Comment signaler un problème ?",
      answer: "Utilisez le bouton 'Signaler un problème' dans les détails du trajet ou contactez directement le support via ce formulaire.",
      category: "problèmes"
    },
    {
      id: 3,
      question: "Comment fonctionne le paiement ?",
      answer: "Nous acceptons Mobile Money, espèces, cartes bancaires et portefeuille Taka Taka. Le paiement est sécurisé via notre plateforme.",
      category: "paiement"
    },
    {
      id: 4,
      question: "Comment devenir chauffeur ?",
      answer: "Rendez-vous dans la section 'Devenir chauffeur' de notre application principale et suivez le processus d'inscription.",
      category: "chauffeurs"
    }
  ];

  const contactChannels = [
    {
      id: 1,
      name: 'Téléphone',
      description: '+224 623 09 07 41',
      availability: 'Lun-Ven, 8h-18h',
      icon: Phone,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      action: () => window.location.href = 'tel:+224623090741'
    },
    {
      id: 2,
      name: 'Email',
      description: 'support@takataka.gn',
      availability: 'Réponse sous 24h',
      icon: Mail,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      action: () => window.location.href = 'mailto:support@takataka.gn'
    },
    {
      id: 3,
      name: 'Chat en direct',
      description: 'Disponible 24/7',
      availability: 'Dans l\'application',
      icon: MessageCircle,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      action: () => window.open('/chat', '_blank')
    },
  ];

  const documentation = [
    {
      id: 1,
      title: "Guide d'utilisation",
      description: "Apprenez à utiliser toutes les fonctionnalités",
      icon: FileText,
      action: () => window.open('/guides/utilisation.pdf', '_blank')
    },
    {
      id: 2,
      title: "Politique de sécurité",
      description: "Comment nous protégeons vos données",
      icon: FileDown,
      action: () => window.open('/policies/securite.pdf', '_blank')
    },
    {
      id: 3,
      title: "Conditions d'utilisation",
      description: "Règles et conditions du service",
      icon: FileText,
      action: () => window.open('/policies/conditions.pdf', '_blank')
    },
    {
      id: 4,
      title: "FAQ complète",
      description: "Toutes les questions fréquentes",
      icon: HelpCircle,
      action: () => window.open('/faq', '_blank')
    }
  ];

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'contact', label: 'Contact', icon: MessageSquare },
  ];

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        alert(`Type de fichier non supporté: ${file.name}`);
        return false;
      }

      if (file.size > maxSize) {
        alert(`Fichier trop volumineux: ${file.name} (max 5MB)`);
        return false;
      }

      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject || !formData.description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);

    // Simuler l'envoi du formulaire
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowSuccessModal(true);
      setFormData({ subject: '', description: '', attachDetails: false });
      setUploadedFiles([]);
    } catch (error) {
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: 'Taux de résolution', value: 95, color: 'green' },
    { label: 'Temps de réponse moyen', value: 45, color: 'blue', suffix: 'min' },
    { label: 'Satisfaction clients', value: 4.8, color: 'yellow', max: 5 },
  ];

  return (
    <>
      <div className="space-y-8">
        {/* En-tête avec stats */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Centre d'aide et support
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Nous sommes là pour vous aider 24h/24 et 7j/7
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                    <Headphones className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">Support 24/7</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Réponse sous 2h</p>
                  </div>
                </div>
                <Badge variant="success" size="lg">
                  <span className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    En ligne
                  </span>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de navigation */}
        <div className="bg-white dark:bg-gray-800/40 rounded-xl p-1 border border-gray-100 dark:border-gray-700/50">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="border-none"
          />
        </div>

        {/* Contenu des tabs */}
        {activeTab === 'faq' && (
          <Card>
            <CardHeader>
              <CardTitle>Questions fréquentes</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Trouvez rapidement des réponses à vos questions
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-green-500 dark:hover:border-green-400 transition-colors"
                  >
                    <button
                      className="w-full p-4 flex justify-between items-center text-left bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                          <HelpCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {faq.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedFaq === faq.id ? 'transform rotate-180' : ''
                          }`}
                      />
                    </button>
                    {expandedFaq === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4"
                      >
                        <div className="pl-11 pt-3">
                          <Badge variant="secondary" size="xs" className="mb-3">
                            {faq.category}
                          </Badge>
                          <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                          <Button
                            variant="ghost"
                            size="small"
                            className="mt-3"
                            onClick={() => window.open(`/faq#${faq.id}`, '_blank')}
                          >
                            Voir plus de détails
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter align="center">
              <Button variant="outline" onClick={() => window.open('/faq', '_blank')}>
                Voir toutes les questions
              </Button>
            </CardFooter>
          </Card>
        )}

        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire de contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contactez-nous</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Remplissez ce formulaire pour nous contacter directement
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      Sujet <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
                      required
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="trip_problem">Problème avec un trajet</option>
                      <option value="payment_problem">Problème de paiement</option>
                      <option value="driver_problem">Problème avec un chauffeur</option>
                      <option value="account_question">Question sur mon compte</option>
                      <option value="suggestion">Suggestion d'amélioration</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
                      placeholder="Décrivez votre problème en détail..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      Pièces jointes (optionnel)
                    </label>
                    <div className="space-y-4">
                      <label className="block border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors cursor-pointer">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.gif,.pdf,.txt"
                        />
                        <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Glissez-déposez vos fichiers ici</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">ou cliquez pour parcourir</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">JPG, PNG, GIF, PDF, TXT (max 5MB)</p>
                      </label>

                      {/* Liste des fichiers uploadés */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                            >
                              <div className="flex items-center">
                                <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.attachDetails}
                        onChange={(e) => setFormData({ ...formData, attachDetails: e.target.checked })}
                        className="w-5 h-5 text-green-600 rounded border-gray-300 dark:border-gray-700 focus:ring-green-500/20"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Joindre les détails de mon dernier trajet
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isSubmitting}
                    icon={Send}
                  >
                    Envoyer la demande
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Canaux de contact */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Autres canaux de contact</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Contactez-nous via ces canaux alternatifs
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {contactChannels.map((channel) => {
                      const Icon = channel.icon;
                      return (
                        <motion.div
                          key={channel.id}
                          whileHover={{ y: -2 }}
                          className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={channel.action}
                        >
                          <div className="flex items-center">
                            <div className={`w-12 h-12 ${channel.bgColor} rounded-full flex items-center justify-center mr-4`}>
                              <Icon className={`w-6 h-6 ${channel.color}`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                                {channel.name}
                              </p>
                              <p className="text-gray-600 dark:text-gray-300 mb-1">
                                {channel.description}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {channel.availability}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Documentation */}
              <Card>
                <CardHeader>
                  <CardTitle>Documentation</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Ressources utiles pour vous aider
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {documentation.map((doc) => {
                      const Icon = doc.icon;
                      return (
                        <button
                          key={doc.id}
                          className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors text-left"
                          onClick={doc.action}
                        >
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                            <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {doc.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {doc.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}


      </div>

      {/* Modal de succès */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        size="sm"
      >
        <div className="text-center p-6">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Demande envoyée !
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Votre demande a été transmise à notre équipe de support.
            Vous recevrez une réponse dans les plus brefs délais.
          </p>
          <div className="space-y-4">

            <Button
              variant="primary"
              fullWidth
              onClick={() => setShowSuccessModal(false)}
            >
              D'accord
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Support;