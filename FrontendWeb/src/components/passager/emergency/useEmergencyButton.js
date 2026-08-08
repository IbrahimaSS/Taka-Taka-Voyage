import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Shield, Users, Heart } from 'lucide-react';
import { GeolocationService } from '../../../services/geolocation';
import { API_ROUTES } from '../../../services/apiRoutes';
import { getApiBaseURL } from '../../../utils/urlHelper';

// URL d'une sonnerie réaliste (tonalité d'appel)
const RINGTONE_URL = "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3";

const CONTACTS = [
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

export const useEmergencyButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);

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

  const getCurrentLocation = async () => {
    try {
      const position = await GeolocationService.getCurrentPosition();
      const location = {
        ...position,
        timestamp: new Date().toISOString()
      };
      setLastLocation(location);
      return location;
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
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

  return {
    contacts: CONTACTS,
    showModal,
    setShowModal,
    showConfirm,
    setShowConfirm,
    isSendingAlert,
    lastLocation,
    isCalling,
    callingService,
    isLogging,
    handleEmergencyCall,
    handleQuickCall,
    stopCall,
  };
};
