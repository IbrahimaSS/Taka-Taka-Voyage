import { Plus } from 'lucide-react';
import { CardHeader, CardTitle } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';
import ExportDropdown from '../../admin/ui/ExportDropdown';

const PlanningHeader = ({ scheduledTrips, onBookNewTrip }) => {
  return (
    <CardHeader align="start" className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <div>
          <CardTitle size="xl">Planning des trajets</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Suivez et exportez votre agenda de mobilité</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <ExportDropdown
            data={scheduledTrips}
            columns={[
              { accessor: 'date', header: 'Date' },
              { accessor: 'time', header: 'Heure' },
              { accessor: 'pickup', header: 'Départ' },
              { accessor: 'destination', header: 'Destination' },
              { accessor: 'vehicle', header: 'Véhicule' },
              { accessor: 'price', header: 'Prix' },
              { accessor: 'status', header: 'Statut' }
            ]}
            fileName="planning_takataka"
            title="Planning des trajets"
          />
          <Button variant="primary" onClick={onBookNewTrip} icon={Plus} fullWidth className="sm:w-auto">Nouveau Trajet</Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default PlanningHeader;
