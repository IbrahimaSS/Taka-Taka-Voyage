// src/utils/exporters.js
const safe = (v, fallback = "") => (v === null || v === undefined ? fallback : v);

const escapeHtml = (str) =>
  String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getByPath = (obj, path) => {
  if (!path) return undefined;
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

// Fonction optimisée pour construire des tables avec pagination pour grandes données
const buildTable = (data = [], columns = [], chunkSize = 10000) => {
  const list = Array.isArray(data) ? data : [];
  const cols = Array.isArray(columns) ? columns : [];
  
  const head = cols.map((c) => c.header);
  
  // Pour les très grandes données, on peut utiliser une approche par chunks
  if (list.length > chunkSize) {
    console.warn(`Large dataset detected (${list.length} rows). Processing in chunks...`);
    
    // Créer un générateur pour traiter les données par chunks
    function* generateRows() {
      for (let i = 0; i < list.length; i++) {
        const row = list[i];
        yield cols.map((c) => {
          const raw = typeof c.accessor === "function" ? c.accessor(row) : getByPath(row, c.accessor);
          const val = c.formatter ? c.formatter(raw, row) : raw;
          return safe(val, "");
        });
      }
    }
    
    return {
      head,
      body: generateRows(),
      largeDataset: true,
      totalRows: list.length
    };
  }
  
  // Pour les datasets normaux
  const body = list.map((row) =>
    cols.map((c) => {
      const raw = typeof c.accessor === "function" ? c.accessor(row) : getByPath(row, c.accessor);
      const val = c.formatter ? c.formatter(raw, row) : raw;
      return safe(val, "");
    })
  );

  return { head, body, largeDataset: false, totalRows: list.length };
};

const downloadBlob = (blob, filename) => {
  try {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    
    // Nettoyer
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("Download error:", error);
    throw error;
  }
};

// Export CSV optimisé pour grandes données
export const exportToCSV = ({ 
  data, 
  columns, 
  fileName = "export", 
  onToast,
  chunkSize = 10000 
}) => {
  try {
    const { head, body, largeDataset, totalRows } = buildTable(data, columns, chunkSize);
    
    // Pour les très grandes données, construire le CSV progressivement
    if (largeDataset) {
      onToast?.("Export CSV", `Génération de ${totalRows} lignes...`, "info");
      
      // Créer le début du CSV
      const headerRow = head.map((h) => `"${String(h ?? "").replace(/"/g, '""')}"`).join(",");
      let csvContent = "\ufeff" + headerRow + "\n";
      
      // Ajouter les données par chunks
      let rowCount = 0;
      for (const row of body) {
        const rowData = row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",");
        csvContent += rowData + "\n";
        rowCount++;
        
        // Mettre à jour la progression périodiquement
        if (rowCount % 5000 === 0) {
          onToast?.("Export CSV", `Traitement: ${rowCount}/${totalRows} lignes...`, "info");
        }
      }
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, `${fileName}_${new Date().toISOString().split("T")[0]}.csv`);
      
      onToast?.(
        "Export CSV réussi", 
        `${totalRows} lignes exportées (${(blob.size / 1024 / 1024).toFixed(2)} MB)`, 
        "success"
      );
    } else {
      // Pour les données normales
      const rows = [head, ...body];
      const csv = "\ufeff" + rows
        .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, `${fileName}_${new Date().toISOString().split("T")[0]}.csv`);
      
      onToast?.(
        "Export CSV réussi", 
        `${data.length} lignes exportées (${(blob.size / 1024).toFixed(2)} KB)`, 
        "success"
      );
    }
  } catch (error) {
    console.error("CSV export error:", error);
    onToast?.("Erreur CSV", error.message || "Erreur lors de l'export", "error");
  }
};

