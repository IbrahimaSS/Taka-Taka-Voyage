import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Headphones,
  MapPin,
  Mail,
  Phone,
  Send,
  ExternalLink,
  Apple,
  Download,
  Play,
  Loader2,
  CheckCircle
} from 'lucide-react';
import Button from '../../ui/Buttons';
import Card from '../../ui/Card';
import { apiClient } from '../../services/apiClient';

const ContactSection = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [adminReply, setAdminReply] = useState(null);
  const [sentMessageId, setSentMessageId] = useState(null);
  const [contactSettings, setContactSettings] = useState({
    phone: '+224 123 45 67 89',
    email: 'support@takataka.gn',
    address: 'Rue du Commerce, Kaloum, Conakry, Guinée'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const fetchContactSettings = async () => {
      try {
        const { data } = await apiClient.get('/common/contact/settings');
        if (data.succes) {
          setContactSettings(data.settings);
        }
      } catch (err) {
        console.error("Erreur chargement settings contact:", err);
      }
    };
    fetchContactSettings();
  }, []);

  useEffect(() => {
    let socket;
    if (showSuccessModal && sentMessageId) {
      // Connexion socket temporaire pour écouter la réponse
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
      socket = io(SOCKET_URL, {
        path: "/socket.io/",
        transports: ["websocket", "polling"],
      });

      socket.on(`contact:reply:${sentMessageId}`, (data) => {
        setAdminReply(data.reply);
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [showSuccessModal, sentMessageId]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAdminReply(null); // Reset
    try {
      const { data } = await apiClient.post('/common/contact', formData);
      if (data.succes) {
        setShowSuccessModal(true);
        setSentMessageId(data.messageId);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      alert('❌ Une erreur est survenue. Veuillez réessayer.');
      console.error("Erreur envoi contact:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
      data-aos="fade-up"
    >
      <div className="container mx-auto">
        {/* Titre */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Contactez-<span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start">nous</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            Vous avez des questions ? Notre équipe est là pour vous aider.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-12">
          {/* Formulaire de contact */}
          <div
            className="lg:w-1/2 mb-12 lg:mb-0"
            data-aos="fade-right"
          >
            <Card className="p-8">
              <form onSubmit={handleContactSubmit}>
                {/* Nom */}
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium" htmlFor="name">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryGreen-start/50 focus:border-transparent transition-all"
                    placeholder="Votre nom"
                    required
                  />
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium" htmlFor="email">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryGreen-start/50 focus:border-transparent transition-all"
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                {/* Sujet */}
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium" htmlFor="subject">
                    Sujet
                  </label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryGreen-start/50 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="support">Support technique</option>
                    <option value="driver">Devenir chauffeur</option>
                    <option value="partner">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                {/* Message */}
                <div className="mb-8">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryGreen-start/50 focus:border-transparent transition-all resize-none"
                    placeholder="Votre message..."
                    required
                  ></textarea>
                </div>

                {/* Bouton Submit */}
                <Button
                  type="submit"
                  variant="gradientMix"
                  size="lg"
                  fullWidth
                  disabled={loading}
                  icon={loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Informations de contact */}
          <div
            className="lg:w-1/2"
            data-aos="fade-left"
            data-aos-delay="100"
          >
            <div className="space-y-8">
              {/* Support Client */}
              <Card hover={true}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primaryGreen-start/20 to-primaryBlue-start/20 flex items-center justify-center flex-shrink-0">
                    <Headphones
                      size={24}
                      className="text-gray-600 dark:text-gray-400"
                    />

                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Support Client</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Notre équipe est disponible 24h/24 et 7j/7 pour répondre à vos questions.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone size={18} className="text-primaryGreen-start" />
                        <span className="text-primaryGreen-start font-bold">{contactSettings.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={18} className="text-primaryBlue-start" />
                        <span className="text-primaryBlue-start font-bold">{contactSettings.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Adresse */}
              <Card hover={true}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primaryBlue-start/20 to-primaryGreen-start/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-gray-600 dark:text-gray-400" size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Notre Siège en Guinée</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {contactSettings.address}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<ExternalLink size={16} />}
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactSettings.address)}`, '_blank')}
                    >
                      Voir sur la carte
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Téléchargement App */}
              <div
                id="telecharger"
                className="bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start p-8 rounded-3xl text-white shadow-2xl"
                data-aos="zoom-in"
                data-aos-delay="200"
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Téléchargez l'application Taka Taka</h3>
                  <p className="opacity-90">
                    Disponible sur iOS et Android. Commencez à voyager dès aujourd'hui !
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {/* App Store */}
                  <Button
                    variant="green"
                    size="lg"
                    className="bg-black/20 hover:bg-black/30 backdrop-blur-sm border border-white/20"
                    icon={<Apple size={24} />}
                    iconPosition="left"
                    fullWidth={true}
                  >
                    <div className="text-left">
                      <div className="text-xs opacity-80">Télécharger sur</div>
                      <div className="text-lg font-bold">App Store</div>
                    </div>
                  </Button>

                  {/* Google Play */}
                  <Button
                    variant="ghost"
                    size="lg"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
                    icon={<Play size={24} />}
                    iconPosition="left"
                    fullWidth={true}
                  >
                    <div className="text-left">
                      <div className="text-xs opacity-80">Disponible sur</div>
                      <div className="text-lg font-bold">Google Play</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modale de succès personnalisée */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full transform transition-all">
            <div className="flex flex-col items-center text-center">

              {!adminReply ? (
                <>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message envoyé !</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Votre message a été transmis avec succès. Notre équipe vous répondra par email ou directement ici. Restez sur cette page si vous attendez une réponse rapide !
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">L'équipe vous a répondu !</h3>
                  <div className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 mb-6 font-medium text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {adminReply}
                  </div>
                </>
              )}

              <Button
                variant="gradientMix"
                fullWidth
                onClick={() => {
                  setShowSuccessModal(false);
                  setAdminReply(null);
                  setSentMessageId(null);
                }}
              >
                C'est compris
              </Button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default ContactSection;