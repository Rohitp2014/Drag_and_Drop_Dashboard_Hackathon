import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { WidgetComponent } from './widgets/WidgetComponent';
import { Widget } from '../types';

interface DashboardProps {
  widgets: Widget[];
  onUpdateWidget: (id: string, updates: Partial<Widget>) => void;
  onDeleteWidget: (id: string) => void;
  onSelectWidget: (widget: Widget) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  widgets,
  onUpdateWidget,
  onDeleteWidget,
  onSelectWidget
}) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [, drop] = useDrop({
    accept: 'widget',
    drop: (item: { id: string }, monitor) => {
      if (!monitor.didDrop()) {
        const offset = monitor.getSourceClientOffset();
        const dashboardRect = dashboardRef.current?.getBoundingClientRect();
        
        if (offset && dashboardRect) {
          const x = Math.max(0, offset.x - dashboardRect.left);
          const y = Math.max(0, offset.y - dashboardRect.top);
          
          onUpdateWidget(item.id, {
            position: { x, y }
          });
        }
      }
    }
  });

  const handleWidgetMove = useCallback((id: string, position: { x: number; y: number }) => {
    onUpdateWidget(id, { position });
  }, [onUpdateWidget]);

  const handleWidgetResize = useCallback((id: string, size: { width: number; height: number }) => {
    onUpdateWidget(id, { size });
  }, [onUpdateWidget]);

  // Auto-save functionality
  useEffect(() => {
    if (widgets.length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setLastSaved(new Date());
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [widgets]);

  drop(dashboardRef);

  return (
    <div className="flex-1 relative overflow-auto min-h-full">
      {/* Auto-save indicator */}
      {(isLoading || lastSaved) && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-sm border px-3 py-2 flex items-center space-x-2">
          {isLoading ? (
            <>
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Saving...</span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Saved {lastSaved?.toLocaleTimeString()}
              </span>
            </>
          )}
        </div>
      )}

      <div
        ref={dashboardRef}
        className="min-h-full relative"
        style={{ 
          background: `
            linear-gradient(135deg, #667eea 0%, #764ba2 100%),
            linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)
          `,
          backgroundSize: 'cover, 20px 20px, 20px 20px'
        }}
      >
      {widgets.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-screen">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-dashed border-white/60 rounded-lg"></div>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Empty Dashboard</h3>
            <p className="text-white/80 max-w-md">
              Get started by clicking "Sales Data" in the header to load the sales dashboard, or add widgets from the sidebar to create your custom dashboard.
            </p>
          </div>
        </div>
      ) : (
        widgets.map(widget => (
          <WidgetComponent
            key={widget.id}
            widget={widget}
            onMove={handleWidgetMove}
            onResize={handleWidgetResize}
            onDelete={onDeleteWidget}
            onSelect={onSelectWidget}
          />
        ))
      )}
      </div>
    </div>
  );
};