// Export Word optimisé
export const exportToWord = ({ 
  data, 
  columns, 
  fileName = "export", 
  title = "Export", 
  onToast,
  maxRows = 50000 
}) => {
  try {
    const { head, body, totalRows } = buildTable(data, columns);
    
    // Limiter le nombre de lignes pour Word (garde-fou)
    const safeBody = Array.isArray(body) ? body.slice(0, maxRows) : [];
    const actualRows = safeBody.length;
    
    if (totalRows > maxRows) {
      onToast?.("Avertissement Word", `Limité à ${maxRows} lignes sur ${totalRows}`, "warning");
    }
    
    const headerHtml = `
      <tr>
        ${head
          .map((h) => `<th style="background-color:#f2f2f2;padding:6px;border:1px solid #ddd;font-weight:bold;">${escapeHtml(h)}</th>`)
          .join("")}
      </tr>`;
    
    const rowsHtml = safeBody
      .map(
        (row) => `
      <tr>
        ${row
          .map((cell) => `<td style="padding:6px;border:1px solid #ddd;vertical-align:top;">${escapeHtml(cell)}</td>`)
          .join("")}
      </tr>`
      )
      .join("");
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${escapeHtml(title)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; font-size: 11px; }
            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            .info { color: #7f8c8d; font-size: 12px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(title)}</h1>
          <div class="info">
            Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}<br>
            Total: ${actualRows} ligne${actualRows > 1 ? 's' : ''}
          </div>
          <table>${headerHtml}${rowsHtml}</table>
        </body>
      </html>`;
    
    const blob = new Blob(["\ufeff", html], { 
      type: "application/msword" 
    });
    downloadBlob(blob, `${fileName}_${new Date().toISOString().split("T")[0]}.doc`);
    
    onToast?.(
      "Export Word réussi", 
      `${actualRows} lignes exportées (${(blob.size / 1024 / 1024).toFixed(2)} MB)`, 
      "success"
    );
  } catch (error) {
    console.error("Word export error:", error);
    onToast?.("Erreur Word", error.message || "Erreur lors de l'export", "error");
  }
};

// Export PDF optimisé avec compression
export const exportToPDF = async ({
  data,
  columns,
  fileName = "export",
  title = "Export",
  orientation = "landscape",
  onToast,
  maxRows = 5000, // PDF supporte moins de lignes
}) => {
  try {
    onToast?.("Export PDF", "Génération du PDF en cours...", "info");
    
    const { head, body, totalRows } = buildTable(data, columns);
    
    // Limiter les lignes pour PDF (performance)
    const safeBody = Array.isArray(body) ? body.slice(0, maxRows) : [];
    const actualRows = safeBody.length;
    
    if (totalRows > maxRows) {
      onToast?.("Avertissement PDF", `Limité à ${maxRows} lignes sur ${totalRows}`, "warning");
    }
    
    // Import dynamique pour réduire le bundle initial
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    
    const doc = new jsPDF({
      orientation,
      unit: "mm",
      format: orientation === "landscape" ? "a4" : "a4",
      compress: true // Compression activée
    });
    
    // En-tête
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text(title, 14, 15);
    
    // Informations
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const dateStr = new Date().toLocaleDateString('fr-FR');
    doc.text(`Généré le ${dateStr}`, 14, 22);
    doc.text(`Total: ${actualRows} ligne${actualRows > 1 ? 's' : ''}`, 14, 27);
    
    // Tableau
    autoTable(doc, {
      startY: 30,
      head: [head],
      body: safeBody,
      theme: 'grid',
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'auto'
      },
      styles: {
        cellPadding: 2,
        fontSize: 8,
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }
      },
      margin: { top: 30 },
      pageBreak: 'auto',
      rowPageBreak: 'auto',
      tableWidth: 'auto',
      showHead: 'everyPage',
      didDrawPage: (data) => {
        // Pied de page
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        const pageCount = doc.internal.getNumberOfPages();
        doc.text(`Page ${data.pageNumber} / ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
      }
    });
    
    doc.save(`${fileName}_${new Date().toISOString().split("T")[0]}.pdf`);
    
    onToast?.(
      "Export PDF réussi", 
      `${actualRows} lignes exportées (PDF compressé)`, 
      "success"
    );
  } catch (error) {
    console.error("PDF export error:", error);
    
    if (error.message.includes("jspdf")) {
      onToast?.(
        "Export PDF", 
        'Pour générer des PDF, installez: npm install jspdf jspdf-autotable', 
        "warning"
      );
    } else {
      onToast?.("Erreur PDF", error.message || "Erreur lors de la génération", "error");
    }
  }
};

