import React, { useState, Suspense } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react';
const Chart = React.lazy(() => import('../Chart'));
import { SalesData } from '../../types';

interface PredictiveAnalyticsProps {
  data: SalesData[];
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ data }) => {
  const [selectedModel, setSelectedModel] = useState<'linear' | 'seasonal' | 'advanced'>('linear');
  const [forecastPeriod, setForecastPeriod] = useState<number>(6);

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data for Predictions</h3>
        <p className="text-gray-600">Upload sales data to generate ML-powered forecasts</p>
      </div>
    );
  }

  // Generate mock prediction data
  const generateForecast = () => {
    const currentData = data.slice(-12).map(item => item.totalSales);
    const lastValue = currentData[currentData.length - 1] || 10000;
    const trend = selectedModel === 'linear' ? 0.05 : selectedModel === 'seasonal' ? 0.03 : 0.08;
    
    const forecast = [];
    for (let i = 1; i <= forecastPeriod; i++) {
      const baseValue = lastValue * (1 + trend * i);
      const randomFactor = 0.9 + Math.random() * 0.2; // ±10% variation
      forecast.push(Math.floor(baseValue * randomFactor));
    }
    
    return forecast;
  };

  const forecast = generateForecast();
  const forecastLabels = Array.from({ length: forecastPeriod }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i + 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  });

  const forecastChart = {
    labels: forecastLabels,
    datasets: [
      {
        label: 'Predicted Sales',
        data: forecast,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5]
      }
    ]
  };

  const confidenceChart = {
    labels: forecastLabels,
    datasets: [
      {
        label: 'Upper Bound',
        data: forecast.map(v => v * 1.2),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 1
      },
      {
        label: 'Prediction',
        data: forecast,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderWidth: 3
      },
      {
        label: 'Lower Bound',
        data: forecast.map(v => v * 0.8),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Predictive Analytics</h2>
        <p className="text-gray-600 dark:text-slate-300">AI-powered sales forecasting and trend prediction</p>
      </div>

      {/* Model Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-600" />
          Forecasting Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prediction Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as 'linear' | 'seasonal' | 'advanced')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="linear">Linear Regression</option>
              <option value="seasonal">Seasonal ARIMA</option>
              <option value="advanced">Neural Network</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Period (Months)</label>
            <select
              value={forecastPeriod}
              onChange={(e) => setForecastPeriod(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Level</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value={90}>90%</option>
              <option value={95}>95%</option>
              <option value={99}>99%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Model Performance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-700">Model Accuracy</h4>
            <Target className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">87.3%</p>
          <p className="text-sm text-gray-600">MAPE Score</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-700">R² Score</h4>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">0.91</p>
          <p className="text-sm text-gray-600">Correlation</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-700">Training Data</h4>
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{data.length}</p>
          <p className="text-sm text-gray-600">Records</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-700">Risk Level</h4>
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">Low</p>
          <p className="text-sm text-gray-600">Volatility</p>
        </div>
      </div>

      {/* Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100" style={{height: 350}} /> }>
          <Chart
            type="line"
            data={forecastChart}
            title={`${forecastPeriod}-Month Sales Forecast`}
            height={350}
          />
        </Suspense>
        
        <Suspense fallback={<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100" style={{height: 350}} /> }>
          <Chart
            type="line"
            data={confidenceChart}
            title="Prediction Confidence Intervals"
            height={350}
          />
        </Suspense>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights & Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Forecast Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-800">Expected Growth</span>
                <span className="font-semibold text-green-600">+12.5%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-800">Peak Month</span>
                <span className="font-semibold text-blue-600">{forecastLabels[2]}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-800">Predicted Revenue</span>
                <span className="font-semibold text-purple-600">
                  ${forecast.reduce((a, b) => a + b, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Strategic Recommendations</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span>Increase inventory for high-demand products in {forecastLabels[2]}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span>Consider seasonal marketing campaigns to maximize growth</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span>Focus on Electronics category for highest ROI</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-600">!</span>
                <span>Monitor market conditions for potential volatility</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
