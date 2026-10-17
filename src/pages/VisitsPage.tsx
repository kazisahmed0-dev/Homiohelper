import React, { useState } from 'react';
import { CalendarCheck, CalendarPlus } from 'lucide-react';
import { Visit, Patient, NavigationTab } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { PageHeading } from '../components/ui/PageHeading';
import { Button } from '../components/ui/Button';
import { Table, Column } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';

export interface VisitsPageProps {
  patients: Patient[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenNewPatient: () => void;
}

export const VisitsPage: React.FC<VisitsPageProps> = ({
  patients,
  onNavigate,
  onOpenNewPatient,
}) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'today' | 'completed'>('today');
  const [visits] = useState<Visit[]>([]);

  const columns: Column<Visit>[] = [
    {
      key: 'patientRegNo',
      header: t('patientsRegNo'),
      render: (v) => (
        <span className="font-mono text-xs font-semibold text-[#164E43] bg-[#EAF2EE] px-2 py-0.5 rounded">
          {v.patientRegNo}
        </span>
      ),
    },
    {
      key: 'patientName',
      header: t('patientsName'),
      render: (v) => <span className="font-semibold text-sm text-[#142620]">{v.patientName}</span>,
    },
    {
      key: 'date',
      header: t('visitsColDateTime'),
      render: (v) => <span className="text-xs text-[#5C6E67]">{v.date}</span>,
    },
    {
      key: 'chiefComplaint',
      header: t('patientsChiefComplaint'),
      render: (v) => <span className="text-xs text-[#30413A]">{v.chiefComplaint}</span>,
    },
    {
      key: 'remedy',
      header: t('visitsColRemedy'),
      render: (v) => (
        <span className="text-xs font-medium text-[#164E43]">
          {v.remedyPrescribed} ({v.potency})
        </span>
      ),
    },
    {
      key: 'status',
      header: t('visitsColStatus'),
      render: (v) => (
        <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
          {v.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeading
        title={t('visitsTitle')}
        subtitle={t('visitsSubtitle')}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<CalendarPlus className="w-4 h-4" />}
            onClick={() => {
              if (patients.length === 0) {
                onOpenNewPatient();
              } else {
                onNavigate('prescriptions');
              }
            }}
          >
            {t('visitsRecordNew')}
          </Button>
        }
      />

      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1.5 p-1 bg-[#EEF3F0] rounded-lg max-w-fit border border-[#D7E2DC]">
        <button
          onClick={() => setFilter('today')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            filter === 'today'
              ? 'bg-white text-[#164E43] shadow-2xs font-bold'
              : 'text-[#5A6D66] hover:text-[#182C25]'
          }`}
        >
          {t('visitsFilterToday')}
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            filter === 'completed'
              ? 'bg-white text-[#164E43] shadow-2xs font-bold'
              : 'text-[#5A6D66] hover:text-[#182C25]'
          }`}
        >
          {t('visitsFilterCompleted')}
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            filter === 'all'
              ? 'bg-white text-[#164E43] shadow-2xs font-bold'
              : 'text-[#5A6D66] hover:text-[#182C25]'
          }`}
        >
          {t('visitsFilterAll')}
        </button>
      </div>

      {visits.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={t('visitsEmptyTitle')}
          description={t('visitsEmptyMsg')}
          actionLabel={patients.length === 0 ? t('patientsRegisterNew') : t('visitsRecordNew')}
          onAction={() => {
            if (patients.length === 0) {
              onOpenNewPatient();
            } else {
              onNavigate('prescriptions');
            }
          }}
        />
      ) : (
        <Table columns={columns} data={visits} keyExtractor={(item) => item.id} />
      )}
    </div>
  );
};
