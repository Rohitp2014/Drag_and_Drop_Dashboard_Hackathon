import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Widget } from '../../types';

interface MetricWidgetProps {
  widget: Widget;
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({ widget }) => {
  const { data, config } = widget;
  const { value = '$0', change = '0%', trend = 'neutral' } = data;
  const { color = '#10B981' } = config;

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
        {change && (
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{change}</span>
          </div>
        )}
      </div>
      
      <div 
        className="h-1 bg-gray-200 rounded-full overflow-hidden"
      >
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            backgroundColor: color,
            width: trend === 'up' ? '75%' : trend === 'down' ? '25%' : '50%'
          }}
        />
      </div>
    </div>
  );
};