import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red';
  format?: 'currency' | 'percentage' | 'number';
}

export function KPICard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  color = 'blue',
  format = 'number'
}: KPICardProps) {
  const formatValue = (val: string | number) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(numVal);
      case 'percentage':
        return `${numVal.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(numVal);
    }
  };

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className={`h-2 bg-gradient-to-r ${colorClasses[color]}`}></div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </h3>
          {icon && (
            <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>
              {icon}
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {formatValue(value)}
            </p>
            {change !== undefined && (
              <div className="flex items-center space-x-1">
                {change >= 0 ? (
                  <TrendingUp size={16} className="text-green-500" />
                ) : (
                  <TrendingDown size={16} className="text-red-500" />
                )}
                <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(change).toFixed(1)}%
                </span>
                {changeLabel && (
                  <span className="text-sm text-gray-500">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}