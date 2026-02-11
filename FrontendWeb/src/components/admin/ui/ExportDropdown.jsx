// src/components/shared/ExportDropdown.jsx - VERSION MODERNE
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ChevronDown, FileSpreadsheet, FileText, FilePen, Printer, Share2 } from "lucide-react";
import Button from "../ui/Bttn";
import { exportToCSV, exportToPDF, exportToWord } from "../../../utils/exporters";

/**
 * Dropdown export réutilisable (CSV, Word, PDF)
 */
export default function ExportDropdown({
  data = [],
  columns = [],
  fileName = "export",
  title = "Export",
  orientation = "landscape",
  showToast,
  onPrint,
  onShare,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const disabled = useMemo(
    () => !Array.isArray(data) || data.length === 0 || !Array.isArray(columns) || columns.length === 0,
    [data, columns]
  );

  const payload = useMemo(
    () => ({ data, columns, fileName, title, orientation, onToast: showToast }),
    [data, columns, fileName, title, orientation, showToast]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative  ${className}`} ref={ref}>
      <Button
        variant="secondary"
        icon={Download}
        onClick={() => setOpen((v) => !v)}
        className="relative"
        disabled={disabled}
        tooltip={disabled ? "Aucune donnée à exporter" : "Exporter les données"}
      >
        Exporter

      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200  dark:bg-gray-800 dark:border-gray-900 z-50 overflow-hidden"
          >
            <div className="py-1 ">
              <button
                onClick={() => {
                  exportToCSV(payload);
                  setOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mr-3 group-hover:bg-emerald-200 transition-colors">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Exporter en CSV</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Format tableur</div>
                </div>
              </button>

              <button
                onClick={() => {
                  exportToWord(payload);
                  setOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Exporter en Word</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Document éditable</div>
                </div>
              </button>

              <button
                onClick={async () => {
                  await exportToPDF(payload);
                  setOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center mr-3 group-hover:bg-rose-200 transition-colors">
                  <FilePen className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Exporter en PDF</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Document imprimable</div>
                </div>
              </button>

              {(onPrint || onShare) && (
                <div className="my-1 border-t border-gray-200 dark:border-gray-800" />
              )}

              {onPrint && (
                <button
                  onClick={() => {
                    onPrint();
                    setOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                    <Printer className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Imprimer la liste</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Version imprimable</div>
                  </div>
                </button>
              )}

              {onShare && (
                <button
                  onClick={() => {
                    onShare();
                    setOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center mr-3 group-hover:bg-primary-200 transition-colors">
                    <Share2 className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Partager</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Partager la liste</div>
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function for classnames
function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}