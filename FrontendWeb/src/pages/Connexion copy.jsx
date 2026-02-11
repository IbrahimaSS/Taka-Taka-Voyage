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

const Connexion = () => {
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

  const showToast = (title, message, type = 'info') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 5000);
  };

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

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await authLogin({
        identifiant: formData.phone,
        motDePasse: formData.password,
      });

      if (response.succes) {
        setLoginSuccess(true);

        if (rememberMe) {
          localStorage.setItem('rememberLogin', 'true');
          localStorage.setItem('userPhone', formData.phone);
        } else {
          localStorage.removeItem('rememberLogin');
          localStorage.removeItem('userPhone');
        }

        showToast('Connexion réussie', 'Redirection vers votre espace...', 'success');

        // Redirection basée sur le rôle de l'utilisateur
        const user = response.utilisateur || response.user;
        setTimeout(() => {
          if (user?.role === 'ADMIN') {
            navigate('/admin');
          } else if (user?.role === 'CHAUFFEUR' || user?.role === 'DRIVER') {
            navigate('/chauffeur');
          } else if (user?.role === 'PASSAGER' || user?.role === 'PASSENGER') {
            navigate('/passager');
          } else {
            navigate('/');
          }
        }, 1000);
      }
    } catch (error) {
      showToast('Erreur de connexion', error?.response?.data?.message || 'Connexion impossible', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setShowInfoModal(true);
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
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                    <Car className="text-white" size={32} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">TAKA TAKA</h1>
                    <p className="text-blue-100 text-lg">Mobilité Intelligente</p>
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center shadow-lg">
                  <Car className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TAKA TAKA</h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Mobilité Intelligente</p>
                </div>
              </div>
            </div>

            {/* Form Container */}
            <div className="   p-6 md:p-8  w-full max-w-4xl ">
              {/* Form Header */}
              <div className="mb-8  ">
                <h2 className="text-2xl text-center font-bold text-gray-900 dark:text-white mb-2">Se connecter</h2>
                <p className="text-gray-600 text-center dark:text-gray-400">Accédez à votre compte Taka Taka</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex justify-between items-center">
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant={"primary"}
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  className={loginSuccess ? '!bg-gradient-to-r !from-green-600 !to-green-700' : ''}
                >
                  {isLoading ? 'Connexion...' : loginSuccess ? 'Connecté !' : 'Se connecter'}
                </Button>

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
                    Nouveau sur Taka Taka ?
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






