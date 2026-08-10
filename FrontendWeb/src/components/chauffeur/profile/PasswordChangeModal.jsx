import { Lock } from 'lucide-react';
import Button from '../../admin/ui/Bttn';
import Modal from '../../admin/ui/Modal';

const PasswordChangeModal = ({ isOpen, onClose, passwordData, setPasswordData, isChangingPassword, onSubmit }) => (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
        <div className="p-2">
            <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center mr-4 shadow-lg shrink-0">
                    <Lock className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Mot de passe</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Renforcez la sécurité de votre compte</p>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mot de passe actuel</label>
                    <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="••••••••"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nouveau mot de passe</label>
                    <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="••••••••"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Confirmer le nouveau mot de passe</label>
                    <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="••••••••"
                    />
                </div>
            </div>
            <div className="flex gap-3 mt-8">
                <Button variant="secondary" fullWidth onClick={onClose}>Annuler</Button>
                <Button variant="primary" fullWidth onClick={onSubmit} loading={isChangingPassword}>Confirmer</Button>
            </div>
        </div>
    </Modal>
);

export default PasswordChangeModal;
