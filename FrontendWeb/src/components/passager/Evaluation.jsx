import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Filter, Award, Clock, MessageSquare, Handshake, CheckCircle, Crown, Users, User, Car, Calendar } from 'lucide-react';

// Composants réutilisables
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import Button from '../admin/ui/Bttn';
import Badge from '../admin/ui/Badge';
import Progress from '../admin/ui/Progress';
import Pagination from '../admin/ui/Pagination';

import evaluationService from '../../services/evaluationService';

const Evaluations = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('given');

  // États pour les données réelles
  const [givenEvaluations, setGivenEvaluations] = useState([]);
  const [receivedEvaluations, setReceivedEvaluations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    repartition: []
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 5
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const getImageUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("data:") || avatar.startsWith("http")) return avatar;
    const baseUrl = API_URL.replace(/\/api$/, '');
    const cleanPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
    return `${baseUrl}${cleanPath}`;
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch stats
      const statsRes = await evaluationService.getStats();
      if (statsRes.succes) {
        // Formater la répartition pour le composant (backend renvoie [{_id: note, total: count}])
        const repartition = [5, 4, 3, 2, 1].map(stars => {
          const found = statsRes.repartition.find(r => r._id === stars);
          const count = found ? found.total : 0;
          return {
            stars,
            count,
            percentage: statsRes.totalEvaluations > 0 ? (count / statsRes.totalEvaluations) * 100 : 0
          };
        });

        // Calculer la moyenne
        const weightedSum = statsRes.repartition.reduce((acc, curr) => acc + (curr._id * curr.total), 0);
        const average = statsRes.totalEvaluations > 0 ? (weightedSum / statsRes.totalEvaluations).toFixed(1) : "0.0";

        setStats({
          total: statsRes.totalEvaluations,
          average,
          repartition
        });
      }

      // 2. Fetch evaluations (always Given for now, backend list)
      const params = {
        page: currentPage,
        limit: 5,
        note: filter === 'all' ? undefined : filter
      };

      const listRes = await evaluationService.getPassagerEvaluations(params);
      if (listRes.succes) {
        // Mapper les données du backend au format attendu par le composant
        const formatted = listRes.evaluations.map(e => ({
          id: e._id,
          driver: {
            name: `${e.chauffeur?.prenom || ''} ${e.chauffeur?.nom || 'Chauffeur'}`,
            vehicle: 'Véhicule',
            avatar: getImageUrl(e.chauffeur?.photoUrl),
          },
          date: new Date(e.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
          rating: e.noteGlobale,
          comment: e.commentaire,
          tags: mapPointsForts(e.pointsForts),
          tagsColors: (e.pointsForts || []).map(() => 'green')
        }));

        setGivenEvaluations(formatted);
        setPagination({
          total: listRes.pagination.total,
          totalPages: listRes.pagination.totalPages,
          limit: listRes.pagination.limit
        });
      }

    } catch (error) {
      console.error("Erreur lors du chargement des évaluations", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [currentPage, filter]);

  // Helper mapping tags
  const mapPointsForts = (points) => {
    const labels = {
      'CONDUITE_FLUIDE': 'Conduite fluide',
      'VEHICULE_PROPRE': 'Véhicule propre',
      'TRES_PONCTUEL': 'Très ponctuel',
      'SERVICE_COURTOIS': 'Service courtois',
      'PRIX_JUSTE': 'Prix juste'
    };
    return (points || []).map(p => labels[p] || p);
  };

  // Conseils pour de meilleures évaluations (Statique)
  const tips = [
    { icon: Clock, title: 'Soyez ponctuel', description: 'Arrivez au point de rendez-vous à l\'heure' },
    { icon: MessageSquare, title: 'Communiquez clairement', description: 'Informez le chauffeur de vos préférences' },
    { icon: Handshake, title: 'Soyez respectueux', description: 'Un comportement courtois est toujours apprécié' },
    { icon: Star, title: 'Évaluez objectivement', description: 'Notez en fonction de l\'expérience globale' }
  ];

  const filters = [
    { id: 'all', label: 'Toutes' },
    { id: '5', label: '5 étoiles' },
    { id: '4', label: '4 étoiles' },
    { id: '3', label: '3 étoiles' }
  ];

  // Générer les étoiles
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          const isFull = starValue <= Math.floor(rating);
          const isHalf = !isFull && starValue - 0.5 <= rating;

          return (
            <div key={i} className="relative">
              <Star className="w-5 h-5 text-gray-300 dark:text-gray-600" />
              {(isFull || isHalf) && (
                <div className={`absolute top-0 left-0 overflow-hidden ${isHalf ? 'w-1/2' : 'w-full'}`}>
                  <Star className="w-5 h-5 text-amber-400 dark:text-amber-500 fill-amber-400 dark:fill-amber-500" />
                </div>
              )}
            </div>
          );
        })}
        <span className="ml-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          {Number(rating).toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Colonne gauche - Évaluations */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="dark:bg-gray-900 border-none shadow-none">
          <CardHeader className="px-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <CardTitle className="text-gray-900 dark:text-gray-100">Mes évaluations</CardTitle>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('given')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'given' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  Données ({stats.total})
                </button>
                <button
                  onClick={() => setActiveTab('received')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'received' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  Reçues (0)
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">

            {activeTab === 'given' && (
              <>
                {/* Filtres */}
                <div className="flex flex-wrap gap-2 mt-2 mb-6">
                  {filters.map((filterItem) => (
                    <button
                      key={filterItem.id}
                      onClick={() => { setFilter(filterItem.id); setCurrentPage(1); }}
                      className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${filter === filterItem.id ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      {filterItem.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-6">
                  {loading ? (
                    <div className="text-center py-12 text-gray-500">Chargement...</div>
                  ) : givenEvaluations.length > 0 ? (
                    givenEvaluations.map((evaluation, index) => (
                      <motion.div key={evaluation.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                        <Card hoverable={true}>
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-blue-200 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center">
                                  {evaluation.driver.avatar ? (
                                    <img src={evaluation.driver.avatar} alt={evaluation.driver.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <User className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 dark:text-gray-100">{evaluation.driver.name}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {evaluation.date} • {evaluation.driver.vehicle}
                                  </p>
                                </div>
                              </div>
                              <div>{renderStars(evaluation.rating)}</div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">{evaluation.comment || "Aucun commentaire laissé."}</p>
                            {evaluation.tags && evaluation.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {evaluation.tags.map((tag, i) => (
                                  <Badge key={i} variant="success" size="sm">{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <Card><CardContent className="text-center py-12"><Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucune évaluation trouvée</h3></CardContent></Card>
                  )}
                </div>

                {!loading && givenEvaluations.length > 0 && pagination.totalPages > 1 && (
                  <CardFooter className="px-0 mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={setCurrentPage}
                      showInfo={true}
                      totalItems={pagination.total}
                      pageSize={pagination.limit}
                      className="w-full"
                    />
                  </CardFooter>
                )}
              </>
            )}

            {activeTab === 'received' && (
              <Card className="mt-4"><CardContent className="text-center py-12"><Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Bientôt disponible</h3><p className="text-gray-500">Ici s'afficheront les notes que les chauffeurs vous donneront.</p></CardContent></Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Colonne droite - Statistiques et conseils */}
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Statistiques globales</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="text-5xl font-bold text-green-700 dark:text-green-500 mb-2">{stats.average}</div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-8 h-8 ${i < Math.floor(stats.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Basée sur {stats.total} évaluations</p>
            </div>
            <div className="space-y-4">
              {stats.repartition.map((stat) => (
                <div key={stat.stars} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{stat.stars} étoile{stat.stars > 1 ? 's' : ''}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{stat.count}</span>
                  </div>
                  <Progress value={stat.percentage} color={stat.stars >= 4 ? 'green' : stat.stars === 3 ? 'yellow' : 'red'} showLabel={false} size="sm" className="dark:bg-gray-700" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Conseils de voyage</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div key={index} className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{tip.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{tip.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Evaluations;