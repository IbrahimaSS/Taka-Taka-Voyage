// src/App.jsx - VERSION MODERNE COMPLÈTE
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Sidebar from '../components/admin/layout/Sidebar';
import Header from '../components/admin/layout/Header';

// Section Components
import Dashboard from '../components/admin/sections/Dashboard';
import Users from '../components/admin/sections/Passagers';
import Drivers from '../components/admin/sections/Chauffeurs';
import Trips from '../components/admin/sections/Trajets';
import Payments from '../components/admin/sections/Payments';
import Validations from '../components/admin/sections/Validations';
import Disputes from '../components/admin/sections/Litiges';
import Documents from '../components/admin/sections/Documents';
import Reports from '../components/admin/sections/Reports';
import Commissions from '../components/admin/sections/Commissions';
import Settings from '../components/admin/sections/Settings';
import UserProfile from '../components/admin/profile/UserProfile';

// UI Components
import Toast from '../components/admin/ui/Toast';
import Modal from '../components/admin/ui/Modale';

function AdminApp() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [currentDate, setCurrentDate] = useState('');
  const location = useLocation();

  useEffect(() => {
    setCurrentDate(format(new Date(), 'EEEE d MMMM yyyy', { locale: fr }));

    const interval = setInterval(() => {
      setCurrentDate(format(new Date(), 'EEEE d MMMM yyyy', { locale: fr }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
  };

  const showModal = (content) => {
    setModal(content);
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <div className="flex min-h-screen inset-0 bg-gray-100 bg-gradient-to-br from-primary-50 to-secondary-100  dark:from-gray-800  dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}>
        {/* Header */}
        <Header
          currentDate={currentDate}
          onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
          showToast={showToast}
        />
        <main className="content-padding">
          <div className="content-container">
            {/* Main Content Area */}
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* Route par défaut pour /admin */}
                <Route index element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard showToast={showToast} />
                  </motion.div>
                } />

                {/* Les autres routes - elles sont maintenant relatives à /admin */}
                <Route path="utilisateurs" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Users showToast={showToast} />
                  </motion.div>
                } />
                <Route path="chauffeurs" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Drivers showToast={showToast} />
                  </motion.div>
                } />
                <Route path="trajets" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Trips showToast={showToast} />
                  </motion.div>
                } />
                <Route path="paiements" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Payments showToast={showToast} />
                  </motion.div>
                } />
                <Route path="validations" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Validations showToast={showToast} />
                  </motion.div>
                } />
                <Route path="litiges" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Disputes showToast={showToast} />
                  </motion.div>
                } />
                <Route path="documents" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Documents showToast={showToast} />
                  </motion.div>
                } />
                <Route path="rapports" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Reports showToast={showToast} />
                  </motion.div>
                } />
                <Route path="commissions" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Commissions showToast={showToast} />
                  </motion.div>
                } />
                <Route path="parametres" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Settings showToast={showToast} />
                  </motion.div>
                } />
                <Route path="profil" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <UserProfile showToast={showToast} />
                  </motion.div>
                } />

                {/* Route pour /admin directement (dashboard) */}
                <Route path="" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard showToast={showToast} />
                  </motion.div>
                } />
              </Routes>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-2 md:mb-0">
              © {new Date().getFullYear()} TakaTaka Admin. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-all duration-200 text-sm hover:underline">
                Aide
              </a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-all duration-200 text-sm hover:underline">
                Sécurité
              </a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-all duration-200 text-sm hover:underline">
                Confidentialité
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notification */}
      <Toast {...toast} onClose={() => setToast(null)} />

      {/* Modal */}
      <Modal isOpen={!!modal} onClose={closeModal}>
        {modal}
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

export default AdminApp;