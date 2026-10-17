import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  size = 'md',
  className = '',
}) => {
  const { t } = useLanguage();
  const displayMessage = message || t('loadingData');

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-[#5E716A] space-y-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={`${sizeClasses[size]} animate-spin text-[#164E43]`} />
      {displayMessage && <p className="text-sm font-medium text-[#465751]">{displayMessage}</p>}
    </div>
  );
};
