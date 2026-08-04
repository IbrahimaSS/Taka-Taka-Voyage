import { TrendingUp } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Button from '../../ui/Bttn';
import ChartCard from '../../ui/ChartCard';
import MethodIcon from './MethodIcon';
import { useTranslation } from 'react-i18next';

const PaymentsCharts = ({ timeRange, onTimeRangeChange, chartData, paymentMethods }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>{t('payments.evolution_chart')}</CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('payments.evolution_desc')}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={timeRange === '30j' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => onTimeRangeChange('30j')}>
                  30j
                </Button>
                <Button
                  variant={timeRange === '90j' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => onTimeRangeChange('90j')}>
                  90j
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartCard
              title=""
              subtitle=""
              chartConfig={{
                type: 'line',
                data: chartData.revenueChart,
                options: {
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  }
                }
              }}
              height="250px"
            />

          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par méthode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.type} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 rounded-lg transition">
                  <div className="flex items-center">
                    <MethodIcon method={method.type} className="w-10 h-10 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{method.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{method.percentage}% ({method.count})</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 dark:text-gray-100">{method.amount}</p>
                    <p className="text-sm text-green-500 flex items-center justify-end">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {method.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsCharts;
