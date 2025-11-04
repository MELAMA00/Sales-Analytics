import { SalesRecord, KPIData } from '../types';
import { format, parseISO, isWithinInterval } from 'date-fns';

export class DataWarehouse {
  private static instance: DataWarehouse;
  private salesData: SalesRecord[] = [];
  private observers: (() => void)[] = [];

  private constructor() {
    // In-memory only: no persistent storage
  }

  static getInstance(): DataWarehouse {
    if (!DataWarehouse.instance) {
      DataWarehouse.instance = new DataWarehouse();
    }
    return DataWarehouse.instance;
  }

  subscribe(callback: () => void) {
    this.observers.push(callback);
  }

  unsubscribe(callback: () => void) {
    this.observers = this.observers.filter(obs => obs !== callback);
  }

  private notify() {
    this.observers.forEach(callback => callback());
  }

  addSalesData(records: SalesRecord[]) {
    this.salesData = [...this.salesData, ...records];
    this.notify();
  }

  getSalesData(): SalesRecord[] {
    return this.salesData;
  }

  getFilteredData(filters: any): SalesRecord[] {
    return this.salesData.filter(record => {
      const recordDate = parseISO(record.date);
      
      // Date range filter
      if (filters.dateRange?.start && filters.dateRange?.end) {
        const start = parseISO(filters.dateRange.start);
        const end = parseISO(filters.dateRange.end);
        if (!isWithinInterval(recordDate, { start, end })) {
          return false;
        }
      }

      // Other filters
      if (filters.product && record.product !== filters.product) return false;
      if (filters.category && record.category !== filters.category) return false;
      if (filters.region && record.region !== filters.region) return false;
      if (filters.salesperson && record.salesperson !== filters.salesperson) return false;

      return true;
    });
  }

  getKPIData(filters?: any): KPIData {
    const data = filters ? this.getFilteredData(filters) : this.salesData;
    
    if (data.length === 0) {
      return {
        totalSales: 0,
        totalProfit: 0,
        totalCost: 0,
        profitMargin: 0,
        averageOrderValue: 0,
        totalOrders: 0
      };
    }

    const totalSales = data.reduce((sum, record) => sum + record.totalSales, 0);
    const totalProfit = data.reduce((sum, record) => sum + record.profit, 0);
    const totalCost = data.reduce((sum, record) => sum + record.cost, 0);
    const totalOrders = data.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    return {
      totalSales,
      totalProfit,
      totalCost,
      profitMargin,
      averageOrderValue,
      totalOrders
    };
  }

  getSalesByMonth(filters?: any) {
    const data = filters ? this.getFilteredData(filters) : this.salesData;
    const monthlyData = new Map();

    data.forEach(record => {
      const month = format(parseISO(record.date), 'yyyy-MM');
      if (monthlyData.has(month)) {
        monthlyData.set(month, monthlyData.get(month) + record.totalSales);
      } else {
        monthlyData.set(month, record.totalSales);
      }
    });

    const sortedMonths = Array.from(monthlyData.keys()).sort();
    return {
      labels: sortedMonths.map(month => format(parseISO(month + '-01'), 'MMM yyyy')),
      data: sortedMonths.map(month => monthlyData.get(month))
    };
  }

  getSalesByCategory(filters?: any) {
    const data = filters ? this.getFilteredData(filters) : this.salesData;
    const categoryData = new Map();

    data.forEach(record => {
      if (categoryData.has(record.category)) {
        categoryData.set(record.category, categoryData.get(record.category) + record.totalSales);
      } else {
        categoryData.set(record.category, record.totalSales);
      }
    });

    return {
      labels: Array.from(categoryData.keys()),
      data: Array.from(categoryData.values())
    };
  }

  getSalesByRegion(filters?: any) {
    const data = filters ? this.getFilteredData(filters) : this.salesData;
    const regionData = new Map();

    data.forEach(record => {
      if (regionData.has(record.region)) {
        regionData.set(record.region, regionData.get(record.region) + record.totalSales);
      } else {
        regionData.set(record.region, record.totalSales);
      }
    });

    return {
      labels: Array.from(regionData.keys()),
      data: Array.from(regionData.values())
    };
  }

  getTopProducts(limit = 10, filters?: any) {
    const data = filters ? this.getFilteredData(filters) : this.salesData;
    const productData = new Map();

    data.forEach(record => {
      if (productData.has(record.product)) {
        productData.set(record.product, productData.get(record.product) + record.totalSales);
      } else {
        productData.set(record.product, record.totalSales);
      }
    });

    return Array.from(productData.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([product, sales]) => ({ product, sales }));
  }

  getUniqueValues(field: keyof SalesRecord): string[] {
    const values = new Set(this.salesData.map(record => record[field] as string));
    return Array.from(values).sort();
  }

  clearData() {
    this.salesData = [];
    this.notify();
  }
}
