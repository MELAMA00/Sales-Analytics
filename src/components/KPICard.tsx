import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  format?: 'currency' | 'percentage' | 'number';
  icon?: React.ReactNode;
  currency?: 'USD' | 'EUR' | 'MAD';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, format = 'number', icon, currency = 'USD' }) => {
  const formatValue = (val: string | number) => {
    const numValue = typeof val === 'string' ? parseFloat(val) : val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(numValue);
      case 'percentage':
        return `${numValue.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(numValue);
    }
  };

  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="h-4 w-4 text-gray-400" />;
    return change > 0 
      ? <TrendingUp className="h-4 w-4 text-green-500" />
      : <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-gray-600';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 dark:text-slate-300 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{formatValue(value)}</p>
          
          {change !== undefined && (
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-gray-500 dark:text-slate-400 text-sm">vs last period</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="flex-shrink-0 text-blue-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
