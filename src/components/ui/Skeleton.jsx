import React from 'react';

/**
 * Reusable Skeleton Loader Component
 */
export default function Skeleton({ className = '', rounded = 'rounded-xl', ...props }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${rounded} ${className}`}
      {...props}
    />
  );
}
