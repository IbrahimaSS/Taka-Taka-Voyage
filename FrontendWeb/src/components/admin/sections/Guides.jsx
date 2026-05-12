import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Search, FileText, Trash2, Edit2, 
  Download, Eye, Filter, Loader2, Upload, AlertCircle,
  X, Check, ExternalLink, ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Bttn';
import Badge from '../ui/Badge';
import Modal from '../ui/Modale';
import guideService from '../../../services/guideService';

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
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un guide..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategorie(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    filterCategorie === cat.id 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Document</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Ordre</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" /></td>
                    </tr>
                  ))
                ) : filteredGuides.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Aucun guide trouvé</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredGuides.map((guide) => (
                    <tr key={guide._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[250px]">{guide.titre}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[250px]">{guide.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={categories.find(c => c.id === guide.categorie)?.color || 'slate'}>
                          {guide.categorie}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{guide.ordre}</span>
                      </td>
                      <td className="px-6 py-4">
                        {guide.actif ? (
                          <Badge variant="success" dot>Actif</Badge>
                        ) : (
                          <Badge variant="slate" dot>Inactif</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => window.open(guide.fichierUrl, '_blank')}
                            className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                            title="Voir le PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenModal(guide)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteId(guide._id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Ajout/Modif */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={currentGuide ? "Modifier le guide" : "Ajouter un nouveau guide"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Titre du document *</label>
              <input
                type="text"
                required
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                placeholder="Ex: Guide d'utilisation Passager"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description courte *</label>
              <textarea
                required
                rows="2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                placeholder="Décrivez brièvement le contenu du document"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Catégorie *</label>
              <select
                required
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              >
                {categories.filter(c => c.id !== 'ALL').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Ordre d'affichage</label>
              <input
                type="number"
                value={formData.ordre}
                onChange={(e) => setFormData({ ...formData, ordre: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Fichier PDF {currentGuide ? "(Optionnel si inchangé)" : "*"}</label>
              <div className="relative">
                <input
                  type="file"
                  id="guideFile"
                  accept="application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="hidden"
                />
                <label 
                  htmlFor="guideFile"
                  className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all"
                >
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedFile ? selectedFile.name : "Cliquez pour sélectionner le PDF"}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">PDF uniquement, Max 20 Mo</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button 
              variant="outline" 
              fullWidth 
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="perso" 
              fullWidth 
              loading={isSubmitting}
            >
              {currentGuide ? "Mettre à jour" : "Créer le guide"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Suppression */}
      <Modal 
        isOpen={!!deleteId} 
        onClose={() => !isDeleting && setDeleteId(null)}
        title="Supprimer le guide ?"
        size="sm"
      >
        <div className="p-4 text-center">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Cette action est irréversible. Le document sera définitivement supprimé de la plateforme.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setDeleteId(null)} disabled={isDeleting}>Annuler</Button>
            <Button variant="danger" fullWidth onClick={handleDelete} loading={isDeleting}>Supprimer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Guides;
