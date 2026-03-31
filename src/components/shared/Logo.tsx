interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap: Record<string, { width: number; height: number }> = {
  sm: { width: 100, height: 48 },
  md: { width: 140, height: 64 },
  lg: { width: 180, height: 80 },
};

function Logo({ variant = 'dark', size = 'md', className = '' }: LogoProps) {
  const { width, height } = sizeMap[size];
  const primary = variant === 'dark' ? '#101B4B' : '#FFFFFF';
  const accent = '#F6D673';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 180 80"
      width={width}
      height={height}
      className={className}
      aria-label="Jenny Professional Eyelash"
      role="img"
    >
      {/* Eyelash / eye shape */}
      <g fill="none" stroke={primary} strokeWidth="1.8" strokeLinecap="round">
        {/* Upper lashes radiating from the eye */}
        <path d="M58 30 Q62 14, 72 10" />
        <path d="M66 26 Q72 12, 82 10" />
        <path d="M76 24 Q82 10, 92 10" />
        <path d="M86 24 Q90 12, 100 12" />
        <path d="M96 26 Q100 16, 108 16" />
        <path d="M104 30 Q108 22, 114 22" />
      </g>
      {/* Eye curve */}
      <path
        d="M50 36 Q82 20, 118 36"
        fill="none"
        stroke={primary}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Lower lid with slight curve */}
      <path
        d="M56 38 Q82 48, 114 38"
        fill="none"
        stroke={primary}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Iris dot */}
      <circle cx="84" cy="36" r="3.5" fill={accent} />

      {/* "jenny" script text */}
      <text
        x="90"
        y="60"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontStyle="italic"
        fontSize="18"
        fontWeight="600"
        fill={primary}
        letterSpacing="-0.5"
      >
        jenny
      </text>

      {/* "professional eyelash" subtitle */}
      <text
        x="90"
        y="72"
        textAnchor="middle"
        fontFamily="'DM Sans', system-ui, sans-serif"
        fontSize="7.5"
        fontWeight="400"
        fill={primary}
        letterSpacing="2.5"
      >
        PROFESSIONAL EYELASH
      </text>
    </svg>
  );
}

export { Logo };
export type { LogoProps };
