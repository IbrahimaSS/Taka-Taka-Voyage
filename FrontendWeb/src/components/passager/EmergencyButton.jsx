import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Shield, Users, AlertTriangle, X, Heart, MapPin, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { GeolocationService } from '../../services/geolocation';

// Composants réutilisables
import Button from '../admin/ui/Bttn';
import Modal from '../admin/ui/Modal';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import Badge from '../admin/ui/Badge';
import ConfirmModal from '../admin/ui/ConfirmModal';

const EmergencyButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');

  const contacts = [
    {
      id: 1,
      name: 'Centre de sécurité TakaTaka',
      number: '+224 623 09 07 41',
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
      toast.success('Position récupérée avec succès');
      return location;
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      setLocationStatus('error');
      toast.error('Impossible de récupérer la position');
      return null;
    }
  };

  const handleEmergencyCall = async () => {
    setIsSendingAlert(true);

    try {
      // Récupérer la position actuelle
      if (!lastLocation) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        getCurrentLocation();
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

      // Notification aux autorités simulée
      setTimeout(() => {
        toast('Les autorités ont été alertées. Restez calme.', {
          icon: '👮',
        });
      }, 3000);

      // Envoyer la position aux contacts d'urgence
      if (lastLocation) {
        console.log('Position envoyée aux secours:', lastLocation);
      }

      setShowConfirm(false);
      setShowModal(false);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du signal d\'urgence');
    } finally {
      setIsSendingAlert(false);
    }
  };

  const handleQuickCall = (contact) => {
    // Simuler l'appel
    console.log(`Appel vers ${contact.name}: ${contact.number}`);
    toast(`Appel vers ${contact.name} en cours...`, {
      icon: '📞',
      duration: 2000
    });
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
        className="fixed bottom-8 right-8 z-40"
      >
        <Button
          variant="danger"
          size="large"
          className="!rounded-full !w-16 !h-16 !p-0 shadow-2xl hover:shadow-3xl relative"
          onClick={() => setShowModal(true)}
          icon={Phone}
        >
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center animate-ping">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
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

          {/* Contacts d'urgence */}
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
                        className={`!px-4 !py-2 ${contact.bgColor} ${contact.color} hover:bg-opacity-30 border-none`}
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