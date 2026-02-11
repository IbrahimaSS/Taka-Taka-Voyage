import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import NotFound from '../../pages/NotFound';

// Composant 404 simple (On peut réutiliser celui de App.jsx si extrait)


const AuthGuard = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-primaryGreen-start border-r-primaryBlue-start border-b-primaryGreen-end border-l-primaryBlue-end rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-300">Vérification de la session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Rediriger vers la page de connexion si non authentifié
        return <Navigate to="/connexion" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Si le rôle n'est pas autorisé, afficher aussi 404
        return <NotFound />;
    }

    return children;
};

export default AuthGuard;
