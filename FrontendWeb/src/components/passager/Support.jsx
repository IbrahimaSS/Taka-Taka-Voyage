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

// Context et services
import { litigeService } from '../../services/litigeService';
import { tripService } from '../../services/tripService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Support = () => {
  const { t } = useTranslation();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [lastTrip, setLastTrip] = useState(null);
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
      answer: "L'annulation est gratuite tant qu'aucun chauffeur n'a accepté la course. Une fois le chauffeur en route, des frais d'annulation de 5 000 GNF sont appliqués pour compenser son déplacement. Le reste de votre paiement est remboursé sur votre portefeuille TakaTaka.",
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
      action: () => toast.info('Le chat en direct est en cours de maintenance. Veuillez utiliser le formulaire ou l\'email.')
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
    { id: 'faq', label: t('support.faq_title'), icon: HelpCircle },
    { id: 'contact', label: t('support.contact_title'), icon: MessageSquare },
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
      toast.error(t('support.error_fields'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Mapping des types pour correspondre à l'enum du backend : PAIEMENT, COMPORTEMENT, TRAJET, ACCIDENT, AGRESSION, URGENCE_MEDICALE, DANGER, AUTRE
      const typeMapping = {
        'trip_problem': 'TRAJET',
        'payment_problem': 'PAIEMENT',
        'driver_problem': 'COMPORTEMENT',
        'account_question': 'AUTRE',
        'suggestion': 'AUTRE',
        'other': 'AUTRE'
      };

      let finalData = {
        type: typeMapping[formData.subject] || 'AUTRE',
        description: formData.description,
        piecesJointes: uploadedFiles.map(f => f.name),
      };

      // Si l'utilisateur veut joindre les détails du dernier trajet
      if (formData.attachDetails) {
        try {
          const { data } = await tripService.getPassengerHistory({ limit: 1 });
          if (data.succes && data.trajets.length > 0) {
            // Le backend attend "reservation" (ObjectId)
            finalData.reservation = data.trajets[0].reservation;

            if (!finalData.reservation) {
              // Fallback au cas où le champ reservation du trajet est manquant (peu probable mais sécurité)
              finalData.reservation = data.trajets[0]._id;
            }
          }
        } catch (tripErr) {
          console.error("Erreur lors de la récupération du dernier trajet:", tripErr);
        }
      }

      const response = await litigeService.creerLitige(finalData);

      if (response.data.succes) {
        setShowSuccessModal(true);
        setFormData({ subject: '', description: '', attachDetails: false });
        setUploadedFiles([]);
        toast.success(t('support.send_success'));
      } else {
        throw new Error(response.data.message || "Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("Erreur support:", error);
      toast.error(error.message || 'Une erreur est survenue. Veuillez réessayer.');
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
                  {t('support.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('support.subtitle')}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                    <Headphones className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{t('support.support_247')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('support.response_time')}</p>
                  </div>
                </div>
                <Badge variant="success" size="lg">
                  <span className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {t('support.online_status')}
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
              <CardTitle>{t('support.faq_title')}</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {t('support.faq_subtitle')}
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
                            {t('support.view_more')}
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
                {t('support.view_all_faq')}
              </Button>
            </CardFooter>
          </Card>
        )}

        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire de contact */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.contact_title')}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {t('support.contact_subtitle')}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      {t('support.subject_label')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
                      required
                    >
                      <option value="">{t('support.subject_placeholder')}</option>
                      <option value="trip_problem">{t('support.subjects.trip_problem')}</option>
                      <option value="payment_problem">{t('support.subjects.payment_problem')}</option>
                      <option value="driver_problem">{t('support.subjects.driver_problem')}</option>
                      <option value="account_question">{t('support.subjects.account_question')}</option>
                      <option value="suggestion">{t('support.subjects.suggestion')}</option>
                      <option value="other">{t('support.subjects.other')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      {t('support.description_label')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
                      placeholder={t('support.description_placeholder')}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      {t('support.attachments_label')}
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
                        <p className="text-gray-600 dark:text-gray-400">{t('support.upload_drop_msg')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">{t('support.upload_click_msg')}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{t('support.upload_extra_msg')}</p>
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
                        {t('support.attach_last_trip')}
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
                    {t('support.send_btn')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Canaux de contact */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.other_channels')}</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {t('support.other_channels_subtitle')}
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
                  <CardTitle>{t('support.documentation')}</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {t('support.documentation_subtitle')}
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
            {t('support.success_title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('support.success_msg')}
          </p>
          <div className="space-y-4">

            <Button
              variant="primary"
              fullWidth
              onClick={() => setShowSuccessModal(false)}
            >
              {t('support.ok_btn')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Support;