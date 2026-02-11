import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Filter, Award, Clock, MessageSquare, Handshake, CheckCircle, Crown, Users, User, Car, ChevronLeft, ChevronRight } from 'lucide-react';

// Composants réutilisables
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import Button from '../admin/ui/Bttn';
import Badge from '../admin/ui/Badge';
import Tabs from '../admin/ui/Tabs';
import Progress from '../admin/ui/Progress';
import Pagination from '../admin/ui/Pagination';

const Evaluations = () => {

  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');

  // Évaluations données par le passager
  const givenEvaluations = [
    {
      id: 1,
      driver: {
        name: 'Baldé Fela',
        vehicle: 'Toyota Corolla',
        avatar: null,
      },
      date: '05 Déc 2025',
      rating: 4,
      comment: 'Conduite très sécuritaire et voiture propre. Arrivé à l\'heure exacte. Je recommande!',
      tags: ['Ponctuel', 'Voiture propre', 'Conduite sûre'],
      tagsColors: ['blue', 'green', 'purple'],
    },
    {
      id: 2,
      driver: {
        name: 'Soumah Ibrahima',
        vehicle: 'Moto-taxi',
        avatar: null,
      },
      date: '03 Déc 2025',
      rating: 5,
      comment: 'Excellent service! Casque fourni et conduite prudente malgré le trafic. Arrivé rapidement à destination.',
      tags: ['Rapide', 'Équipement fourni', 'Connaît les raccourcis'],
      tagsColors: ['blue', 'green', 'yellow'],
    },
    {
      id: 3,
      driver: {
        name: 'Tara Man',
        vehicle: 'Voiture privée',
        avatar: null,
      },
      date: '01 Déc 2025',
      rating: 4.5,
      comment: 'Bon chauffeur, voiture confortable. Un peu de retard à cause du trafic mais a prévenu à l\'avance.',
      tags: ['Climatisation', 'Voiture confortable', 'Légèrement en retard'],
      tagsColors: ['blue', 'green', 'red'],
    },
  ];

  // Évaluations reçues par le passager
  const receivedEvaluations = [
    {
      id: 1,
      driver: {
        name: 'Mamadou Fela',
        vehicle: 'Taxi',
        avatar: null,
      },
      date: '03 Déc 2025',
      rating: 5,
      comment: 'Passager très ponctuel et agréable!',
    },
    {
      id: 2,
      driver: {
        name: 'Soumah Ibrahima',
        vehicle: 'Moto-taxi',
        avatar: null,
      },
      date: '01 Déc 2025',
      rating: 4.5,
      comment: 'Communication claire, trajet agréable.',
    },
  ];

  // Statistiques des évaluations
  const ratingStats = [
    { stars: 5, count: 18, percentage: 75 },
    { stars: 4, count: 4, percentage: 16.7 },
    { stars: 3, count: 2, percentage: 8.3 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  // Conseils pour de meilleures évaluations
  const tips = [
    {
      icon: Clock,
      title: 'Soyez ponctuel',
      description: 'Arrivez au point de rendez-vous à l\'heure',
    },
    {
      icon: MessageSquare,
      title: 'Communiquez clairement',
      description: 'Informez le chauffeur de vos préférences',
    },
    {
      icon: Handshake,
      title: 'Soyez respectueux',
      description: 'Un comportement courtois est toujours apprécié',
    },
    {
      icon: Star,
      title: 'Évaluez objectivement',
      description: 'Notez en fonction de l\'expérience globale',
    },
  ];

  const badges = [
    {
      id: 1,
      name: 'Passager exemplaire',
      description: '10 trajets parfaits',
      icon: CheckCircle,
      color: 'green',
      earned: true,
    },
    {
      id: 2,
      name: 'Membre fidèle',
      description: '6 mois d\'activité',
      icon: Crown,
      color: 'yellow',
      earned: true,
    },
    {
      id: 3,
      name: 'Social',
      description: '3 chauffeurs recommandés',
      icon: Users,
      color: 'blue',
      earned: false,
    },
    {
      id: 4,
      name: 'Critique positif',
      description: '15 évaluations données',
      icon: Star,
      color: 'purple',
      earned: true,
    },
  ];

  const filters = [
    { id: 'all', label: 'Toutes' },
    { id: '5', label: '5 étoiles' },
    { id: '4', label: '4 étoiles' },
    { id: '3', label: '3 étoiles' },
  ];

  const tabs = [
    { id: 'given', label: 'Évaluations données', count: givenEvaluations.length },
    { id: 'received', label: 'Évaluations reçues', count: receivedEvaluations.length },
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
                <div
                  className={`absolute top-0 left-0 overflow-hidden ${isHalf ? 'w-1/2' : 'w-full'
                    }`}
                >
                  <Star className="w-5 h-5 text-amber-400 dark:text-amber-500 fill-amber-400 dark:fill-amber-500" />
                </div>
              )}
            </div>
          );
        })}
        <span className="ml-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const getEvaluations = () => {
    const evaluations = givenEvaluations;

    if (filter === 'all') return evaluations;

    const minRating = parseInt(filter);
    return evaluations.filter(evaluation => Math.floor(evaluation.rating) === minRating);
  };

  const currentEvaluations = getEvaluations();
  const totalPages = Math.ceil(currentEvaluations.length / 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Colonne gauche - Évaluations */}
      <div className="lg:col-span-2 space-y-6">
        {/* En-tête avec tabs */}
        <Card className="dark:bg-gray-900 border-none shadow-none">
          <CardHeader className="px-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="text-gray-900 dark:text-gray-100">Mes évaluations</CardTitle>

              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Button
                    variant="secondary"
                    icon={Filter}
                    onClick={() => { }}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  >
                    Filtrer
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">


            {/* Filtres */}
            <div className="flex flex-wrap gap-2 mt-6 mb-6">
              {filters.map((filterItem) => (
                <button
                  key={filterItem.id}
                  onClick={() => setFilter(filterItem.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${filter === filterItem.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  {filterItem.label}
                </button>
              ))}
            </div>

            {/* Liste des évaluations */}
            <div className="space-y-6">
              {currentEvaluations.length > 0 ? (
                currentEvaluations.map((evaluation, index) => (
                  <motion.div
                    key={evaluation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card hoverable={true}>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-blue-200 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center">
                              {evaluation.driver.avatar ? (
                                <img
                                  src={evaluation.driver.avatar}
                                  alt={evaluation.driver.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-gray-100">
                                {evaluation.driver.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {evaluation.date} • {evaluation.driver.vehicle}
                              </p>
                            </div>
                          </div>
                          <div>
                            {renderStars(evaluation.rating)}
                          </div>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {evaluation.comment}
                        </p>

                        {evaluation.tags && (
                          <div className="flex flex-wrap gap-2">
                            {evaluation.tags.map((tag, i) => (
                              <Badge
                                key={i}
                                variant={evaluation.tagsColors[i] || 'default'}
                                size="sm"
                                className="mb-1"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Aucune évaluation trouvée
                    </h3>

                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>

          {currentEvaluations.length > 0 && (
            <CardFooter>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showInfo={true}
                totalItems={currentEvaluations.length}
                pageSize={3}
                className="w-full"
              />
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Colonne droite - Statistiques et conseils */}
      <div className="space-y-6">
        {/* Note moyenne */}
        <Card>
          <CardHeader>
            <CardTitle>Ma note moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="text-5xl font-bold text-green-700 dark:text-green-500 mb-2">
                4.8
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-8 h-8 ${i < 4
                        ? 'text-amber-400 dark:text-amber-500 fill-amber-400 dark:fill-amber-500'
                        : 'text-amber-400 dark:text-amber-500'
                      }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Basée sur 24 trajets
              </p>
            </div>

            <div className="space-y-4">
              {ratingStats.map((stat) => (
                <div key={stat.stars} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {stat.stars} étoile{stat.stars > 1 ? 's' : ''}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {stat.count}
                    </span>
                  </div>
                  <Progress
                    value={stat.percentage}
                    color={
                      stat.stars === 5 ? 'green' :
                        stat.stars === 4 ? 'blue' :
                          stat.stars === 3 ? 'yellow' :
                            stat.stars === 2 ? 'orange' :
                              'red'
                    }
                    showLabel={false}
                    size="sm"
                    className="dark:bg-gray-700"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conseils pour de meilleures évaluations */}
        <Card>
          <CardHeader>
            <CardTitle>Conseils pour de meilleures évaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {tip.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {tip.description}
                      </p>
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