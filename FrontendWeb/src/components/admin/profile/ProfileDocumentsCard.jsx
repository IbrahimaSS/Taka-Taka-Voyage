// src/components/profile/components/ProfileDocumentsCard.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Trash2, Download, CheckCircle, AlertCircle, File, Eye } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Bttn';
import Badge from '../ui/Badge';

const ProfileDocumentsCard = ({ showToast }) => {
    const [documents, setDocuments] = useState([
        { id: 1, name: 'CV_Fela_Balde.pdf', size: '1.2 MB', status: 'verified', date: '12/12/2023', type: 'application/pdf' },
        { id: 2, name: 'Carte_Identite.jpg', size: '800 KB', status: 'pending', date: '05/01/2024', type: 'image/jpeg' },
    ]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        setIsUploading(true);

        // Simuler un upload multiple
        setTimeout(() => {
            const newDocs = files.map((file, index) => ({
                id: documents.length + index + 1,
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                status: 'pending',
                date: new Date().toLocaleDateString('fr-FR'),
                type: file.type
            }));

            setDocuments(prev => [...prev, ...newDocs]);
            setIsUploading(false);
            showToast('Succès', `${files.length} fichier(s) ajouté(s)`, 'success');
        }, 1500);
    };

    const removeDocument = (id) => {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        showToast('Info', 'Document supprimé', 'info');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified':
                return <Badge variant="success" size="sm" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Vérifié</Badge>;
            case 'pending':
                return <Badge variant="warning" size="sm" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> En attente</Badge>;
            default:
                return <Badge variant="default" size="sm">Inconnu</Badge>;
        }
    };

    return (
        <Card className="border-2 border-gray-100 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-blue-800">Documents personnels</CardTitle>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Gérez vos justificatifs et documents officiels</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <Button
                        variant="perso"
                        size="small"
                        icon={Upload}
                        onClick={() => fileInputRef.current.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Chargement...' : 'Uploader'}
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {documents.length > 0 ? (
                            documents.map((doc) => (
                                <motion.div
                                    key={doc.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                            {doc.type.includes('image') ? <File className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate max-w-[200px]">{doc.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-500">{doc.size}</span>
                                                <span className="text-xs text-gray-300">•</span>
                                                <span className="text-xs text-gray-500">{doc.date}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(doc.status)}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Voir">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Télécharger">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => removeDocument(doc.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Aucun document pour le moment</p>
                                <Button
                                    variant="link"
                                    className="mt-2 text-blue-600"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    Cliquez pour uploader
                                </Button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProfileDocumentsCard;
