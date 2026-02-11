// src/components/ui/TableActions.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  MoreVertical,
  Edit,
  Download,
  Copy,
  Archive,
  UserCheck,
  UserX,
  Mail,
  Phone,
  ExternalLink,
  EyeOff,
  Lock,
  Unlock,
  Star,
  Flag,
  Info,
  Settings,
  RefreshCw,
  Share,
  Printer,
  Send,
  BarChart,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Bookmark,
  Filter,
  SortAsc,
  Grid,
  List,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FolderOpen,
  AlertTriangle
} from 'lucide-react';

// Configuration des types d'actions disponibles
export const actionTypes = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  RESOLVE: 'resolve',
  REJECT: 'reject',
  APPROVE: 'approve',
  DOWNLOAD: 'download',
  COPY: 'copy',
  ARCHIVE: 'archive',
  ACTIVATE: 'activate',
  DEACTIVATE: 'deactivate',
  EMAIL: 'email',
  CALL: 'call',
  LINK: 'link',
  HIDE: 'hide',
  SHOW: 'show',
  LOCK: 'lock',
  UNLOCK: 'unlock',
  STAR: 'star',
  FLAG: 'flag',
  INFO: 'info',
  SETTINGS: 'settings',
  REFRESH: 'refresh',
  SHARE: 'share',
  PRINT: 'print',
  SEND: 'send',
  ANALYZE: 'analyze',
  SCHEDULE: 'schedule',
  TRACK: 'track',
  FAVORITE: 'favorite',
  BOOKMARK: 'bookmark',
  FILTER: 'filter',
  SORT: 'sort',
  GRID: 'grid',
  LIST: 'list',
  EXPAND: 'expand',
  COLLAPSE: 'collapse',
  ZOOM_IN: 'zoom_in',
  ZOOM_OUT: 'zoom_out',
  ROTATE: 'rotate',
  PREVIEW: 'preview',
  OPEN: 'open'
};

// Mapping des icônes par type d'action
export const actionIcons = {
  [actionTypes.VIEW]: Eye,
  [actionTypes.EDIT]: Edit,
  [actionTypes.DELETE]: Trash2,
  [actionTypes.RESOLVE]: CheckCircle,
  [actionTypes.REJECT]: XCircle,
  [actionTypes.APPROVE]: UserCheck,
  [actionTypes.DOWNLOAD]: Download,
  [actionTypes.COPY]: Copy,
  [actionTypes.ARCHIVE]: Archive,
  [actionTypes.ACTIVATE]: UserCheck,
  [actionTypes.DEACTIVATE]: UserX,
  [actionTypes.EMAIL]: Mail,
  [actionTypes.CALL]: Phone,
  [actionTypes.LINK]: ExternalLink,
  [actionTypes.HIDE]: EyeOff,
  [actionTypes.SHOW]: Eye,
  [actionTypes.LOCK]: Lock,
  [actionTypes.UNLOCK]: Unlock,
  [actionTypes.STAR]: Star,
  [actionTypes.FLAG]: Flag,
  [actionTypes.INFO]: Info,
  [actionTypes.SETTINGS]: Settings,
  [actionTypes.REFRESH]: RefreshCw,
  [actionTypes.SHARE]: Share,
  [actionTypes.PRINT]: Printer,
  [actionTypes.SEND]: Send,
  [actionTypes.ANALYZE]: BarChart,
  [actionTypes.SCHEDULE]: Calendar,
  [actionTypes.TRACK]: Clock,
  [actionTypes.LOCATE]: MapPin,
  [actionTypes.FAVORITE]: Heart,
  [actionTypes.BOOKMARK]: Bookmark,
  [actionTypes.FILTER]: Filter,
  [actionTypes.SORT]: SortAsc,
  [actionTypes.GRID]: Grid,
  [actionTypes.LIST]: List,
  [actionTypes.EXPAND]: Maximize2,
  [actionTypes.COLLAPSE]: Minimize2,
  [actionTypes.ZOOM_IN]: ZoomIn,
  [actionTypes.ZOOM_OUT]: ZoomOut,
  [actionTypes.ROTATE]: RotateCw,
  [actionTypes.PREVIEW]: Eye,
  [actionTypes.OPEN]: FolderOpen
};

