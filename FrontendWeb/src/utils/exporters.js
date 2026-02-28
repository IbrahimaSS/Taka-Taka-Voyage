import { logoBase64 } from './logoBase64';

const safe = (v, fallback = "") => {
  if (v === null || v === undefined) return fallback;
  if (typeof v === 'string') {
    // Remplacer les espaces insécables (U+00A0 et U+202F) par des espaces standards
    // car jsPDF et certains lecteurs PDF ont du mal à les afficher sans fontes spéciales.
    return v.replace(/[\u00A0\u202F]/g, " ");
  }
  return v;
};

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
          const raw = typeof c.accessor === "function" ? c.accessor(row, i) : getByPath(row, c.accessor);
          const val = c.formatter ? c.formatter(raw, row, i) : raw;
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
  const body = list.map((row, i) =>
    cols.map((c) => {
      const raw = typeof c.accessor === "function" ? c.accessor(row, i) : getByPath(row, c.accessor);
      const val = c.formatter ? c.formatter(raw, row, i) : raw;
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

// Export Word optimisé avec un design premium
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

    // Limiter le nombre de lignes (garde-fou)
    const safeBody = Array.isArray(body) ? body.slice(0, maxRows) : [];
    const actualRows = safeBody.length;

    if (totalRows > maxRows) {
      onToast?.("Avertissement Word", `Limité à ${maxRows} lignes sur ${totalRows}`, "warning");
    }

    // Calcul des totaux dynamiques
    const totals = columns.map((col, idx) => {
      const isNumeric = /montant|total|prix|frais|commission|amount|price|fees/i.test(col.header);
      if (isNumeric) {
        let sum = 0;
        safeBody.forEach(row => {
          const val = row[idx];
          const num = parseFloat(String(val).replace(/[^\d.,]/g, "").replace(",", "."));
          if (!isNaN(num)) sum += num;
        });
        return sum > 0 ? sum.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : "";
      }
      return "";
    });

    const hasTotals = totals.some(t => t !== "");

    const headerHtml = `
      <thead>
        <tr style="background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%); background-color: #10b981;">
          ${head
        .map((h) => `<th style="color:white;padding:12px 8px;border:1px solid #ddd;font-weight:bold;text-align:left;">${escapeHtml(h)}</th>`)
        .join("")}
        </tr>
      </thead>`;

    const rowsHtml = safeBody
      .map(
        (row, i) => `
      <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        ${row
            .map((cell) => `<td style="padding:8px;border:1px solid #e2e8f0;vertical-align:top;color:#334155;">${escapeHtml(cell)}</td>`)
            .join("")}
      </tr>`
      )
      .join("");

    const totalsHtml = hasTotals ? `
      <tfoot>
        <tr style="background-color: #f1f5f9; font-weight: bold;">
          ${totals.map((t, idx) => idx === 0 ? `<td style="padding:10px 8px;border:1px solid #cbd5e1;">TOTAL</td>` : `<td style="padding:10px 8px;border:1px solid #cbd5e1;text-align:right;">${t}</td>`).join("")}
        </tr>
      </tfoot>` : "";

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>TAKA TAKA - ${escapeHtml(title)}</title>
          <style>
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; }
            .header-container { display: flex; align-items: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-placeholder { width: 50px; height: 50px; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; margin-right: 15px; }
            .company-name { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; }
            .report-title { font-size: 18px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; color: #64748b; background: #f8fafc; padding: 15px; border-radius: 8px; }
            table { border-collapse: collapse; width: 100%; font-size: 11px; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="logo-placeholder">TT</div>
            <div>
              <h1 class="company-name">TAKA TAKA</h1>
              <div class="report-title">${escapeHtml(title)}</div>
            </div>
          </div>
          
          <div class="meta-info">
            <div>
              <strong>Rapport :</strong> ${escapeHtml(title)}<br>
              <strong>Date d’export :</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
            </div>
            <div style="text-align: right;">
              <strong>Nombre d'enregistrements :</strong> ${actualRows}<br>
              <strong>Format :</strong> Microsoft Word (.doc)
            </div>
          </div>

          <table>
            ${headerHtml}
            <tbody>${rowsHtml}</tbody>
            ${totalsHtml}
          </table>

          <div class="footer">
            <div>© ${new Date().getFullYear()} TAKA TAKA | Rapport Administratif Confidentiel</div>
            <div>Généré dynamiquement par le système</div>
          </div>
        </body>
      </html>`;

    const blob = new Blob(["\ufeff", html], {
      type: "application/msword"
    });
    downloadBlob(blob, `${fileName}_${new Date().toISOString().split("T")[0]}.doc`);

    onToast?.(
      "Export Word réussi",
      `${actualRows} lignes exportées`,
      "success"
    );
  } catch (error) {
    console.error("Word export error:", error);
    onToast?.("Erreur Word", error.message || "Erreur lors de l'export", "error");
  }
};

// Export PDF Premium avec Design Moderne et Totaux Dynamiques
export const exportToPDF = async ({
  data,
  columns,
  fileName = "export",
  title = "Export",
  orientation = "landscape",
  onToast,
  maxRows = 5000,
}) => {
  try {
    onToast?.("Export PDF", "Génération du rapport premium...", "info");

    const { head, body, totalRows } = buildTable(data, columns);

    // Limiter les lignes pour PDF
    const safeBody = Array.isArray(body) ? body.slice(0, maxRows) : [];
    const actualRows = safeBody.length;

    // Import dynamique
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const doc = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- EN-TÊTE PREMIUM GRADIENT ---
    const headerHeight = 35;
    for (let i = 0; i < 100; i++) {
      const step = i / 100;
      const r = Math.round(16 + (37 - 16) * step);     // 16 -> 37 (Emerald -> Blue)
      const g = Math.round(185 + (99 - 185) * step);   // 185 -> 99
      const b = Math.round(129 + (235 - 129) * step);  // 129 -> 235
      doc.setFillColor(r, g, b);
      doc.rect((pageWidth / 100) * i, 0, pageWidth / 100 + 0.5, headerHeight, 'F');
    }

    // --- LOGO TAKA TAKA ---
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 8, 18, 18, 4, 4, 'F'); // Fond blanc pour le logo
    doc.addImage(logoBase64, 'JPEG', 15, 9, 16, 16, '', 'FAST');

    // --- TEXTE "TAKA TAKA" ---
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("TAKA TAKA", 36, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 230, 240);
    doc.text("Votre transport, notre confort", 36, 24);

    // REPORT METADATA (RIGHT)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`RAPPORT : ${title.toUpperCase()}`, pageWidth - 14, 15, { align: 'right' });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 230, 240);
    doc.setFontSize(8);
    const dateNow = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    doc.text(`Généré le : ${dateNow}`, pageWidth - 14, 21, { align: 'right' });
    doc.text(`Total : ${actualRows} enregistrements`, pageWidth - 14, 26, { align: 'right' });

    // --- CORPS DU DOCUMENT ---

    // Title Section
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 50);

    // Emerald Accent Under Title
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.8);
    doc.line(14, 54, 45, 54);

    // Tableau avec Autotable Premium
    autoTable(doc, {
      startY: 65,
      head: [head],
      body: safeBody,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 185, 129], // OFFICIAL GREEN
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'left',
        cellPadding: 4,
        lineWidth: 0.1,
        lineColor: [255, 255, 255]
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3.5,
        textColor: [30, 41, 59],
        lineColor: [203, 213, 225], // Visible Grey Lines
        lineWidth: 0.1
      },
      alternateRowStyles: { fillColor: [250, 252, 254] },
      margin: { top: 65, left: 14, right: 14, bottom: 25 },
      didDrawPage: (data) => {
        // PROFESSIONAL FOOTER
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        const fDate = new Date().toLocaleDateString('fr-FR');
        doc.text(`© ${new Date().getFullYear()} TAKA TAKA | DOCUMENT ADMINISTRATIF CONFIDENTIEL`, 14, pageHeight - 10);
        doc.text(`Audit le ${fDate} | Page ${data.pageNumber} sur ${doc.internal.getNumberOfPages()}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
      }
    });

    if (totalRows > maxRows) {
      doc.setFontSize(8);
      doc.setTextColor(239, 68, 68);
      doc.text(`* Note : Affichage limité aux ${maxRows} premières lignes pour l'optimisation.`, 14, doc.lastAutoTable.finalY + 12);
    }

    doc.save(`${fileName}_${new Date().toISOString().split("T")[0]}.pdf`);

    onToast?.(
      "Export PDF réussi",
      `Rapport premium exporté (${actualRows} lignes)`,
      "success"
    );
  } catch (error) {
    console.error("PDF export error:", error);
    onToast?.("Erreur PDF", error.message || "Erreur lors de la génération", "error");
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