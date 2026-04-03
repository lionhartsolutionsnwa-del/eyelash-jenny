import Image from 'next/image';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap: Record<string, { width: number; height: number }> = {
  sm: { width: 80, height: 80 },
  md: { width: 120, height: 120 },
  lg: { width: 160, height: 160 },
  xl: { width: 280, height: 280 },
};

function Logo({ variant = 'dark', size = 'md', className = '' }: LogoProps) {
  const { width, height } = sizeMap[size];
  const src = variant === 'light' ? '/images/logo-light.png' : '/images/logo-dark.png';

  return (
    <Image
      src={src}
      alt="Jenny Professional Eyelash"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}

export { Logo };
export type { LogoProps };
