import React from 'react';
import { Widget } from '../../types';

interface TableWidgetProps {
  widget: Widget;
}

export const TableWidget: React.FC<TableWidgetProps> = ({ widget }) => {
  const { data } = widget;
  const { headers = [], rows = [] } = data;

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            {headers.map((header: string, index: number) => (
              <th key={index} className="px-3 py-2 text-left font-medium text-gray-700 border-b border-gray-200">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any[], rowIndex: number) => (
            <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
              {row.map((cell: any, cellIndex: number) => (
                <td key={cellIndex} className="px-3 py-2 text-gray-900 border-b border-gray-100">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="flex items-center justify-center h-20 text-gray-500">
          No data available
        </div>
      )}
    </div>
  );
};