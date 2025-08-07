import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { User, databaseManager } from './lib/supabase';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ConfigPanel } from './components/ConfigPanel';
import { DatasetViewer } from './components/DatasetViewer';
import { UserSelector } from './components/UserSelector';
import { DataManager } from './components/DataManager';
import { Widget, DashboardLayout } from './types';
import { generateId } from './utils/helpers';
import { validateDashboardData, debounce } from './utils/helpers';

function App() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isDatasetViewerOpen, setIsDatasetViewerOpen] = useState(false);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const [dashboardTitle, setDashboardTitle] = useState('Sales Dashboard');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved dashboard from localStorage
  // Load saved dashboard from localStorage
  useEffect(() => {
    setIsLoading(true);
    const saved = localStorage.getItem('dashboard-layout');
    if (saved) {
      try {
        const data: DashboardLayout = JSON.parse(saved);
        if (validateDashboardData(data)) {
          setWidgets(data.widgets || []);
          setDashboardTitle(data.title || 'User Dashboard');
        } else {
          throw new Error('Invalid dashboard data format');
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setError('Failed to load saved dashboard. Loading default layout.');
      }
    } else {
      // Load demo data
      loadSalesDashboard();
    }
    setIsLoading(false);
  }, []);

  // Load user-specific dashboard when user changes
  useEffect(() => {
    if (selectedUser) {
      loadUserDashboard();
    }
  }, [selectedUser]);

  // Save dashboard to localStorage whenever widgets change
  const debouncedSave = debounce((widgets: Widget[], title: string) => {
    try {
      const layout: DashboardLayout = {
        title,
        widgets,
        lastModified: new Date().toISOString()
      };
      localStorage.setItem('dashboard-layout', JSON.stringify(layout));
      setError(null);
    } catch (error) {
      console.error('Error saving dashboard:', error);
      setError('Failed to save dashboard changes.');
    }
  }, 1000);

  useEffect(() => {
    if (widgets.length > 0 || dashboardTitle !== 'User Dashboard') {
      debouncedSave(widgets, dashboardTitle);
    }
  }, [widgets, dashboardTitle]);

  const updateWidgetsWithSalesData = async () => {
    if (!selectedUser) return;

    const metrics = await databaseManager.getMetrics(selectedUser.id);
    const revenueByMonth = await databaseManager.getRevenueByMonth(selectedUser.id);
    const revenueByRegion = await databaseManager.getRevenueByRegion(selectedUser.id);
    const topProducts = await databaseManager.getTopProducts(selectedUser.id);
    const recentOrders = await databaseManager.getRecentOrders(selectedUser.id);

    setWidgets(prevWidgets => prevWidgets.map(widget => {
      switch (widget.id) {
        case 'sales-revenue':
          return {
            ...widget,
            data: {
              value: `$${(metrics.totalRevenue / 1000).toFixed(1)}K`,
              change: `${metrics.growthRate > 0 ? '+' : ''}${metrics.growthRate.toFixed(1)}%`,
              trend: metrics.growthRate > 0 ? 'up' : metrics.growthRate < 0 ? 'down' : 'neutral'
            }
          };
        case 'total-orders':
          return {
            ...widget,
            data: {
              value: metrics.totalOrders.toString(),
              change: `${metrics.completionRate.toFixed(1)}% completed`,
              trend: metrics.completionRate > 80 ? 'up' : metrics.completionRate > 60 ? 'neutral' : 'down'
            }
          };
        case 'avg-order-value':
          return {
            ...widget,
            data: {
              value: `$${metrics.averageOrderValue.toFixed(0)}`,
              change: `Top: ${metrics.topProduct}`,
              trend: 'up'
            }
          };
        case 'revenue-chart':
          return {
            ...widget,
            data: revenueByMonth
          };
        case 'region-chart':
          return {
            ...widget,
            data: revenueByRegion
          };
        case 'recent-orders':
          return {
            ...widget,
            data: {
              headers: ['Order ID', 'Customer', 'Product', 'Amount', 'Status'],
              rows: recentOrders.slice(0, 8).map(order => [
                order.id,
                order.customer,
                order.product,
                `$${order.totalAmount.toLocaleString()}`,
                order.status.charAt(0).toUpperCase() + order.status.slice(1)
              ])
            }
          };
        case 'top-products':
          return {
            ...widget,
            data: {
              headers: ['Product', 'Revenue', 'Orders'],
              rows: topProducts.map(product => [
                product.product,
                `$${product.revenue.toLocaleString()}`,
                product.orders.toString()
              ])
            }
          };
        case 'completion-rate':
          return {
            ...widget,
            data: {
              current: Math.round(metrics.completionRate),
              target: 100,
              label: 'Order Completion Rate'
            }
          };
        case 'revenue-goal':
          return {
            ...widget,
            data: {
              current: Math.round(metrics.totalRevenue / 1000),
              target: 500,
              label: 'Monthly Revenue Goal (K)'
            }
          };
        default:
          return widget;
      }
    }));
  };

  const loadUserDashboard = async () => {
    if (!selectedUser) return;

    try {
      const metrics = await databaseManager.getMetrics(selectedUser.id);
      const revenueByMonth = await databaseManager.getRevenueByMonth(selectedUser.id);
      const revenueByRegion = await databaseManager.getRevenueByRegion(selectedUser.id);
      const topProducts = await databaseManager.getTopProducts(selectedUser.id);
      const recentOrders = await databaseManager.getRecentOrders(selectedUser.id);

      const salesWidgets: Widget[] = [
      {
        id: `sales-revenue-${selectedUser.id}`,
        type: 'metric',
        title: 'Total Revenue',
        position: { x: 0, y: 0 },
        size: { width: 300, height: 150 },
        data: {
          value: `$${(metrics.totalRevenue / 1000).toFixed(1)}K`,
          change: `${metrics.growthRate > 0 ? '+' : ''}${metrics.growthRate.toFixed(1)}%`,
          trend: metrics.growthRate > 0 ? 'up' : metrics.growthRate < 0 ? 'down' : 'neutral'
        },
        config: { color: '#10B981' }
      },
      {
        id: `total-orders-${selectedUser.id}`,
        type: 'metric',
        title: 'Total Orders',
        position: { x: 320, y: 0 },
        size: { width: 280, height: 150 },
        data: {
          value: metrics.totalOrders.toString(),
          change: `${metrics.completionRate.toFixed(1)}% completed`,
          trend: metrics.completionRate > 80 ? 'up' : metrics.completionRate > 60 ? 'neutral' : 'down'
        },
        config: { color: '#3B82F6' }
      },
      {
        id: `avg-order-value-${selectedUser.id}`,
        type: 'metric',
        title: 'Avg Order Value',
        position: { x: 620, y: 0 },
        size: { width: 300, height: 150 },
        data: {
          value: `$${metrics.averageOrderValue.toFixed(0)}`,
          change: `Top: ${metrics.topProduct}`,
          trend: 'up'
        },
        config: { color: '#F59E0B' }
      },
      {
        id: `revenue-chart-${selectedUser.id}`,
        type: 'chart',
        title: 'Revenue by Month',
        position: { x: 0, y: 170 },
        size: { width: 450, height: 300 },
        data: revenueByMonth,
        config: { chartType: 'line', color: '#3B82F6' }
      },
      {
        id: `region-chart-${selectedUser.id}`,
        type: 'chart',
        title: 'Revenue by Region',
        position: { x: 470, y: 170 },
        size: { width: 450, height: 300 },
        data: revenueByRegion,
        config: { chartType: 'bar', color: '#10B981' }
      },
      {
        id: `recent-orders-${selectedUser.id}`,
        type: 'table',
        title: 'Recent Orders',
        position: { x: 0, y: 490 },
        size: { width: 600, height: 280 },
        data: {
          headers: ['Order ID', 'Customer', 'Product', 'Amount', 'Status'],
          rows: recentOrders.slice(0, 8).map(order => [
            order.id,
            order.customer,
            order.product,
            `$${order.totalAmount.toLocaleString()}`,
            order.status.charAt(0).toUpperCase() + order.status.slice(1)
          ])
        },
        config: {}
      },
      {
        id: `top-products-${selectedUser.id}`,
        type: 'table',
        title: 'Top Products',
        position: { x: 620, y: 490 },
        size: { width: 400, height: 280 },
        data: {
          headers: ['Product', 'Revenue', 'Orders'],
          rows: topProducts.map(product => [
            product.product,
            `$${product.revenue.toLocaleString()}`,
            product.orders.toString()
          ])
        },
        config: {}
      },
      {
        id: `completion-rate-${selectedUser.id}`,
        type: 'progress',
        title: 'Order Completion Rate',
        position: { x: 940, y: 0 },
        size: { width: 280, height: 200 },
        data: {
          current: Math.round(metrics.completionRate),
          target: 100,
          label: 'Order Completion Rate'
        },
        config: { color: '#10B981' }
      },
      {
        id: `revenue-goal-${selectedUser.id}`,
        type: 'progress',
        title: 'Revenue Goal',
        position: { x: 940, y: 220 },
        size: { width: 280, height: 200 },
        data: {
          current: Math.round(metrics.totalRevenue / 1000),
          target: 500,
          label: 'Monthly Revenue Goal (K)'
        },
        config: { color: '#F59E0B' }
      }
    ];
      setWidgets(salesWidgets);
      setDashboardTitle(`${selectedUser.name}'s Dashboard`);
    } catch (error) {
      console.error('Error loading user dashboard:', error);
      setError('Failed to load user dashboard data.');
    }
  };

  const addWidget = (type: Widget['type']) => {
    const newWidget: Widget = {
      id: generateId(),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      position: { x: 50, y: 50 },
      size: getDefaultSize(type),
      data: getDefaultData(type),
      config: {}
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, ...updates } : widget
    ));
  };

  const deleteWidget = (id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
    if (selectedWidget?.id === id) {
      setSelectedWidget(null);
      setIsConfigOpen(false);
    }
  };

  const getDefaultSize = (type: Widget['type']) => {
    const sizes = {
      metric: { width: 300, height: 150 },
      chart: { width: 400, height: 300 },
      table: { width: 500, height: 250 },
      progress: { width: 250, height: 200 },
      text: { width: 300, height: 100 }
    };
    return sizes[type];
  };

  const getDefaultData = (type: Widget['type']) => {
    const defaultData = {
      metric: { value: '$0', change: '0%', trend: 'neutral' },
      chart: { 
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 
        values: [10, 20, 15, 30, 25] 
      },
      table: { 
        headers: ['Column 1', 'Column 2'], 
        rows: [['Row 1 Col 1', 'Row 1 Col 2']] 
      },
      progress: { current: 50, target: 100, label: 'Progress' },
      text: { content: 'Enter your text here...' }
    };
    return defaultData[type];
  };

  const handleWidgetSelect = (widget: Widget) => {
    setSelectedWidget(widget);
    setIsConfigOpen(true);
  };

  const clearDashboard = () => {
    setWidgets([]);
    setSelectedWidget(null);
    setIsConfigOpen(false);
    setError(null);
  };

  const handleDataUpdate = () => {
    updateWidgetsWithSalesData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-red-600 hover:text-red-800 underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <UserSelector
            selectedUser={selectedUser}
            onUserSelect={setSelectedUser}
          />
        </div>
        
        <Header 
          title={dashboardTitle}
          onTitleChange={setDashboardTitle}
          onClearDashboard={clearDashboard}
          onLoadDemo={() => {}} // Disabled when user is selected
          onViewDataset={() => setIsDatasetViewerOpen(true)}
          selectedUser={selectedUser}
          onManageData={() => setIsDataManagerOpen(true)}
        />
        
        <div className="flex h-[calc(100vh-4rem)]">
          <Sidebar onAddWidget={addWidget} />
          
          <div className="flex-1 flex">
            <Dashboard
              widgets={widgets}
              onUpdateWidget={updateWidget}
              onDeleteWidget={deleteWidget}
              onSelectWidget={handleWidgetSelect}
            />
            
            {isConfigOpen && selectedWidget && (
              <ConfigPanel
                widget={selectedWidget}
                onUpdateWidget={updateWidget}
                onClose={() => setIsConfigOpen(false)}
              />
            )}
          </div>
        </div>
        
        {isDatasetViewerOpen && (
          <DatasetViewer 
            selectedUser={selectedUser}
            onClose={() => setIsDatasetViewerOpen(false)} 
          />
        )}
        
        {isDataManagerOpen && selectedUser && (
          <DataManager
            user={selectedUser}
            onClose={() => setIsDataManagerOpen(false)}
            onDataUpdate={handleDataUpdate}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App;