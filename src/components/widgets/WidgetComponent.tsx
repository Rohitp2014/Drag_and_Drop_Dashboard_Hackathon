import React, { useRef, useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { Settings, X, Move } from 'lucide-react';
import { Widget } from '../../types';
import { MetricWidget } from './MetricWidget';
import { ChartWidget } from './ChartWidget';
import { TableWidget } from './TableWidget';
import { ProgressWidget } from './ProgressWidget';
import { TextWidget } from './TextWidget';

interface WidgetComponentProps {
  widget: Widget;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onDelete: (id: string) => void;
  onSelect: (widget: Widget) => void;
}

export const WidgetComponent: React.FC<WidgetComponentProps> = ({
  widget,
  onMove,
  onResize,
  onDelete,
  onSelect
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: 'widget',
    item: { id: widget.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !widgetRef.current) return;

    const rect = widgetRef.current.getBoundingClientRect();
    const newWidth = Math.max(200, e.clientX - rect.left);
    const newHeight = Math.max(100, e.clientY - rect.top);

    onResize(widget.id, { width: newWidth, height: newHeight });
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  const stopResize = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', stopResize);
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
      };
    }
  }, [isResizing]);

  const renderWidget = () => {
    switch (widget.type) {
      case 'metric':
        return <MetricWidget widget={widget} />;
      case 'chart':
        return <ChartWidget widget={widget} />;
      case 'table':
        return <TableWidget widget={widget} />;
      case 'progress':
        return <ProgressWidget widget={widget} />;
      case 'text':
        return <TextWidget widget={widget} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(true);
    onSelect(widget);
    setTimeout(() => setIsSelected(false), 200);
  };

  drag(widgetRef);

  return (
    <div
      ref={widgetRef}
      className={`absolute bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
        isDragging 
          ? 'opacity-75 scale-105 border-blue-400 shadow-xl backdrop-blur-sm' 
          : isHovered || isSelected
            ? 'border-blue-300 shadow-lg backdrop-blur-sm'
            : 'border-white/50 hover:border-white/80 hover:shadow-lg backdrop-blur-sm'
      } bg-white/95`}
      style={{
        left: widget.position.x,
        top: widget.position.y,
        width: widget.size.width,
        height: widget.size.height,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100/50 bg-white/50 rounded-t-lg">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Move className="w-4 h-4 text-gray-400" />
          <h3 className="font-medium text-gray-800 truncate">{widget.title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(widget);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Configure"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(widget.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        className="p-4 h-[calc(100%-60px)] overflow-hidden"
        style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        {renderWidget()}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity bg-blue-500/20 rounded-tl-lg"
        onMouseDown={startResize}
      >
        <div className="absolute bottom-1 right-1 w-0 h-0 border-l-4 border-l-transparent border-b-4 border-b-blue-500"></div>
        <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-l-3 border-l-transparent border-b-3 border-b-blue-400"></div>
      </div>
    </div>
  );
};