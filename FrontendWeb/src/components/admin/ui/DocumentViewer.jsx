// src/components/ui/DocumentViewer.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Image as ImageIcon, FileText, FileDown, ExternalLink } from 'lucide-react';
import Button from './Bttn';

const DocumentViewer = ({ document, isOpen, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!document) return null;

  const fileUrl = document.fileUrl || document.url || '';
  const detectedFormat = document.format || fileUrl.split('.').pop()?.toLowerCase() || '';
  const isPDF = detectedFormat === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(detectedFormat);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-950">
              <div className="flex items-center">
                {isPDF ? (
                  <FileDown className="w-6 h-6 text-red-500 mr-3" />
                ) : isImage ? (
                  <ImageIcon className="w-6 h-6 text-blue-500 mr-3" />
                ) : (
                  <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{document.fileName || document.type}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {document.owner?.name || 'Chauffeur'} • {document.size || 'Taille inconnue'} • {detectedFormat.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 mr-4">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={ZoomOut}
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                  />
                  <span className="text-sm font-medium min-w-[40px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="small"
                    icon={ZoomIn}
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                  />
                  <Button
                    variant="ghost"
                    size="small"
                    icon={RotateCw}
                    onClick={handleRotate}
                  />
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={handleReset}
                  >
                    Réinitialiser
                  </Button>
                </div>

                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </a>

                <Button
                  variant="ghost"
                  icon={X}
                  onClick={onClose}
                  className="ml-2"
                />
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4 md:p-8 overflow-auto min-h-[60vh]" style={{ height: 'calc(90vh - 160px)' }}>
              {isImage ? (
                <motion.div
                  style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="transition-transform duration-200"
                >
                  <img
                    src={fileUrl}
                    alt={document.fileName}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg bg-white"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/800x600?text=Erreur+de+chargement`;
                    }}
                  />
                </motion.div>
              ) : isPDF ? (
                <div className="w-full h-full flex flex-col items-center">
                  <object
                    data={`${fileUrl}#toolbar=1`}
                    type="application/pdf"
                    className="w-full h-full min-h-[65vh] rounded-lg shadow-lg border dark:border-gray-800"
                  >
                    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-8 text-center bg-white dark:bg-gray-900 rounded-xl shadow-inner w-full">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <FileDown className="w-10 h-10 text-red-600" />
                      </div>
                      <h4 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">Aperçu indisponible</h4>
                      <p className="text-gray-500 max-w-md mb-6 text-sm">
                        Votre navigateur ne peut pas afficher le PDF directement (ou l'accès est bloqué). Vous pouvez le consulter en cliquant ci-dessous.
                      </p>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-md"
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Ouvrir le PDF
                      </a>
                    </div>
                  </object>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] w-full text-center">
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-700 dark:text-gray-200 font-medium">{document.fileName || 'Document'}</p>
                  <p className="text-gray-500 mt-2">Format non supporté pour l'aperçu en direct.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50 dark:bg-gray-950">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-4">
                  <span>Type: {detectedFormat.toUpperCase()}</span>
                  <span>•</span>
                  <span>Taille: {document.size || 'N/A'}</span>
                  <span>•</span>
                  <span>Uploadé le: {document.createdAt || document.uploadDate ? new Date(document.createdAt || document.uploadDate).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
                </div>
                <div>
                  <span className="font-medium">Zoom: {Math.round(zoom * 100)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DocumentViewer;