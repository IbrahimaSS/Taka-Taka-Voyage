import React from 'react';
import { 
  Car, 
  Apple, 
  Facebook,
  Twitter, 
  Instagram, 
  Linkedin, 
  ArrowUpRight,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react';

import Button from '../../ui/Buttons';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  const navigationLinks = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'chauffeurs', label: 'Chauffeurs' },
    { id: 'passagers', label: 'Passagers' },
    { id: 'fonctionnalites', label: 'Fonctionnalités' },
  ];

  const companyLinks = [
    { label: 'À propos', href: '#about' },
    { label: 'Carrières', href: '#careers' },
    { label: 'Presse', href: '#press' },
    { label: 'Blog', href: '#blog' },
  ];

  const legalLinks = [
    { label: 'Confidentialité', href: '#privacy' },
    { label: 'Conditions', href: '#terms' },
    { label: 'Cookies', href: '#cookies' },
    { label: 'Sécurité', href: '#security' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gray-900 text-white py-16 px-6">
      <div className="container mx-auto">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-10">
          {/* Logo & Description */}
          <div className="md:w-1/3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start flex items-center justify-center">
                <Car className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">TAKA TAKA</h1>
                <p className="text-gray-400 text-sm font-medium">Mobilité Intelligente</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md">
              La solution de mobilité urbaine la plus complète, connectant passagers et chauffeurs en temps réel.
            </p>
            
            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin size={16} />
                <span>Rue du Commerce, Kaloum, Conakry, Guinée</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone size={16} />
                <span>+224 123 45 67 89</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Mail size={16} />
                <span>contact@takataka.gn</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-16">
            {/* Navigation */}
            <div>
              <h3 className="font-bold text-lg mb-5 text-white flex items-center gap-2">
                <ArrowUpRight size={18} />
                Navigation
              </h3>
              <ul className="space-y-3">
                {navigationLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollToSection(link.id)}
                      className="footer-link text-gray-400 hover:text-primaryGreen-start transition duration-300 text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Entreprise */}
            <div>
              <h3 className="font-bold text-lg mb-5 text-white flex items-center gap-2">
                <Globe size={18} />
                Entreprise
              </h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="footer-link text-gray-400 hover:text-primaryBlue-start transition duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h3 className="font-bold text-lg mb-5 text-white">Légal</h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="footer-link text-gray-400 hover:text-white transition duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <div className="flex items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Taka Taka. Tous droits réservés.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={scrollToTop}
            >
              Retour en haut
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-gray-400 hover:text-white text-xl transition duration-300 transform hover:-translate-y-1 hover:scale-110"
                aria-label={social.label}
              >
                <social.icon size={24} />
              </a>
            ))}
          </div>
        </div>

        {/* Mobile Apps CTA */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 mb-4">Téléchargez notre application mobile</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;