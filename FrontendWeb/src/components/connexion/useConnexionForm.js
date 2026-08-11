import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

// Extrait de pages/Connexion.jsx (decomposition) : tout le state et la
// logique metier du formulaire de connexion (validation, 2FA/OTP, social
// login, "se souvenir de moi"). Aucun changement de comportement par
// rapport a l'original.
export const useConnexionForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  // 2FA states
  const [requires2FA, setRequires2FA] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [deviceId, setDeviceId] = useState(localStorage.getItem('takataka_deviceId') || '');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login: authLogin } = useAuth();
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  const navigate = useNavigate();

  useEffect(() => {
    const rememberedLogin = localStorage.getItem('rememberLogin');
    const savedPhone = localStorage.getItem('userPhone');

    if (rememberedLogin === 'true') {
      setRememberMe(true);
      if (savedPhone) {
        setFormData(prev => ({ ...prev, phone: savedPhone }));
      }
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const showToast = (title, message, type = 'info') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 5000);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error === 'auth_failed') {
      showToast('Échec de connexion', 'L’authentification avec votre réseau social a échoué.', 'error');
    } else if (error === 'server_error') {
      showToast('Erreur serveur', 'Une erreur technique est survenue sur le serveur.', 'error');
    }
    // Nettoyer l'URL
    if (error) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.phone.trim()) {
      errors.phone = 'Ce champ est requis';
    } else {
      const phoneRegex = /^(\d{9}|\d{3} \d{3} \d{3})$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!phoneRegex.test(formData.phone.replace(/\s/g, '')) && !emailRegex.test(formData.phone)) {
        errors.phone = 'Format invalide. Utilisez 9 chiffres ou une adresse email valide';
      }
    }

    if (!formData.password) {
      errors.password = 'Ce champ est requis';
    } else if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!requires2FA && !validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await authLogin({
        identifiant: formData.phone,
        motDePasse: formData.password,
        deviceId: deviceId,
        otpCode: requires2FA ? otpCode.join('') : undefined
      });

      if (response && response.requires2FA) {
        setRequires2FA(true);
        if (response.deviceId) setDeviceId(response.deviceId);
        if (response.telephoneMasked) setMaskedPhone(response.telephoneMasked);
        if (response.emailMasked) setMaskedEmail(response.emailMasked);
        if (!requires2FA) {
          setResendCooldown(60);
        }
        showToast('Vérification requise', response.message || 'Veuillez entrer le code OTP reçu.', 'info');
        return;
      }

      if (response && response.succes) {
        setLoginSuccess(true);
        if (response.deviceId) {
          localStorage.setItem('takataka_deviceId', response.deviceId);
        }

        if (rememberMe) {
          localStorage.setItem('rememberLogin', 'true');
          localStorage.setItem('userPhone', formData.phone);
        } else {
          localStorage.removeItem('rememberLogin');
          localStorage.removeItem('userPhone');
        }

        const statut = response.statut;
        if (statut === 'EN_ATTENTE') {
          showToast('Compte en attente', 'Votre dossier est en cours de validation.', 'info');
          setTimeout(() => navigate('/validation-en-attente'), 1500);
          return;
        }

        showToast('Connexion réussie', 'Redirection vers votre espace...', 'success');

        const user = response.utilisateur || response.user;
        setTimeout(() => {
          if (user?.role === 'ADMIN') navigate('/admin');
          else if (user?.role === 'CHAUFFEUR' || user?.role === 'DRIVER') navigate('/chauffeur');
          else if (user?.role === 'PASSAGER' || user?.role === 'PASSENGER') navigate('/passager');
          else navigate('/');
        }, 1000);
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || 'Connexion impossible';
      if (error?.response?.data?.requires2FA) {
        setOtpCode(['', '', '', '', '', '']);
        showToast('Code invalide', errMsg, 'error');
        setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
      } else {
        showToast('Erreur de connexion', errMsg, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleResendOtp = async () => {
    setOtpCode(['', '', '', '', '', '']);
    setResendCooldown(60);
    setIsLoading(true);
    try {
      const response = await authLogin({
        identifiant: formData.phone,
        motDePasse: formData.password,
        deviceId: deviceId,
      });
      if (response && response.requires2FA) {
        if (response.deviceId) setDeviceId(response.deviceId);
        if (response.telephoneMasked) setMaskedPhone(response.telephoneMasked);
        if (response.emailMasked) setMaskedEmail(response.emailMasked);
        showToast('Code renvoyé', 'Un nouveau code vous a été envoyé.', 'success');
      }
    } catch (err) {
      showToast('Erreur', err?.response?.data?.message || 'Impossible de renvoyer le code.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setRequires2FA(false);
    setOtpCode(['', '', '', '', '', '']);
    setResendCooldown(0);
  };

  const handleSocialLogin = (provider) => {
    const baseURL = authService.getBaseURL();
    window.location.href = `${baseURL}/auth/${provider.toLowerCase()}`;
  };

  return {
    showPassword, setShowPassword,
    rememberMe, setRememberMe,
    isLoading, loginSuccess,
    formData, validationErrors,
    requires2FA, otpCode, maskedPhone, maskedEmail, resendCooldown,
    toast, setToast, showToast,
    navigate,
    handleInputChange, handleSubmit, handleOtpChange, handleOtpKeyDown,
    handleResendOtp, handleBackToLogin, handleSocialLogin,
  };
};
