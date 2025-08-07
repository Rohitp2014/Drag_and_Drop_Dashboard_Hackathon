import React, { useState, useEffect } from 'react';
import { User, ChevronDown, Users, LogOut } from 'lucide-react';
import { User as UserType, databaseManager } from '../lib/supabase';

interface UserSelectorProps {
  selectedUser: UserType | null;
  onUserSelect: (user: UserType) => void;
  onLogout?: () => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUser,
  onUserSelect,
  onLogout
}) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await databaseManager.getUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors = {
      'Sales': 'bg-blue-100 text-blue-800',
      'Marketing': 'bg-green-100 text-green-800',
      'Operations': 'bg-purple-100 text-purple-800'
    };
    return colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-5 py-3 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 min-w-80"
      >
        <div className="flex items-center space-x-2 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-sm">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          {selectedUser ? (
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900">{selectedUser.name}</div>
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-500">{selectedUser.department} • {selectedUser.region}</div>
                <div className="px-2 py-0.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs font-medium shadow-sm">
                  Authenticated
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 font-medium">Select a user to login</div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {selectedUser && onLogout && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-xl z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center space-x-2 px-3 py-3 text-sm text-gray-500 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
              <Users className="w-4 h-4" />
              <span className="font-medium">{users.length} Users Available for Login</span>
            </div>
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onUserSelect(user);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                  selectedUser?.id === user.id ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' : ''
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${getDepartmentColor(user.department)}`}>
                      {user.department}
                    </span>
                    <span className="text-xs text-gray-400">{user.region}</span>
                  </div>
                </div>
                {selectedUser?.id === user.id && (
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-sm"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};