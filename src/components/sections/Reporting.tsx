import React, { useState } from 'react';
import { FileText, Download, Filter } from 'lucide-react';
import { SalesData } from '../../types';

interface ReportingProps {
  data: SalesData[];
}

const Reporting: React.FC<ReportingProps> = ({ data }) => {
  const [selectedReport, setSelectedReport] = useState<string>('sales-summary');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const reports = [
    { id: 'sales-summary', name: 'Sales Summary', description: 'Overview of sales performance' },
    { id: 'product-performance', name: 'Product Performance', description: 'Analysis by product' },
    { id: 'regional-analysis', name: 'Regional Analysis', description: 'Sales by geographic region' },
    { id: 'salesperson-performance', name: 'Salesperson Performance', description: 'Individual performance metrics' },
    { id: 'profit-analysis', name: 'Profit Analysis', description: 'Profitability breakdown' }
  ];

  const renderSalesSummary = () => {
    const totalSales = data.reduce((sum, record) => sum + record.totalSales, 0);
    const totalProfit = data.reduce((sum, record) => sum + record.profit, 0);
    const totalCost = data.reduce((sum, record) => sum + record.cost, 0);
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Sales Summary Report</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900">Total Sales</h4>
            <p className="text-2xl font-bold text-blue-700">
              ${totalSales.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900">Total Profit</h4>
            <p className="text-2xl font-bold text-green-700">
              ${totalProfit.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900">Total Cost</h4>
            <p className="text-2xl font-bold text-red-700">
              ${totalCost.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.slice(0, 10).map((record, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.totalSales.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.profit.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProductPerformance = () => {
    const productStats = new Map();
    
    data.forEach(record => {
      if (!productStats.has(record.product)) {
        productStats.set(record.product, {
          product: record.product,
          category: record.category,
          totalSales: 0,
          totalProfit: 0,
          quantity: 0
        });
      }
      
      const stats = productStats.get(record.product);
      stats.totalSales += record.totalSales;
      stats.totalProfit += record.profit;
      stats.quantity += record.quantity;
    });
    
    const products = Array.from(productStats.values()).sort((a, b) => b.totalSales - a.totalSales);
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Product Performance Report</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.quantity.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.totalSales.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.totalProfit.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReport = () => {
    switch (selectedReport) {
      case 'sales-summary':
        return renderSalesSummary();
      case 'product-performance':
        return renderProductPerformance();
      default:
        return <div className="text-center py-8 text-gray-600">Select a report to view details</div>;
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">Upload data to generate reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reporting</h2>
        <p className="text-gray-600 dark:text-slate-300">Generate detailed reports and analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 mb-4">Available Reports</h3>
            <div className="space-y-2">
              {reports.map(report => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedReport === report.id
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="font-medium">{report.name}</div>
                  <div className="text-sm text-gray-600 dark:text-slate-300">{report.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Report Details</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300">Data from {data.length} records</p>
              </div>
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
            
            <div className="p-6">
              {renderReport()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reporting;
