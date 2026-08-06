import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Bttn';
import ConfirmModal from '../ui/ConfirmModal';
import guideService from '../../../services/guideService';
import GuidesFilterBar from './guides/GuidesFilterBar';
import GuidesTable from './guides/GuidesTable';
import GuideFormModal from './guides/GuideFormModal';

const Guides = ({ showToast }) => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGuide, setCurrentGuide] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    categorie: 'PASSAGER',
    icone: 'FileText',
    ordre: 0,
    actif: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const { data } = await guideService.getAll();
      if (data.succes) {
        setGuides(data.guides);
      }
    } catch (err) {
      console.error('Erreur chargement guides:', err);
      showToast('Erreur', 'Impossible de charger les guides', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (guide = null) => {
    if (guide) {
      setCurrentGuide(guide);
      setFormData({
        titre: guide.titre,
        description: guide.description,
        categorie: guide.categorie,
        icone: guide.icone,
        ordre: guide.ordre,
        actif: guide.actif
      });
    } else {
      setCurrentGuide(null);
      setFormData({
        titre: '',
        description: '',
        categorie: 'PASSAGER',
        icone: 'FileText',
        ordre: 0,
        actif: true
      });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('titre', formData.titre);
    data.append('description', formData.description);
    data.append('categorie', formData.categorie);
    data.append('icone', formData.icone);
    data.append('ordre', formData.ordre);
    data.append('actif', formData.actif);

    if (selectedFile) {
      data.append('fichier', selectedFile);
    } else if (!currentGuide) {
      showToast('Attention', 'Le fichier PDF est requis pour un nouveau guide', 'warning');
      setIsSubmitting(false);
      return;
    }

    try {
      let response;
      if (currentGuide) {
        response = await guideService.update(currentGuide._id, data);
      } else {
        response = await guideService.create(data);
      }

      if (response.data.succes) {
        showToast('Succès', currentGuide ? 'Guide mis à jour' : 'Guide créé avec succès', 'success');
        setIsModalOpen(false);
        fetchGuides();
      }
    } catch (err) {
      console.error('Erreur soumission guide:', err);
      showToast('Erreur', err.response?.data?.message || 'Une erreur est survenue', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { data } = await guideService.delete(deleteId);
      if (data.succes) {
        showToast('Succès', 'Guide supprimé', 'success');
        setDeleteId(null);
        fetchGuides();
      }
    } catch (err) {
      showToast('Erreur', 'Impossible de supprimer le guide', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredGuides = guides.filter(g => {
    const matchesSearch = g.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategorie = filterCategorie === 'ALL' || g.categorie === filterCategorie;
    return matchesSearch && matchesCategorie;
  });

  const categories = [
    { id: 'ALL', label: 'Toutes', color: 'slate' },
    { id: 'PASSAGER', label: 'Passagers', color: 'blue' },
    { id: 'CHAUFFEUR', label: 'Chauffeurs', color: 'amber' },
    { id: 'ETUDE', label: 'Étude', color: 'purple' },
    { id: 'FAQ', label: 'FAQ', color: 'emerald' },
    { id: 'LEGAL', label: 'Légal', color: 'slate' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guides & Documentation</h1>
          <p className="text-slate-500 dark:text-slate-400">Gérez les documents d'aide publics de la plateforme</p>
        </div>
        <Button variant="perso" icon={Plus} onClick={() => handleOpenModal()}>
          Ajouter un guide
        </Button>
      </div>

      <Card>
        <GuidesFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          filterCategorie={filterCategorie}
          onFilterChange={setFilterCategorie}
        />
        <GuidesTable
          guides={filteredGuides}
          loading={loading}
          categories={categories}
          onEdit={handleOpenModal}
          onDelete={setDeleteId}
        />
      </Card>

      <GuideFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentGuide={currentGuide}
        formData={formData}
        onFieldChange={handleFieldChange}
        categories={categories}
        selectedFile={selectedFile}
        onFileChange={setSelectedFile}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => !isDeleting && setDeleteId(null)}
        onConfirm={handleDelete}
        type="delete"
        message="Cette action est irréversible. Le document sera définitivement supprimé de la plateforme."
        loading={isDeleting}
      />
    </div>
  );
};

export default Guides;
