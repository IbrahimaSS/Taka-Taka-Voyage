import React, { useState, useEffect } from 'react';
import {
  Car,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
  Check,
  Loader2,
  Users,
  Star,
  Shield,
  Clock,
  Info,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import Button from '../components/admin/ui/Bttn';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/admin/ui/Modal';
import Toast from '../components/admin/ui/Toast';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const Connexion = () => {
  const { settings } = useSettings();
  const platform = settings?.platform || {};

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

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
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Phone/Email validation
    if (!formData.phone.trim()) {
      errors.phone = 'Ce champ est requis';
    } else {
      const phoneRegex = /^(\d{9}|\d{3} \d{3} \d{3})$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!phoneRegex.test(formData.phone.replace(/\s/g, '')) && !emailRegex.test(formData.phone)) {
        errors.phone = 'Format invalide. Utilisez 9 chiffres ou une adresse email valide';
      }
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Ce champ est requis';
    } else if (formData.password.length < 6) {
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

      // Gestion spécifique au 2FA
      if (response && response.requires2FA) {
        setRequires2FA(true);
        if (response.deviceId) setDeviceId(response.deviceId);
        if (response.telephoneMasked) setMaskedPhone(response.telephoneMasked);
        if (response.emailMasked) setMaskedEmail(response.emailMasked);
        if (!requires2FA) {
          // Premier déclenchement 2FA → démarrer le cooldown
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
        // OTP invalide ou expiré, rester sur l'écran OTP
        setOtpCode(['', '', '', '', '', '']);
        showToast('Code invalide', errMsg, 'error');
        // Focus le premier input OTP
        setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
      } else {
        showToast('Erreur de connexion', errMsg, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1); // Only 1 digit
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto focus next input
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

  const handleSocialLogin = (provider) => {
    const baseURL = authService.getBaseURL(); // On récupère l'URL du backend via le service original
    window.location.href = `${baseURL}/auth/${provider.toLowerCase()}`;
  };

  const stats = [
    { value: '50K+', label: 'Utilisateurs actifs', icon: Users, color: 'text-blue-400' },
    { value: '4.8★', label: 'Satisfaction', icon: Star, color: 'text-green-400' },
    { value: '98%', label: 'Taux de réussite', icon: Shield, color: 'text-blue-500' },
    { value: '24/7', label: 'Support', icon: Clock, color: 'text-green-500' }
  ];

  const getButtonIcon = () => {
    if (isLoading) {
      return <Loader2 className="animate-spin" size={20} />;
    }
    if (loginSuccess) {
      return <Check size={20} />;
    }
    return <LogIn size={20} />;
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

      {/* Information Modal */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Information importante"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
            <p className="text-gray-700 dark:text-gray-300">
              La connexion avec les réseaux sociaux n'est pas encore disponible.
              Cette fonctionnalité sera bientôt implémentée.
            </p>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowInfoModal(false)}
            >
              Compris
            </Button>
          </div>
        </div>
      </Modal>

      {/* Validation Modal */}
      <Modal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="Erreurs de validation"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Veuillez corriger les erreurs suivantes :
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                {validationErrors.phone && <li>{validationErrors.phone}</li>}
                {validationErrors.password && <li>{validationErrors.password}</li>}
              </ul>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="primary"
              onClick={() => setShowValidationModal(false)}
            >
              Corriger
            </Button>
          </div>
        </div>
      </Modal>

      <div className="flex min-h-screen">
        {/* Left Panel: Brand & Information */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-green-900">
            <div className="absolute w-64 h-64 bg-white/5 rounded-full -top-32 -left-32 animate-pulse"></div>
            <div className="absolute w-96 h-96 bg-green-500/10 rounded-full -bottom-48 -right-48 animate-ping-slow"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 p-12 flex flex-col justify-between text-white w-full">
            {/* Logo & Brand */}
            <div>
              <div className="flex items-start justify-between mb-12">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20 overflow-hidden">
                    {platform.logo ? (
                      <img src={platform.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Car className="text-white" size={32} />
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold uppercase tracking-tight bg-gradient-to-r from-emerald-500 to-blue-200 bg-clip-text text-transparent">{platform.name || 'TAKA TAKA'}</h1>
                    <p className="text-blue-100 text-lg">{platform.tagline || 'Mobilité Intelligente'}</p>
                  </div>
                </div>

                {/* Back to Home */}
                <a
                  href="/"
                  className="inline-flex items-center text-blue-100 hover:text-white text-sm transition-colors group bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/10"
                >
                  <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={16} />
                  Retour à l'accueil
                </a>
              </div>

              {/* Welcome Message */}
              <div className="mb-12 max-w-lg">
                <h2 className="text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Bienvenue !
                </h2>
                <p className="text-blue-100/90 text-lg leading-relaxed">
                  Connectez-vous pour accéder à vos trajets, suivre vos courses et profiter de nos services
                  exclusifs de mobilité urbaine en toute sécurité.
                </p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-6 mb-12">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-white/10"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg bg-white/10 ${stat.color}`}>
                        <stat.icon size={20} />
                      </div>
                      <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                    <p className="text-blue-100/80 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Security Info */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-start space-x-3">
                  <Shield className="text-green-400 mt-0.5" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Connexion sécurisée</h3>
                    <p className="text-blue-100/80 text-sm">
                      Vos informations sont protégées par un chiffrement de bout en bout.
                      Nous ne partageons jamais vos données personnelles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="flex-1 flex items-center bg-white dark:bg-gray-800 justify-center p-4 md:p-8">
          <div className="w-full max-w-2xl">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center shadow-lg overflow-hidden">
                  {platform.logo ? (
                    <img src={platform.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Car className="text-white" size={24} />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold uppercase tracking-tight bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">{platform.name || 'TAKA TAKA'}</h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{platform.tagline || 'Mobilité Intelligente'}</p>
                </div>
              </div>
            </div>

            {/* Form Container */}
            <div className="   p-6 md:p-8  w-full max-w-4xl ">
              {/* Form Header */}
              <div className="mb-8  ">
                <h2 className="text-2xl text-center font-bold text-gray-900 dark:text-white mb-2">Se connecter</h2>
                <p className="text-gray-600 text-center dark:text-gray-400">Accédez à votre compte {platform.name || 'Taka Taka'}</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">

                {requires2FA ? (
                  <div className="text-center space-y-6">
                    {/* Animated Shield Icon */}
                    <div className="relative mx-auto w-20 h-20">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full opacity-20 animate-ping" style={{ animationDuration: '2s' }}></div>
                      <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Shield className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        Vérification de sécurité
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Nouvel appareil détecté sur votre compte
                      </p>
                    </div>

                    {/* Info Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800/40">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center flex-shrink-0">
                          <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            Code envoyé par email
                          </p>
                          {(maskedPhone || maskedEmail) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {maskedPhone && <span>{maskedPhone}</span>}
                              {maskedPhone && maskedEmail && <span className="mx-1">•</span>}
                              {maskedEmail && <span>{maskedEmail}</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* OTP Input Fields */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wider">
                        Entrez le code à 6 chiffres
                      </p>
                      <div className="flex justify-center gap-3">
                        {otpCode.map((digit, i) => (
                          <input
                            key={`otp-${i}`}
                            id={`otp-${i}`}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            onFocus={(e) => e.target.select()}
                            className={`w-13 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none
                              ${digit
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md shadow-blue-500/10'
                                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                              }
                              focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10
                              hover:border-blue-300 dark:hover:border-blue-500`}
                            style={{ width: '52px' }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Timer Progress */}
                    <div className="px-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Code valable 5 min
                        </span>
                        {resendCooldown > 0 && (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {resendCooldown}s
                          </span>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000"
                          style={{ width: resendCooldown > 0 ? `${(resendCooldown / 60) * 100}%` : '100%' }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || isLoading}
                        onClick={async () => {
                          setOtpCode(['', '', '', '', '', '']);
                          setRequires2FA(false);
                          setResendCooldown(60);
                          setIsLoading(true);
                          try {
                            const response = await authLogin({
                              identifiant: formData.phone,
                              motDePasse: formData.password,
                              deviceId: deviceId,
                            });
                            if (response && response.requires2FA) {
                              setRequires2FA(true);
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
                        }}
                        className={`inline-flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4 rounded-xl transition-all duration-200
                          ${resendCooldown > 0
                            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                            : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                          }`}
                      >
                        <Mail size={16} />
                        {resendCooldown > 0
                          ? `Renvoyer dans ${resendCooldown}s`
                          : 'Renvoyer un nouveau code'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRequires2FA(false);
                          setOtpCode(['', '', '', '', '', '']);
                          setResendCooldown(0);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors py-2"
                      >
                        <ArrowLeft size={14} />
                        Retour à la connexion
                      </button>
                    </div>

                    {/* Trust Badge */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 pt-2">
                      <Shield size={12} className="text-green-500" />
                      <span>Protection renforcée pour votre sécurité</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Phone/Email Input */}
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium flex items-center">
                        Numéro de téléphone / Adresse Email
                        <button
                          type="button"
                          onClick={() => showToast('Format accepté', 'Utilisez votre numéro (9 chiffres) ou votre email', 'info')}
                          className="ml-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                          title="Plus d'informations"
                        >
                          <Info size={14} />
                        </button>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Smartphone className="text-gray-400" size={20} />
                        </div>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${validationErrors.phone
                            ? 'border-red-500 focus:ring-red-500/50'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                          placeholder="xxx xxx xxx / example@gmail.com"
                        />
                      </div>
                      {validationErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                      )}
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                        Entrez votre numéro de téléphone (9 chiffres) ou votre adresse email
                      </p>
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                        Mot de passe
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="text-gray-400" size={20} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-12 py-3 rounded-xl border ${validationErrors.password
                            ? 'border-red-500 focus:ring-red-500/50'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                          placeholder="Votre mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {validationErrors.password && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                      )}
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                        Le mot de passe doit contenir au moins 8 caractères
                      </p>
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="hidden"
                          />
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${rememberMe
                            ? 'bg-green-600 border-green-600 shadow-inner'
                            : 'border-gray-300 dark:border-gray-600 group-hover:border-green-500'
                            }`}>
                            {rememberMe && <Check className="text-white" size={14} />}
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                          Se souvenir de moi
                        </span>
                      </label>
                      <a
                        href="/forgot-password"
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors hover:underline"
                      >
                        Mot de passe oublié ?
                      </a>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant={"primary"}
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  disabled={requires2FA && otpCode.join('').length < 6}
                  className={loginSuccess ? '!bg-gradient-to-r !from-green-600 !to-green-700' : ''}
                >
                  {isLoading ? 'Vérification...' : loginSuccess ? 'Connecté !' : requires2FA ? 'Valider le code' : 'Se connecter'}
                </Button>

                {!requires2FA && (
                  <>
                    {/* Divider */}
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 text-sm font-medium">
                          Ou continuer avec
                        </span>
                      </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSocialLogin('Google')}
                        icon={() => (
                          <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          </svg>
                        )}
                      >
                        Google
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSocialLogin('Facebook')}
                        icon={() => (
                          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        )}
                      >
                        Facebook
                      </Button>
                    </div>

                    {/* Signup Links */}
                    <div className="text-center mb-8">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Nouveau sur {platform.name || 'Taka Taka'} ?
                        <button
                          onClick={() => navigate('/inscription')}
                          className="font-bold text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 ml-2 transition-colors hover:underline"
                        >
                          Créer un compte
                        </button>
                      </p>
                      <div className="flex flex-col justify-center sm:flex-row gap-4">
                        <Button
                          onClick={() => navigate('/inscription?type=passenger')}
                          variant="outline"
                          className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-bold">Passager</span>
                            <span className="text-xs opacity-75">Réserver des trajets</span>
                          </div>
                        </Button>
                        <Button
                          onClick={() => navigate('/inscription?type=driver')}
                          variant="outline"
                          className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-bold">Chauffeur</span>
                            <span className="text-xs opacity-75">Offrir des trajets</span>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </form>

              {/* Security Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                  <Shield className="w-4 h-4 mr-2 text-green-500" />
                  Connexion 100% sécurisée • Vos données sont protégées
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connexion;






