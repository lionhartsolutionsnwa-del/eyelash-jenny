'use client';

import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  loading?: boolean;
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-navy text-white hover:bg-navy-light focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
  gold: [
    'bg-gold text-navy font-semibold relative overflow-hidden',
    'hover:bg-gold-dark',
    'focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
  ].join(' '),
  secondary:
    'border-2 border-navy text-navy bg-transparent hover:bg-navy hover:text-white focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
  ghost:
    'text-navy-light bg-transparent hover:text-navy hover:bg-gray-light/50 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      className = '',
      disabled = false,
      loading = false,
      href,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      'inline-flex items-center justify-center gap-2 rounded-full font-body font-medium',
      'transition-transform transition-opacity duration-200 ease-out',
      'active:scale-[0.98]',
      'disabled:opacity-50 disabled:pointer-events-none',
      'cursor-pointer select-none',
    ].join(' ');

    const classes = [baseStyles, variantStyles[variant], sizeStyles[size], className]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
        {/* Gold shimmer overlay */}
        {variant === 'gold' && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-none"
            style={{
              animation: 'none',
            }}
          />
        )}
      </>
    );

    // Wrap shimmer in a group for hover trigger
    const wrapperClass = variant === 'gold' ? 'group' : '';

    if (href && !disabled) {
      return (
        <Link href={href} className={`${classes} ${wrapperClass}`}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`${classes} ${wrapperClass}`}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
