'use client';

import { useState, useId, type ChangeEvent } from 'react';

interface InputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

function Input({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  error,
  value,
  onChange,
  className = '',
}: InputProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const filled = value !== undefined && value !== '';
  const isActive = focused || filled;

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={isActive ? placeholder : ' '}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          'peer w-full bg-white rounded-xl px-4 pt-5 pb-2 text-navy font-body text-base',
          'border outline-none',
          'transition-[border-color,box-shadow] duration-200',
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/30'
            : 'border-gray-light focus:border-gold focus:ring-1 focus:ring-gold/30',
        ].join(' ')}
      />
      <label
        htmlFor={id}
        className={[
          'pointer-events-none absolute left-4 font-body transition-all duration-200',
          isActive
            ? 'top-1.5 text-xs text-navy-light'
            : 'top-1/2 -translate-y-1/2 text-base text-gray',
        ].join(' ')}
      >
        {label}
        {required && <span className="text-gold-dark ml-0.5">*</span>}
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-400 font-body">
          {error}
        </p>
      )}
    </div>
  );
}

export { Input };
export type { InputProps };
