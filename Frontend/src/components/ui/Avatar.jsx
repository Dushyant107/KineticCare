import React from 'react';

export const Avatar = ({
  src,
  name = 'User',
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  className = '',
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0][0].toUpperCase();
  };

  return src ? (
    <img
      src={src}
      alt={name}
      className={`${sizes[size]} rounded-full object-cover border border-slate-200 ${className}`}
    />
  ) : (
    <div
      className={`${sizes[size]} rounded-full bg-sky-100 text-sky-700 font-bold border border-sky-200 flex items-center justify-center ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
