import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#283833] tracking-wide">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 pointer-events-none text-[#71827C] flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full text-sm bg-white border rounded-lg px-3.5 py-2 min-h-[40px] text-[#192622] placeholder:text-[#8FA19B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#164E43] focus:border-[#164E43] disabled:bg-[#F3F5F4] disabled:text-[#8FA19B] disabled:cursor-not-allowed ${
              leftIcon ? 'pl-9' : ''
            } ${rightIcon ? 'pr-9' : ''} ${
              error
                ? 'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50/20'
                : 'border-[#CFDAD4] hover:border-[#B5C5BD]'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 pointer-events-none text-[#71827C] flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#63756F]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
