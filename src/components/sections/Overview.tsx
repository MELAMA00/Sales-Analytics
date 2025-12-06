import React, { Suspense } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Users } from 'lucide-react';
import KPICard from '../KPICard';
const Chart = React.lazy(() => import('../Chart'));
import FilterPanel from '../FilterPanel';
import { SalesData, KPIData, ChartData } from '../../types';
import { DataProcessor } from '../../utils/dataProcessor';

interface OverviewProps {
  data: SalesData[];
  filteredData: SalesData[];
  categories: string[];
  regions: string[];
  salespeople: string[];
  selectedCategories: string[];
  selectedRegions: string[];
  selectedSalespeople: string[];
  dateRange: { start: string; end: string };
  currency: 'USD' | 'EUR' | 'MAD';
  onCategoryChange: (categories: string[]) => void;
  onRegionChange: (regions: string[]) => void;
  onSalespersonChange: (salespeople: string[]) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onCurrencyChange: (currency: 'USD' | 'EUR' | 'MAD') => void;
  onClearFilters: () => void;
}

const Overview: React.FC<OverviewProps> = ({
  filteredData,
  categories,
  regions,
  salespeople,
  selectedCategories,
  selectedRegions,
  selectedSalespeople,
  dateRange,
  currency,
  onCategoryChange,
  onRegionChange,
  onSalespersonChange,
  onDateRangeChange,
  onCurrencyChange,
  onClearFilters
}) => {
  const kpis = DataProcessor.calculateKPIs(filteredData);
  const salesOverTimeChart = DataProcessor.generateSalesOverTimeChart(filteredData);
  const categoryChart = DataProcessor.generateCategoryChart(filteredData);
  const regionChart = DataProcessor.generateRegionChart(filteredData);

  if (filteredData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8 border border-gray-100 dark:border-slate-700 text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 dark:text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-600 dark:text-slate-300 mb-4">
            Upload your CSV files to start analyzing sales data and generating insights.
          </p>
          <button
            onClick={() => {/* Navigate to upload section */}}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Overview</h2>
        <p className="text-gray-600 dark:text-slate-300">
          Comprehensive view of your sales performance with {filteredData.length.toLocaleString()} records
        </p>
      </div>

      {/* Filters */}
      <FilterPanel
        categories={categories}
        regions={regions}
        salespeople={salespeople}
        selectedCategories={selectedCategories}
        selectedRegions={selectedRegions}
        selectedSalespeople={selectedSalespeople}
        dateRange={dateRange}
        currency={currency}
        onCategoryChange={onCategoryChange}
        onRegionChange={onRegionChange}
        onSalespersonChange={onSalespersonChange}
        onDateRangeChange={onDateRangeChange}
        onCurrencyChange={onCurrencyChange}
        onClearFilters={onClearFilters}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Sales"
          value={kpis.totalSales}
          change={kpis.salesGrowth}
          format="currency"
          currency={currency}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <KPICard
          title="Total Profit"
          value={kpis.totalProfit}
          change={5.2}
          format="currency"
          currency={currency}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <KPICard
          title="Profit Margin"
          value={kpis.profitMargin}
          change={2.1}
          format="percentage"
          icon={<ShoppingBag className="h-6 w-6" />}
        />
        <KPICard
          title="Avg Order Value"
          value={kpis.averageOrderValue}
          change={-1.3}
          format="currency"
          currency={currency}
          icon={<Users className="h-6 w-6" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700" style={{height: 350}} /> }>
          <Chart
            type="line"
            data={salesOverTimeChart}
            title="Sales Trend Over Time"
            currency={currency}
            height={350}
          />
        </Suspense>
        <Suspense fallback={<div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700" style={{height: 350}} /> }>
          <Chart
            type="doughnut"
            data={categoryChart}
            title="Sales by Category"
            currency={currency}
            height={350}
          />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Suspense fallback={<div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700" style={{height: 300}} /> }>
          <Chart
            type="bar"
            data={regionChart}
            title="Sales by Region"
            currency={currency}
            height={300}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default Overview;
