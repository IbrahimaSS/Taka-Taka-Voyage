import React, { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/admin/ui/Bttn';
import Modal from '../components/admin/ui/Modal';
import ConfirmModal from '../components/admin/ui/ConfirmModal';
import Toast from '../components/admin/ui/Toast';
import { authService } from '../services/authService';
import { chauffeurService } from '../services/chauffeurService';
import { useSettings } from '../context/SettingsContext';
import InscriptionChauffeur from '../components/inscription/InscriptionChauffeur';
import InscriptionSidebar from '../components/inscription/InscriptionSidebar';
import StepUserType from '../components/inscription/StepUserType';
import StepPersonalInfo from '../components/inscription/StepPersonalInfo';
import StepOtpVerification from '../components/inscription/StepOtpVerification';

const Inscription = () => {
  const { settings } = useSettings();
  const platform = settings?.platform || {};
  const [currentStep, setCurrentStep] = useState(1);  // pour  
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    genre: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ['', '', '', '', '', ''],
    termsAccepted: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: '#6b7280'
  });
  const [otpTimer, setOtpTimer] = useState(60);
  const [generatedOtp, setGeneratedOtp] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showStepModal, setShowStepModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    let interval;
    if (currentStep === 3 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, otpTimer]);

  const showToast = (title, message, type = 'info') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 5000);
  };

  const buildInscriptionPayload = () => ({
    nom: formData.lastName,
    prenom: formData.firstName,
    telephone: formData.phone.replace(/\s/g, ''),
    genre: formData.genre,
    email: formData.email,
    motDePasse: formData.password,
    typeProfil: userType === 'driver' ? 'CHAUFFEUR' : 'PASSAGER',
  });

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    showToast('Type de compte sélectionné',
      type === 'passenger'
        ? 'Vous avez choisi le compte Passager'
        : 'Vous avez choisi le compte Chauffeur',
      'success');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Calcul de la force du mot de passe
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData(prev => ({ ...prev, otp: newOtp }));
    setOtpVerified(false);

    if (value && index < 5) {
      setActiveOtpIndex(index + 1);
    }

    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      autoVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      setActiveOtpIndex(index - 1);
    }
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    let message = '';
    let color = '#6b7280';

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 0:
        message = 'Très faible';
        color = '#ef4444';
        break;
      case 1:
        message = 'Faible';
        color = '#f97316';
        break;
      case 2:
        message = 'Moyen';
        color = '#eab308';
        break;
      case 3:
        message = 'Bon';
        color = '#22c55e';
        break;
      case 4:
        message = 'Très bon';
        color = '#0d8c6f';
        break;
    }

    setPasswordStrength({ score, message, color });
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!userType) {
        errors.userType = 'Veuillez sélectionner un type de compte';
      }
    }

    if (step === 2) {
      const { firstName, lastName, phone, genre, email, password, confirmPassword } = formData;

      if (!firstName.trim()) {
        errors.firstName = 'Le prénom est requis';
      } else if (firstName.length < 2) {
        errors.firstName = 'Le prénom doit contenir au moins 2 caractères';
      }

      if (!lastName.trim()) {
        errors.lastName = 'Le nom est requis';
      } else if (lastName.length < 2) {
        errors.lastName = 'Le nom doit contenir au moins 2 caractères';
      }

      if (!phone.trim()) {
        errors.phone = 'Le numéro de téléphone est requis';
      } else if (!/^\d{9}$/.test(phone.replace(/\s/g, ''))) {
        errors.phone = 'Numéro de téléphone invalide (9 chiffres requis)';
      }

      if (!genre.trim()) {
        errors.genre = 'Le genre est requis';
      } else if (genre.trim() !== 'MASCULIN' && genre.trim() !== 'FEMININ') {
        errors.genre = 'Genre invalide';
      }

      if (!email.trim()) {
        errors.email = "L'email est requis";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.email = "L'email est invalide";
        }
      }

      if (!password) {
        errors.password = 'Le mot de passe est requis';
      } else if (password.length < 8) {
        errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      }

      if (!confirmPassword) {
        errors.confirmPassword = 'La confirmation du mot de passe est requise';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    if (step === 3) {
      if (!formData.termsAccepted) {
        errors.termsAccepted = "Vous devez accepter les conditions d'utilisation";
      }

      const otpValue = formData.otp.join('');
      if (otpValue.length !== 6) {
        errors.otp = 'Le code de vérification doit contenir 6 chiffres';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = async () => {
    if (!validateStep(currentStep)) {
      showToast('Validation échouée', 'Veuillez vérifier les champs du formulaire', 'error');
      return;
    }

    // Show modal for step transition
    if (currentStep === 1 && userType) {
      setShowStepModal(true);
      return;
    }

    // Lors du passage à l'OTP, initier l'inscription côté backend
    if (currentStep === 2) {
      setIsSubmitting(true);
      try {
        await authService.initInscription(buildInscriptionPayload());
        showToast('Code envoyé', 'Un code OTP a été envoyé à votre numéro', 'success');
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        const apiMessage = error?.response?.data?.message;
        const apiError = error?.response?.data?.erreurs?.[0]?.msg;
        showToast(
          'Erreur inscription',
          apiMessage || apiError || 'Impossible d\'initier l\'inscription',
          'error'
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const resendOtp = async () => {
    if (otpTimer > 0) {
      showToast('Temps d\'attente', `Veuillez attendre ${otpTimer} secondes`, 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.initInscription(buildInscriptionPayload());
      setOtpTimer(60);
      setOtpVerified(false);
      showToast('Code renvoyé', 'Un nouveau code a été envoyé à votre numéro', 'success');
      setFormData(prev => ({ ...prev, otp: ['', '', '', '', '', ''] }));
      setActiveOtpIndex(0);
    } catch (error) {
      setOtpVerified(false);
      showToast(
        'Erreur OTP',
        error?.response?.data?.message || 'Impossible de renvoyer le code',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const autoVerifyOtp = async (otp) => {
    try {
      await authService.verifyOtp({ telephone: formData.phone.replace(/\\s/g, ''), code: otp });
      setOtpVerified(true);
      showToast('Code correct', 'Vérification réussie !', 'success');
    } catch (error) {
      setOtpVerified(false);
      showToast(
        'Code invalide',
        error?.response?.data?.message || 'Le code OTP est incorrect',
        'error'
      );
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    setIsSubmitting(true);


    try {
      const otpValue = formData.otp.join('');
      if (!otpVerified) {
        await authService.verifyOtp({ telephone: formData.phone.replace(/\s/g, ''), code: otpValue });
        setOtpVerified(true);
      }

      await authService.finaliserInscription(buildInscriptionPayload());

      if (userType === 'driver') {
        const loginRes = await authService.login({
          identifiant: formData.phone.replace(/\s/g, ''),
          motDePasse: formData.password,
        });

        // Persister temporairement pour la page d'attente
        if (loginRes.data?.utilisateur) {
          localStorage.setItem('pendingDriver', JSON.stringify(loginRes.data.utilisateur));
          localStorage.setItem('utilisateur', JSON.stringify(loginRes.data.utilisateur));
        }

        setCurrentStep(4);
        showToast('Informations sauvegard�es', 'Passez maintenant aux documents du chauffeur', 'success');
      } else {
        showToast('Compte cr�� !', 'Votre compte passager a �t� cr�� avec succ�s', 'success');
        setTimeout(() => {
          navigate('/connexion');
        }, 2000);
      }
    } catch (error) {
      showToast(
        'Erreur inscription',
        error?.response?.data?.message || 'Impossible de finaliser l\'inscription',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDriverFinalSubmit = async (driverData) => {
    setIsSubmitting(true);

    try {
      try {
        await chauffeurService.updateVehicule({
          typeVehicule: driverData.vehicle.type,
          marque: driverData.vehicle.brand,
          modele: driverData.vehicle.model,
          plaque: driverData.vehicle.plate,
          couleur: driverData.vehicle.color,
          capacite: driverData.vehicle.capacity,
          annee: driverData.vehicle.year,
        });
      } catch (vehiculeError) {
        console.error("DEBUG: Erreur updateVehicule:", vehiculeError);
        throw new Error(vehiculeError?.response?.data?.message || "Erreur lors de la sauvegarde du véhicule");
      }

      const formDataDocs = new FormData();
      // Noms de champs alignés avec multer backend: photo, license, idCard, carRegistration, insurance
      if (driverData.photo) {
        formDataDocs.append('photo', driverData.photo);
      }
      if (driverData.license) {
        formDataDocs.append('license', driverData.license);
      }
      if (driverData.idCard) {
        formDataDocs.append('idCard', driverData.idCard);
      }
      if (driverData.carRegistration) {
        formDataDocs.append('carRegistration', driverData.carRegistration);
      }
      if (driverData.insurance) {
        formDataDocs.append('insurance', driverData.insurance);
      }

      try {
        await chauffeurService.uploadDocuments(formDataDocs);
      } catch (docError) {
        console.error("DEBUG: Erreur uploadDocuments:", docError);
        throw new Error(docError?.response?.data?.message || "Erreur lors de l'envoi des documents");
      }

      showToast('Inscription complète', 'Votre demande est en cours de validation', 'success');
      setTimeout(() => {
        navigate('/validation-en-attente');
      }, 1500);
    } catch (error) {
      console.error("DEBUG: Erreur de finalisation chauffeur:", error);
      showToast(
        'Erreur finalisation',
        error.message || 'Impossible de finaliser l\'inscription',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    const totalSteps = userType === 'driver' ? 4 : 3;
    return ((currentStep - 1) / (totalSteps - 1)) * 100;
  };

  const isPasswordMatch = () => {
    return formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;
  };

  const getStepModalContent = () => {
    if (currentStep === 1 && userType === 'passenger') {
      return {
        title: 'Étape suivante : Informations personnelles',
        content: 'Vous allez maintenant renseigner vos informations personnelles. Assurez-vous d\'avoir votre numéro de téléphone à portée de main.'
      };
    }
    if (currentStep === 1 && userType === 'driver') {
      return {
        title: 'Important pour les chauffeurs',
        content: 'En tant que chauffeur, vous devrez fournir des documents supplémentaires (permis, carte grise, assurance) et des informations sur votre véhicule.'
      };
    }
    return {
      title: 'Confirmer l\'étape',
      content: 'Êtes-vous prêt à passer à l\'étape suivante ?'
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 bg-gradient-to-br from-primary-50 to-secondary-100  dark:from-gray-800  dark:bg-slate-900">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Step Transition Modal */}
      <ConfirmModal
        isOpen={showStepModal}
        onClose={() => setShowStepModal(false)}
        onConfirm={() => {
          setCurrentStep(prev => prev + 1);
          setShowStepModal(false);
        }}
        title={getStepModalContent().title}
        message={getStepModalContent().content}
        type="info"
        confirmText="Continuer"
        cancelText="Revenir"
      />

      {/* Terms Modal */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Conditions d'utilisation"
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Mentions importantes</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              En créant un compte Taka Taka, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium text-gray-800 dark:text-gray-200">1. Utilisation du service</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Le service <span className="font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">{platform.name || 'Taka Taka'}</span> permet la mise en relation entre passagers et chauffeurs pour des trajets urbains.
            </p>

            <h5 className="font-medium text-gray-800 dark:text-gray-200">2. Données personnelles</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vos données sont collectées et traitées conformément à notre politique de confidentialité.
            </p>

            <h5 className="font-medium text-gray-800 dark:text-gray-200">3. Responsabilités</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Les utilisateurs sont responsables du respect des lois en vigueur lors de l'utilisation du service.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              onClick={() => setShowTermsModal(false)}
            >
              Compris
            </Button>
          </div>
        </div>
      </Modal>

      <div className="flex min-h-screen">
        <InscriptionSidebar currentStep={currentStep} userType={userType} platform={platform} />

        {/* Contenu principal */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-3xl">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-3 mb-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg">
                <Car className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold uppercase tracking-tight bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">{platform.name || 'TAKA TAKA'}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{platform.tagline || 'Mobilité Intelligente'}</p>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="mb-8">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-green-600 transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <h1 className={`text-2xl font-bold ${userType === 'passenger' ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'}`}>
                  {userType === 'passenger' ? 'Compte Passager' : ''}
                  {userType === 'driver' ? 'Compte Chauffeur' : ''}
                  {!userType && 'Création de compte'}
                </h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Étape {currentStep} sur {userType === 'driver' ? 4 : 3}
                </span>
              </div>
            </div>

            {/* Conteneur du formulaire   bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700  */}
            <div className=" p-6 md:p-8  ">
              <AnimatePresence mode="wait">
                {/* Étape 1: Type de compte */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="animate-fade-in"
                  >
                    <StepUserType
                      userType={userType}
                      onSelect={handleUserTypeSelect}
                      error={validationErrors.userType}
                      onNext={handleNextStep}
                      showToast={showToast}
                    />
                  </motion.div>
                )}

                {/* Étape 2: Informations */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="animate-fade-in"
                  >
                    <StepPersonalInfo
                      formData={formData}
                      onChange={handleInputChange}
                      errors={validationErrors}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      showConfirmPassword={showConfirmPassword}
                      setShowConfirmPassword={setShowConfirmPassword}
                      passwordStrength={passwordStrength}
                      isPasswordMatch={isPasswordMatch}
                      onNext={handleNextStep}
                      onPrev={handlePrevStep}
                      isSubmitting={isSubmitting}
                    />
                  </motion.div>
                )}

                {/* Étape 3: Vérification */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="animate-fade-in"
                  >
                    <StepOtpVerification
                      formData={formData}
                      otpTimer={otpTimer}
                      activeOtpIndex={activeOtpIndex}
                      setActiveOtpIndex={setActiveOtpIndex}
                      onOtpChange={handleOtpChange}
                      onOtpKeyDown={handleOtpKeyDown}
                      errors={validationErrors}
                      onResendOtp={resendOtp}
                      onTermsChange={(checked) => setFormData(prev => ({ ...prev, termsAccepted: checked }))}
                      onShowTerms={() => setShowTermsModal(true)}
                      platform={platform}
                      onPrev={handlePrevStep}
                      onSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                    />
                  </motion.div>
                )}

                {/* Étape 4: Documents et véhicule (uniquement pour chauffeurs) */}
                {currentStep === 4 && userType === 'driver' && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <InscriptionChauffeur
                      onBack={() => setCurrentStep(3)}
                      onSubmit={handleDriverFinalSubmit}
                      formData={formData}
                      showToast={showToast}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Liens */}
            <div className="text-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                Vous avez déjà un compte <span className="font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">{platform.name || 'Taka Taka'}</span> ?{' '}
                <a href="/connexion" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold ml-2 hover:underline">
                  Se connecter
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscription;





















