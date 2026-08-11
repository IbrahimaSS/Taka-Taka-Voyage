import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { passwordResetService } from '../../services/passwordResetService';

// Flux "Mot de passe oublie" (frontend uniquement, voir
// services/passwordResetService.js pour le point d'integration backend).
// Meme structure que useConnexionForm.js / useInscriptionFlow.js.
export const useMotDePasseOublieFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [identifiant, setIdentifiant] = useState('');
  const [identifiantMasque, setIdentifiantMasque] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [activeCodeIndex, setActiveCodeIndex] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', color: '#6b7280' });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const showToast = (title, message, type = 'info') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 5000);
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = {
      0: { message: 'Très faible', color: '#ef4444' },
      1: { message: 'Faible', color: '#f97316' },
      2: { message: 'Moyen', color: '#eab308' },
      3: { message: 'Bon', color: '#22c55e' },
      4: { message: 'Très bon', color: '#0d8c6f' },
    };
    setPasswordStrength({ score, ...levels[score] });
  };

  // Etape 1 : identifiant
  const handleIdentifiantChange = (e) => {
    setIdentifiant(e.target.value);
    if (validationErrors.identifiant) {
      setValidationErrors(prev => ({ ...prev, identifiant: null }));
    }
  };

  const validateIdentifiant = () => {
    const errors = {};
    const value = identifiant.trim();
    if (!value) {
      errors.identifiant = 'Ce champ est requis';
    } else {
      const phoneRegex = /^(\d{9}|\d{3} \d{3} \d{3})$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!phoneRegex.test(value.replace(/\s/g, '')) && !emailRegex.test(value)) {
        errors.identifiant = 'Format invalide. Utilisez 9 chiffres ou une adresse email valide';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitIdentifiant = async (e) => {
    e.preventDefault();
    if (!validateIdentifiant()) return;

    setIsLoading(true);
    try {
      const response = await passwordResetService.requestReset(identifiant.trim());
      if (response.data.succes) {
        setIdentifiantMasque(response.data.identifiantMasque || identifiant.trim());
        setResendCooldown(60);
        setCurrentStep(2);
      }
    } catch (error) {
      showToast('Erreur', error?.response?.data?.message || 'Impossible d\'envoyer le code.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Etape 2 : code de verification
  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      setActiveCodeIndex(index + 1);
      document.getElementById(`reset-code-${index + 1}`)?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      setActiveCodeIndex(index - 1);
      document.getElementById(`reset-code-${index - 1}`)?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      await passwordResetService.resendResetCode(identifiant.trim());
      setResendCooldown(60);
      setCode(['', '', '', '', '', '']);
      setActiveCodeIndex(0);
      showToast('Code renvoyé', 'Un nouveau code vous a été envoyé.', 'success');
    } catch (error) {
      showToast('Erreur', error?.response?.data?.message || 'Impossible de renvoyer le code.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    const codeValue = code.join('');
    if (codeValue.length !== 6) {
      setValidationErrors({ code: 'Le code doit contenir 6 chiffres' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await passwordResetService.verifyResetCode(identifiant.trim(), codeValue);
      if (response.data.succes) {
        setResetToken(response.data.resetToken);
        setValidationErrors({});
        setCurrentStep(3);
      }
    } catch (error) {
      showToast('Code invalide', error?.response?.data?.message || 'Le code saisi est incorrect.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Etape 3 : nouveau mot de passe
  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    calculatePasswordStrength(e.target.value);
    if (validationErrors.newPassword) {
      setValidationErrors(prev => ({ ...prev, newPassword: null }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (validationErrors.confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: null }));
    }
  };

  const isPasswordMatch = () => newPassword === confirmPassword && confirmPassword.length > 0;

  const validateNewPassword = () => {
    const errors = {};
    if (!newPassword) {
      errors.newPassword = 'Le mot de passe est requis';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitNewPassword = async (e) => {
    e.preventDefault();
    if (!validateNewPassword()) return;

    setIsLoading(true);
    try {
      const response = await passwordResetService.resetPassword(identifiant.trim(), resetToken, newPassword);
      if (response.data.succes) {
        showToast('Mot de passe modifié', 'Vous pouvez maintenant vous connecter.', 'success');
        setTimeout(() => navigate('/connexion'), 1500);
      }
    } catch (error) {
      showToast('Erreur', error?.response?.data?.message || 'Impossible de modifier le mot de passe.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevStep = () => setCurrentStep(prev => Math.max(1, prev - 1));

  return {
    currentStep,
    identifiant, identifiantMasque,
    code, activeCodeIndex, resendCooldown,
    newPassword, confirmPassword, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
    passwordStrength, isPasswordMatch,
    isLoading, validationErrors,
    toast, setToast,
    handleIdentifiantChange, handleSubmitIdentifiant,
    handleCodeChange, handleCodeKeyDown, handleResendCode, handleSubmitCode,
    handleNewPasswordChange, handleConfirmPasswordChange, handleSubmitNewPassword,
    handlePrevStep,
  };
};
