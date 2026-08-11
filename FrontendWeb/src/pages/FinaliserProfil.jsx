import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { useNavigate } from 'react-router-dom';
import { Phone, User, CheckCircle2, ChevronRight, LogOut, Car } from 'lucide-react';
import { API_ROUTES } from '../services/apiRoutes';
import Button from '../components/admin/ui/Bttn';

const FinaliserProfil = () => {
    const { user, setUser, logout, checkAuth } = useAuth();
    const [telephone, setTelephone] = useState('');
    const [role, setRole] = useState('PASSAGER');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!telephone || telephone.length < 8) {
            setError('Veuillez entrer un numéro de téléphone valide.');
            return;
        }

        setIsLoading(true);
        try {
            // On utilise un endpoint existant ou on en crée un. 
            // Pour l'instant on suppose un endpoint de mise à jour de profil
            const response = await apiClient.put(API_ROUTES.auth.socialFinalize, {
                telephone,
                role
            });

            if (response.data.succes) {
                // Mettre à jour le user en local
                await checkAuth();
                const target = role === 'CHAUFFEUR' ? '/chauffeur' : '/passager';
                navigate(target);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la validation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primaryGreen-start to-primaryBlue-start rounded-2xl flex items-center justify-center shadow-xl shadow-primaryBlue-start/20 transition-all duration-300 hover:scale-105">
                        <User className="w-10 h-10 text-white" />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    Finalisez votre profil
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    Heureux de vous voir, <span className="font-bold bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start bg-clip-text text-transparent px-1">{user?.prenom || 'Voyageur'}</span> ! <br />
                    Une dernière étape pour commencer l'aventure Taka Taka.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-2xl shadow-slate-200/50 dark:shadow-none sm:rounded-3xl sm:px-10 border border-slate-100 dark:border-slate-800 backdrop-blur-sm bg-opacity-80">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Votre numéro de téléphone
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primaryGreen-start">
                                    <Phone className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="tel"
                                    required
                                    value={telephone}
                                    onChange={(e) => setTelephone(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primaryGreen-start/50 focus:border-primaryGreen-start transition-all"
                                    placeholder="Ex: 622 00 00 00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                                Vous êtes ?
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('PASSAGER')}
                                    className={`relative p-4 flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${role === 'PASSAGER'
                                        ? 'border-primaryGreen-start bg-primaryGreen-start/5 text-primaryGreen-start'
                                        : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    <User className="w-8 h-8 mb-2" />
                                    <span className="font-bold text-sm uppercase tracking-wider">Passager</span>
                                    {role === 'PASSAGER' && <CheckCircle2 className="absolute top-2 right-2 w-5 h-5" />}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRole('CHAUFFEUR')}
                                    className={`relative p-4 flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${role === 'CHAUFFEUR'
                                        ? 'border-primaryBlue-start bg-primaryBlue-start/5 text-primaryBlue-start'
                                        : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    <Car className="w-8 h-8 mb-2" />
                                    <span className="font-bold text-sm uppercase tracking-wider">Chauffeur</span>
                                    {role === 'CHAUFFEUR' && <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-primaryBlue-start" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-center gap-3 animate-shake">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                            </div>
                        )}

                        <div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                fullWidth
                                className="!h-14 !bg-gradient-to-r !from-primaryGreen-start !to-primaryBlue-start !rounded-2xl !shadow-xl shadow-primaryGreen-start/20 active:scale-95 gap-3 overflow-hidden group"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="tracking-wide">C'est parti !</span>
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                        <button
                            onClick={() => logout()}
                            className="text-slate-500 hover:text-red-500 dark:text-slate-400 flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Utiliser un autre compte
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinaliserProfil;
