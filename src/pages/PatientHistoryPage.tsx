import React, { useState } from 'react';
import { FileClock, User } from 'lucide-react';
import { Patient, NavigationTab } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { PageHeading } from '../components/ui/PageHeading';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';

export interface PatientHistoryPageProps {
  patients: Patient[];
  selectedPatientId?: string | null;
  onSelectPatient: (patient: Patient) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const PatientHistoryPage: React.FC<PatientHistoryPageProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const searchResults = searchQuery.trim()
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.mobile.includes(searchQuery)
      )
    : patients;

  return (
    <div className="space-y-6">
      <PageHeading
        title={t('historyTitle')}
        subtitle={t('historySubtitle')}
        actions={
          activePatient && (
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate('prescriptions')}
            >
              {t('dashCreatePrescription')}
            </Button>
          )
        }
      />

      {patients.length === 0 ? (
        <EmptyState
          icon={FileClock}
          title={t('historyEmptyTitle')}
          description={t('historyEmptyMsg')}
          actionLabel={t('patientsRegisterNew')}
          onAction={() => onNavigate('patients')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Patient Selector List */}
          <div className="lg:col-span-4 bg-white border border-[#D5E1DB] rounded-xl p-4 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#475B54]">
              {t('historySelectPatient')}
            </label>
            <SearchInput
              sizeVariant="sm"
              placeholder={t('historySearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />

            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1 divide-y divide-[#E9EFEA]">
              {searchResults.map((patient) => {
                const isSelected = activePatient?.id === patient.id;
                return (
                  <button
                    key={patient.id}
                    onClick={() => onSelectPatient(patient)}
                    className={`w-full text-left p-3 rounded-lg transition-all pt-2.5 ${
                      isSelected
                        ? 'bg-[#EBF3EF] border border-[#BFD4CB] text-[#123930]'
                        : 'hover:bg-[#F4F7F5] text-[#2C3E37]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm truncate">{patient.name}</span>
                      <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 bg-white border border-[#D2DED8] rounded text-[#164E43]">
                        {patient.regNo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#637770] mt-1">
                      <span>{patient.mobile}</span>
                      <span>·</span>
                      <span>
                        {patient.age}y /{' '}
                        {patient.gender === 'male'
                          ? t('patientsGenderMale')
                          : patient.gender === 'female'
                          ? t('patientsGenderFemale')
                          : t('patientsGenderOther')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Clinical History Details for Selected Patient */}
          <div className="lg:col-span-8 space-y-5">
            {activePatient ? (
              <div className="bg-white border border-[#D5E1DB] rounded-xl p-5 space-y-6">
                {/* Patient Summary Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E3ECE7] gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#E8F1EC] text-[#164E43] flex items-center justify-center font-bold text-base">
                      {activePatient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-[#142620]">
                          {activePatient.name}
                        </h2>
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#EFF6F3] text-[#164E43] rounded">
                          {activePatient.regNo}
                        </span>
                      </div>
                      <p className="text-xs text-[#5E716B]">
                        {activePatient.age} {language === 'bn' ? 'বছর' : 'years'} ·{' '}
                        {activePatient.gender === 'male'
                          ? t('patientsGenderMale')
                          : activePatient.gender === 'female'
                          ? t('patientsGenderFemale')
                          : t('patientsGenderOther')}{' '}
                        · {t('patientsFieldBloodGroup')}: {activePatient.bloodGroup || '—'} ·{' '}
                        {t('patientsMobile')}: {activePatient.mobile}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-[#637770] sm:text-right">
                    <p className="font-medium text-[#1E322A]">
                      {t('historyRegisteredDate')}
                    </p>
                    <p>
                      {new Date(activePatient.registeredAt).toLocaleDateString(
                        language === 'bn' ? 'bn-BD' : 'en-GB'
                      )}
                    </p>
                  </div>
                </div>

                {/* Homoeopathic Case Record Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#435750]">
                    {t('historyCaseAnamnesisTitle')}
                  </h3>

                  <div className="p-4 bg-[#F8FAF9] border border-[#DEE7E2] rounded-lg space-y-2">
                    <span className="text-xs font-semibold text-[#182C25] block">
                      {t('historyComplaintsAndModalities')}
                    </span>
                    <p className="text-sm text-[#384A43] leading-relaxed">
                      {activePatient.chiefComplaint || t('historyNoComplaintsYet')}
                    </p>
                  </div>

                  {/* Previous Prescriptions / Encounter Log (Initial state) */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#435750] mb-2.5">
                      {t('historyRemedyLogTitle')}
                    </h4>
                    <div className="border border-dashed border-[#CFDAD4] rounded-lg p-5 text-center bg-[#FAFCFA]">
                      <p className="text-xs text-[#647770] mb-3">
                        {t('historyNoPastRemedies')}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onNavigate('prescriptions')}
                      >
                        {t('rxGenerateNew')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={User}
                title={t('historyEmptyTitle')}
                description={t('historyEmptyMsg')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
