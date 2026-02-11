// src/components/ui/DocumentViewer.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Image as ImageIcon, FileText, FileDown } from 'lucide-react';
import Button from './Bttn';

const DocumentViewer = ({ document, isOpen, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!document) return null;

  const isPDF = document.format?.toLowerCase() === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(document.format?.toLowerCase());

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
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{document.fileName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {document.owner.name} • {document.size} • {document.format}
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

                <Button
                  variant="ghost"
                  icon={Download}
                  onClick={() => {
                    // Simuler téléchargement
                    const link = document.createElement('a');
                    link.href = document.fileUrl || '#';
                    link.download = document.fileName;
                    link.click();
                  }}
                >
                  Télécharger
                </Button>

                <Button
                  variant="ghost"
                  icon={X}
                  onClick={onClose}
                  className="ml-2"
                />
              </div>
            </div>

            {/* Document Content */}
            <div className="p-8 flex items-center justify-center overflow-auto" style={{ height: 'calc(90vh - 80px)' }}>
              <motion.div
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="transition-transform duration-200"
              >
                {isImage ? (
                  <img
                    src={document.fileUrl || `https://via.placeholder.com/800x600?text=${document.fileName}`}
                    alt={document.fileName}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  />
                ) : isPDF ? (
                  <div className="w-full h-[70vh] bg-gray-100 dark:bg-gray-950 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FileDown className="w-16 h-16 text-red-400 mx-auto mb-4" />
                      <p className="text-gray-700 dark:text-gray-200 font-medium">{document.fileName}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                        Prévisualisation PDF non disponible<br />
                        Téléchargez le fichier pour le visualiser
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[70vh] bg-gray-100 dark:bg-gray-950 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-700 dark:text-gray-200 font-medium">{document.fileName}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                        Prévisualisation non disponible
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50 dark:bg-gray-950">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-4">
                  <span>Type: {document.format}</span>
                  <span>•</span>
                  <span>Taille: {document.size}</span>
                  <span>•</span>
                  <span>Uploadé le: {new Date(document.uploadDate).toLocaleDateString('fr-FR')}</span>
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