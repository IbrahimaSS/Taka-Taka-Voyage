import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Nouveau chauffeur inscrit',
      description: 'Kouamé Adou vient de s\'inscrire',
      time: 'Il y a 5 min',
      icon: 'user-check',
      color: 'green',
      read: false
    }
  ]);
  const [modals, setModals] = useState({
    validation: false,
    confirmation: false,
    payment: false,
    driverDetails: false
  });
  const [modalData, setModalData] = useState({});

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const openModal = (modalName, data = {}) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    setModalData(data);
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setModalData({});
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Acceuil', icon: 'LayoutDashboard', badge: null },
    { id: 'users', label: 'Utilisateurs', icon: 'Users', badge: 24 },
    { id: 'drivers', label: 'Chauffeurs', icon: 'Car', badge: 156 },
    { id: 'trips', label: 'Trajets', icon: 'Route', badge: '2.4K' },
    { id: 'payments', label: 'Paiements', icon: 'Wallet', badge: null },
    { id: 'validations', label: 'Validations', icon: 'CheckCircle', badge: 12 },
    { id: 'disputes', label: 'Litiges', icon: 'AlertTriangle', badge: 8 },
    { id: 'documents', label: 'Documents', icon: 'FileText', badge: null },
    { id: 'reports', label: 'Rapports', icon: 'BarChart3', badge: null },
    { id: 'commissions', label: 'Commissions', icon: 'Percent', badge: null },
    { id: 'settings', label: 'Paramètres', icon: 'Settings', badge: null },
  ];

  const stats = {
    totalUsers: 2450,
    activeDrivers: 156,
    todayTrips: 342,
    totalRevenue: '4.2M GNF',
    users: {
      active: 1842,
      newThisMonth: 127,
      avgRating: 4.7
    }
  };

  return (
    <AppContext.Provider value={{
      sidebarCollapsed,
      mobileMenuOpen,
      activeSection,
      menuItems,
      notifications,
      stats,
      modals,
      modalData,
      toggleSidebar,
      toggleMobileMenu,
      setActiveSection,
      openModal,
      closeModal,
      markNotificationAsRead,
      clearAllNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
};