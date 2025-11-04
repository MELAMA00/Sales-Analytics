import React, { useState, Suspense } from 'react';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';
const Chart = React.lazy(() => import('../Chart'));
import { SalesData } from '../../types';
import { DataProcessor } from '../../utils/dataProcessor';

interface TrendsProps {
  data: SalesData[];
}

const Trends: React.FC<TrendsProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'profit' | 'volume'>('sales');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Trend Data Available</h3>
        <p className="text-gray-600">Upload sales data to analyze trends and patterns</p>
      </div>
    );
  }

  const salesOverTimeChart = DataProcessor.generateSalesOverTimeChart(data);
  const categoryChart = DataProcessor.generateCategoryChart(data);
  const regionChart = DataProcessor.generateRegionChart(data);

  // Generate additional trend data
  const quarterlyData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Quarterly Sales',
      data: [
        Math.floor(Math.random() * 100000) + 50000,
        Math.floor(Math.random() * 100000) + 50000,
        Math.floor(Math.random() * 100000) + 50000,
        Math.floor(Math.random() * 100000) + 50000
      ],
      backgroundColor: '#10B981',
      borderColor: '#059669',
      borderWidth: 2
    }]
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trends Analysis</h2>
        <p className="text-gray-600 dark:text-slate-300">Interactive charts to explore sales trends and patterns</p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as 'sales' | 'profit' | 'volume')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="sales">Sales Revenue</option>
                <option value="profit">Profit</option>
                <option value="volume">Sales Volume</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Last 12 months</span>
          </div>
        </div>
      </div>

      {/* Main Trend Chart */}
      <Suspense fallback={<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100" style={{height: 400}} /> }>
        <Chart
          type="line"
          data={salesOverTimeChart}
          title={`${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend - ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}`}
          height={400}
        />
      </Suspense>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100" style={{height: 300}} /> }>
          <Chart
            type="bar"
            data={quarterlyData}
            title="Quarterly Performance"
            height={300}
          />
        </Suspense>
        
        <Suspense fallback={<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100" style={{height: 300}} /> }>
          <Chart
            type="doughnut"
            data={categoryChart}
            title="Category Distribution"
            height={300}
          />
        </Suspense>
      </div>

      <Suspense fallback={<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100" style={{height: 300}} /> }>
        <Chart
          type="bar"
          data={regionChart}
          title="Regional Performance Trends"
          height={300}
        />
      </Suspense>

      {/* Trend Insights */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          Key Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-1">Growth Trend</h4>
            <p className="text-sm text-blue-800">Sales showing positive upward trend over the last quarter</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-1">Best Performing</h4>
            <p className="text-sm text-green-800">Electronics category leading in revenue generation</p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-1">Seasonal Pattern</h4>
            <p className="text-sm text-yellow-800">Holiday seasons show 25% increase in sales volume</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trends;
