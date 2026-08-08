import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_ROUTES } from '../../services/apiRoutes';
import { getApiBaseURL } from '../../utils/urlHelper';

export const useProfileState = ({ user, updateAuthUser }) => {
  const [passenger, setPassenger] = useState(user || null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // ===================== FETCH PROFILE REAL =====================
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      const baseURL = getApiBaseURL();
      const { data } = await axios.get(`${baseURL}${API_ROUTES.passager.profil.get}`, {
        withCredentials: true
      });
      if (data?.succes && data?.profil) {
        console.log("👤 [CONTEXT] Profil récupéré:", data.profil);
        setPassenger(data.profil);
        if (updateAuthUser) {
          updateAuthUser(data.profil);
        }
      }
    } catch (err) {
      console.error("❌ [CONTEXT] Erreur fetch profile:", err.message);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [updateAuthUser]);

  useEffect(() => {
    if (user) {
      setPassenger(user);
      if (!user._id && !user.id) {
        fetchProfile();
      }
    } else {
      setPassenger(null);
    }
  }, [user, fetchProfile]);

  const updatePassenger = async (newData) => {
    try {
      const isFormData = newData instanceof FormData;
      const config = {
        withCredentials: true,
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
      };

      const baseURL = getApiBaseURL();
      const { data } = await axios.put(`${baseURL}${API_ROUTES.passager.profil.update}`, newData, config);
      if (data?.succes) {
        const updatedUser = data.profil || data.utilisateur || (isFormData ? null : newData);

        if (updatedUser) {
          setPassenger(updatedUser);
          if (updateAuthUser) {
            updateAuthUser(updatedUser);
          }
        }

        if (isFormData) {
          await fetchProfile();
        }
        toast.success("Profil mis à jour !");
        return true;
      }
    } catch (err) {
      console.error("❌ [CONTEXT] Erreur update profile:", err.message);
      toast.error(err.response?.data?.message || "Échec de la mise à jour du profil");
    }
    return false;
  };

  return {
    passenger,
    setPassenger,
    isLoadingProfile,
    fetchProfile,
    updatePassenger,
  };
};
