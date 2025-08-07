import React from 'react';
import { Widget } from '../../types';

interface ChartWidgetProps {
  widget: Widget;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ widget }) => {
  const { data, config } = widget;
  const { labels = [], values = [] } = data;
  const { chartType = 'line', color = '#3B82F6' } = config;

  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  // Format numbers for display
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Generate Y-axis labels
  const getYAxisLabels = () => {
    const steps = 4;
    const stepValue = range / steps;
    const labels = [];
    for (let i = 0; i <= steps; i++) {
      const value = minValue + (stepValue * i);
      labels.push(formatValue(Math.round(value)));
    }
    return labels.reverse(); // Reverse to show highest at top
  };

  const getPathData = () => {
    if (values.length < 2) return '';
    
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - ((value - minValue) / range) * 100;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const renderChart = () => {
    if (chartType === 'bar') {
      return (
        <div className="flex h-40">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between text-xs text-gray-500 pr-2 py-1">
            {getYAxisLabels().map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
          
          {/* Chart area */}
          <div className="flex-1 flex items-end justify-between space-x-1">
            {values.map((value, index) => {
              const height = ((value - minValue) / range) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative flex flex-col items-center">
                    {/* Value label on top of bar */}
                    <span className="text-xs text-gray-700 font-medium mb-1">
                      {formatValue(value)}
                    </span>
                    <div
                      className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                      style={{
                        height: `${Math.max(height, 2)}px`,
                        backgroundColor: color,
                        minHeight: '2px'
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1 truncate">
                    {labels[index] || `#${index + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (chartType === 'pie') {
      const total = values.reduce((sum, value) => sum + value, 0);
      let currentAngle = 0;
      
      return (
        <div className="h-40 flex items-center justify-between">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {values.map((value, index) => {
                const percentage = (value / total) * 100;
                const angle = (percentage / 100) * 360;
                const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                const largeArc = angle > 180 ? 1 : 0;
                
                // Calculate text position (middle of the slice)
                const textAngle = currentAngle + angle / 2;
                const textRadius = 25;
                const textX = 50 + textRadius * Math.cos((textAngle * Math.PI) / 180);
                const textY = 50 + textRadius * Math.sin((textAngle * Math.PI) / 180);
                
                const pathData = [
                  `M 50 50`,
                  `L ${x1} ${y1}`,
                  `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                const sliceColor = `hsl(${(index * 60) % 360}, 70%, 60%)`;
                const result = (
                  <g key={index}>
                    <path
                      d={pathData}
                      fill={sliceColor}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                    {/* Value text in slice (only show if slice is large enough) */}
                    {percentage > 8 && (
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-white text-xs font-medium"
                        transform={`rotate(${textAngle > 90 && textAngle < 270 ? textAngle + 180 : textAngle} ${textX} ${textY})`}
                      >
                        {formatValue(value)}
                      </text>
                    )}
                  </g>
                );
                
                currentAngle += angle;
                return result;
              })}
            </svg>
          </div>
          
          {/* Enhanced legend with values and percentages */}
          <div className="ml-4 space-y-2 flex-1">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
            {labels.slice(0, 5).map((label, index) => {
              const value = values[index];
              const percentage = ((value / total) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center flex-1 min-w-0">
                    <div 
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: `hsl(${(index * 60) % 360}, 70%, 60%)` }}
                    />
                    <span className="truncate">{label}</span>
                  </div>
                  <div className="ml-2 text-right">
                    <div className="font-medium text-gray-900">{formatValue(value)}</div>
                    <div className="text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            })}
            {labels.length > 5 && (
              <div className="text-xs text-gray-400 italic">
                +{labels.length - 5} more items
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-40 flex">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between text-xs text-gray-500 pr-2 py-1">
          {getYAxisLabels().map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
        
        {/* Chart area */}
        <div className="flex-1 relative">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            
            {/* Horizontal grid lines for Y-axis values */}
            {getYAxisLabels().map((_, index) => {
              const y = (index / (getYAxisLabels().length - 1)) * 100;
              return (
                <line
                  key={index}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                />
              );
            })}
            
            {/* Chart line */}
            {values.length >= 2 && (
              <path
                d={getPathData()}
                fill="none"
                stroke={color}
                strokeWidth="2"
                className="transition-all duration-300"
              />
            )}
            
            {/* Data points */}
            {values.map((value, index) => {
              const x = (index / (values.length - 1)) * 100;
              const y = 100 - ((value - minValue) / range) * 100;
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    fill={color}
                    className="transition-all duration-300 hover:r-4"
                  />
                  {/* Value labels on data points */}
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    className="fill-gray-700 text-xs font-medium"
                    style={{ fontSize: '3px' }}
                  >
                    {formatValue(value)}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            {labels.slice(0, 5).map((label, index) => (
              <span key={index} className="truncate">{label}</span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      {renderChart()}
    </div>
  );
};