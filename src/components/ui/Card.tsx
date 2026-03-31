import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  hoverable?: boolean;
}

function Card({ children, className = '', elevated = false, hoverable = false }: CardProps) {
  const baseStyles = 'bg-white rounded-2xl';

  const shadowStyles = elevated
    ? 'shadow-[0_4px_12px_rgba(16,27,75,0.08),0_12px_32px_rgba(16,27,75,0.06)]'
    : 'shadow-[0_2px_8px_rgba(16,27,75,0.05),0_4px_16px_rgba(16,27,75,0.03)]';

  const hoverStyles = hoverable
    ? 'transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(16,27,75,0.1),0_16px_48px_rgba(16,27,75,0.06)]'
    : '';

  return (
    <div className={`${baseStyles} ${shadowStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}

export { Card };
export type { CardProps };