// Mapping des couleurs par type d'action
export const actionColors = {
  [actionTypes.VIEW]: 'text-blue-500',
  [actionTypes.EDIT]: 'text-yellow-500',
  [actionTypes.DELETE]: 'text-red-500',
  [actionTypes.RESOLVE]: 'text-green-500',
  [actionTypes.REJECT]: 'text-red-500',
  [actionTypes.APPROVE]: 'text-green-500',
  [actionTypes.ACTIVATE]: 'text-green-500',
  [actionTypes.DEACTIVATE]: 'text-red-500',
  [actionTypes.DOWNLOAD]: 'text-purple-500',
  [actionTypes.COPY]: 'text-gray-500 dark:text-gray-400',
  [actionTypes.ARCHIVE]: 'text-gray-500 dark:text-gray-400',
  default: 'text-gray-500 dark:text-gray-400'
};

// Mapping des étiquettes par type d'action
export const actionLabels = {
  [actionTypes.VIEW]: 'Voir détails',
  [actionTypes.EDIT]: 'Modifier',
  [actionTypes.DELETE]: 'Supprimer',
  [actionTypes.RESOLVE]: 'Résoudre',
  [actionTypes.REJECT]: 'Rejeter',
  [actionTypes.APPROVE]: 'Approuver',
  [actionTypes.DOWNLOAD]: 'Télécharger',
  [actionTypes.COPY]: 'Copier',
  [actionTypes.ARCHIVE]: 'Archiver',
  [actionTypes.ACTIVATE]: 'Activer',
  [actionTypes.DEACTIVATE]: 'Désactiver',
  [actionTypes.EMAIL]: 'Envoyer un email',
  [actionTypes.CALL]: 'Appeler',
  [actionTypes.LINK]: 'Ouvrir le lien',
  [actionTypes.HIDE]: 'Masquer',
  [actionTypes.SHOW]: 'Afficher',
  [actionTypes.LOCK]: 'Verrouiller',
  [actionTypes.UNLOCK]: 'Déverrouiller',
  [actionTypes.STAR]: 'Marquer',
  [actionTypes.FLAG]: 'Signaler',
  [actionTypes.INFO]: 'Informations',
  [actionTypes.SETTINGS]: 'Paramètres',
  [actionTypes.REFRESH]: 'Actualiser',
  [actionTypes.SHARE]: 'Partager',
  [actionTypes.PRINT]: 'Imprimer',
  [actionTypes.SEND]: 'Envoyer',
  [actionTypes.ANALYZE]: 'Analyser',
  [actionTypes.SCHEDULE]: 'Planifier',
  [actionTypes.TRACK]: 'Suivre',
  [actionTypes.FAVORITE]: 'Ajouter aux favoris',
  [actionTypes.BOOKMARK]: 'Ajouter aux signets',
  [actionTypes.FILTER]: 'Filtrer',
  [actionTypes.SORT]: 'Trier',
  [actionTypes.GRID]: 'Vue grille',
  [actionTypes.LIST]: 'Vue liste',
  [actionTypes.EXPAND]: 'Agrandir',
  [actionTypes.COLLAPSE]: 'Réduire',
  [actionTypes.ZOOM_IN]: 'Zoom avant',
  [actionTypes.ZOOM_OUT]: 'Zoom arrière',
  [actionTypes.ROTATE]: 'Tourner',
  [actionTypes.PREVIEW]: 'Aperçu',
  [actionTypes.OPEN]: 'Ouvrir'
};

// Props par défaut pour le composant
const defaultProps = {
  item: null,
  actions: ['view', 'edit', 'delete'],
  onAction: () => {},
  customActions: [],
  align: 'right',
  iconSize: 16,
  showLabel: true,
  disabledActions: [],
  confirmActions: ['delete'],
  confirmMessage: 'Êtes-vous sûr de vouloir effectuer cette action ?',
  confirmTitle: 'Confirmation',
  className: '',
  menuClassName: '',
  buttonClassName: '',
  itemIdField: 'id',
  itemNameField: 'name',
  showDividerBefore: ['delete', 'archive'],
  position: 'bottom-right',
  offsetX: 0,
  offsetY: 2,
  maxHeight: '300px',
  withAnimation: true,
  triggerElement: null
};

