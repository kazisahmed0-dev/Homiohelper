import React, { SelectHTMLAttributes, ReactNode, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, children, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-[#283833] tracking-wide">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none text-sm bg-white border rounded-lg pl-3.5 pr-9 py-2 min-h-[40px] text-[#192622] transition-colors focus:outline-none focus:ring-2 focus:ring-[#164E43] focus:border-[#164E43] disabled:bg-[#F3F5F4] disabled:text-[#8FA19B] disabled:cursor-not-allowed ${
              error
                ? 'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50/20'
                : 'border-[#CFDAD4] hover:border-[#B5C5BD]'
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3 pointer-events-none text-[#71827C] flex items-center justify-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#63756F]">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
