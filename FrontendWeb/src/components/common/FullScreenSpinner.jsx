// Spinner plein ecran partage - etait duplique a l'identique entre
// App.jsx (fallback Suspense des routes) et AuthGuard.jsx (verification de
// session), seul le message differait.
const FullScreenSpinner = ({ message = 'Chargement...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-t-primaryGreen-start border-r-primaryBlue-start border-b-primaryGreen-end border-l-primaryBlue-end rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-600 dark:text-slate-300">{message}</p>
    </div>
  </div>
);

export default FullScreenSpinner;