// Fonction d'export universelle
export const exportData = (format, options) => {
  switch (format) {
    case 'csv':
      return exportToCSV(options);
    case 'word':
      return exportToWord(options);
    case 'pdf':
      return exportToPDF(options);
    default:
      throw new Error(`Format non supporté: ${format}`);
  }
};

// Générer des données de test volumineuses (utile pour le développement)
export const generateMockData = (rows = 10000, columns = 8) => {
  const mockData = [];
  const documentTypes = ['license', 'id_card', 'registration', 'insurance', 'inspection', 'medical', 'bank', 'photo'];
  const statuses = ['valid', 'pending', 'expired', 'expiring', 'rejected'];
  const drivers = [
    'Kouamé Adou', 'Aïcha Diarra', 'Mohamed Sylla', 'Fatoumata Bâ',
    'Samuel Mensah', 'Jean Dupont', 'Marie Curie', 'Paul Martin'
  ];
  
  for (let i = 0; i < rows; i++) {
    const driverIndex = i % drivers.length;
    const docTypeIndex = i % documentTypes.length;
    const statusIndex = i % statuses.length;
    
    mockData.push({
      id: i + 1,
      type: documentTypes[docTypeIndex],
      driverId: driverIndex + 1,
      driverName: drivers[driverIndex],
      number: `DOC-${String(i + 1).padStart(6, '0')}`,
      expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      issueDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: statuses[statusIndex],
      fileName: `document_${documentTypes[docTypeIndex]}_${i + 1}.pdf`,
      size: `${(Math.random() * 5 + 0.1).toFixed(1)} MB`,
      format: Math.random() > 0.5 ? 'PDF' : 'JPG',
      notes: i % 3 === 0 ? 'Document important à vérifier' : '',
      reviewedBy: i % 4 === 0 ? 'Admin System' : null
    });
  }
  
  return mockData;
};

// Fonction pour compresser les données avant export
export const compressDataForExport = (data, options = {}) => {
  const {
    excludeColumns = [],
    maxStringLength = 500,
    compressNumbers = true
  } = options;
  
  return data.map(item => {
    const compressed = { ...item };
    
    // Éliminer les colonnes spécifiées
    excludeColumns.forEach(col => {
      delete compressed[col];
    });
    
    // Tronquer les longues chaînes
    Object.keys(compressed).forEach(key => {
      if (typeof compressed[key] === 'string' && compressed[key].length > maxStringLength) {
        compressed[key] = compressed[key].substring(0, maxStringLength) + '...';
      }
    });
    
    // Compresser les nombres (optionnel)
    if (compressNumbers) {
      Object.keys(compressed).forEach(key => {
        if (typeof compressed[key] === 'number') {
          // Arrondir les nombres à 2 décimales
          compressed[key] = Math.round(compressed[key] * 100) / 100;
        }
      });
    }
    
    return compressed;
  });
};

// Formateur de date pour les exports
export const dateFormatter = (value, format = 'short') => {
  if (!value) return 'N/A';
  
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('fr-FR');
    case 'long':
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    case 'iso':
      return date.toISOString().split('T')[0];
    default:
      return date.toLocaleDateString('fr-FR');
  }
};

// Formateur de fichier taille
export const fileSizeFormatter = (value) => {
  if (!value) return 'N/A';
  
  const match = value.match(/(\d+(?:\.\d+)?)\s*(MB|KB|GB)/i);
  if (match) {
    const [, size, unit] = match;
    return `${parseFloat(size).toFixed(1)} ${unit.toUpperCase()}`;
  }
  
  return value;
};