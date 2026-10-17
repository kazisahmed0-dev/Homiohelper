import React, { ReactNode } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  emptyState?: ReactNode;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  compact?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  isLoading,
  onRowClick,
  compact = false,
}: TableProps<T>) {
  const { t } = useLanguage();

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className="w-full bg-white border border-[#D5E0DA] rounded-xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F3F6F4] border-b border-[#D5E0DA] text-[#445650] text-xs font-semibold uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${compact ? 'py-2.5 px-3' : 'py-3.5 px-4'} ${
                    alignClasses[col.align || 'left']
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6EDE9] text-sm text-[#1B2925]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-[#6A7C75]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#164E43] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">{t('loadingData')}</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8">
                  {emptyState || (
                    <div className="text-center py-6 text-[#72847E] text-sm">
                      {t('noResultsFound')}
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={keyExtractor(item, index)}
                  onClick={() => onRowClick?.(item)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-[#F7FAF8]' : 'hover:bg-[#F9FBFA]'
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${compact ? 'py-2.5 px-3' : 'py-3.5 px-4'} ${
                        alignClasses[col.align || 'left']
                      } ${col.className || ''}`}
                    >
                      {col.render
                        ? col.render(item, index)
                        : (item as Record<string, unknown>)[col.key] !== undefined
                        ? String((item as Record<string, unknown>)[col.key])
                        : '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
