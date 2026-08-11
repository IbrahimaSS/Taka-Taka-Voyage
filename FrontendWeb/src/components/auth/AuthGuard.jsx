import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import NotFound from '../../pages/NotFound';
import FullScreenSpinner from '../common/FullScreenSpinner';

const AuthGuard = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <FullScreenSpinner message="Vérification de la session..." />;
    }

    if (!isAuthenticated) {
        // Rediriger vers la page de connexion si non authentifié
        return <Navigate to="/connexion" state={{ from: location }} replace />;
    }

    // Rediriger vers la finalisation du profil si le téléphone est manquant (Login Social)
    // Sauf si on est déjà sur la page de finalisation
    if (user && !user.telephone && location.pathname !== '/finaliser-profil') {
        return <Navigate to="/finaliser-profil" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Si le rôle n'est pas autorisé, afficher aussi 404
        return <NotFound />;
    }

    return children;
};

export default AuthGuard;
