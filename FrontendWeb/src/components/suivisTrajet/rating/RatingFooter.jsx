import { ShieldCheck, HelpCircle, FileText } from 'lucide-react';

const RatingFooter = ({ platform }) => {
  return (
    <footer className="mt-12 bg-gray-900 dark:bg-black text-white py-8 border-t border-gray-800 transition-colors">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-6">© {new Date().getFullYear()} {platform.name || 'TakaTaka'}. Tous droits réservés.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <button className="text-gray-500 hover:text-white transition-colors text-sm flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Sécurité
            </button>
            <button className="text-gray-500 hover:text-white transition-colors text-sm flex items-center">
              <HelpCircle className="w-4 h-4 mr-2" />
              Aide
            </button>
            <button className="text-gray-500 hover:text-white transition-colors text-sm flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default RatingFooter;
