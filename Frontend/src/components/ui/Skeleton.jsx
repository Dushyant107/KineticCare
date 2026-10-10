import React from 'react';

export const Skeleton = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-md',
}) => {
  return (
    <div className={`animate-pulse bg-slate-200 ${width} ${height} ${rounded} ${className}`} />
  );
};

export default Skeleton;
