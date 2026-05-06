import { apiClient } from './apiClient';

/**
 * Service pour le Community Hub Taka-Taka
 */
export const communityService = {
  /**
   * Récupérer le fil d'actualité
   */
  getPosts: async (tag = null) => {
    try {
      const params = tag ? { tag } : {};
      const response = await apiClient.get('/community/posts', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Créer une nouvelle publication
   */
  creerPost: async (data) => {
    try {
      const response = await apiClient.post('/community/posts', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Liker ou unliker un post
   */
  toggleLike: async (postId) => {
    try {
      const response = await apiClient.put(`/community/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Uploader un média (FormData)
   */
  uploadMedia: async (formData) => {
    try {
      const response = await apiClient.post('/community/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Récupérer les commentaires d'un post
   */
  getCommentaires: async (postId) => {
    try {
      const response = await apiClient.get(`/community/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Ajouter un commentaire
   */
  ajouterCommentaire: async (postId, contenu) => {
    try {
      const response = await apiClient.post(`/community/posts/${postId}/comments`, { contenu });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Messagerie Privée
   */
  startConversation: async (destinataireId) => {
    try {
      const response = await apiClient.post('/community/conversations', { destinataireId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMesConversations: async () => {
    try {
      const response = await apiClient.get('/community/conversations');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  envoyerMessageDirect: async (convId, data) => {
    try {
      const response = await apiClient.post(`/community/conversations/${convId}/messages`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getHistoriqueMessages: async (convId) => {
    try {
      const response = await apiClient.get(`/community/conversations/${convId}/messages`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
