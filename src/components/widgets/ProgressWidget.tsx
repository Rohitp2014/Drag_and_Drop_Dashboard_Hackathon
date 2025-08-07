import React from 'react';
import { Widget } from '../../types';

interface ProgressWidgetProps {
  widget: Widget;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ widget }) => {
  const { data, config } = widget;
  const { current = 0, target = 100, label = 'Progress' } = data;
  const { color = '#3B82F6' } = config;

  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="h-full flex flex-col justify-center space-y-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{current}</div>
        <div className="text-sm text-gray-500">of {target}</div>
        <div className="text-xs text-gray-400 mt-1">{label}</div>
      </div>

      {/* Circular progress */}
      <div className="flex justify-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#f3f4f6"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={color}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${percentage * 2.51} ${(100 - percentage) * 2.51}`}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold" style={{ color }}>
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* Linear progress */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>
    </div>
  );
};