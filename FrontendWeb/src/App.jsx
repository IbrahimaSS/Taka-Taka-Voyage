import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layouts
import AdminApp from './pages/AdminApp';
import PublicProviders from './PublicProviders';


// Pages
import HomePage from './pages/HomePage';
import ChauffeurApp from './pages/ChauffeurApp';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import Passenger from './pages/Passager';
import { PassengerProvider } from './context/PassengerContext';

import NotFound from './pages/NotFound';

// Auth
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/auth/AuthGuard';


// Composants chargés paresseusement
const ValidationEnAttente = lazy(() => import('./components/validation/ValidationEnAttente'));
const ValidationReussie = lazy(() => import('./components/validation/ValidationReussie'));

// Composant de chargement
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-t-primaryGreen-start border-r-primaryBlue-start border-b-primaryGreen-end border-l-primaryBlue-end rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-600 dark:text-slate-300">Chargement...</p>
    </div>
  </div>
);



// Composant principal
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* PUBLIC */}
            <Route element={<PublicProviders />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/connexion" element={<Connexion />} />
              <Route path="/inscription" element={<Inscription />} />

              {/* Chauffeur */}
              <Route path="/chauffeur/*" element={
                <AuthGuard allowedRoles={['CHAUFFEUR', 'DRIVER']}>
                  <ChauffeurApp />
                </AuthGuard>
              } />
              <Route path="/chauffeurs" element={<Navigate to="/chauffeur" replace />} />
              <Route path="/chauffeurs/*" element={<Navigate to="/chauffeur" replace />} />

              {/* Passager */}
              <Route path="/passager/*" element={
                <AuthGuard allowedRoles={['PASSAGER', 'PASSENGER']}>
                  <PassengerProvider>
                    <Passenger />
                  </PassengerProvider>
                </AuthGuard>
              } />
              <Route path="/passagers" element={<Navigate to="/passager" replace />} />
              <Route path="/passagers/*" element={<Navigate to="/passager" replace />} />

              {/* Pages de validation */}
              <Route path="/validation-en-attente" element={<ValidationEnAttente />} />
              <Route path="/validation-reussie" element={<ValidationReussie />} />
            </Route>

            {/* ADMIN */}
            <Route path="/admin/*" element={
              <AuthGuard allowedRoles={['ADMIN']}>
                <AdminApp />
              </AuthGuard>
            } />

            {/* Routes de compatibilité */}
            <Route path="/logout" element={<Navigate to="/admin/logout" replace />} />
            <Route path="/login" element={<Navigate to="/connexion" replace />} />
            <Route path="/signup" element={<Navigate to="/inscription" replace />} />


            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
