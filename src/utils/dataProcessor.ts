import { SalesData, KPIData, ChartData } from '../types';
import { format, parseISO, isWithinInterval } from 'date-fns';

export class DataProcessor {
  static calculateKPIs(data: SalesData[]): KPIData {
    if (data.length === 0) {
      return {
        totalSales: 0,
        totalProfit: 0,
        totalCost: 0,
        averageOrderValue: 0,
        salesGrowth: 0,
        profitMargin: 0
      };
    }

    const totalSales = data.reduce((sum, record) => sum + record.totalSales, 0);
    const totalProfit = data.reduce((sum, record) => sum + record.profit, 0);
    const totalCost = data.reduce((sum, record) => sum + record.cost, 0);
    const averageOrderValue = totalSales / data.length;
    const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    // Calculate growth (mock calculation)
    const salesGrowth = Math.random() * 20 - 10; // -10% to +10%

    return {
      totalSales,
      totalProfit,
      totalCost,
      averageOrderValue,
      salesGrowth,
      profitMargin
    };
  }

  static generateSalesOverTimeChart(data: SalesData[]): ChartData {
    const monthlyData = new Map<string, number>();
    
    data.forEach(record => {
      const monthKey = format(parseISO(record.date), 'yyyy-MM');
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + record.totalSales);
    });

    const sortedEntries = Array.from(monthlyData.entries()).sort();
    
    return {
      labels: sortedEntries.map(([month]) => format(parseISO(`${month}-01`), 'MMM yyyy')),
      datasets: [{
        label: 'Sales',
        data: sortedEntries.map(([, sales]) => sales),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2
      }]
    };
  }

  static generateCategoryChart(data: SalesData[]): ChartData {
    const categoryData = new Map<string, number>();
    
    data.forEach(record => {
      categoryData.set(record.category, (categoryData.get(record.category) || 0) + record.totalSales);
    });

    const entries = Array.from(categoryData.entries());
    
    return {
      labels: entries.map(([category]) => category),
      datasets: [{
        label: 'Sales by Category',
        data: entries.map(([, sales]) => sales),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#F97316',
          '#06B6D4',
          '#84CC16'
        ]
      }]
    };
  }

  static generateRegionChart(data: SalesData[]): ChartData {
    const regionData = new Map<string, number>();
    
    data.forEach(record => {
      regionData.set(record.region, (regionData.get(record.region) || 0) + record.totalSales);
    });

    const entries = Array.from(regionData.entries());
    
    return {
      labels: entries.map(([region]) => region),
      datasets: [{
        label: 'Sales by Region',
        data: entries.map(([, sales]) => sales),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1
      }]
    };
  }

  static filterData(data: SalesData[], filters: Partial<{
    dateRange: { start: string; end: string };
    categories: string[];
    regions: string[];
    salespeople: string[];
  }>): SalesData[] {
    return data.filter(record => {
      // Date range filter
      if (filters.dateRange) {
        const recordDate = parseISO(record.date);
        const start = parseISO(filters.dateRange.start);
        const end = parseISO(filters.dateRange.end);
        
        if (!isWithinInterval(recordDate, { start, end })) {
          return false;
        }
      }

      // Category filter
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(record.category)) {
          return false;
        }
      }

      // Region filter
      if (filters.regions && filters.regions.length > 0) {
        if (!filters.regions.includes(record.region)) {
          return false;
        }
      }

      // Salesperson filter
      if (filters.salespeople && filters.salespeople.length > 0) {
        if (!filters.salespeople.includes(record.salesperson)) {
          return false;
        }
      }

      return true;
    });
  }

  static getUniqueValues(data: SalesData[], field: keyof SalesData): string[] {
    const values = new Set(data.map(record => record[field] as string));
    return Array.from(values).sort();
  }
}