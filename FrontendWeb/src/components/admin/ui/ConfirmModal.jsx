// src/components/ui/ConfirmModal.jsx - VERSION MODERNE
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  AlertTriangle, CheckCircle, XCircle, Info, HelpCircle,
  AlertCircle, UserCheck, UserX, Trash2, LogOut,
  ShieldAlert, ShieldCheck, X
} from 'lucide-react';
import Button from './Bttn';

/**
 * Composant de modal de confirmation réutilisable
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message = 'Êtes-vous sûr de vouloir effectuer cette action ?',
  type = 'info',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmVariant = 'primary',
  cancelVariant = 'secondary',
  showComment = false,
  commentLabel = 'Commentaire',
  commentPlaceholder = 'Ajouter un commentaire...',
  requireComment = false,
  maxCommentLength = 500,
  loading = false,
  destructive = false,
  size = 'md',
  commentValue = "",
  onCommentChange,
  children
}) => {
  const [comment, setComment] = useState(commentValue);
  const [commentError, setCommentError] = useState('');

  // Sincroniser le commentaire interne avec la prop externe
  React.useEffect(() => {
    setComment(commentValue);
  }, [commentValue]);

  // Configuration basée sur le type
  const typeConfig = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-100',
      defaultConfirmVariant: 'primary',
      defaultTitle: 'Succès',
      ringColor: 'ring-emerald-500/20'
    },
    error: {
      icon: XCircle,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-100',
      defaultConfirmVariant: 'danger',
      defaultTitle: 'Erreur',
      ringColor: 'ring-rose-500/20'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-100',
      defaultConfirmVariant: 'warning',
      defaultTitle: 'Attention',
      ringColor: 'ring-amber-500/20'
    },
    info: {
      icon: Info,
      iconColor: 'text-primary-500',
      bgColor: 'bg-primary-100',
      defaultConfirmVariant: 'primary',
      defaultTitle: 'Information',
      ringColor: 'ring-primary-500/20'
    },
    delete: {
      icon: Trash2,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-100',
      defaultConfirmVariant: 'danger',
      defaultTitle: 'Supprimer',
      ringColor: 'ring-rose-500/20'
    },
    validate: {
      icon: UserCheck,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-100',
      defaultConfirmVariant: 'primary',
      defaultTitle: 'Validation',
      ringColor: 'ring-emerald-500/20'
    },
    reject: {
      icon: UserX,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-100',
      defaultConfirmVariant: 'danger',
      defaultTitle: 'Rejet',
      ringColor: 'ring-rose-500/20'
    },
    logout: {
      icon: LogOut,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-100',
      defaultConfirmVariant: 'warning',
      defaultTitle: 'Déconnexion',
      ringColor: 'ring-amber-500/20'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const IconComponent = config.icon;

  const finalConfirmVariant = confirmVariant === 'primary' && config.defaultConfirmVariant
    ? config.defaultConfirmVariant
    : confirmVariant;

  const finalTitle = title === 'Confirmation' && config.defaultTitle
    ? config.defaultTitle
    : title;

  // Validation du commentaire
  const validateComment = () => {
    if (requireComment && !comment.trim()) {
      setCommentError('Un commentaire est requis');
      return false;
    }
    if (comment.length > maxCommentLength) {
      setCommentError(`Le commentaire ne doit pas dépasser ${maxCommentLength} caractères`);
      return false;
    }
    setCommentError('');
    return true;
  };

  // Gestion de la confirmation
  const handleConfirm = () => {
    if (showComment && !validateComment()) {
      return;
    }

    onConfirm(comment);
    if (!loading) {
      setComment('');
      setCommentError('');
    }
  };

  // Gestion de la fermeture
  const handleClose = () => {
    setComment('');
    setCommentError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}

        className={clsx(
          'relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col overflow-hidden',
          size === 'sm' ? 'max-w-md' :
            size === 'md' ? 'max-w-lg' :
              size === 'lg' ? 'max-w-2xl' :
                'max-w-4xl'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-900">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center ${config.ringColor} ring-2`}>
                <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {finalTitle}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {message}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-xl transition-colors"
              variant={"perso"}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Contenu additionnel */}
          {children && (
            <div className="bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-4 mb-4">
              {children}
            </div>
          )}

          {/* Champ de commentaire */}
          {showComment && (
            <div className="space-y-3 mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {commentLabel}
                {requireComment && <span className="text-rose-500 ml-1">*</span>}
                <span className="text-gray-500 dark:text-gray-400 text-xs font-normal ml-2">
                  {comment.length}/{maxCommentLength} caractères
                </span>
              </label>

              <textarea
                className={clsx(
                  'w-full p-3 border rounded-xl focus:ring-2 focus:ring-offset-2 transition',
                  commentError
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-gray-300 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-100 dark:bg-gray-900'
                )}
                rows="3"
                placeholder={commentPlaceholder}
                value={comment}
                onChange={(e) => {
                  const val = e.target.value;
                  setComment(val);
                  onCommentChange?.(val);
                  if (commentError) validateComment();
                }}
                maxLength={maxCommentLength}
              />

              {commentError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-rose-500"
                >
                  {commentError}
                </motion.p>
              )}
            </div>
          )}

          {/* Indicateur d'action destructrice */}
          {destructive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-200 rounded-xl p-4"
            >
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-rose-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-rose-700 font-medium">
                  Cette action est irréversible. Veuillez confirmer avec précaution.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
            <Button
              variant={cancelVariant}
              onClick={handleClose}
              disabled={loading}
              className="mt-3 sm:mt-0"
              fullWidth={window.innerWidth < 640}
            >
              {cancelText}
            </Button>

            <Button
              variant={finalConfirmVariant}
              onClick={handleConfirm}
              loading={loading}
              disabled={loading || (showComment && requireComment && !comment.trim())}
              fullWidth={window.innerWidth < 640}
              className={destructive ? 'shadow-lg shadow-rose-500/20' : ''}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmModal;