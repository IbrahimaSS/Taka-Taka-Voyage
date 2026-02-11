import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Star, Filter, Award, Clock, MessageSquare, Handshake,
    CheckCircle, Crown, Users, User, Car, ChevronDown,
    ThumbsUp, ShieldCheck
} from 'lucide-react';

// Composants réutilisables
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';
import Badge from '../../admin/ui/Badge';
import Progress from '../../admin/ui/Progress';
import Pagination from '../../admin/ui/Pagination';

const ChauffeurEvaluations = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState('all');

    const receivedEvaluations = [
        {
            id: 1,
            passenger: { name: 'Aissatou Sow', avatar: null },
            date: '24 Jan 2026',
            rating: 5,
            comment: 'Excellent chauffeur ! Très ponctuel et conduite très souple. La voiture était impeccable.',
            tags: ['Ponctuel', 'Véhicule Propre', 'Expertise'],
        },
        {
            id: 2,
            passenger: { name: 'Mamadou Diallo', avatar: null },
            date: '22 Jan 2026',
            rating: 4,
            comment: 'Bon trajet, chauffeur sympathique. Un peu de musique aurait été sympa.',
            tags: ['Courtois', 'Conduite Sûre'],
        },
        {
            id: 3,
            passenger: { name: 'Fatoumata Camara', avatar: null },
            date: '20 Jan 2026',
            rating: 5,
            comment: 'Trajet parfait pour l\'aéroport. Connaît très bien les raccourcis.',
            tags: ['Rapide', 'Navigation'],
        },
    ];

    const stats = {
        average: 4.9,
        total: 1248,
        distribution: [
            { stars: 5, count: 1120, percentage: 90 },
            { stars: 4, count: 98, percentage: 8 },
            { stars: 3, count: 25, percentage: 1.5 },
            { stars: 2, count: 5, percentage: 0.5 },
            { stars: 1, count: 0, percentage: 0 },
        ]
    };

    const renderStars = (rating) => (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
            ))}
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-1">
            <div className="lg:col-span-2 space-y-6">
                <Card className="surface border-none shadow-sm">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Avis des Passagers</CardTitle>
                            <div className="flex gap-2">
                                {['all', '5', '4', '3'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {f === 'all' ? 'Tous' : `${f} ★`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {receivedEvaluations.map((evalItem, idx) => (
                            <motion.div
                                key={evalItem.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                                            <User className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-gray-900 dark:text-gray-100">{evalItem.passenger.name}</p>
                                            <p className="text-xs text-gray-500">{evalItem.date}</p>
                                        </div>
                                    </div>
                                    {renderStars(evalItem.rating)}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm italic mb-4">"{evalItem.comment}"</p>
                                <div className="flex flex-wrap gap-2">
                                    {evalItem.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" size="xs" className="bg-white dark:bg-gray-800 border-gray-200">{tag}</Badge>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Pagination currentPage={currentPage} totalPages={12} onPageChange={setCurrentPage} />
                    </CardFooter>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="surface bg-primary-600 text-white border-none shadow-xl">
                    <CardContent className="p-8 text-center">
                        <div className="inline-flex p-4 bg-white/20 rounded-3xl mb-4">
                            <Star className="w-12 h-12 text-amber-400 fill-amber-400" />
                        </div>
                        <h2 className="text-5xl font-black mb-1">{stats.average}</h2>
                        <p className="text-primary-100 font-bold uppercase tracking-widest text-xs mb-6">Note Moyenne Globale</p>
                        <div className="space-y-3">
                            {stats.distribution.map(dist => (
                                <div key={dist.stars} className="flex items-center gap-3">
                                    <span className="text-xs font-bold w-4">{dist.stars}★</span>
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-400" style={{ width: `${dist.percentage}%` }} />
                                    </div>
                                    <span className="text-[10px] w-8">{dist.count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="bg-black/10 border-none">
                        <div className="flex items-center justify-center gap-2 text-sm font-bold">
                            <ThumbsUp className="w-4 h-4" />
                            {stats.total} évaluations totales
                        </div>
                    </CardFooter>
                </Card>

                <Card className="surface">
                    <CardHeader><CardTitle>Conseil Pro</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20">
                            <Award className="w-8 h-8 text-amber-600 shrink-0" />
                            <div>
                                <p className="font-bold text-amber-900 dark:text-amber-100 text-sm">Maintenez 4.8+</p>
                                <p className="text-xs text-amber-800/80 dark:text-amber-200/80">Les chauffeurs avec une note &gt; 4.8 reçoivent 25% de courses en plus en priorité.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ChauffeurEvaluations;
