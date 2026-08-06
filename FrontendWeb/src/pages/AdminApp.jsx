// src/App.jsx - VERSION MODERNE COMPLÈTE
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Layout Components
import Sidebar from '../components/admin/layout/Sidebar';
import Header from '../components/admin/layout/Header';

// Section Components
import Dashboard from '../components/admin/sections/Dashboard';
import { useSettings } from '../context/SettingsContext';
import { useNotificationCenter, NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

// UI Components
import Toast from '../components/admin/ui/Toast';
import Modal from '../components/admin/ui/Modal';

import { adminRoutes } from './adminapp/adminRoutes';
import { useAdminSocketNotifications } from './adminapp/useAdminSocketNotifications';
import ReportGeneratedModal from './adminapp/ReportGeneratedModal';
import NewContactModal from './adminapp/NewContactModal';

function AdminApp() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const platform = settings?.platform || {};
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [reportGeneratedData, setReportGeneratedData] = useState(null);
  const [newContactData, setNewContactData] = useState(null);
  const [currentDate, setCurrentDate] = useState('');
  const location = useLocation();

  useEffect(() => {
    setCurrentDate(format(new Date(), 'EEEE d MMMM yyyy', { locale: fr }));

    const interval = setInterval(() => {
      setCurrentDate(format(new Date(), 'EEEE d MMMM yyyy', { locale: fr }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const { user } = useAuth();
  const { addNotification } = useNotificationCenter();

  // Real-time socket for Admin
  useAdminSocketNotifications({ user, addNotification, setReportGeneratedData, setNewContactData });

  const showToast = (titleOrObj, message, type = 'success') => {
    let finalTitle, finalMessage, finalType;

    if (typeof titleOrObj === 'object' && titleOrObj !== null) {
      finalTitle = titleOrObj.title || 'Notification';
      finalMessage = titleOrObj.message || '';
      finalType = titleOrObj.type || 'success';
    } else {
      finalTitle = titleOrObj;
      finalMessage = message;
      finalType = type;
    }

    setToast({ title: finalTitle, message: finalMessage, type: finalType });

    // Also add to notification history for the bell icon
    addNotification({
      title: finalTitle,
      message: finalMessage,
      type: finalType === 'error' ? NOTIFICATION_TYPES.ERROR : (finalType === 'warning' ? NOTIFICATION_TYPES.WARNING : NOTIFICATION_TYPES.SUCCESS),
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      showToast: false // We already show it via the local toast state
    });
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
      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}>
        {/* Header */}
        <Header
          currentDate={currentDate}
          onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
          showToast={showToast}
        />
        <main className="content-padding flex-1">
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
                {adminRoutes.map(({ path, Component }) => (
                  <Route key={path} path={path} element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Component showToast={showToast} />
                    </motion.div>
                  } />
                ))}

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
              © {new Date().getFullYear()} {platform.name || 'TakaTaka'} Admin. {t('common.all_rights_reserved') || 'Tous droits réservés.'}
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-all duration-200 text-sm hover:underline">
                {t('common.help') || 'Aide'}
              </a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-all duration-200 text-sm hover:underline">
                {t('common.security') || 'Sécurité'}
              </a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-all duration-200 text-sm hover:underline">
                {t('common.privacy') || 'Confidentialité'}
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notification */}
      <Toast {...toast} onClose={() => setToast(null)} />

      {/* Modale Notification Rapport */}
      <ReportGeneratedModal
        reportData={reportGeneratedData}
        onClose={() => setReportGeneratedData(null)}
      />

      {/* Modale Notification Nouveau Contact */}
      <NewContactModal
        contactData={newContactData}
        onClose={() => setNewContactData(null)}
        showToast={showToast}
      />

      {/* Modal Générique */}
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