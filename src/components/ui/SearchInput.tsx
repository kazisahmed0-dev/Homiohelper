import React, { InputHTMLAttributes, forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onClear?: () => void;
  sizeVariant?: 'sm' | 'md' | 'lg';
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder, sizeVariant = 'md', className = '', ...props }, ref) => {
    const { t, language } = useLanguage();
    const defaultPlaceholder = placeholder || (language === 'bn' ? 'অনুসন্ধান...' : 'Search...');

    const sizeClasses = {
      sm: 'py-1.5 pl-8 pr-7 text-xs min-h-[36px]',
      md: 'py-2.5 pl-9 pr-9 text-sm min-h-[42px]',
      lg: 'py-3 pl-10 pr-10 text-base min-h-[48px]',
    };

    const iconSizes = {
      sm: 'w-3.5 h-3.5 left-2.5',
      md: 'w-4 h-4 left-3',
      lg: 'w-5 h-5 left-3.5',
    };

    return (
      <div className="relative flex items-center w-full">
        <Search
          className={`absolute text-[#748780] pointer-events-none transition-colors ${iconSizes[sizeVariant]}`}
        />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={defaultPlaceholder}
          className={`w-full bg-white border border-[#CBD7D1] hover:border-[#ADC0B7] rounded-lg text-[#1A2622] placeholder:text-[#8E9F99] transition-all focus:outline-none focus:ring-2 focus:ring-[#164E43] focus:border-[#164E43] ${sizeClasses[sizeVariant]} ${className}`}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label={language === 'bn' ? 'মুছে ফেলুন' : 'Clear search'}
            className="absolute right-2.5 p-1 text-[#748780] hover:text-[#164E43] rounded-full hover:bg-[#EDF2EF] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
