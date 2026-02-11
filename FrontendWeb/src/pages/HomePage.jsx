import React, { useState } from 'react';

import Navbar from '../components/home/Navbar';
import HeroSection from '../components/home/HeroSection';
import PassagersSection from '../components/home/PassagersSection';
import ChauffeursSection from '../components/home/ChauffeursSection';
import FonctionnalitesSection from '../components/home/FonctionnalitesSection';
import ContactSection from '../components/home/ContactSection';
import Footer from '../components/home/Footer';

const HomePage = () => {
  const [selectedOption, setSelectedOption] = useState('standard');

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">


      <Navbar />
      <HeroSection />
      <PassagersSection selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      <ChauffeursSection />
      <FonctionnalitesSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default HomePage;