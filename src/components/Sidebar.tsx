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
    <aside className="w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200/50 p-6 overflow-y-auto shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Widget Library</h2>
        <p className="text-sm text-gray-500">Drag and drop widgets to build your dashboard</p>
      </div>
      
      {/* Search and Filter */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search widgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all duration-200"
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
              className={`px-3 py-2 text-xs font-medium rounded-full transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
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
            className="w-full p-4 bg-gradient-to-br from-gray-50 to-white hover:from-blue-50 hover:to-indigo-50 border border-gray-200 hover:border-blue-300 rounded-xl text-left transition-all duration-300 group hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm">
                <Icon className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">{label}</h3>
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" />
                </div>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredWidgets.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V3a1 1 0 00-1-1H10a1 1 0 00-1 1v3.306" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No widgets found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
        </div>
      )}

      <div className="mt-8 p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200/50 shadow-sm">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          Dashboard Tips
        </h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li>• Drag widgets to reposition them</li>
          <li>• Resize using the corner handles</li>
          <li>• Click widgets to configure them</li>
          <li>• Manage data through user dashboard</li>
          <li>• Export/import dashboard layouts</li>
        </ul>
      </div>

      {/* Performance Info */}
      <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Performance
        </h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          Dashboard optimized for {filteredWidgets.length} widget types
        </p>
      </div>
    </aside>
  );
};