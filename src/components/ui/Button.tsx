import { ReactNode } from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses = {
  primary:
    'bg-[#7f56d9] hover:bg-[#6b47c0] text-white shadow-lg shadow-[rgba(127,86,217,0.2)] hover:shadow-[rgba(127,86,217,0.4)]',
  secondary:
    'bg-[var(--bg-secondary)] border border-[var(--border-card)] text-[var(--text-primary)] hover:bg-[var(--bg-input)] hover:border-[rgba(127,86,217,0.3)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:text-[#7f56d9] hover:bg-[var(--bg-input)]',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  href,
  className = '',
  type = 'button',
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-300 ${variantClasses[variant]} ${sizeClasses[size]} ${
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
  } ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
