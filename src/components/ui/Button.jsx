import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button Component
 * Design System: Linear / Stripe / Vercel modern SaaS aesthetic
 * 
 * Variants:
 * - primary: solid blue (#2563EB), subtle shadow, hover darken + slight lift, active scale 0.98
 * - secondary: white bg, 1px slate-200 border, hover light gray
 * - ghost: transparent, hover light background
 * - outline: transparent with 1px border
 * 
 * Sizes:
 * - sm: h-9, px-3.5, text-xs, rounded-xl
 * - md: h-11, px-5, text-sm, rounded-xl
 * - lg: h-12, px-6, text-base, rounded-xl
 * - icon: square icon button (h-9 or h-11)
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    to,
    href,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  // Base classes for consistent modern SaaS feel
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl select-none transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 group cursor-pointer whitespace-nowrap shrink-0';

  // Variant mappings
  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    secondary:
      'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-2xs hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100/90 active:scale-[0.98]',
    outline:
      'bg-transparent border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]',
  }[variant] || '';

  // Size mappings
  const sizeClasses = {
    sm: 'h-9 px-3.5 text-xs gap-1.5',
    md: 'h-11 px-5 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
    'icon-sm': 'h-9 w-9 p-0',
    'icon-md': 'h-11 w-11 p-0',
  }[size] || 'h-11 px-5 text-sm gap-2';

  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

  const content = (
    <>
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0 transition-transform duration-150 group-hover:translate-x-0.5">
          {rightIcon}
        </span>
      )}
    </>
  );

  // Render as React Router Link if 'to' is provided
  if (to && !disabled) {
    return (
      <Link ref={ref} to={to} className={combinedClasses} {...props}>
        {content}
      </Link>
    );
  }

  // Render as standard anchor if 'href' is provided
  if (href && !disabled) {
    return (
      <a ref={ref} href={href} className={combinedClasses} {...props}>
        {content}
      </a>
    );
  }

  // Standard Button
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={combinedClasses}
      {...props}
    >
      {content}
    </button>
  );
});

export default Button;
