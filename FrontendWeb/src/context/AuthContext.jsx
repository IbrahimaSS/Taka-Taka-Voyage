import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import { authService } from '../services/authService';
import { API_ROUTES } from '../services/apiRoutes';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Vérifier la session au chargement
    const checkAuth = useCallback(async () => {
        try {
            const response = await apiClient.get(API_ROUTES.auth.me);
            if (response.data.succes) {
                setUser(response.data.utilisateur);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Session non valide ou expirée');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Connexion
    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            if (response.data.succes) {
                setUser(response.data.utilisateur);
                setIsAuthenticated(true);
                return {
                    succes: true,
                    utilisateur: response.data.utilisateur,
                    user: response.data.utilisateur
                };
            }
            return { succes: false };
        } catch (error) {
            throw error;
        }
    };

    // Déconnexion
    const logout = async () => {
        try {
            // Appeler le backend pour supprimer le cookie
            await apiClient.post(API_ROUTES.auth.logout);
        } catch (error) {
            console.error('Erreur lors de la déconnexion côté serveur', error);
        } finally {
            // Toujours nettoyer l'état local, même si l'appel backend échoue
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Mettre à jour l'utilisateur manuellement (ex: après modification du profil)
    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    // Obtenir la route de redirection basée sur le rôle
    const getRedirectPath = (userRole) => {
        const role = userRole || user?.role;
        if (!role) return '/connexion';

        switch (role.toUpperCase()) {
            case 'ADMIN':
                return '/admin';
            case 'CHAUFFEUR':
            case 'DRIVER':
                return '/chauffeur';
            case 'PASSAGER':
            case 'PASSENGER':
                return '/passager';
            default:
                return '/';
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                logout,
                checkAuth,
                updateUser,
                setUser,
                getRedirectPath
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
