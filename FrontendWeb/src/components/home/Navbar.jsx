import React, { useMemo, useState } from 'react';
import { Car, Download, LogIn, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '../../ui/Buttons';
import { ThemeToggle } from '../../ui/ThemeToggle';
import { cn } from '../../utils/cn';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = useMemo(
    () => [
      { id: 'accueil', label: 'Accueil' },
      { id: 'passagers', label: 'Passagers' },
      { id: 'chauffeurs', label: 'Chauffeurs' },
      { id: 'fonctionnalites', label: 'Fonctionnalités' },
      { id: 'contact', label: 'Contact' },
    ],
    []
  );

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <button
              type="button"
              onClick={() => scrollToSection('accueil')}
              className="flex items-center gap-3 group"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-sm">
                <Car className="h-5 w-5 text-white" />
              </span>
              <span className="leading-tight text-left">
                <span className="block text-sm font-semibold tracking-wide text-slate-900 dark:text-white">
                  TAKATAKA
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  Mobilité & Logistique
                </span>
              </span>
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                    'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70',
                    'dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-800/50'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle className="hidden sm:inline-flex" />

              <button
                type="button"
                onClick={() => navigate('/connexion')}
                className={cn(
                  'hidden md:inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70',
                  'dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-800/50'
                )}
              >
                <LogIn className="h-4 w-4" />
                Connexion
              </button>

              <Button
                variant="gradientMix"
                size="sm"
                onClick={() => scrollToSection('telecharger')}
                icon={<Download className="h-4 w-4" />}
              >
                Télécharger
              </Button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                className={cn(
                  'md:hidden inline-flex items-center justify-center rounded-xl p-2 border border-slate-200 bg-white/60',
                  'text-slate-700 hover:bg-slate-100/70 transition-colors',
                  'dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800/50'
                )}
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="mx-auto max-w-7xl px-4 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Navigation
                </span>
                <ThemeToggle />
              </div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                    'text-slate-700 hover:bg-slate-100/70',
                    'dark:text-slate-200 dark:hover:bg-slate-800/50'
                  )}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/connexion');
                }}
                className={cn(
                  'w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border border-slate-200',
                  'text-slate-700 hover:bg-slate-100/70 transition-colors',
                  'dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/50'
                )}
              >
                <LogIn className="h-4 w-4" />
                Connexion
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
