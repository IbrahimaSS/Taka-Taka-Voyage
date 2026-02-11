// data/mockNotifications.ts
import { NotificationItem } from './Notification';

export const mockNotifications = [
  {
    id: '1',
    type: 'trajet',
    title: 'Nouvelle demande de trajet',
    message: 'Marie souhaite rejoindre Paris depuis Lyon demain à 14h',
    time: 'Il y a 5 min',
    isRead,
    metadata: {
      prix: '45€',
      destination: 'Paris',
      departure: 'Lyon',
      date: 'Demain 14h'
    }
  },
  {
    id: '2',
    type: 'paiement',
    title: 'Paiement confirmé',
    message: 'Votre paiement de 120€ a été traité avec succès',
    time: 'Il y a 1h',
    isRead,
    metadata: {
      prix: '120€',
      statut: 'Confirmé'
    }
  },
  {
    id: '3',
    type: 'trajet',
    title: 'Trajet annulé',
    message: 'Votre trajet vers Marseille a été annulé',
    time: 'Hier',
    isRead,
    metadata: {
      destination: 'Marseille'
    }
  },
  {
    id: '4',
    type: 'system',
    title: 'Maintenance programmée',
    message: 'Une maintenance est prévue ce soir de 23h à 01h',
    time: 'Il y a 2 jours',
    isRead
  }
];