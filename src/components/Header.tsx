import React, { useState, useEffect } from 'react';
import { Settings, Download, Upload, Trash2, RefreshCw, Database, Edit } from 'lucide-react';
import { User } from '../lib/supabase';

interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onClearDashboard: () => void;
  onLoadDemo: () => void;
  onViewDataset: () => void;
  selectedUser: User | null;
  onManageData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onTitleChange,
  onClearDashboard,
  onLoadDemo,
  onViewDataset,
  selectedUser,
  onManageData
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [lastSaved, setLastSaved] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-layout');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.lastModified) {
          setLastSaved(new Date(data.lastModified).toLocaleString());
        }
      } catch (error) {
        console.error('Error reading save time:', error);
      }
    }
  }, [title]); // Update when title changes (indicating save)

  const handleTitleSubmit = () => {
    onTitleChange(tempTitle);
    setIsEditing(false);
  };

  const handleExport = () => {
    const data = localStorage.getItem('dashboard-layout');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          localStorage.setItem('dashboard-layout', data);
          window.location.reload();
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-6 py-5 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          {isEditing ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyPress={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="text-xl font-bold bg-transparent border-b-2 border-blue-500 outline-none text-gray-800"
              autoFocus
            />
          ) : (
            <h1
              className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent cursor-pointer hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              onClick={() => setIsEditing(true)}
            >
              {title}
            </h1>
          )}
        </div>
        {lastSaved && (
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            Last saved: {lastSaved}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl text-sm font-medium shadow-sm border border-green-100">
          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
          <span>Auto-save enabled</span>
        </div>

        {!selectedUser && <button
          onClick={onLoadDemo}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-xl transition-all duration-200 font-medium"
          title="Load Sales Dashboard"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Sales Data</span>
        </button>
        }
        <button
          onClick={onViewDataset}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 font-medium"
          title="View Dataset"
        >
          <Database className="w-4 h-4" />
          <span className="text-sm">View Dataset</span>
        </button>

        {selectedUser && onManageData && (
          <button
            onClick={onManageData}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-200 font-medium"
            title="Manage Data"
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm">Manage Data</span>
          </button>
        )}

        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all duration-200 font-medium"
          title="Export Dashboard"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export</span>
        </button>

        <label className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 cursor-pointer font-medium">
          <Upload className="w-4 h-4" />
          <span className="text-sm">Import</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        <button
          onClick={onClearDashboard}
          className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-200 font-medium"
          title="Clear Dashboard"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">Clear</span>
        </button>
      </div>
    </header>
  );
};