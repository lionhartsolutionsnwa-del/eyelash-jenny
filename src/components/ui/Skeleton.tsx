interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'card';
}

const variantStyles: Record<string, string> = {
  text: 'h-4 w-full rounded-md',
  circle: 'h-12 w-12 rounded-full',
  card: 'h-48 w-full rounded-2xl',
};

function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[variantStyles[variant], className].join(' ')}
      style={{
        background: 'linear-gradient(90deg, #F8F8FA 25%, #E7E7E7 50%, #F8F8FA 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}

export { Skeleton };
export type { SkeletonProps };
