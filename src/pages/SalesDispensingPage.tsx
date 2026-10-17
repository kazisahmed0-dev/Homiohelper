import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { NavigationTab } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { PageHeading } from '../components/ui/PageHeading';
import { EmptyState } from '../components/ui/EmptyState';

export interface SalesDispensingPageProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const SalesDispensingPage: React.FC<SalesDispensingPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <PageHeading
        title={t('salesTitle')}
        subtitle={t('salesSubtitle')}
      />

      <EmptyState
        icon={ShoppingBag}
        title={t('salesEmptyTitle')}
        description={t('salesEmptyMsg')}
        actionLabel={t('actionView') + ' ' + t('navPrescriptions')}
        onAction={() => onNavigate('prescriptions')}
      >
        <div className="mt-4 p-4 max-w-lg mx-auto bg-white border border-[#D5E1DB] rounded-lg text-left text-xs text-[#4F625B] space-y-2">
          <p className="font-semibold text-[#182A24]">
            {t('salesPlannedTitle')}
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#5E716A]">
            <li>{t('salesPlannedItem1')}</li>
            <li>{t('salesPlannedItem2')}</li>
            <li>{t('salesPlannedItem3')}</li>
          </ul>
        </div>
      </EmptyState>
    </div>
  );
};
