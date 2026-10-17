import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[34px] gap-1.5',
    md: 'text-sm px-4 py-2 min-h-[40px] gap-2',
    lg: 'text-base px-5 py-2.5 min-h-[46px] gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#164E43] text-white hover:bg-[#113E35] active:bg-[#0D3029] focus-visible:ring-[#164E43] shadow-xs',
    secondary:
      'bg-[#E7EFEA] text-[#164E43] hover:bg-[#DCE7E1] active:bg-[#D0DDD6] focus-visible:ring-[#164E43]',
    outline:
      'bg-white border border-[#CDD8D2] text-[#22332E] hover:bg-[#F4F7F5] active:bg-[#EAEFEA] focus-visible:ring-[#164E43]',
    ghost:
      'bg-transparent text-[#384842] hover:bg-[#F0F4F2] active:bg-[#E5ECE9] focus-visible:ring-[#164E43]',
    danger:
      'bg-[#B91C1C] text-white hover:bg-[#991B1B] active:bg-[#7F1D1D] focus-visible:ring-[#B91C1C] shadow-xs',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};
