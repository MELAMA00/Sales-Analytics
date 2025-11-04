import React, { useState, useEffect, Suspense } from 'react';
import Sidebar from './components/Sidebar';
const Overview = React.lazy(() => import('./components/sections/Overview'));
const UploadData = React.lazy(() => import('./components/sections/UploadData'));
const Reporting = React.lazy(() => import('./components/sections/Reporting'));
const Trends = React.lazy(() => import('./components/sections/Trends'));
const PredictiveAnalytics = React.lazy(() => import('./components/sections/PredictiveAnalytics'));
const Settings = React.lazy(() => import('./components/sections/Settings'));
import { SalesData } from './types';
import { DataProcessor } from './utils/dataProcessor';

function App() {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [filteredData, setFilteredData] = useState<SalesData[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedSalespeople, setSelectedSalespeople] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // Set theme based on system preference (no persistence)
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // No settings persistence; remove listeners

  // Initialize date range when data is loaded
  useEffect(() => {
    if (salesData.length > 0 && (!dateRange.start || !dateRange.end)) {
      const dates = salesData.map(item => item.date).sort();
      setDateRange({
        start: dates[0],
        end: dates[dates.length - 1]
      });
    }
  }, [salesData]);

  // Apply filters whenever data or filter criteria change
  useEffect(() => {
    const normalizedRange = (dateRange.start && dateRange.end)
      ? (new Date(dateRange.start) <= new Date(dateRange.end)
        ? dateRange
        : { start: dateRange.end, end: dateRange.start })
      : undefined;

    const filtered = DataProcessor.filterData(salesData, {
      dateRange: normalizedRange,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      regions: selectedRegions.length > 0 ? selectedRegions : undefined,
      salespeople: selectedSalespeople.length > 0 ? selectedSalespeople : undefined
    });
    
    setFilteredData(filtered);
  }, [salesData, selectedCategories, selectedRegions, selectedSalespeople, dateRange]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const handleDataUpload = (newData: SalesData[]) => {
    setSalesData(prevData => [...prevData, ...newData]);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedRegions([]);
    setSelectedSalespeople([]);
    if (salesData.length > 0) {
      const dates = salesData.map(item => item.date).sort();
      setDateRange({
        start: dates[0],
        end: dates[dates.length - 1]
      });
    }
  };

  // Get unique values for filter options
  const categories = DataProcessor.getUniqueValues(salesData, 'category');
  const regions = DataProcessor.getUniqueValues(salesData, 'region');
  const salespeople = DataProcessor.getUniqueValues(salesData, 'salesperson');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <Overview
            data={salesData}
            filteredData={filteredData}
            categories={categories}
            regions={regions}
            salespeople={salespeople}
            selectedCategories={selectedCategories}
            selectedRegions={selectedRegions}
            selectedSalespeople={selectedSalespeople}
            dateRange={dateRange}
            onCategoryChange={setSelectedCategories}
            onRegionChange={setSelectedRegions}
            onSalespersonChange={setSelectedSalespeople}
            onDateRangeChange={setDateRange}
            onClearFilters={clearFilters}
          />
        );
      case 'upload':
        return <UploadData onDataUpload={handleDataUpload} />;
      case 'reporting':
        return <Reporting data={filteredData} />;
      case 'trends':
        return <Trends data={filteredData} />;
      case 'predictive':
        return <PredictiveAnalytics data={filteredData} />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview 
          data={salesData}
          filteredData={filteredData}
          categories={categories}
          regions={regions}
          salespeople={salespeople}
          selectedCategories={selectedCategories}
          selectedRegions={selectedRegions}
          selectedSalespeople={selectedSalespeople}
          dateRange={dateRange}
          onCategoryChange={setSelectedCategories}
          onRegionChange={setSelectedRegions}
          onSalespersonChange={setSelectedSalespeople}
          onDateRangeChange={setDateRange}
          onClearFilters={clearFilters}
        />;
    }
  };

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} theme={theme} onToggleTheme={toggleTheme} />
      
      <main className={`flex-1 p-8 overflow-auto`}>
        <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
          {renderActiveSection()}
        </Suspense>
      </main>
    </div>
  );
}

export default App;
