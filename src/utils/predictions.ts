import { SalesRecord } from '../types';
import { format, parseISO, addMonths } from 'date-fns';

export interface PredictionResult {
  month: string;
  predictedSales: number;
  confidence: number;
}

export function generateSalesPredictions(data: SalesRecord[], monthsAhead = 6): PredictionResult[] {
  if (data.length === 0) return [];

  // Group sales by month
  const monthlyData = new Map<string, number>();
  data.forEach(record => {
    const month = format(parseISO(record.date), 'yyyy-MM');
    monthlyData.set(month, (monthlyData.get(month) || 0) + record.totalSales);
  });

  const sortedMonths = Array.from(monthlyData.keys()).sort();
  const salesValues = sortedMonths.map(month => monthlyData.get(month)!);

  // Simple linear regression for trend
  const n = salesValues.length;
  if (n < 2) return [];

  const x = Array.from({ length: n }, (_, i) => i);
  const y = salesValues;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate moving average for seasonal adjustment
  const windowSize = Math.min(3, n);
  const movingAverages: number[] = [];
  for (let i = 0; i < n; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(n, start + windowSize);
    const window = salesValues.slice(start, end);
    movingAverages.push(window.reduce((a, b) => a + b, 0) / window.length);
  }

  // Generate predictions
  const predictions: PredictionResult[] = [];
  const lastMonthDate = parseISO(sortedMonths[sortedMonths.length - 1] + '-01');

  for (let i = 1; i <= monthsAhead; i++) {
    const futureMonth = addMonths(lastMonthDate, i);
    const monthStr = format(futureMonth, 'MMM yyyy');
    
    // Linear trend prediction
    const trendPrediction = intercept + slope * (n + i - 1);
    
    // Add seasonal component (simplified)
    const seasonalIndex = (n + i - 1) % 12;
    const seasonalFactor = 1 + (Math.sin((seasonalIndex * Math.PI) / 6) * 0.1);
    
    const predictedSales = Math.max(0, trendPrediction * seasonalFactor);
    
    // Calculate confidence (decreases with distance)
    const confidence = Math.max(0.3, 0.9 - (i - 1) * 0.1);

    predictions.push({
      month: monthStr,
      predictedSales: Math.round(predictedSales),
      confidence: Math.round(confidence * 100)
    });
  }

  return predictions;
}