/**
 * Composant TableActions réutilisable pour les actions dans les tableaux
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.item - L'élément sur lequel agir
 * @param {Array} props.actions - Liste des actions à afficher
 * @param {Function} props.onAction - Callback appelé lors d'une action
 * @param {Array} props.customActions - Actions personnalisées
 * @param {string} props.align - Alignement du menu (left, right)
 * @param {number} props.iconSize - Taille des icônes
 * @param {boolean} props.showLabel - Afficher les labels des actions
 * @param {Array} props.disabledActions - Actions désactivées
 * @param {Array} props.confirmActions - Actions nécessitant une confirmation
 * @param {string} props.confirmMessage - Message de confirmation
 * @param {string} props.confirmTitle - Titre de confirmation
 * @param {string} props.className - Classes CSS supplémentaires
 * @param {string} props.menuClassName - Classes CSS supplémentaires pour le menu
 * @param {string} props.buttonClassName - Classes CSS supplémentaires pour le bouton
 * @param {string} props.itemIdField - Champ ID de l'élément
 * @param {string} props.itemNameField - Champ nom de l'élément
 * @param {Array} props.showDividerBefore - Actions précédées d'un séparateur
 * @param {string} props.position - Position du menu (bottom-right, bottom-left, top-right, top-left)
 * @param {number} props.offsetX - Décalage horizontal
 * @param {number} props.offsetY - Décalage vertical
 * @param {string} props.maxHeight - Hauteur maximale du menu
 * @param {boolean} props.withAnimation - Activer les animations
 * @param {ReactNode} props.triggerElement - Élément personnalisé pour déclencher le menu
 */
