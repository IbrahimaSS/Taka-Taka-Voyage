// src/components/profile/components/ProfileHeader.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Save, X, Plus } from 'lucide-react';
import Button from '../ui/Bttn';

const ProfileHeader = ({
  title,
  description,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  showAddButton = false,
  onAddClick,
  addButtonText = "Ajouter un personnels"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">{description}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {showAddButton && (
          <Button
            variant="perso"
            // className="bg-gradient-to-r from-blue-700 to-teal-700"
            icon={Plus}
            onClick={onAddClick}
          >
            {addButtonText}
          </Button>
        )}

        {isEditing ? (
          <>
            <Button
              variant="secondary"
              icon={X}
              onClick={onCancel}
            >
              Annuler
            </Button>
            <Button
              variant="perso"

              icon={Save}
              onClick={onSave}
            >
              Sauvegarder
            </Button>
          </>
        ) : (
          <Button
            variant="perso"

            icon={Edit2}
            onClick={onEdit}
          >
            Modifier le profil
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileHeader;