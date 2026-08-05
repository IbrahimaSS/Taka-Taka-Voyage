import { TypeBadge, StatusBadge, FormatBadge } from './reportBadges';
import ReportActions from './ReportActions';

// Composant pour le tableau des rapports (version mobile)
const MobileReportCard = ({ report, onView, onGenerate, onDownload, isMobile }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-900 p-4 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-2">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm md:text-base mb-1 truncate">{report.title}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{report.description}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            <TypeBadge type={report.type} />
            <StatusBadge status={report.status} />
          </div>
        </div>
        <ReportActions
          report={report}
          onView={onView}
          onGenerate={onGenerate}
          onExport={() => { }}
          isMobile={isMobile}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500 dark:text-gray-400 block mb-1">Format</span>
          <FormatBadge format={report.format} />
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400 block mb-1">Date</span>
          <span className="text-gray-800 dark:text-gray-100 font-medium">{report.createdAt}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400 block mb-1">ID</span>
          <span className="text-gray-800 dark:text-gray-100 font-mono text-xs">{report.id}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400 block mb-1">Téléchargements</span>
          <span className="text-gray-800 dark:text-gray-100 font-medium">{report.downloadCount}</span>
        </div>
      </div>
    </div>
  );
};

export default MobileReportCard;
