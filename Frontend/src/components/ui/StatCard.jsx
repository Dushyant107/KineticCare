import React from 'react';

export const StatCard = ({
  title,
  value,
  unit,
  change,
  changeType = 'positive', // 'positive', 'negative', 'neutral'
  icon: Icon,
  iconBg = 'bg-sky-50 text-sky-600',
  description,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{value}</span>
            {unit && <span className="text-sm font-semibold text-slate-500">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(change || description) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {change && (
            <span className={`font-semibold ${
              changeType === 'positive' ? 'text-emerald-600' : changeType === 'negative' ? 'text-red-600' : 'text-slate-600'
            }`}>
              {change}
            </span>
          )}
          {description && <span className="text-slate-500">{description}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
