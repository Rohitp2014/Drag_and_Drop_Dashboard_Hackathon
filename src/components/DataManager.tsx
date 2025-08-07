import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Save, Search, Filter } from 'lucide-react';
import { SalesRecord, User, databaseManager } from '../lib/supabase';

interface DataManagerProps {
  user: User;
  onClose: () => void;
  onDataUpdate: () => void;
}

export const DataManager: React.FC<DataManagerProps> = ({
  user,
  onClose,
  onDataUpdate
}) => {
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [filteredData, setFilteredData] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<SalesRecord | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    customer: '',
    product: '',
    category: 'Software',
    quantity: 1,
    unit_price: 100,
    region: user.region,
    status: 'completed' as const
  });

  useEffect(() => {
    loadSalesData();
  }, [user.id]);

  useEffect(() => {
    applyFilters();
  }, [salesData, searchTerm, statusFilter]);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      const data = await databaseManager.getSalesData(user.id);
      setSalesData(data);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...salesData];

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    setFilteredData(filtered);
  };

  const handleAddRecord = async () => {
    try {
      const recordToAdd = {
        ...newRecord,
        user_id: user.id,
        total_amount: newRecord.quantity * newRecord.unit_price
      };

      await databaseManager.addSalesRecord(recordToAdd);
      await loadSalesData();
      onDataUpdate();
      setIsAddingNew(false);
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        customer: '',
        product: '',
        category: 'Software',
        quantity: 1,
        unit_price: 100,
        region: user.region,
        status: 'completed'
      });
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  const handleUpdateRecord = async () => {
    if (!editingRecord) return;

    try {
      const updates = {
        ...editingRecord,
        total_amount: editingRecord.quantity * editingRecord.unit_price
      };

      await databaseManager.updateSalesRecord(editingRecord.id, updates);
      await loadSalesData();
      onDataUpdate();
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      await databaseManager.deleteSalesRecord(id);
      await loadSalesData();
      onDataUpdate();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const categories = ['Software', 'Services', 'Hardware', 'Consulting'];
  const statuses = ['completed', 'pending', 'cancelled'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Data Manager - {user.name}</h2>
            <p className="text-gray-600">{user.department} • {user.region}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Record</span>
            </button>
          </div>
        </div>

        {/* Add New Record Form */}
        {isAddingNew && (
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Sales Record</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input
                type="date"
                value={newRecord.date}
                onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Customer"
                value={newRecord.customer}
                onChange={(e) => setNewRecord({...newRecord, customer: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Product"
                value={newRecord.product}
                onChange={(e) => setNewRecord({...newRecord, product: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newRecord.category}
                onChange={(e) => setNewRecord({...newRecord, category: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={newRecord.quantity}
                onChange={(e) => setNewRecord({...newRecord, quantity: parseInt(e.target.value) || 1})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Unit Price"
                value={newRecord.unit_price}
                onChange={(e) => setNewRecord({...newRecord, unit_price: parseFloat(e.target.value) || 0})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newRecord.region}
                onChange={(e) => setNewRecord({...newRecord, region: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <select
                value={newRecord.status}
                onChange={(e) => setNewRecord({...newRecord, status: e.target.value as any})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={handleAddRecord}
                disabled={!newRecord.customer || !newRecord.product}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Save Record</span>
              </button>
              <button
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Qty</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Unit Price</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    {editingRecord?.id === record.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            value={editingRecord.date}
                            onChange={(e) => setEditingRecord({...editingRecord, date: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editingRecord.customer}
                            onChange={(e) => setEditingRecord({...editingRecord, customer: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editingRecord.product}
                            onChange={(e) => setEditingRecord({...editingRecord, product: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editingRecord.category}
                            onChange={(e) => setEditingRecord({...editingRecord, category: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editingRecord.quantity}
                            onChange={(e) => setEditingRecord({...editingRecord, quantity: parseInt(e.target.value) || 1})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editingRecord.unit_price}
                            onChange={(e) => setEditingRecord({...editingRecord, unit_price: parseFloat(e.target.value) || 0})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 font-mono">
                          ${(editingRecord.quantity * editingRecord.unit_price).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editingRecord.status}
                            onChange={(e) => setEditingRecord({...editingRecord, status: e.target.value as any})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {statuses.map(status => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-1">
                            <button
                              onClick={handleUpdateRecord}
                              className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingRecord(null)}
                              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">{record.date}</td>
                        <td className="px-4 py-3 font-medium">{record.customer}</td>
                        <td className="px-4 py-3">{record.product}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {record.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{record.quantity}</td>
                        <td className="px-4 py-3 font-mono">${record.unit_price}</td>
                        <td className="px-4 py-3 font-mono font-medium">${record.total_amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'completed' ? 'bg-green-100 text-green-800' :
                            record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setEditingRecord(record)}
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {filteredData.length} of {salesData.length} records for {user.name}
          </div>
        </div>
      </div>
    </div>
  );
};