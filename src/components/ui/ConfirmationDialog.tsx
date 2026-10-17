import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from './Button';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const { t, language } = useLanguage();
  const effectiveConfirmLabel = confirmLabel || t('actionConfirm');
  const effectiveCancelLabel = cancelLabel || t('actionCancel');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F1B17]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="relative w-full max-w-md bg-white rounded-xl border border-[#CBD6D0] p-6 shadow-xl transition-all z-10"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {variant === 'danger' && (
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 id="dialog-title" className="text-base font-semibold text-[#182622]">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#71847D] hover:text-[#1F2E29] p-1 rounded-md transition-colors"
            aria-label={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-sm text-[#4E6059] leading-relaxed">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="md" onClick={onClose} disabled={isLoading}>
            {effectiveCancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {effectiveConfirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
