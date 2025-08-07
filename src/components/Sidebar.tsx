import React, { useState } from 'react';
import { BarChart3, PieChart, Table, TrendingUp, FileText, Plus } from 'lucide-react';
import { Widget } from '../types';

interface SidebarProps {
  onAddWidget: (type: Widget['type']) => void;
}

const widgetTypes = [
  { type: 'metric', icon: TrendingUp, label: 'Metric Card', description: 'Display key metrics with trend indicators' },
  { type: 'chart', icon: BarChart3, label: 'Chart', description: 'Line, bar, and pie charts for data visualization' },
  { type: 'table', icon: Table, label: 'Data Table', description: 'Tabular data with sorting and filtering' },
  { type: 'progress', icon: PieChart, label: 'Progress', description: 'Progress bars and goal tracking' },
  { type: 'text', icon: FileText, label: 'Text Widget', description: 'Rich text content and notes' }
] as const;

export const Sidebar: React.FC<SidebarProps> = ({ onAddWidget }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Widgets' },
    { id: 'visualization', label: 'Visualization' },
    { id: 'data', label: 'Data Display' },
    { id: 'content', label: 'Content' }
  ];

  const getWidgetCategory = (type: string) => {
    switch (type) {
      case 'metric':
      case 'progress':
        return 'visualization';
      case 'chart':
        return 'visualization';
      case 'table':
        return 'data';
      case 'text':
        return 'content';
      default:
        return 'all';
    }
  };

  const filteredWidgets = widgetTypes.filter(widget => {
    const matchesSearch = widget.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || getWidgetCategory(widget.type) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <aside className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Widget Library</h2>
      
      {/* Search and Filter */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search widgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredWidgets.map(({ type, icon: Icon, label, description }) => (
          <button
            key={type}
            onClick={() => onAddWidget(type)}
            className="w-full p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-left transition-all duration-200 group"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-900">{label}</h3>
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredWidgets.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No widgets found matching your criteria.</p>
        </div>
      )}

      <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Sales Dashboard</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Drag widgets to reposition them</li>
          <li>• Resize using the corner handles</li>
          <li>• Click widgets to configure them</li>
          <li>• Data updates automatically every 10s</li>
          <li>• Export/import dashboard layouts</li>
        </ul>
      </div>

      {/* Performance Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Performance</h4>
        <p className="text-xs text-gray-600">
          Dashboard optimized for {filteredWidgets.length} widget types
        </p>
      </div>
    </aside>
  );
};