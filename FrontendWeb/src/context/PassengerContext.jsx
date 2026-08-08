// src/context/PassengerContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from './AuthContext';
import { useNotificationCenter } from "./NotificationContext";
import { useProfileState } from './passenger/useProfileState';
import { useGeolocation } from './passenger/useGeolocation';
import { useTripLifecycle } from './passenger/useTripLifecycle';

const PassengerContext = createContext();
export const usePassenger = () => {
  const context = useContext(PassengerContext);
  return context || null;
};

export const PassengerProvider = ({ children }) => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const { addNotification } = useNotificationCenter();

  const [currentPage, setCurrentPage] = useState("home");

  const { passenger, setPassenger, isLoadingProfile, updatePassenger } = useProfileState({ user, updateAuthUser });
  const { userLocation, hasLocationPermission, isLoadingLocation, retryLocation } = useGeolocation();

  const {
    currentTrip, setCurrentTrip,
    tripStatus, setTripStatus,
    selectedDriver, setSelectedDriver,
    pendingTicket, setPendingTicket,
    activeTicket, setActiveTicket,
    trips,
    transactions,
    defineTrip,
    confirmTrip,
    cancelTripByPassenger,
    completeTrip,
  } = useTripLifecycle({ user, passenger, addNotification, userLocation, setCurrentPage });

  // 🤖 [IA] Écouter les demandes de navigation (changement d'onglets)
  useEffect(() => {
    const handleIANavigation = (event) => {
      const { page, role } = event.detail;
      if (role === 'PASSENGER' || role === 'PASSAGER') {
        console.log(`🤖 [CONTEXT] Navigation IA reçue vers: ${page}`);
        if (page) setCurrentPage(page);
      }
    };

    window.addEventListener('taka-ia-navigation', handleIANavigation);
    return () => window.removeEventListener('taka-ia-navigation', handleIANavigation);
  }, []);

  const value = useMemo(
    () => ({
      passenger,
      setPassenger,
      updatePassenger,
      isLoadingProfile,
      currentPage,
      setCurrentPage,
      trips,
      transactions,
      currentTrip,
      setCurrentTrip,
      tripStatus,
      setTripStatus,
      selectedDriver,
      setSelectedDriver,
      pendingTicket,
      setPendingTicket,
      activeTicket,
      setActiveTicket,
      userLocation,
      hasLocationPermission,
      isLoadingLocation,
      retryLocation,
      defineTrip,
      confirmTrip,
      cancelTripByPassenger,
      completeTrip,
    }),
    [
      passenger,
      isLoadingProfile,
      currentPage,
      trips,
      transactions,
      currentTrip,
      setCurrentTrip,
      tripStatus,
      setTripStatus,
      selectedDriver,
      setSelectedDriver,
      pendingTicket,
      activeTicket,
      userLocation,
      hasLocationPermission,
      isLoadingLocation,
    ]
  );

  return <PassengerContext.Provider value={value}>{children}</PassengerContext.Provider>;
};
