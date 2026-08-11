// src/pages/ChauffeurApp.jsx
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from '../context/AuthContext';

import Sidebar from "../components/admin/layout/Sidebar";
import Header from "../components/admin/layout/Header";
import Toast from "../components/admin/ui/Toast";
import Modal from "../components/admin/ui/Modal";
import Bttn from "../components/admin/ui/Bttn";

import Dashboard from "../components/chauffeur/Dashboard";
import Trajets from "../components/chauffeur/Trajets";
import HistoriqueTrajet from "../components/chauffeur/HistoriqueTrajet";
import Planning from "../components/chauffeur/Planning";
import Revenues from "../components/chauffeur/Revenues.jsx";
import ChauffeurProfile from "../components/chauffeur/shared/ChauffeurProfile";
import ChauffeurSettings from "../components/chauffeur/shared/ChauffeurSettings";
import ChauffeurSupport from "../components/chauffeur/shared/ChauffeurSupport";
import ChauffeurEvaluations from "../components/chauffeur/shared/ChauffeurEvaluations";
import ChauffeurTracking from "../components/chauffeur/ChauffeurTracking";
import Wallet from "../components/chauffeur/Wallet";
import DriverRentalSection from "../components/chauffeur/DriverRentalSection";
import CommunityHub from "../components/community/CommunityHub";
import RentalHistory from "../components/passager/RentalHistory";
import TripNotificationToast from "../components/chauffeur/TripNotificationToast";
import DriverProvider, { useDriverContext } from '../context/DriverContext';
import { Toaster } from 'react-hot-toast';
import { ROLES } from '../config/navConfig';
import { useSettings } from '../context/SettingsContext';

import LiveTrackingWrapper from './chauffeur/LiveTrackingWrapper';
import DriverAutoOnline from './chauffeur/DriverAutoOnline';

function DriverAppContent() {
  const { settings } = useSettings();
  const platform = settings?.platform || {};
  const { user } = useAuth();

  // 🔒 Bloquer l'accès si le chauffeur est EN_ATTENTE de validation
  if (user?.statut === 'EN_ATTENTE') {
    return <Navigate to="/validation-en-attente" replace />;
  }

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { tripStep } = useDriverContext();

  // Redirection automatique vers le suivi en direct
  useEffect(() => {
    const isOnLive = location.pathname.includes("live-tracking");
    if (tripStep === 'in_progress' && !isOnLive) {
      console.log("🚀 [ChauffeurApp] Redirection automatique vers le suivi en direct.");
      navigate("/chauffeur/live-tracking", { replace: true });
    }
  }, [tripStep, location.pathname, navigate]);

  useEffect(() => {
    const update = () => setCurrentDate(format(new Date(), "EEEE d MMMM yyyy", { locale: fr }));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = "success", duration = 3000) => {
    setToast({ message, type, duration });
    setTimeout(() => setToast(null), duration);
  };

  const showModal = (content, onClose) => {
    if (!content) {
      setModal(null);
    } else {
      setModal({ content, onClose });
    }
  };
  const closeModal = () => {
    if (modal?.onClose) modal.onClose();
    setModal(null);
  };

  const isLiveTracking = location.pathname.includes("live-tracking");

  return (
    <div className="flex min-h-screen inset-0 bg-gray-100 bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-800 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <TripNotificationToast />

      {!isLiveTracking && (
        <Sidebar
          role={ROLES.CHAUFFEUR}
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${!isLiveTracking && sidebarCollapsed ? "lg:ml-20" : !isLiveTracking ? "lg:ml-72" : "ml-0"
          }`}
      >
        {!isLiveTracking && (
          <Header
            role={ROLES.CHAUFFEUR}
            currentDate={currentDate}
            onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
            showToast={showToast}
          />
        )}

        <main className={isLiveTracking ? "h-screen" : "content-padding"}>
          <div className="content-container">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route index element={<Dashboard onToast={showToast} onModal={showModal} />} />
                <Route path="trips" element={<Trajets onToast={showToast} onModal={showModal} />} />
                <Route path="community" element={<CommunityHub isFullPage={true} />} />
                <Route path="history" element={<HistoriqueTrajet onToast={showToast} onModal={showModal} />} />
                <Route path="revenues" element={<Revenues onToast={showToast} onModal={showModal} />} />
                <Route path="tracking" element={<ChauffeurTracking />} />
                <Route path="live-tracking" element={<LiveTrackingWrapper />} />
                <Route path="planning" element={<Planning onToast={showToast} onModal={showModal} />} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="settings" element={<ChauffeurSettings onToast={showToast} onModal={showModal} />} />
                <Route path="evaluations" element={<ChauffeurEvaluations onToast={showToast} onModal={showModal} />} />
                <Route path="support" element={<ChauffeurSupport onToast={showToast} onModal={showModal} />} />
                <Route path="profil" element={<ChauffeurProfile onToast={showToast} onModal={showModal} />} />
                <Route path="locations" element={<DriverRentalSection onToast={showToast} />} />
                <Route path="rental-history" element={<RentalHistory onToast={showToast} onModal={showModal} />} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>

        {!isLiveTracking && (
          <footer className="border-t border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-2 md:mb-0">
                © {new Date().getFullYear()} {platform.name || 'TakaTaka'} Driver. Tous droits réservés.
              </p>
              <div className="flex items-center space-x-6">
                <Bttn
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    showModal(
                      <div className="p-6">
                        <h3>Aide Chauffeur</h3>
                        <p>Support 24/7...</p>
                      </div>
                    )
                  }
                >
                  Aide Chauffeur
                </Bttn>

                <Bttn variant="ghost" size="sm" onClick={() => showToast("Sécurité en cours de développement", "info")}>
                  Sécurité
                </Bttn>
              </div>
            </div>
          </footer>
        )}
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <Modal isOpen={!!modal} onClose={closeModal} title={modal?.title}>
        {modal?.content}
      </Modal>

      {/* Toaster global */}
      <Toaster
        position="top-right"
        containerStyle={{
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
          loading: {
            style: {
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            },
          },
        }}
      />
    </div>
  );
}

function ChauffeurApp() {
  return (
    <DriverProvider>
      <DriverAutoOnline />
      <DriverAppContent />
    </DriverProvider>
  );
}

export default ChauffeurApp;
