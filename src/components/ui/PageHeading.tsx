import React, { ReactNode } from 'react';

export interface PageHeadingProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export const PageHeading: React.FC<PageHeadingProps> = ({
  title,
  subtitle,
  badgeText,
  actions,
  children,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#DDE5E1] mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#14231E]">
            {title}
          </h1>
          {badgeText && (
            <span className="text-xs text-[#52665F] font-medium">
              · {badgeText}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#5B6F68] leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {actions}
        </div>
      )}

      {children}
    </div>
  );
};
