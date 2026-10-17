import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface NotificationBannerProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  type = 'info',
  title,
  message,
  onDismiss,
  className = '',
}) => {
  const { t } = useLanguage();

  const configs = {
    info: {
      container: 'bg-[#F2F7F5] border-[#CFDFD8] text-[#164E43]',
      icon: Info,
      iconClass: 'text-[#164E43]',
    },
    success: {
      container: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]',
      icon: CheckCircle2,
      iconClass: 'text-[#166534]',
    },
    warning: {
      container: 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]',
      icon: AlertTriangle,
      iconClass: 'text-[#B45309]',
    },
    error: {
      container: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
      icon: AlertCircle,
      iconClass: 'text-[#DC2626]',
    },
  };

  const current = configs[type];
  const Icon = current.icon;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3.5 border rounded-xl text-sm transition-all ${current.container} ${className}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconClass}`} />
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold text-xs uppercase tracking-wider mb-0.5">{title}</h4>}
        <div className="text-xs md:text-sm leading-relaxed">{message}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          type="button"
          aria-label={t('dismissNotice')}
          className="text-current opacity-70 hover:opacity-100 p-1 -mr-1 rounded-md transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