const TableActions = (props) => {
  const {
    item,
    actions,
    onAction,
    customActions,
    align,
    iconSize,
    showLabel,
    disabledActions,
    confirmActions,
    // confirmMessage,
    confirmTitle,
    className,
    menuClassName,
    buttonClassName,
    itemIdField,
    itemNameField,
    showDividerBefore,
    position,
    offsetX,
    offsetY,
    maxHeight,
    withAnimation,
    triggerElement
  } = { ...defaultProps, ...props };

  const [showActions, setShowActions] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuRef = useRef(null);

  // Fermer le menu en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gérer le défilement pour fermer le menu
  useEffect(() => {
    if (showActions) {
      const handleScroll = () => setShowActions(false);
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [showActions]);

  // Préparer les actions à afficher
  const getActions = () => {
    const allActions = [];
    
    // Actions prédéfinies
    actions.forEach(actionType => {
      if (actionTypes[actionType.toUpperCase()]) {
        allActions.push({
          type: actionType,
          label: actionLabels[actionType] || actionType,
          icon: actionIcons[actionType] || MoreVertical,
          color: actionColors[actionType] || actionColors.default,
          requiresConfirmation: confirmActions.includes(actionType)
        });
      }
    });

    // Actions personnalisées
    customActions.forEach(customAction => {
      allActions.push({
        ...customAction,
        type: customAction.type || 'custom',
        requiresConfirmation: confirmActions.includes(customAction.type) || customAction.requiresConfirmation
      });
    });

    return allActions;
  };

  // Gérer le clic sur une action
  const handleActionClick = (action) => {
    if (disabledActions.includes(action.type)) {
      return;
    }

    if (action.requiresConfirmation) {
      setPendingAction(action);
      setShowConfirm(true);
      setShowActions(false);
    } else {
      executeAction(action);
    }
  };

  // Exécuter l'action
  const executeAction = (action) => {
    if (onAction) {
      onAction(action.type, item);
    }
    
    if (action.onClick) {
      action.onClick(item);
    }
    
    setShowActions(false);
  };

  // Confirmer l'action
  const handleConfirm = () => {
    if (pendingAction) {
      executeAction(pendingAction);
    }
    setShowConfirm(false);
    setPendingAction(null);
  };

  // Annuler la confirmation
  const handleCancel = () => {
    setShowConfirm(false);
    setPendingAction(null);
  };

  // Obtenir la position du menu
  const getMenuPosition = () => {
    const positions = {
      'bottom-right': `right-${offsetX} mt-${offsetY}`,
      'bottom-left': `left-${offsetX} mt-${offsetY}`,
      'top-right': `right-${offsetX} mb-${offsetY} bottom-full`,
      'top-left': `left-${offsetX} mb-${offsetY} bottom-full`
    };
    
    return positions[position] || positions['bottom-right'];
  };

  // Rendu du bouton de déclenchement
  const renderTrigger = () => {
    if (triggerElement) {
      return React.cloneElement(triggerElement, {
        onClick: () => setShowActions(!showActions)
      });
    }

    return (
      <button
        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 rounded-lg transition duration-200 ${buttonClassName}`}
        onClick={() => setShowActions(!showActions)}
        aria-label="Actions"
        title="Actions"
      >
        <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400 dark:text-gray-400" />
      </button>
    );
  };

  // Rendu des actions
  const renderActions = () => {
    const actionList = getActions();
    
    return (
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${getMenuPosition()} w-48 bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 dark:border-gray-700 z-50 overflow-hidden ${menuClassName}`}
            style={{ maxHeight, overflowY: 'auto' }}
          >
            <div className="py-1">
              {actionList.map((action, index) => {
                const Icon = action.icon || MoreVertical;
                const isDisabled = disabledActions.includes(action.type);
                const showDivider = showDividerBefore.includes(action.type) && index > 0;

                return (
                  <React.Fragment key={action.type || index}>
                    {showDivider && (
                      <div className="border-t border-gray-200 dark:border-gray-800 dark:border-gray-700 my-1"></div>
                    )}
                    
                    <button
                      className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-950 dark:hover:bg-gray-800 flex items-center text-sm ${
                        isDisabled 
                          ? 'text-gray-400 dark:text-gray-500 dark:text-gray-500 cursor-not-allowed' 
                          : 'text-gray-700 dark:text-gray-200 dark:text-gray-300'
                      } transition duration-150`}
                      onClick={() => !isDisabled && handleActionClick(action)}
                      disabled={isDisabled}
                      title={action.label}
                    >
                      <Icon 
                        className={`w-${iconSize} h-${iconSize} mr-3 ${action.color || actionColors.default}`} 
                      />
                      {showLabel && action.label}
                      {action.badge && (
                        <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                          action.badgeColor === 'red' ? 'bg-red-100 text-red-800' :
                          action.badgeColor === 'green' ? 'bg-green-100 text-green-800' :
                          action.badgeColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                          action.badgeColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-100'
                        }`}>
                          {action.badge}
                        </span>
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Rendu de la modal de confirmation
  // const renderConfirmModal = () => {
  //   if (!showConfirm || !pendingAction) return null;

  //   const itemName = item ? item[itemNameField] || itemIdField : 'cet élément';
  //   const actionLabel = pendingAction.label.toLowerCase();

  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  //       <motion.div
  //         initial={{ opacity: 0, scale: 0.9 }}
  //         animate={{ opacity: 1, scale: 1 }}
  //         className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full"
  //       >
  //         <div className="p-6">
  //           <div className="flex items-center mb-4">
  //             <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mr-3">
  //               <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
  //             </div>
  //             <div>
  //               <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-white">
  //                 {confirmTitle}
  //               </h3>
  //               <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">
  //                 Action: {pendingAction.label}
  //               </p>
  //             </div>
  //           </div>
            
  //           {/* <p className="text-gray-700 dark:text-gray-200 dark:text-gray-300 mb-6">
  //             {confirmMessage.replace('{item}', itemName).replace('{action}', actionLabel)}
  //           </p> */}
            
  //           <div className="flex justify-end space-x-3">
  //             <button
  //               onClick={handleCancel}
  //               className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 rounded-lg transition"
  //             >
  //               Annuler
  //             </button>
  //             <button
  //               onClick={handleConfirm}
  //               className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
  //                 pendingAction.type === 'delete' 
  //                   ? 'bg-red-500 hover:bg-red-600' 
  //                   : 'bg-blue-500 hover:bg-blue-600'
  //               }`}
  //             >
  //               Confirmer
  //             </button>
  //           </div>
  //         </div>
  //       </motion.div>
  //     </div>
  //   );
  // };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {renderTrigger()}
      {renderActions()}
      {/* {renderConfirmModal()} */}
    </div>
  );
};

// Exporter les utilitaires pour une utilisation externe
TableActions.actionTypes = actionTypes;
TableActions.actionIcons = actionIcons;
TableActions.actionColors = actionColors;
TableActions.actionLabels = actionLabels;

export default TableActions;