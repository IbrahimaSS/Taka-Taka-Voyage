import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socketService';

import Navbar from '../components/home/Navbar';
import HeroSection from '../components/home/HeroSection';
import PassagersSection from '../components/home/PassagersSection';
import ChauffeursSection from '../components/home/ChauffeursSection';
import FlotteBTransSection from '../components/home/FlotteBTransSection';
import FonctionnalitesSection from '../components/home/FonctionnalitesSection';
import ContactSection from '../components/home/ContactSection';
import Footer from '../components/home/Footer';

const HomePage = () => {
  const [selectedOption, setSelectedOption] = useState('standard');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Si l'utilisateur n'est pas authentifié, on le connecte en tant qu'invité
    // pour qu'il reçoive les notifications de nouveaux véhicules
    if (!isAuthenticated && !socketService.isConnected()) {
      socketService.connect(); // Par défaut, connecte en GUEST
    }
  }, [isAuthenticated]);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <PassagersSection selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      <ChauffeursSection />
      <FlotteBTransSection />
      <FonctionnalitesSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default HomePage;