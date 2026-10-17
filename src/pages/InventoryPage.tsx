import React from 'react';
import { Package } from 'lucide-react';
import { NavigationTab } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { PageHeading } from '../components/ui/PageHeading';
import { EmptyState } from '../components/ui/EmptyState';

export interface InventoryPageProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <PageHeading
        title={t('inventoryTitle')}
        subtitle={t('inventorySubtitle')}
      />

      <EmptyState
        icon={Package}
        title={t('inventoryEmptyTitle')}
        description={t('inventoryEmptyMsg')}
        actionLabel={t('actionView') + ' ' + t('navMedicines')}
        onAction={() => onNavigate('medicines')}
      >
        <div className="mt-4 p-4 max-w-lg mx-auto bg-white border border-[#D5E1DB] rounded-lg text-left text-xs text-[#4F625B] space-y-2">
          <p className="font-semibold text-[#182A24]">
            {t('inventoryPlannedTitle')}
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#5E716A]">
            <li>{t('inventoryPlannedItem1')}</li>
            <li>{t('inventoryPlannedItem2')}</li>
            <li>{t('inventoryPlannedItem3')}</li>
          </ul>
        </div>
      </EmptyState>
    </div>
  );
};
