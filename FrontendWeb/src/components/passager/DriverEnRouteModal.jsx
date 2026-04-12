import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, Phone, QrCode } from 'lucide-react';
import { usePassenger } from '../../context/PassengerContext';
 
const DriverEnRouteModal = ({ driver, onTrack, onContact, status, tripDetails }) => {
    const { activeTicket } = usePassenger();
    if (!driver) return null;

    const isArrived = status === 'arrived';

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed bottom-24 right-4 z-[9999] pointer-events-none flex justify-end"
        >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-l-4 border-green-500 p-4 w-80 pointer-events-auto backdrop-blur-xl">
                <div className="flex items-center space-x-4">
                    {/* Photo Chauffeur */}
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden border-2 border-blue-500 shadow-md">
                            {(() => {
                                const avatar = driver.photo;
                                if (avatar && (avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('/'))) {
                                    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                    const baseUrl = apiURL.replace(/\/api$/, '');
                                    const avatarUrl = (avatar.startsWith('data:') || avatar.startsWith('http'))
                                        ? avatar
                                        : `${baseUrl}${avatar.startsWith('/') ? avatar : `/${avatar}`}`;

                                    return (
                                        <img
                                            src={avatarUrl}
                                            alt=""
                                            className="h-full w-full object-cover absolute inset-0 z-10"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    );
                                }
                                return null;
                            })()}
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-lg uppercase">
                                {driver.name ? driver.name.split(' ').map(n => n[0]).filter(c => /[a-z0-9]/i.test(c)).join('').slice(0, 2) : '?'}
                            </div>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 ${isArrived ? 'bg-emerald-500' : 'bg-green-500'} w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 animate-pulse`}></div>
                    </div>

                    {/* Infos Textuelles */}
                    <div className="flex-1 min-w-0 mr-4">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                            {driver.name}
                        </h4>
                        <p className={`text-sm ${isArrived ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'} font-medium truncate`}>
                            {isArrived ? 'Est arrivé ! ✅' : 'Est en route vers vous'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {driver.vehicle?.brand} {driver.vehicle?.model} • {driver.vehicle?.plate}
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent('taka:open_ticket', { detail: activeTicket || tripDetails }));
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center space-x-2 text-xs font-black uppercase tracking-wider"
                    >
                        <QrCode className="w-4 h-4" />
                        <span>Mon Ticket</span>
                    </button>

                    <button
                        onClick={onTrack}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center space-x-2 text-xs font-black uppercase tracking-wider"
                    >
                        <Navigation className="w-4 h-4" />
                        <span>Carte</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default DriverEnRouteModal;
