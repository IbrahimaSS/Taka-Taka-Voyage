import { useTranslation } from 'react-i18next';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import ChartCard from '../../ui/ChartCard';
import { formatGNF } from './commissionHelpers';

const CommissionsCharts = ({ evolutionData, repartitionData, chartHeight }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <ChartCard
          title={t('commissions.evolution_chart')}
          subtitle={t('commissions.real_data_subtitle')}
          chartConfig={{
            type: 'line',
            data: {
              labels: evolutionData.length > 0 ? evolutionData.map(d => d.label) : ['Aucune donnée'],
              datasets: [{
                label: t('payments.platform_commission') + ' (GNF)',
                data: evolutionData.length > 0 ? evolutionData.map(d => d.total) : [0],
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
              }]
            },
            options: {
              scales: {
                y: {
                  ticks: {
                    callback: (value) => `${(value / 1000).toFixed(0)}K`
                  }
                }
              }
            }
          }}
          height={chartHeight}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('commissions.repartition_service')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {repartitionData.length > 0 ? repartitionData.map((item, idx) => {
            const serviceLabels = {
              MOTO: t('commissions.moto_taxi'),
              TAXI: t('commissions.taxi'),
              VOITURE: t('commissions.private_car'),
              BUS: t('commissions.bus')
            };
            const serviceColors = { MOTO: 'green', TAXI: 'blue', VOITURE: 'purple', BUS: 'orange' };
            const label = serviceLabels[item.service] || item.service;
            const color = serviceColors[item.service] || 'gray';
            const colorClass = color === 'green' ? 'bg-green-500' : color === 'blue' ? 'bg-blue-500' : color === 'purple' ? 'bg-purple-500' : color === 'orange' ? 'bg-orange-500' : 'bg-gray-500';
            return (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{item.pourcentage}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${colorClass}`}
                    style={{ width: `${item.pourcentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatGNF(item.montant)}</p>
              </div>
            );
          }) : (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('commissions.no_repartition_data')}</p>
            </div>
          )}
          {repartitionData.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('commissions.total_commissions')}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {formatGNF(repartitionData.reduce((sum, r) => sum + r.montant, 0))}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionsCharts;
