import React from 'react';
import { Widget } from '../../types';
import { Plus, Minus } from 'lucide-react';

interface TableWidgetProps {
  widget: Widget;
  onUpdateWidget?: (id: string, updates: Partial<Widget>) => void;
}

export const TableWidget: React.FC<TableWidgetProps> = ({ widget, onUpdateWidget }) => {
  const { data } = widget;
  const { headers = ['Column 1', 'Column 2'], rows = [['Row 1 Col 1', 'Row 1 Col 2']] } = data;

  const addColumn = () => {
    if (!onUpdateWidget) return;
    
    const newHeaders = [...headers, `Column ${headers.length + 1}`];
    const newRows = rows.map((row: string[]) => [...row, `New Cell`]);
    
    onUpdateWidget(widget.id, {
      data: { headers: newHeaders, rows: newRows }
    });
  };

  const removeColumn = (columnIndex: number) => {
    if (!onUpdateWidget || headers.length <= 1) return;
    
    const newHeaders = headers.filter((_: string, index: number) => index !== columnIndex);
    const newRows = rows.map((row: string[]) => 
      row.filter((_: string, index: number) => index !== columnIndex)
    );
    
    onUpdateWidget(widget.id, {
      data: { headers: newHeaders, rows: newRows }
    });
  };

  const addRow = () => {
    if (!onUpdateWidget) return;
    
    const newRow = headers.map((_: string, index: number) => `Row ${rows.length + 1} Col ${index + 1}`);
    const newRows = [...rows, newRow];
    
    onUpdateWidget(widget.id, {
      data: { headers, rows: newRows }
    });
  };

  const removeRow = (rowIndex: number) => {
    if (!onUpdateWidget || rows.length <= 1) return;
    
    const newRows = rows.filter((_: string[], index: number) => index !== rowIndex);
    
    onUpdateWidget(widget.id, {
      data: { headers, rows: newRows }
    });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    if (!onUpdateWidget) return;
    
    const newRows = [...rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    
    onUpdateWidget(widget.id, {
      data: { headers, rows: newRows }
    });
  };

  const updateHeader = (colIndex: number, value: string) => {
    if (!onUpdateWidget) return;
    
    const newHeaders = [...headers];
    newHeaders[colIndex] = value;
    
    onUpdateWidget(widget.id, {
      data: { headers: newHeaders, rows }
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Table Controls */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={addRow}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            title="Add Row"
          >
            <Plus className="w-3 h-3" />
            <span>Row</span>
          </button>
          <button
            onClick={addColumn}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            title="Add Column"
          >
            <Plus className="w-3 h-3" />
            <span>Column</span>
          </button>
        </div>
        <div className="text-xs text-gray-500">
          {rows.length} rows × {headers.length} columns
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {headers.map((header: string, colIndex: number) => (
                <th key={colIndex} className="relative group">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(colIndex, e.target.value)}
                      className="w-full px-3 py-2 font-medium text-gray-700 bg-transparent border-none outline-none focus:bg-white focus:shadow-sm rounded"
                      placeholder={`Column ${colIndex + 1}`}
                    />
                    {headers.length > 1 && (
                      <button
                        onClick={() => removeColumn(colIndex)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                        title="Remove Column"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: string[], rowIndex: number) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors group">
                {row.map((cell: string, colIndex: number) => (
                  <td key={colIndex} className="relative border-b border-gray-100">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="w-full px-3 py-2 text-gray-900 bg-transparent border-none outline-none focus:bg-white focus:shadow-sm rounded"
                      placeholder="Enter data..."
                    />
                  </td>
                ))}
                {rows.length > 1 && (
                  <td className="w-8">
                    <button
                      onClick={() => removeRow(rowIndex)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all ml-1"
                      title="Remove Row"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="flex items-center justify-center h-20 text-gray-500">
          <div className="text-center">
            <p className="mb-2">No data available</p>
            <button
              onClick={addRow}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add First Row
            </button>
          </div>
        </div>
      )}
    </div>
  );
};