import { type ReactNode } from 'react';

type BadgeVariant = 'popular' | 'new' | 'confirmed' | 'pending' | 'cancelled' | 'completed';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  popular: 'bg-gold/20 text-gold-dark border border-gold/30',
  new: 'bg-navy/10 text-navy',
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
  completed: 'bg-gray-light text-gray',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

function Badge({ variant = 'new', children, className = '', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-medium font-body leading-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
