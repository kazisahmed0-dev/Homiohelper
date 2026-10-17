import React, { useState } from 'react';
import {
  UserPlus,
  CalendarPlus,
  FilePlus,
  Clock,
  UserCheck,
  Package,
  Eye,
} from 'lucide-react';
import { Patient, NavigationTab } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { PageHeading } from '../components/ui/PageHeading';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import { Table, Column } from '../components/ui/Table';
import { useDoctorProfile } from '../context/DoctorProfileContext';

export interface DashboardPageProps {
  patients: Patient[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenNewPatient: () => void;
  onSelectPatient: (patient: Patient) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  patients,
  onNavigate,
  onOpenNewPatient,
  onSelectPatient,
}) => {
  const { t, language } = useLanguage();
  const { doctorProfile } = useDoctorProfile();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter patients based on quick search
  const filteredPatients = searchQuery.trim()
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.mobile.includes(searchQuery)
      )
    : patients;

  // Recent patients list (last 5)
  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .slice(0, 5);

  const today = new Date();
  const bdDateString = today.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const patientColumns: Column<Patient>[] = [
    {
      key: 'regNo',
      header: t('patientsRegNo'),
      render: (p) => (
        <span className="font-mono text-xs font-semibold text-[#164E43] bg-[#EFF6F3] px-2 py-0.5 rounded">
          {p.regNo}
        </span>
      ),
    },
    {
      key: 'name',
      header: t('patientsName'),
      render: (p) => (
        <div>
          <p className="font-semibold text-sm text-[#14231E]">{p.name}</p>
          <p className="text-xs text-[#637770]">{p.address || p.district || '—'}</p>
        </div>
      ),
    },
    {
      key: 'mobile',
      header: t('patientsMobile'),
      render: (p) => <span className="font-mono text-xs text-[#2A3C35]">{p.mobile}</span>,
    },
    {
      key: 'ageGender',
      header: t('patientsAgeGender'),
      render: (p) => (
        <span className="text-xs text-[#485B54]">
          {p.age}y · {p.gender === 'male' ? t('patientsGenderMale') : p.gender === 'female' ? t('patientsGenderFemale') : t('patientsGenderOther')}
        </span>
      ),
    },
    {
      key: 'chiefComplaint',
      header: t('patientsChiefComplaint'),
      render: (p) => (
        <span className="text-xs text-[#354740] line-clamp-1 max-w-[200px]">
          {p.chiefComplaint || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('patientsActions'),
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectPatient(p)}
            className="text-xs h-7 px-2"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            {t('actionView')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Heading with Action Buttons */}
      <PageHeading
        title={t('dashTitle')}
        subtitle={t('dashSubtitle')}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="md"
              leftIcon={<CalendarPlus className="w-4 h-4 text-[#164E43]" />}
              onClick={() => onNavigate('visits')}
            >
              {t('dashNewVisit')}
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<FilePlus className="w-4 h-4 text-[#164E43]" />}
              onClick={() => onNavigate('prescriptions')}
            >
              {t('dashCreatePrescription')}
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={onOpenNewPatient}
            >
              {t('dashNewPatient')}
            </Button>
          </div>
        }
      />

      {/* Prominent Patient Search Area */}
      <div className="p-4 sm:p-5 bg-white border border-[#D5E1DB] rounded-xl shadow-2xs">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#435750] mb-2">
          {t('dashQuickSearchTitle')}
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchInput
              sizeVariant="lg"
              placeholder={t('dashQuickSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto px-6 shrink-0"
            onClick={() => {
              if (searchQuery.trim()) {
                onNavigate('patients');
              }
            }}
          >
            {t('actionSearch')}
          </Button>
        </div>
        <p className="mt-2 text-xs text-[#6A7E77]">
          {t('dashQuickSearchTip')}
        </p>

        {/* Quick Search Preview Results if searching */}
        {searchQuery.trim() && (
          <div className="mt-4 pt-4 border-t border-[#E3ECE7]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#182B24]">
                {language === 'bn'
                  ? `অনুসন্ধানের ফলাফল (${filteredPatients.length} জন)`
                  : `Search Results (${filteredPatients.length} found)`}
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#164E43] hover:underline"
              >
                {t('actionReset')}
              </button>
            </div>
            {filteredPatients.length > 0 ? (
              <Table
                columns={patientColumns}
                data={filteredPatients}
                keyExtractor={(item) => item.id}
                compact
              />
            ) : (
              <p className="text-xs text-[#71857E] py-2">
                {t('noResultsFound')} &ldquo;{searchQuery}&rdquo;
              </p>
            )}
          </div>
        )}
      </div>

      {/* Today Section (Doctor's Daily Session Overview) */}
      <div className="bg-white border border-[#D5E1DB] rounded-xl p-5">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E3ECE7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EBF2EE] text-[#164E43] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#142620]">
                {t('dashTodaySection')}
              </h2>
              <p className="text-xs text-[#61746E]">{bdDateString}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#164E43] bg-[#EBF3EF] px-2.5 py-1 rounded-md font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            {t('dashDutyDoctor')}: {doctorProfile.name || t('doctorDefaultName')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
          <div className="p-3 bg-[#F8FAF9] border border-[#DEE7E2] rounded-lg">
            <span className="text-[#647770] font-medium block mb-1">
              {t('dashShift')}
            </span>
            <p className="font-semibold text-sm text-[#182A24]">
              {t('dashShiftMorningEvening')}
            </p>
            <p className="text-[11px] text-[#71857E] mt-0.5">
              {t('dashShiftHours')}
            </p>
          </div>

          <div className="p-3 bg-[#F8FAF9] border border-[#DEE7E2] rounded-lg">
            <span className="text-[#647770] font-medium block mb-1">
              {t('dashRegisteredPatientsLabel')}
            </span>
            <p className="font-semibold text-sm text-[#182A24]">
              {patients.length} {language === 'bn' ? 'জন' : 'Patients'}
            </p>
            <p className="text-[11px] text-[#71857E] mt-0.5">
              {patients.length === 0
                ? t('dashRegisteredPatientsSubZero')
                : t('dashRegisteredPatientsSubCount')}
            </p>
          </div>

          <div className="p-3 bg-[#F8FAF9] border border-[#DEE7E2] rounded-lg">
            <span className="text-[#647770] font-medium block mb-1">
              {t('dashPrescriptionPadFormat')}
            </span>
            <p className="font-semibold text-sm text-[#182A24]">
              {t('dashPrescriptionPadDesc')}
            </p>
            <p className="text-[11px] text-[#71857E] mt-0.5">
              {language === 'bn' ? 'প্রিন্ট ও বিতরণ প্রস্তুত' : 'Print & dispense ready'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Recent Patients & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="bg-white border border-[#D5E1DB] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E3ECE7]">
              <div>
                <h3 className="text-sm font-bold text-[#142620]">
                  {t('dashRecentPatientsTitle')}
                </h3>
                <p className="text-xs text-[#637770]">
                  {t('dashRecentPatientsDesc')}
                </p>
              </div>
              {patients.length > 0 && (
                <button
                  onClick={() => onNavigate('patients')}
                  className="text-xs font-semibold text-[#164E43] hover:underline"
                >
                  {t('dashViewAllPatients')}
                </button>
              )}
            </div>

            {recentPatients.length === 0 ? (
              <EmptyState
                icon={UserCheck}
                title={t('dashEmptyRecentPatientsTitle')}
                description={t('dashEmptyRecentPatientsMsg')}
                actionLabel={t('dashNewPatient')}
                onAction={onOpenNewPatient}
              />
            ) : (
              <Table
                columns={patientColumns}
                data={recentPatients}
                keyExtractor={(item) => item.id}
                compact
              />
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-[#D5E1DB] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E3ECE7]">
              <div>
                <h3 className="text-sm font-bold text-[#142620]">
                  {t('dashLowStockTitle')}
                </h3>
                <p className="text-xs text-[#637770]">
                  {t('dashLowStockDesc')}
                </p>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs font-semibold text-[#164E43] hover:underline"
              >
                {t('dashViewInventory')}
              </button>
            </div>

            <EmptyState
              icon={Package}
              title={t('dashEmptyLowStockTitle')}
              description={t('dashEmptyLowStockMsg')}
              actionLabel={t('actionView') + ' ' + t('navInventory')}
              onAction={() => onNavigate('inventory')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
