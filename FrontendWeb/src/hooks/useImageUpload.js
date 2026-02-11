// src/components/profile/hooks/useImageUpload.js
import { useState, useCallback } from 'react';

export const useImageUpload = (initialImage = null) => {
  const [image, setImage] = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = useCallback((file) => {
    // Types d'images acceptés
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    // Taille maximale : 5MB
    const maxSize = 5 * 1024 * 1024;

    if (!acceptedTypes.includes(file.type)) {
      throw new Error('Type de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.');
    }

    if (file.size > maxSize) {
      throw new Error('L\'image est trop volumineuse. Maximum : 5MB');
    }

    return true;
  }, []);

  const uploadImage = useCallback(async (file) => {
    try {
      setUploading(true);
      setError(null);

      // Validation
      validateFile(file);

      // Simuler un upload (remplacez par votre logique d'upload réelle)
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const imageUrl = e.target.result;
          setImage(imageUrl);
          setUploading(false);
          resolve(imageUrl);
        };

        reader.onerror = () => {
          setUploading(false);
          setError('Erreur lors de la lecture du fichier');
          reject(new Error('Erreur lors de la lecture du fichier'));
        };

        reader.readAsDataURL(file);
      });

    } catch (err) {
      setUploading(false);
      setError(err.message);
      throw err;
    }
  }, [validateFile]);

  const removeImage = useCallback(() => {
    setImage(null);
    setError(null);
  }, []);

  return {
    image,
    uploading,
    error,
    uploadImage,
    removeImage,
    setImage
  };
};