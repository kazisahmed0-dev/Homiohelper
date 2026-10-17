import React, { useState } from 'react';
import { UserPlus, Users, Search, Eye, CalendarPlus } from 'lucide-react';
import { Patient, NavigationTab } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { PageHeading } from '../components/ui/PageHeading';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { Table, Column } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';

export interface PatientsPageProps {
  patients: Patient[];
  onOpenNewPatient: () => void;
  onSelectPatient: (patient: Patient) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  patients,
  onOpenNewPatient,
  onSelectPatient,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = patients.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.regNo.toLowerCase().includes(q) ||
      p.mobile.includes(searchTerm) ||
      (p.district && p.district.toLowerCase().includes(q))
    );
  });

  const columns: Column<Patient>[] = [
    {
      key: 'regNo',
      header: t('patientsRegNo'),
      render: (p) => (
        <span className="font-mono text-xs font-semibold text-[#164E43] bg-[#EAF2EE] px-2 py-0.5 rounded">
          {p.regNo}
        </span>
      ),
    },
    {
      key: 'name',
      header: t('patientsName'),
      render: (p) => (
        <div>
          <p className="font-semibold text-sm text-[#142620]">{p.name}</p>
          <p className="text-xs text-[#637770]">
            {p.address ? `${p.address}, ` : ''}
            {p.district || (language === 'bn' ? 'বাংলাদেশ' : 'Bangladesh')}
          </p>
        </div>
      ),
    },
    {
      key: 'mobile',
      header: t('patientsMobile'),
      render: (p) => <span className="font-mono text-xs text-[#293A34]">{p.mobile}</span>,
    },
    {
      key: 'ageGender',
      header: t('patientsAgeGender'),
      render: (p) => (
        <span className="text-xs text-[#445650]">
          {p.age}y ·{' '}
          {p.gender === 'male'
            ? t('patientsGenderMale')
            : p.gender === 'female'
            ? t('patientsGenderFemale')
            : t('patientsGenderOther')}
          {p.bloodGroup ? ` (${p.bloodGroup})` : ''}
        </span>
      ),
    },
    {
      key: 'chiefComplaint',
      header: t('patientsChiefComplaint'),
      render: (p) => (
        <span className="text-xs text-[#30423B] line-clamp-2 max-w-[240px]">
          {p.chiefComplaint || '—'}
        </span>
      ),
    },
    {
      key: 'lastVisit',
      header: t('patientsLastVisit'),
      render: (p) => (
        <span className="text-xs text-[#5D7068]">
          {new Date(p.lastVisitAt || p.registeredAt).toLocaleDateString(
            language === 'bn' ? 'bn-BD' : 'en-GB'
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('patientsActions'),
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectPatient(p)}
            className="text-xs h-7 px-2"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            {t('actionView')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('visits')}
            className="text-xs h-7 px-2 text-[#164E43]"
            title={t('visitsRecordNew')}
          >
            <CalendarPlus className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeading
        title={t('patientsTitle')}
        subtitle={t('patientsSubtitle')}
        badgeText={`${patients.length} ${t('patientsCountBadge')}`}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={onOpenNewPatient}
          >
            {t('patientsRegisterNew')}
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 border border-[#D5E1DB] rounded-xl">
        <div className="w-full sm:max-w-md">
          <SearchInput
            placeholder={t('patientsSearchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
          />
        </div>
        <div className="text-xs text-[#5D7069] self-start sm:self-center">
          {filtered.length} {t('patientsShownCount')}
        </div>
      </div>

      {patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('patientsEmptyTitle')}
          description={t('patientsEmptyMsg')}
          actionLabel={t('patientsRegisterNew')}
          onAction={onOpenNewPatient}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t('noResultsFound')}
          description={
            language === 'bn'
              ? `"${searchTerm}" এর সাথে মিলে এমন কোনো রোগী নেই। বানান পরীক্ষা করুন।`
              : `No patient matched "${searchTerm}". Check the registration number or mobile.`
          }
          actionLabel={t('actionReset')}
          onAction={() => setSearchTerm('')}
        />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => onSelectPatient(item)}
        />
      )}
    </div>
  );
};
