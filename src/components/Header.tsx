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
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-blue-600" />
          {isEditing ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyPress={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="text-xl font-semibold bg-transparent border-b border-blue-500 outline-none"
              autoFocus
            />
          ) : (
            <h1
              className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {title}
            </h1>
          )}
        </div>
        {lastSaved && (
          <div className="text-sm text-gray-500">
            Last saved: {lastSaved}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Auto-save enabled</span>
        </div>

        {!selectedUser && <button
          onClick={onLoadDemo}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="Load Sales Dashboard"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Sales Data</span>
        </button>
        }
        <button
          onClick={onViewDataset}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="View Dataset"
        >
          <Database className="w-4 h-4" />
          <span className="text-sm">View Dataset</span>
        </button>

        {selectedUser && onManageData && (
          <button
            onClick={onManageData}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Manage Data"
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm">Manage Data</span>
          </button>
        )}

        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="Export Dashboard"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export</span>
        </button>

        <label className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
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
          className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          title="Clear Dashboard"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">Clear</span>
        </button>
      </div>
    </header>
  );
};