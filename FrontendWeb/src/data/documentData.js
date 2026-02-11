// src/data/documentData.js

// Types de documents
export const documentTypes = [
  { id: 'license', label: 'Permis de conduire', icon: 'IdCard', color: 'blue', required: true },
  { id: 'id_card', label: "Carte d'identité", icon: 'User', color: 'purple', required: true },
  { id: 'registration', label: 'Carte grise', icon: 'Car', color: 'green', required: true },
  { id: 'insurance', label: 'Assurance', icon: 'Shield', color: 'orange', required: true },
  { id: 'inspection', label: 'Contrôle technique', icon: 'FileCheck', color: 'red', required: true },
  { id: 'medical', label: 'Certificat médical', icon: 'FileText', color: 'teal', required: false },
  { id: 'bank', label: 'RIB', icon: 'FileText', color: 'indigo', required: false },
  { id: 'photo', label: "Photo d'identité", icon: 'User', color: 'pink', required: true }
];

// Statuts de documents
export const statusTypes = [
  { id: 'valid', label: 'Valide', icon: 'CheckCircle', color: 'success', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  { id: 'rejected', label: 'Rejeté', icon: 'FileX', color: 'error', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  { id: 'pending', label: 'En attente', icon: 'Clock', color: 'warning', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
  { id: 'expired', label: 'Expiré', icon: 'XCircle', color: 'error', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  { id: 'expiring', label: 'Expire bientôt', icon: 'AlertTriangle', color: 'warning', bgColor: 'bg-orange-50', textColor: 'text-orange-700' }
];

// Données simulées de chauffeurs
export const mockDrivers = [
  {
    id: 1,
    name: 'Kouamé Adou',
    role: 'chauffeur',
    phone: '+225 01 23 45 67 89',
    email: 'kouame@example.com',
    status: 'active',
    hireDate: '2022-03-15'
  },
  {
    id: 2,
    name: 'Aïcha Diarra',
    role: 'chauffeur',
    phone: '+225 07 89 12 34 56',
    email: 'aicha@example.com',
    status: 'active',
    hireDate: '2022-06-20'
  },
  {
    id: 3,
    name: 'Mohamed Sylla',
    role: 'chauffeur',
    phone: '+225 05 67 89 01 23',
    email: 'mohamed@example.com',
    status: 'active',
    hireDate: '2023-01-10'
  },
  {
    id: 4,
    name: 'Fatoumata Bâ',
    role: 'chauffeur',
    phone: '+225 03 45 67 89 01',
    email: 'fatoumata@example.com',
    status: 'active',
    hireDate: '2023-04-25'
  }
];

// Données simulées de documents
export const mockDocuments = [
  {
    id: 1,
    type: 'license',
    driverId: 1,
    number: '123456789',
    expiryDate: '2026-08-15',
    issueDate: '2021-08-15',
    uploadDate: '2024-03-15',
    uploadBy: 'Admin System',
    validity: 85,
    status: 'valid',
    size: '2.4 MB',
    format: 'PDF',
    notes: 'Permis international valide',
    fileName: 'permis_kouame_adou.pdf',
    fileUrl: '/documents/permis.pdf',
    reviewedBy: 'Jean Dupont',
    reviewDate: '2024-03-16',
    version: 1
  },
  {
    id: 2,
    type: 'registration',
    driverId: 1,
    number: 'EF-456-GH',
    expiryDate: '2024-09-30',
    issueDate: '2022-09-30',
    uploadDate: '2024-02-22',
    uploadBy: 'Kouamé Adou',
    validity: 15,
    status: 'expiring',
    size: '1.8 MB',
    format: 'PDF',
    notes: 'Carte grise à jour',
    fileName: 'carte_grise_aicha.pdf',
    fileUrl: '/documents/carte_grise.pdf',
    reviewedBy: null,
    reviewDate: null,
    version: 1
  },
  {
    id: 3,
    type: 'insurance',
    driverId: 1,
    number: 'ASS-789-012',
    expiryDate: '2024-05-15',
    issueDate: '2023-05-15',
    uploadDate: '2024-01-10',
    uploadBy: 'Mohamed Sylla',
    validity: 0,
    status: 'expired',
    size: '3.2 MB',
    format: 'PDF',
    notes: 'Assurance tous risques',
    fileName: 'assurance_mohamed.pdf',
    fileUrl: '/documents/assurance.pdf',
    reviewedBy: 'Admin System',
    reviewDate: '2024-01-11',
    version: 1
  },
  {
    id: 4,
    type: 'inspection',
    driverId: 2,
    number: 'CT-2024-001',
    expiryDate: '2025-01-10',
    issueDate: '2024-01-10',
    uploadDate: '2024-03-20',
    uploadBy: 'Aïcha Diarra',
    validity: 92,
    status: 'valid',
    size: '1.5 MB',
    format: 'PDF',
    notes: 'Contrôle technique récent',
    fileName: 'controle_technique_aicha.pdf',
    fileUrl: '/documents/controle_technique.pdf',
    reviewedBy: 'Jean Dupont',
    reviewDate: '2024-03-21',
    version: 1
  },
  {
    id: 5,
    type: 'medical',
    driverId: 2,
    number: 'MED-2024-045',
    expiryDate: '2025-03-01',
    issueDate: '2024-03-01',
    uploadDate: '2024-04-05',
    uploadBy: 'Fatoumata Bâ',
    validity: 95,
    status: 'pending',
    size: '1.2 MB',
    format: 'JPG',
    notes: 'Certificat médical d\'aptitude',
    fileName: 'certificat_medical_fatoumata.jpg',
    fileUrl: '/documents/certificat_medical.jpg',
    reviewedBy: null,
    reviewDate: null,
    version: 1
  },
  {
    id: 6,
    type: 'id_card',
    driverId: 3,
    number: '123456789012',
    expiryDate: '2030-12-31',
    issueDate: '2020-12-31',
    uploadDate: '2024-02-25',
    uploadBy: 'Mohamed Sylla',
    validity: 80,
    status: 'valid',
    size: '2.1 MB',
    format: 'PDF',
    notes: 'Carte d\'identité nationale',
    fileName: 'cni_mohamed.pdf',
    fileUrl: '/documents/cni.pdf',
    reviewedBy: 'Admin System',
    reviewDate: '2024-02-26',
    version: 1
  }
];

// Configuration pour l'export
export const exportConfig = {
  columns: [
    { header: 'Type', accessor: (doc) => documentTypes.find(t => t.id === doc.type)?.label || doc.type },
    { header: 'Propriétaire', accessor: (doc, drivers) => drivers.find(d => d.id === doc.driverId)?.name || 'Inconnu' },
    { header: 'Numéro', accessor: (doc) => doc.number || 'N/A' },
    { header: 'Statut', accessor: (doc) => statusTypes.find(s => s.id === doc.status)?.label || doc.status },
    { header: 'Date expiration', accessor: (doc) => doc.expiryDate || 'N/A' },
    { header: 'Date upload', accessor: (doc) => doc.uploadDate },
    { header: 'Fichier', accessor: (doc) => doc.fileName },
    { header: 'Taille', accessor: (doc) => doc.size },
  ],
  fileName: `documents_${new Date().toISOString().split('T')[0]}`,
  title: 'Liste des documents',
  orientation: 'landscape'
};

// Options de filtre
export const filterOptions = {
  status: [
    { value: 'all', label: 'Tous les statuts' },
    ...statusTypes.map(status => ({ value: status.id, label: status.label })),
  ],
  completeness: [
    { value: 'all', label: 'Tous' },
    { value: 'complete', label: 'Profil complet' },
    { value: 'incomplete', label: 'Profil incomplet' },
  ],
  documentType: [
    { value: 'all', label: 'Tous les types' },
    ...documentTypes.map(type => ({ value: type.id, label: type.label })),
  ]
};

// Fonctions utilitaires
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const groupDocumentsByDriver = (documents, drivers) => {
  const driversMap = {};
  
  drivers.forEach(driver => {
    driversMap[driver.id] = {
      ...driver,
      documents: [],
      totalDocuments: 0,
      validCount: 0,
      pendingCount: 0,
      expiredCount: 0,
      expiringCount: 0,
      rejectedCount: 0,
      completeness: 0
    };
  });
  
  documents.forEach(doc => {
    const driverId = doc.driverId;
    if (driversMap[driverId]) {
      driversMap[driverId].documents.push(doc);
      driversMap[driverId].totalDocuments++;
      
      // Compter par statut
      if (doc.status === 'valid') driversMap[driverId].validCount++;
      if (doc.status === 'pending') driversMap[driverId].pendingCount++;
      if (doc.status === 'expired') driversMap[driverId].expiredCount++;
      if (doc.status === 'expiring') driversMap[driverId].expiringCount++;
      if (doc.status === 'rejected') driversMap[driverId].rejectedCount++;
    }
  });
  
  // Calculer le taux de complétude
  Object.keys(driversMap).forEach(driverId => {
    const driver = driversMap[driverId];
    const requiredDocs = documentTypes.filter(d => d.required);
    const completedRequired = requiredDocs.filter(reqType => 
      driver.documents.some(doc => doc.type === reqType.id && doc.status === 'valid')
    ).length;
    
    driver.completeness = requiredDocs.length > 0 
      ? Math.round((completedRequired / requiredDocs.length) * 100) 
      : 0;
  });
  
  return Object.values(driversMap);
};

// Fonction pour calculer les statistiques
export const calculateStats = (drivers) => {
  const totalDrivers = drivers.length;
  const completeProfiles = drivers.filter(d => d.completeness === 100).length;
  const pendingReviews = drivers.reduce((sum, driver) => sum + driver.pendingCount, 0);
  const expiringSoon = drivers.reduce((sum, driver) => sum + driver.expiringCount, 0);
  const totalDocuments = drivers.reduce((sum, driver) => sum + driver.totalDocuments, 0);

  return [
    {
      title: 'Chauffeurs',
      value: totalDrivers.toString(),
      icon: 'Users',
      color: 'blue',
      trend: totalDrivers > 5 ? 'up' : 'stable',
      percentage: totalDrivers > 0 ? Math.round((completeProfiles / totalDrivers) * 100) : 0,
      progress: totalDrivers > 0 ? Math.round((completeProfiles / totalDrivers) * 100) : 0,
      description: `${completeProfiles} profils complets`,
    },
    {
      title: 'Documents à vérifier',
      value: pendingReviews.toString(),
      icon: 'AlertTriangle',
      color: 'yellow',
      trend: 'stable',
      percentage: totalDocuments > 0 ? Math.round((pendingReviews / totalDocuments) * 100) : 0,
      progress: totalDocuments > 0 ? Math.round((pendingReviews / totalDocuments) * 100) : 0,
      description: 'En attente de validation',
    },
    {
      title: 'Expirent bientôt',
      value: expiringSoon.toString(),
      icon: 'Clock',
      color: 'orange',
      trend: 'up',
      percentage: totalDocuments > 0 ? Math.round((expiringSoon / totalDocuments) * 100) : 0,
      progress: totalDocuments > 0 ? Math.round((expiringSoon / totalDocuments) * 100) : 0,
      description: 'À renouveler rapidement',
    }
  ];
};

// Simuler un appel API
export const fetchDocuments = async () => {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    success: true,
    data: mockDocuments,
    timestamp: new Date().toISOString()
  };
};

export const fetchDrivers = async () => {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    success: true,
    data: mockDrivers,
    timestamp: new Date().toISOString()
  };
};

// Fonction pour mettre à jour un document
export const updateDocument = async (documentId, updates) => {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    success: true,
    data: { id: documentId, ...updates },
    message: 'Document mis à jour avec succès'
  };
};

// Fonction pour uploader un document
export const uploadDocument = async (fileData, driverId) => {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newDocument = {
    id: Math.floor(Math.random() * 10000),
    type: fileData.type,
    driverId,
    number: fileData.number || null,
    expiryDate: fileData.expiryDate || null,
    issueDate: fileData.issueDate || null,
    uploadDate: new Date().toISOString().split('T')[0],
    uploadBy: fileData.uploadBy || 'Utilisateur',
    validity: 100,
    status: 'pending',
    size: `${(fileData.file.size / 1024 / 1024).toFixed(1)} MB`,
    format: fileData.file.type.split('/')[1].toUpperCase(),
    notes: fileData.notes || '',
    fileName: fileData.file.name,
    fileUrl: URL.createObjectURL(fileData.file),
    reviewedBy: null,
    reviewDate: null,
    version: 1
  };
  
  return {
    success: true,
    data: newDocument,
    message: 'Document uploadé avec succès'
  };
};