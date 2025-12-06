export interface SalesData {
  id: string;
  date: string;
  product: string;
  category: string;
  region: string;
  salesperson: string;
  quantity: number;
  unitPrice: number;
  totalSales: number;
  cost: number;
  profit: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  uploadDate: string;
  recordCount: number;
  status: 'processing' | 'completed' | 'error';
}

export interface ProcessingResult {
  data: SalesData[];
  errors: string[];
  warnings: string[];
  totalRows: number;
  processedRows: number;
  skippedRows: number;
}

export interface KPIData {
  totalSales: number;
  totalProfit: number;
  totalCost: number;
  averageOrderValue: number;
  salesGrowth: number;
  profitMargin: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  categories: string[];
  regions: string[];
  salespeople: string[];
  currency: 'USD' | 'EUR' | 'MAD';
}
