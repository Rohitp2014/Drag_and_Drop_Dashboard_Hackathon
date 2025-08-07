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
    <div className="h-full flex flex-col justify-center space-y-6 p-2">
      <div className="text-center">
        <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{current}</div>
        <div className="text-sm font-medium text-gray-500">of {target}</div>
        <div className="text-xs text-gray-400 mt-2 font-medium">{label}</div>
      </div>

      {/* Circular progress */}
      <div className="flex justify-center">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#f1f5f9"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#gradient)"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={`${percentage * 2.51} ${(100 - percentage) * 2.51}`}
              className="transition-all duration-700 ease-out drop-shadow-sm"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={`${color}aa`} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold" style={{ color }}>
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* Linear progress */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          <div
            className="h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ 
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${color}, ${color}dd)`
            }}
          />
        </div>
      </div>
    </div>
  );
};