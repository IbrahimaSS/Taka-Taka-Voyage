import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import evaluationService from '../../../services/evaluationService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getImageUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("data:") || avatar.startsWith("http")) return avatar;
  const baseUrl = API_URL.replace(/\/api$/, '');
  const cleanPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
  return `${baseUrl}${cleanPath}`;
};

export const useEvaluationsData = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('given');

  const [givenEvaluations, setGivenEvaluations] = useState([]);
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

  // Helper mapping tags
  const mapPointsForts = (points) => {
    const labels = {
      'CONDUITE_FLUIDE': t('evaluations.tags.CONDUITE_FLUIDE'),
      'VEHICULE_PROPRE': t('evaluations.tags.VEHICULE_PROPRE'),
      'TRES_PONCTUEL': t('evaluations.tags.TRES_PONCTUEL'),
      'SERVICE_COURTOIS': t('evaluations.tags.SERVICE_COURTOIS'),
      'PRIX_JUSTE': t('evaluations.tags.PRIX_JUSTE')
    };
    return (points || []).map(p => labels[p] || p);
  };

  useEffect(() => {
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
              name: `${e.chauffeur?.prenom || ''} ${e.chauffeur?.nom || t('evaluations.driver')}`,
              vehicle: t('evaluations.vehicle'),
              avatar: getImageUrl(e.chauffeur?.photoUrl),
            },
            date: new Date(e.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
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

    fetchData();
  }, [currentPage, filter]);

  return {
    currentPage, setCurrentPage,
    filter, setFilter,
    loading,
    activeTab, setActiveTab,
    givenEvaluations,
    stats,
    pagination,
  };
};
