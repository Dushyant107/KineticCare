import React from 'react';

export const Table = ({
  columns = [],
  data = [],
  keyField = '_id',
  emptyMessage = 'No records found',
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto border border-slate-200 rounded-xl bg-white ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200">
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={row[keyField] || rowIdx} className="hover:bg-slate-50/50 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={col.key || colIdx} className="px-4 py-3 text-slate-700 font-medium">
                    {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
