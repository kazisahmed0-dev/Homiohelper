import React, { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-[#283833] tracking-wide">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`w-full text-sm bg-white border rounded-lg px-3.5 py-2.5 text-[#192622] placeholder:text-[#8FA19B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#164E43] focus:border-[#164E43] disabled:bg-[#F3F5F4] disabled:text-[#8FA19B] disabled:cursor-not-allowed resize-y ${
            error
              ? 'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50/20'
              : 'border-[#CFDAD4] hover:border-[#B5C5BD]'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#63756F]">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
