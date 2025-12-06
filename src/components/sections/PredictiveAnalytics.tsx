import React, { useMemo, useState, Suspense } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, FileText, FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
const Chart = React.lazy(() => import('../Chart'));
import { SalesData } from '../../types';

interface PredictiveAnalyticsProps {
  data: SalesData[];
  currency: 'USD' | 'EUR' | 'MAD';
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ data, currency }) => {
  const [selectedModel, setSelectedModel] = useState<'linear' | 'seasonal' | 'advanced'>('linear');
  const [forecastPeriod, setForecastPeriod] = useState<number>(6);
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data for Predictions</h3>
        <p className="text-gray-600">Upload sales data to generate ML-powered forecasts</p>
      </div>
    );
  }

  // Generate mock prediction data (memoized to avoid new random values every render)
  const forecast = useMemo(() => {
    const currentData = data.slice(-12).map(item => item.totalSales);
    const lastValue = currentData[currentData.length - 1] || 10000;
    const trend = selectedModel === 'linear' ? 0.05 : selectedModel === 'seasonal' ? 0.03 : 0.08;

    const nextValues = [];
    for (let i = 1; i <= forecastPeriod; i++) {
      const baseValue = lastValue * (1 + trend * i);
      const randomFactor = 0.9 + Math.random() * 0.2; // +/- 10% variation
      nextValues.push(Math.floor(baseValue * randomFactor));
    }

    return nextValues;
  }, [data, forecastPeriod, selectedModel]);

  const forecastLabels = useMemo(() => (
    Array.from({ length: forecastPeriod }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() + i + 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    })
  ), [forecastPeriod]);

  const exportRows = useMemo<(string | number)[][]>(() => {
    const header: (string | number)[][] = [
      ['Sales Forecast'],
      ['Model', selectedModel === 'linear' ? 'Linear Regression' : selectedModel === 'seasonal' ? 'Seasonal ARIMA' : 'Neural Network'],
      ['Period (months)', forecastPeriod],
      [],
      ['Month', 'Predicted Sales']
    ];

    const rows = forecast.map((value, idx) => [forecastLabels[idx], value]);
    return [...header, ...rows];
  }, [forecast, forecastLabels, forecastPeriod, selectedModel]);

  const downloadCSV = () => {
    const escapeCell = (cell: string | number) => {
      const value = String(cell ?? '');
      const needsEscaping = value.includes(',') || value.includes('"') || value.includes('\n');
      if (!needsEscaping) return value;
      return `"${value.replace(/"/g, '""')}"`;
    };

    const csvContent = exportRows.map(row => row.map(escapeCell).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forecast-${selectedModel}-${forecastPeriod}m.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Forecast');
    XLSX.writeFile(workbook, `forecast-${selectedModel}-${forecastPeriod}m.xlsx`);
  };

  const downloadPDF = () => {
    const htmlRows = exportRows
      .map(row => `<tr>${row.map(cell => `<td style="padding:8px 12px;border:1px solid #e2e8f0;">${cell}</td>`).join('')}</tr>`)
      .join('');

    const html = `
      <html>
        <head>
          <title>Forecast Export</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h2 { margin-bottom: 12px; }
            table { border-collapse: collapse; width: 100%; }
            td { font-size: 12px; }
          </style>
        </head>
        <body>
          <h2>Sales Forecast (${forecastPeriod}-Month)</h2>
          <table>${htmlRows}</table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onafterprint = () => printWindow.close();
    printWindow.print();
  };

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

      {/* Export Options */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Forecast</h3>
            <p className="text-sm text-gray-600 dark:text-slate-300">Download the forecast in your preferred format</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={downloadCSV}
            className="flex items-center justify-center gap-2 bg-blue-50 text-blue-800 border border-blue-100 dark:border-slate-700 rounded-lg px-4 py-3 hover:bg-blue-100 transition-colors"
          >
            <FileText className="h-4 w-4" />
            CSV
          </button>
          <button
            onClick={downloadExcel}
            className="flex items-center justify-center gap-2 bg-green-50 text-green-800 border border-green-100 dark:border-slate-700 rounded-lg px-4 py-3 hover:bg-green-100 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center justify-center gap-2 bg-purple-50 text-purple-800 border border-purple-100 dark:border-slate-700 rounded-lg px-4 py-3 hover:bg-purple-100 transition-colors"
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
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
            <h4 className="font-medium text-gray-700">R^2 Score</h4>
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
            currency={currency}
            height={350}
          />
        </Suspense>
        
        <Suspense fallback={<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100" style={{height: 350}} /> }>
          <Chart
            type="line"
            data={confidenceChart}
            title="Prediction Confidence Intervals"
            currency={currency}
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
                  {formatCurrency(forecast.reduce((a, b) => a + b, 0))}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Strategic Recommendations</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-green-600">&#10003;</span>
                <span>Increase inventory for high-demand products in {forecastLabels[2]}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600">&#10003;</span>
                <span>Consider seasonal marketing campaigns to maximize growth</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600">&#10003;</span>
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
