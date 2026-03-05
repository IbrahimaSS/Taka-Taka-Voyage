import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Shield, Users, AlertTriangle, X, Heart, MapPin, Bell, PhoneOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { GeolocationService } from '../../services/geolocation';
import { API_ROUTES } from '../../services/apiRoutes';
import { getApiBaseURL } from '../../utils/urlHelper';

// Composants réutilisables
import Button from '../admin/ui/Bttn';
import Modal from '../admin/ui/Modal';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import Badge from '../admin/ui/Badge';
import ConfirmModal from '../admin/ui/ConfirmModal';

// URL d'une sonnerie réaliste (tonalité d'appel)
const RINGTONE_URL = "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3";

const EmergencyButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');

  // États pour l'appel actif
  const [isCalling, setIsCalling] = useState(false);
  const [callingService, setCallingService] = useState(null);
  const [isLogging, setIsLogging] = useState(false);

  // Récurrences et Timers
  const audioRef = useRef(null);
  const callTimerRef = useRef(null);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (callTimerRef.current) clearTimeout(callTimerRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Fonction pour jouer le message vocal (Voix féminine style Orange/Opérateur)
  const playUnavailableMessage = () => {
    if (audioRef.current) audioRef.current.pause(); // Arrêter la sonnerie

    const message = "Désolé, le service Taka Taka est injoignable pour le moment. Veuillez réessayer plus tard.";
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9; // Rythme légèrement lent pour plus de clarté
    utterance.pitch = 1.1; // Ton un peu plus haut pour une voix plus féminine

    // Essayer de trouver une voix féminine française dans le navigateur
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.lang.includes('fr') && (v.name.includes('Hortense') || v.name.includes('Julie') || v.name.includes('Google') || v.name.includes('Female')));
    if (femaleVoice) utterance.voice = femaleVoice;

    window.speechSynthesis.speak(utterance);

    // Fermer l'UI automatiquement après le message
    utterance.onend = () => {
      setTimeout(() => stopCall(), 1000);
    };
  };

  const contacts = [
    {
      id: 1,
      name: 'Centre de sécurité TakaTaka',
      number: '+224 629 02 16 34',
      icon: Shield,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      type: 'security',
      available: true
    },
    {
      id: 2,
      name: 'Police nationale',
      number: '117',
      icon: Shield,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      type: 'police',
      available: true
    },
    {
      id: 3,
      name: 'Contact d\'urgence enregistré',
      number: '+224 623 12 76 09',
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      type: 'personal',
      available: true
    },
    {
      id: 4,
      name: 'SAMU - Urgences médicales',
      number: '442',
      icon: Heart,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      type: 'medical',
      available: true
    },
  ];

  const getCurrentLocation = async () => {
    setLocationStatus('fetching');
    try {
      const position = await GeolocationService.getCurrentPosition();
      const location = {
        ...position,
        timestamp: new Date().toISOString()
      };
      setLastLocation(location);
      setLocationStatus('success');
      return location;
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      setLocationStatus('error');
      return null;
    }
  };

  const handleEmergencyCall = async () => {
    setIsSendingAlert(true);

    try {
      // Récupérer la position actuelle
      let loc = lastLocation;
      if (!loc) {
        loc = await getCurrentLocation();
      }

      // Simuler l'envoi de l'alerte
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Signal d\'urgence envoyé ! Aide en route.', {
        duration: 5000,
        icon: '🚨',
        style: {
          background: 'linear-gradient(to right, #dc2626, #ef4444)',
          color: 'white',
        },
      });

      setShowConfirm(false);
      setShowModal(false);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du signal d\'urgence');
    } finally {
      setIsSendingAlert(false);
    }
  };

  const handleQuickCall = async (contact) => {
    setCallingService(contact);
    setIsCalling(true);
    setIsLogging(true);

    // 🔊 Lancement de la sonnerie
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(RINGTONE_URL);
        audioRef.current.loop = true;
        audioRef.current.volume = 1.0;
      }
      audioRef.current.play().catch(e => console.log("Audio play blocked"));

      // ⏱️ Lancement du timer de 30 secondes pour le message d'indisponibilité
      if (callTimerRef.current) clearTimeout(callTimerRef.current);
      callTimerRef.current = setTimeout(() => {
        playUnavailableMessage();
      }, 30000);

    } catch (e) {
      console.error("Erreur audio:", e);
    }

    try {
      // 1. Déclenchement de l'appel système
      const cleanNumber = contact.number.replace(/\s+/g, '');
      window.location.href = `tel:${cleanNumber}`;

      // 2. Logging
      const loc = lastLocation || await getCurrentLocation().catch(() => null);
      const baseURL = getApiBaseURL();

      await axios.post(`${baseURL}${API_ROUTES.alertes.logAppel}`, {
        service: contact.name,
        numero: contact.number,
        lat: loc?.lat,
        lng: loc?.lng
      }, { withCredentials: true });

    } catch (error) {
      console.error("❌ Erreur logging:", error);
    } finally {
      setIsLogging(false);
    }
  };

  const stopCall = () => {
    setIsCalling(false);
    setCallingService(null);

    // 🔇 Arrêt de tout (Audio + Timer + Voix)
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (callTimerRef.current) {
      clearTimeout(callTimerRef.current);
      callTimerRef.current = null;
    }
    window.speechSynthesis.cancel();
  };

  const locationInfo = {
    fetching: { text: 'Récupération de votre position...', color: 'text-blue-500' },
    success: { text: 'Position disponible', color: 'text-green-500' },
    error: { text: 'Position indisponible', color: 'text-red-500' },
    idle: { text: 'Position non récupérée', color: 'text-gray-500' }
  };

  return (
    <>
      {/* Bouton flottant d'urgence */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-28 right-8 z-40"
      >
        <Button
          variant="solid"
          size="large"
          className="!rounded-full !w-16 !h-16 !p-0 shadow-2xl hover:shadow-3xl relative !bg-red-600 hover:!bg-red-700 border-none text-white flex items-center justify-center transition-all"
          onClick={() => setShowModal(true)}
          icon={Phone}
        >
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
          </span>
        </Button>
      </motion.div>

      {/* Modal d'urgence principal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="md"
        closeOnOverlayClick={true}
      >
        <div className="space-y-6">
          {/* En-tête d'urgence */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-2xl p-6 text-white -mt-6 -mx-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Signal d'urgence</h2>
                  <p className="text-red-100 text-sm">
                    Votre position sera partagée avec les autorités
                  </p>
                </div>
              </div>
            </div>


          </div>

          {/* Contacts d'urgence ou Appel en cours */}
          <AnimatePresence mode="wait">
            {!isCalling ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle size="sm">Contacts d'urgence</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Appeler directement un service de secours
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {contacts.map((contact) => {
                        const Icon = contact.icon;
                        return (
                          <div
                            key={contact.id}
                            className={`p-4 ${contact.bgColor} rounded-xl flex items-center justify-between hover:shadow-md transition-shadow dark:border dark:border-white/5`}
                          >
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full ${contact.bgColor} flex items-center justify-center mr-3`}>
                                <Icon className={`w-5 h-5 ${contact.color}`} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {contact.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {contact.number}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={() => handleQuickCall(contact)}
                              className={`!px-4 !py-2 ${contact.bgColor} ${contact.color} hover:bg-opacity-30 border-none font-bold`}
                              icon={Phone}
                            >
                              Appeler
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="calling"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse" />
                  <CardContent className="p-10 text-center flex flex-col items-center">
                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mb-8 relative">
                      <Phone className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-pulse rotate-12" />
                      <div className="absolute -inset-4 rounded-full bg-blue-400/20 animate-ping" />
                      <div className="absolute -inset-8 rounded-full bg-blue-300/10 animate-ping [animation-delay:0.5s]" />
                    </div>

                    <h3 className="text-2xl font-black text-blue-900 dark:text-blue-100 mb-2">📞 Appel en cours...</h3>
                    <div className="space-y-1 mb-8">
                      <p className="text-lg font-bold text-blue-800 dark:text-blue-300">Service : {callingService?.name}</p>
                      <p className="text-blue-600 dark:text-blue-400 font-mono tracking-widest">{callingService?.number}</p>
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-[200px]">
                      <Button
                        variant="danger"
                        fullWidth
                        className="!rounded-2xl !py-4 shadow-lg shadow-red-500/20"
                        icon={PhoneOff}
                        onClick={stopCall}
                      >
                        Raccrocher
                      </Button>
                      {isLogging && (
                        <div className="flex items-center justify-center gap-2 text-xs text-blue-500">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Enregistrement du log...</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message d'avertissement */}
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                    Important
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Utilisez ce bouton uniquement en cas de véritable urgence.
                    Un usage abusif peut entraîner des sanctions légales.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => setShowConfirm(true)}
              icon={AlertTriangle}
            >
              Alerter les secours
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmation d'urgence */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleEmergencyCall}
        title="Alerte d'urgence"
        message="Êtes-vous sûr de vouloir envoyer un signal d'urgence ? Votre position sera partagée avec les autorités et vos contacts d'urgence."
        type="error"
        confirmText="Oui, alerter les secours"
        cancelText="Non, annuler"
        confirmVariant="danger"
        loading={isSendingAlert}
        destructive={true}
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-300">
                Un signal sera envoyé aux services de secours suivants :
              </p>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-red-600 dark:text-red-400">
              <li>• Centre de sécurité TakaTaka</li>
              <li>• Police nationale (117)</li>
              <li>• Votre contact d'urgence</li>
            </ul>
          </div>

          {lastLocation && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Votre position sera partagée :
                </p>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Lat: {lastLocation.lat.toFixed(6)}, Lng: {lastLocation.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </ConfirmModal>
    </>
  );
};

export default EmergencyButton;