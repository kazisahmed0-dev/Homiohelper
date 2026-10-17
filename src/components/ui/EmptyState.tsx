import React, { ReactNode } from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  children,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-[#CFDAD4] rounded-xl bg-[#FAFCFA] ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#EBF2EE] text-[#164E43] flex items-center justify-center mb-3.5">
        <Icon className="w-6 h-6 stroke-[1.6]" />
      </div>
      <h3 className="text-base font-semibold text-[#1F2E29] mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-[#5B6D66] max-w-md leading-relaxed mb-4">
          {description}
        </p>
      )}
      {children}
      {actionLabel && onAction && (
        <div className="mt-2">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
