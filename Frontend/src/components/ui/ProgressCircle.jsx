import React from 'react';

export const ProgressCircle = ({
  value = 0,
  size = 120,
  strokeWidth = 10,
  color = '#0284C7', // sky-600
  trackColor = '#E2E8F0',
  label,
  sublabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black text-slate-900 leading-none">{value}</span>
        {label && <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-1">{label}</span>}
        {sublabel && <span className="text-xs font-semibold text-slate-400">{sublabel}</span>}
      </div>
    </div>
  );
};

export default ProgressCircle;
