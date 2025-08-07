import React, { useState } from 'react';
import { X, Save, Palette } from 'lucide-react';
import { Widget } from '../types';

interface ConfigPanelProps {
  widget: Widget;
  onUpdateWidget: (id: string, updates: Partial<Widget>) => void;
  onClose: () => void;
}

const colorOptions = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
];

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  widget,
  onUpdateWidget,
  onClose
}) => {
  const [title, setTitle] = useState(widget.title);
  const [color, setColor] = useState(widget.config.color || '#3B82F6');

  const handleSave = () => {
    onUpdateWidget(widget.id, {
      title,
      config: { ...widget.config, color }
    });
    onClose();
  };

  const renderSpecificConfig = () => {
    switch (widget.type) {
      case 'metric':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type="text"
                value={widget.data.value}
                onChange={(e) => onUpdateWidget(widget.id, {
                  data: { ...widget.data, value: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Change
              </label>
              <input
                type="text"
                value={widget.data.change}
                onChange={(e) => onUpdateWidget(widget.id, {
                  data: { ...widget.data, change: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trend
              </label>
              <select
                value={widget.data.trend}
                onChange={(e) => onUpdateWidget(widget.id, {
                  data: { ...widget.data, trend: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
          </div>
        );
      case 'chart':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chart Type
              </label>
              <select
                value={widget.config.chartType || 'line'}
                onChange={(e) => onUpdateWidget(widget.id, {
                  config: { ...widget.config, chartType: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>
          </div>
        );
      case 'progress':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Value
              </label>
              <input
                type="number"
                value={widget.data.current}
                onChange={(e) => onUpdateWidget(widget.id, {
                  data: { ...widget.data, current: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Value
              </label>
              <input
                type="number"
                value={widget.data.target}
                onChange={(e) => onUpdateWidget(widget.id, {
                  data: { ...widget.data, target: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                type="text"
                value={widget.data.label}
                onChange={(e) => onUpdateWidget(widget.id, {
                  data: { ...widget.data, label: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Widget Settings</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Basic Settings</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Widget Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Color Theme
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption}
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorOption 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: colorOption }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Widget-specific settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Widget Configuration</h4>
          {renderSpecificConfig()}
        </div>

        {/* Size and Position */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Layout</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width
              </label>
              <input
                type="number"
                value={widget.size.width}
                onChange={(e) => onUpdateWidget(widget.id, {
                  size: { ...widget.size, width: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height
              </label>
              <input
                type="number"
                value={widget.size.height}
                onChange={(e) => onUpdateWidget(widget.id, {
                  size: { ...widget.size, height: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};