// src/components/profile/components/UserFormModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Key, UserCheck, UserCog, Save } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Bttn';
import Switch from '../ui/Switch';

const UserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title = "Ajouter un personnels"
}) => {
  // État initial avec permissions par défaut
  const defaultFormData = {
    name: '',
    email: '',
    phone: '',
    role: 'agent',
    permissions: {
      view: true,
      edit: false,
      create: false,
      delete: false,
      manageUsers: false
    },
    sendWelcomeEmail: true,
    generatePassword: true
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      // Fusionner les données initiales avec les valeurs par défaut
      setFormData({
        ...defaultFormData,
        ...initialData,
        permissions: {
          ...defaultFormData.permissions,
          ...(initialData.permissions || {})
        }
      });
    } else {
      // Réinitialiser au formulaire vide
      setFormData(defaultFormData);
    }
  }, [initialData, isOpen]); // Ajout de isOpen pour réinitialiser à chaque ouverture

  const roles = [
    { id: 'admin', label: 'Administrateur', description: 'Accès complet au système', icon: Shield },
    { id: 'supervisor', label: 'Superviseur', description: 'Gestion des équipes et rapports', icon: UserCheck },
    { id: 'agent', label: 'Agent', description: 'Opérations quotidiennes', icon: User },
    { id: 'analyst', label: 'Analyste', description: 'Analyse des données', icon: UserCog }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.email?.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.role) newErrors.role = 'Le rôle est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...(prev.permissions || {}), // S'assurer que permissions existe
        [permission]: !prev.permissions?.[permission]
      }
    }));
  };

  // S'assurer que permissions est toujours un objet
  const permissions = formData.permissions || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <div className="space-y-6 scroll-m-t-2 overflow-auto h-[70vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Nom complet *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full border-2 ${errors.name ? 'border-red-300' : 'border-gray-200 dark:border-gray-900'} dark:bg-gray-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full border-2 ${errors.email ? 'border-red-300' : 'border-gray-200 dark:border-gray-900'} dark:bg-gray-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all`}
                placeholder="john@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="+224 XXX XX XX XX"
              />
            </div>
          </div>

          {/* Rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Rôle *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(role => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleInputChange('role', role.id)}
                  className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all ${formData.role === role.id
                    ? 'border-blue-600 bg-slate-200/30 dark:bg-gray-700'
                    : 'border-gray-200 dark:border-gray-900 hover:border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800'
                    }`}
                >
                  <role.icon className={`w-5 h-5 mb-1 ${formData.role === role.id ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`} />
                  <span className={`text-sm font-medium ${formData.role === role.id ? 'text-blue-700' : 'text-gray-700 dark:text-gray-200'}`}>
                    {role.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{role.description}</span>
                </button>
              ))}
            </div>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>
        </div>

        {/* Permissions */}
        <div>
          <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">Permissions</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(permissions).map(([key, value]) => (
              <label
                key={key}
                className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition-all ${value
                  ? 'border-teal-600 bg-slate-200/30 dark:bg-gray-700'
                  : 'border-gray-200 dark:border-gray-900 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800'
                  }`}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">
                  {key === 'view' && 'Lecture'}
                  {key === 'edit' && 'Édition'}
                  {key === 'create' && 'Création'}
                  {key === 'delete' && 'Suppression'}
                  {key === 'manageUsers' && 'Gestion utilisateurs'}
                </span>
                <Switch
                  checked={!!value} // S'assurer que c'est un booléen
                  onChange={() => handlePermissionChange(key)}
                  size="sm"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl hover:border-gray-300 dark:border-gray-700 transition-all cursor-pointer">
            <div className="flex items-center space-x-3">
              <Mail className="text-blue-600 w-5 h-5" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">Envoyer un email de bienvenue</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">L'utilisateur recevra ses identifiants par email</p>
              </div>
            </div>
            <Switch
              checked={!!formData.sendWelcomeEmail}
              onChange={() => handleInputChange('sendWelcomeEmail', !formData.sendWelcomeEmail)}
            />
          </label>

          <label className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl hover:border-gray-300 dark:border-gray-700 transition-all cursor-pointer">
            <div className="flex items-center space-x-3">
              <Key className="text-teal-600 w-5 h-5" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">Générer un mot de passe</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Un mot de passe aléatoire sera créé</p>
              </div>
            </div>
            <Switch
              checked={!!formData.generatePassword}
              onChange={() => handleInputChange('generatePassword', !formData.generatePassword)}
            />
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-900">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            className="bg-gradient-to-r from-blue-700 to-teal-700"
            icon={Save}
            onClick={handleSubmit}
          >
            {initialData ? 'Mettre à jour' : 'Créer le personnels'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserFormModal;