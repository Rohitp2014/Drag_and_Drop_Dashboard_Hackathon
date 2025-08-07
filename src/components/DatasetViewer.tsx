import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Download, Eye, BarChart3 } from 'lucide-react';
import { salesDataManager, SalesRecord } from '../data/salesData';

interface DatasetViewerProps {
  onClose: () => void;
}

export const DatasetViewer: React.FC<DatasetViewerProps> = ({ onClose }) => {
  const [data, setData] = useState<SalesRecord[]>([]);
  const [filteredData, setFilteredData] = useState<SalesRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortField, setSortField] = useState<keyof SalesRecord>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const salesData = salesDataManager.getData();
    setData(salesData);
    setFilteredData(salesData);

    const unsubscribe = salesDataManager.subscribe(() => {
      const updatedData = salesDataManager.getData();
      setData(updatedData);
      applyFilters(updatedData);
    });

    return unsubscribe;
  }, []);

  const applyFilters = (dataToFilter: SalesRecord[] = data) => {
    let filtered = [...dataToFilter];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.salesRep.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(record => record.region === regionFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, regionFilter, sortField, sortDirection, data]);

  const handleSort = (field: keyof SalesRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportData = () => {
    const csvContent = [
      // Headers
      ['Order ID', 'Date', 'Customer', 'Product', 'Category', 'Quantity', 'Unit Price', 'Total Amount', 'Sales Rep', 'Region', 'Status'].join(','),
      // Data rows
      ...filteredData.map(record => [
        record.id,
        record.date,
        `"${record.customer}"`,
        `"${record.product}"`,
        record.category,
        record.quantity,
        record.unitPrice,
        record.totalAmount,
        `"${record.salesRep}"`,
        record.region,
        record.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Get unique values for filters
  const uniqueStatuses = [...new Set(data.map(record => record.status))];
  const uniqueRegions = [...new Set(data.map(record => record.region))];

  const metrics = salesDataManager.getMetrics();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Sales Dataset Viewer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Total Records</div>
              <div className="text-2xl font-bold text-gray-900">{data.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="text-2xl font-bold text-green-600">${metrics.totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Avg Order Value</div>
              <div className="text-2xl font-bold text-blue-600">${metrics.averageOrderValue.toFixed(0)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Completion Rate</div>
              <div className="text-2xl font-bold text-purple-600">{metrics.completionRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, product, order ID, or sales rep..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            {/* Region Filter */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Regions</option>
              {uniqueRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            {/* Export Button */}
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} records
            {filteredData.length !== data.length && ` (filtered from ${data.length} total)`}
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {[
                  { key: 'id', label: 'Order ID' },
                  { key: 'date', label: 'Date' },
                  { key: 'customer', label: 'Customer' },
                  { key: 'product', label: 'Product' },
                  { key: 'category', label: 'Category' },
                  { key: 'quantity', label: 'Qty' },
                  { key: 'unitPrice', label: 'Unit Price' },
                  { key: 'totalAmount', label: 'Total' },
                  { key: 'salesRep', label: 'Sales Rep' },
                  { key: 'region', label: 'Region' },
                  { key: 'status', label: 'Status' }
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-left font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort(key as keyof SalesRecord)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{label}</span>
                      {sortField === key && (
                        <span className="text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((record, index) => (
                <tr key={record.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="px-4 py-3 font-mono text-blue-600">{record.id}</td>
                  <td className="px-4 py-3">{record.date}</td>
                  <td className="px-4 py-3 font-medium">{record.customer}</td>
                  <td className="px-4 py-3">{record.product}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {record.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{record.quantity}</td>
                  <td className="px-4 py-3 font-mono">${record.unitPrice}</td>
                  <td className="px-4 py-3 font-mono font-medium">${record.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">{record.salesRep}</td>
                  <td className="px-4 py-3">{record.region}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'completed' ? 'bg-green-100 text-green-800' :
                      record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};