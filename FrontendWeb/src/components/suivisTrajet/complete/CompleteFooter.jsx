import { ShieldCheck, HelpCircle, FileText } from 'lucide-react';

const CompleteFooter = () => (
  <footer className="mt-12 bg-gray-900 dark:bg-black text-white py-8 border-t border-gray-800">
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center">
        <p className="text-gray-500 mb-6">© 2024 TakaTaka. Tous droits réservés.</p>
        <div className="flex justify-center gap-6">
          <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
            <ShieldCheck className="w-4 h-4 inline mr-2" />
            Sécurité
          </a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
            <HelpCircle className="w-4 h-4 inline mr-2" />
            Aide
          </a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
            <FileText className="w-4 h-4 inline mr-2" />
            Conditions
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default CompleteFooter;
