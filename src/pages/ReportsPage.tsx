import React from 'react';
import { BarChart3 } from 'lucide-react';
import { NavigationTab } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { PageHeading } from '../components/ui/PageHeading';
import { EmptyState } from '../components/ui/EmptyState';

export interface ReportsPageProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <PageHeading
        title={t('reportsTitle')}
        subtitle={t('reportsSubtitle')}
      />

      <EmptyState
        icon={BarChart3}
        title={t('reportsEmptyTitle')}
        description={t('reportsEmptyMsg')}
        actionLabel={t('actionView') + ' ' + t('navDashboard')}
        onAction={() => onNavigate('dashboard')}
      >
        <div className="mt-4 p-4 max-w-lg mx-auto bg-white border border-[#D5E1DB] rounded-lg text-left text-xs text-[#4F625B] space-y-2">
          <p className="font-semibold text-[#182A24]">
            {t('reportsPlannedTitle')}
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#5E716A]">
            <li>{t('reportsPlannedItem1')}</li>
            <li>{t('reportsPlannedItem2')}</li>
            <li>{t('reportsPlannedItem3')}</li>
          </ul>
        </div>
      </EmptyState>
    </div>
  );
};
