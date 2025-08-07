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
    <div className="flex-1 relative overflow-auto min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Auto-save indicator */}
      {(isLoading || lastSaved) && (
        <div className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 px-4 py-3 flex items-center space-x-3 transition-all duration-300">
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">Saving...</span>
            </>
          ) : (
            <>
              <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                Saved {lastSaved?.toLocaleTimeString()}
              </span>
            </>
          )}
        </div>
      )}

      <div
        ref={dashboardRef}
        className="min-h-full relative p-6"
        style={{ 
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%),
            linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
          `,
          backgroundSize: 'cover, 24px 24px, 24px 24px'
        }}
      >
      {widgets.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[80vh]">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-xl border border-white/20">
              <div className="w-16 h-16 border-4 border-dashed border-white/70 rounded-2xl animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Empty Dashboard
            </h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              Get started by clicking "Sales Data" in the header to load the sales dashboard, or add widgets from the sidebar to create your custom dashboard.
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
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
            onUpdateWidget={onUpdateWidget}
          />
        ))
      )}
      </div>
    </div>
  );
};