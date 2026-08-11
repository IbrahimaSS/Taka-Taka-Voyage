import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layouts
import PublicProviders from './PublicProviders';


// Pages
import HomePage from './pages/HomePage';
import FinaliserProfil from './pages/FinaliserProfil';
import { PassengerProvider } from './context/PassengerContext';

import NotFound from './pages/NotFound';

// Auth
import AuthGuard from './components/auth/AuthGuard';
import PlatformMonitor from './components/notifications/PlatformMonitor';
import ReservationReminder from './components/notifications/ReservationReminder';
import OfflineBanner from './components/common/OfflineBanner';
import NouveauVehiculeAlerte from './components/common/NouveauVehiculeAlerte';
import FullScreenSpinner from './components/common/FullScreenSpinner';



// Composants chargés paresseusement
const ValidationEnAttente = lazy(() => import('./components/validation/ValidationEnAttente'));
const ValidationReussie = lazy(() => import('./components/validation/ValidationReussie'));
// AssistantIA (1126 lignes) est monte sans condition sur TOUTE page, y compris
// le site public pour un visiteur anonyme qui n'ouvre jamais le widget - le
// plus gros fichier du repo, en lazy pour le sortir du chunk critique initial.
const AssistantIA = lazy(() => import('./components/assistant/AssistantIA'));

// Coquilles de role (Admin/Chauffeur/Passager) + pages secondaires - mutuellement
// exclusives selon la session (un chauffeur ne charge jamais le bundle Admin,
// un visiteur anonyme ne charge ni l'un ni l'autre). HomePage reste eager :
// c'est la vraie page d'atterrissage, la mettre en lazy ajouterait un
// aller-retour reseau pour zero benefice.
const AdminApp = lazy(() => import('./pages/AdminApp'));
const ChauffeurApp = lazy(() => import('./pages/ChauffeurApp'));
const Passenger = lazy(() => import('./pages/Passager'));
const Connexion = lazy(() => import('./pages/Connexion'));
const Inscription = lazy(() => import('./pages/Inscription'));
const MotDePasseOublie = lazy(() => import('./pages/MotDePasseOublie'));
const DownloadApp = lazy(() => import('./pages/DownloadApp'));
const GuidePage = lazy(() => import('./pages/GuidePage'));

// Composant principal
export default function App() {
  return (
    <BrowserRouter>
      <PlatformMonitor />
      <ReservationReminder />
      {/* fallback null : widget flottant sans coquille visible avant montage,
          un spinner plein ecran serait pire que rien puisque le reste de la
          page est deja interactif */}
      <Suspense fallback={null}>
        <AssistantIA />
      </Suspense>
      <OfflineBanner />
      <NouveauVehiculeAlerte />
      <Suspense fallback={<FullScreenSpinner />}>
        <Routes>
          {/* PUBLIC */}
          <Route element={<PublicProviders />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
            <Route path="/telecharger" element={<DownloadApp />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/finaliser-profil" element={
              <AuthGuard allowedRoles={[]}>
                <FinaliserProfil />
              </AuthGuard>
            } />

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
    </BrowserRouter>
  );
}
