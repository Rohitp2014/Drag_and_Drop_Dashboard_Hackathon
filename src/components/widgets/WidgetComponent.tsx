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
  onUpdateWidget: (id: string, updates: Partial<Widget>) => void;
}

export const WidgetComponent: React.FC<WidgetComponentProps> = ({
  widget,
  onMove,
  onResize,
  onDelete,
  onSelect,
  onUpdateWidget
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
      className={`absolute bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 transition-all duration-300 ${
        isDragging 
          ? 'opacity-80 scale-105 border-blue-400 shadow-2xl rotate-1' 
          : isHovered || isSelected
            ? 'border-blue-300 shadow-xl transform hover:scale-[1.02]'
            : 'border-white/30 hover:border-blue-200 hover:shadow-xl hover:transform hover:scale-[1.01]'
      }`}
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
      <div className="flex items-center justify-between p-4 border-b border-gray-100/50 bg-gradient-to-r from-white/60 to-white/40 rounded-t-2xl backdrop-blur-sm">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className="p-1 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
            <Move className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800 truncate text-sm">{widget.title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(widget);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Configure"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(widget.id);
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Delete"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        className="p-5 h-[calc(100%-68px)] overflow-hidden"
        style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        {widget.type === 'table' ? (
          <TableWidget widget={widget} onUpdateWidget={onUpdateWidget} />
        ) : (
          renderWidget()
        )}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize opacity-0 hover:opacity-100 transition-all duration-200 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-tl-xl"
        onMouseDown={startResize}
      >
        <div className="absolute bottom-1 right-1 w-0 h-0 border-l-4 border-l-transparent border-b-4 border-b-blue-500/70"></div>
        <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-l-3 border-l-transparent border-b-3 border-b-purple-400/70"></div>
      </div>
    </div>
  );
};