// 404.jsx
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 animate-fade-in">
      {/* Container principal */}
      <div className="w-full max-w-lg mx-auto">
        {/* Carte avec effets */}
        <div className="relative rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl p-8 md:p-12 transform transition-all duration-300 hover:scale-[1.02]">
          
          {/* Élément décoratif */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              {/* Cercle externe animé */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primaryBlue-start to-primaryGreen-start opacity-10 animate-pulse"></div>
              
              {/* Cercle interne */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primaryBlue-start to-primaryGreen-start flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">404</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="pt-16 text-center">
            {/* Titre */}
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primaryBlue-start to-primaryGreen-start bg-clip-text text-transparent mb-4">
              Page introuvable
            </h1>
            
            {/* Description */}
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              Oups ! Il semble que la page que vous cherchez ait pris une autre direction. 
              Elle pourrait être en pause ou avoir changé d'itinéraire.
            </p>

            {/* Code d'erreur stylisé */}
            <div className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-slate-700/50 rounded-full mb-8">
              <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                Erreur: 404 • Not Found
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
              {/* Bouton Retour */}
              <button
                onClick={() => window.history.back()}
                className="group relative px-6 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Retour
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-600 dark:to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              {/* Bouton Accueil avec gradient */}
              <Link
                to="/"
                className="group relative px-8 py-3 rounded-xl overflow-hidden"
              >
                {/* Fond gradient animé */}
                <div className="absolute inset-0 bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start group-hover:from-primaryGreen-end group-hover:to-primaryBlue-end transition-all duration-500"></div>
                
                {/* Effet de surbrillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                {/* Texte */}
                <span className="relative z-10 text-white font-semibold flex items-center gap-2">
                  Retour à l'accueil
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Lien de contact */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Vous pensez qu'il s'agit d'une erreur ?
              </p>
              <a 
                href="#" 
                className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contacter le support
              </a>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} Votre Application. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;