import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { chauffeurService } from '../../services/chauffeurService';

// Extrait de pages/Inscription.jsx (affinement) : tout le state et la
// logique du flux d'inscription multi-etapes (type de compte, informations
// personnelles, verification OTP, documents chauffeur). Aucun changement de
// comportement par rapport a l'original, hormis le fix deja applique sur
// autoVerifyOtp (regex d'espaces).
export const useInscriptionFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showStepModal, setShowStepModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
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
    setTimeout(() => setToast(t => ({ ...t, show: false })), 5000);
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

    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

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

  const handleTermsChange = (checked) => {
    setFormData(prev => ({ ...prev, termsAccepted: checked }));
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

    if (currentStep === 1 && userType) {
      setShowStepModal(true);
      return;
    }

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
      await authService.verifyOtp({ telephone: formData.phone.replace(/\s/g, ''), code: otp });
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

        if (loginRes.data?.utilisateur) {
          localStorage.setItem('pendingDriver', JSON.stringify(loginRes.data.utilisateur));
          localStorage.setItem('utilisateur', JSON.stringify(loginRes.data.utilisateur));
        }

        setCurrentStep(4);
        showToast('Informations sauvegardées', 'Passez maintenant aux documents du chauffeur', 'success');
      } else {
        showToast('Compte créé !', 'Votre compte passager a été créé avec succès', 'success');
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

  return {
    currentStep, setCurrentStep,
    userType,
    formData,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    passwordStrength,
    otpTimer,
    isSubmitting,
    activeOtpIndex, setActiveOtpIndex,
    validationErrors,
    showStepModal, setShowStepModal,
    showTermsModal, setShowTermsModal,
    toast, setToast,
    handleUserTypeSelect, handleInputChange, handleOtpChange, handleOtpKeyDown, handleTermsChange,
    handleNextStep, handlePrevStep, resendOtp, handleSubmit, handleDriverFinalSubmit,
    getProgressPercentage, isPasswordMatch, getStepModalContent,
  };
};
