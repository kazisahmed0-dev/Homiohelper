import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Printer,
  Plus,
  Trash2,
  Edit3,
  Eye,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Building2,
  Sparkles,
  Search,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { Prescription, Patient, NavigationTab, PrescribedRemedy, Medicine } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useDoctorProfile } from '../context/DoctorProfileContext';
import {
  getSavedPrescriptions,
  savePrescriptionToStorage,
  deletePrescriptionFromStorage,
} from '../services/prescriptionStorage';
import {
  printPrescriptionIsolated,
  openStandalonePrintTab,
} from '../services/prescriptionPrintService';
import { medicineStorage } from '../services/medicineStorage';
import { PageHeading } from '../components/ui/PageHeading';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { Table, Column } from '../components/ui/Table';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { NotificationBanner } from '../components/ui/NotificationBanner';
import { PrescriptionPadPreview } from '../components/prescription/PrescriptionPadPreview';
import { PrescriptionPrintModal } from '../components/modals/PrescriptionPrintModal';

export interface PrescriptionsPageProps {
  patients: Patient[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenNewPatient: () => void;
}

const COMMON_POTENCIES = [
  'Q (Mother Tincture)',
  '30C',
  '200C',
  '1M',
  '10M',
  '50M',
  'CM',
  '0/1 (LM)',
  '0/2 (LM)',
  '0/3 (LM)',
  '0/6 (LM)',
  '3X (Biochemic)',
  '6X (Biochemic)',
  '12X (Biochemic)',
  '30X (Biochemic)',
  '200X (Biochemic)',
];

const COMMON_DOSAGES_BN = [
  '৪ দানা করে (4 globules)',
  '৫ ফোঁটা আধা কাপ পানিতে',
  '১০ ফোঁটা এক কাপ পানিতে',
  '২ টি করে বড়ি (2 tablets)',
  '১ পুরিয়া (1 powder)',
  '১ ড্রাম শিশি (#30 globules)',
];

const COMMON_FREQUENCIES_BN = [
  'দিনে ২ বার খাবার ৩০ মিনিট আগে',
  'দিনে ৩ বার খাবার পর',
  'প্রতিদিন সকালে ১ বার খালি পেটে',
  'রাতে ঘুমানোর পূর্বে ১ বার',
  'তীব্র ব্যথায় প্রতি ২ ঘণ্টা পরপর',
  'সপ্তাহে ১ বার (এক মাত্রা)',
];

const COMMON_DURATIONS_BN = [
  '৩ দিন (3 days)',
  '৭ দিন (7 days)',
  '১০ দিন (10 days)',
  '১৫ দিন (15 days)',
  '২১ দিন (21 days)',
  '১ মাস (1 month)',
];

const PRESET_DIET_RESTRICTIONS_BN = [
  'কাঁচা পেঁয়াজ, কাঁচা রসুন ও কর্পূর সম্পূর্ণ বর্জনীয়।',
  'টক জাতীয় খাবার ও ঠান্ডা পানীয় পরিহার করুন।',
  'কড়া চা, কফি ও তামাকজাত দ্রব্য এড়িয়ে চলুন।',
  'ঔষধ সেবনের ৩০ মিনিট আগে ও পরে কিছু খাবেন না।',
];

const PRESET_DIET_RESTRICTIONS_EN = [
  'Avoid raw onions, garlic, camphor and strong menthol.',
  'Avoid sour items, cold drinks, and refrigerated foods.',
  'Avoid strong coffee, tea, and tobacco.',
  'Do not consume food or drink 30 minutes before and after medicine.',
];

export const PrescriptionsPage: React.FC<PrescriptionsPageProps> = ({
  patients,
  onNavigate,
  onOpenNewPatient,
}) => {
  const { t, language } = useLanguage();
  const { doctorProfile, openProfileModal } = useDoctorProfile();

  // Active view mode: 'builder' | 'history'
  const [activeTab, setActiveTab] = useState<'builder' | 'history'>('builder');

  // Mobile layout sub-tab: 'editor' | 'preview'
  const [mobileSubTab, setMobileSubTab] = useState<'editor' | 'preview'>('editor');

  // Stored prescriptions list
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => getSavedPrescriptions());

  // Medicine catalog for autocomplete
  const medicineCatalog: Medicine[] = useMemo(() => medicineStorage.getMedicines(), []);

  // Remedy helper to create a brand new completely empty remedy row (all fields blank by default)
  const createEmptyRemedy = (): PrescribedRemedy => ({
    id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    medicineName: '',
    potency: '',
    form: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    whenToTake: '',
    howToTake: '',
    beforeAfterFood: '',
    additionalInstructions: '',
  });

  // Form drafting state - ALL fields start completely empty
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [customPatientName, setCustomPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [patientMobile, setPatientMobile] = useState<string>('');
  const [patientRegNo, setPatientRegNo] = useState<string>('');
  const [date, setDate] = useState<string>(
    new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB')
  );
  const [showPatientSuggestions, setShowPatientSuggestions] = useState<boolean>(false);

  // Clinical findings, history, diagnosis & procedures - ALL start completely empty
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [patientHistory, setPatientHistory] = useState<string>('');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [procedures, setProcedures] = useState<string>('');
  const [investigations, setInvestigations] = useState<string>('');

  // Vitals - ALL start completely empty
  const [bp, setBp] = useState<string>('');
  const [pulse, setPulse] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');

  // Dynamic remedies list - starts with a single empty remedy row
  const [remedies, setRemedies] = useState<PrescribedRemedy[]>([createEmptyRemedy()]);

  // Autocomplete search states per row index
  const [activeRemedyIndex, setActiveRemedyIndex] = useState<number | null>(null);

  // Food Restrictions & Health Advice - ALL start completely empty (blank by default)
  const [foodsToAvoid, setFoodsToAvoid] = useState<string>('');
  const [foodsPermitted, setFoodsPermitted] = useState<string>('');
  const [generalPrecautions, setGeneralPrecautions] = useState<string>('');
  const [additionalAdvice, setAdditionalAdvice] = useState<string>('');
  const [dietRestrictions, setDietRestrictions] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [warning, setWarning] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');

  // Notification and confirmation states
  const [notification, setNotification] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Dedicated Prescription Print & Export Modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printModalRx, setPrintModalRx] = useState<Prescription | null>(null);

  // Filter matching patients for live autocomplete dropdown
  const matchingPatients = useMemo(() => {
    if (!customPatientName.trim()) return [];
    const query = customPatientName.toLowerCase().trim();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.regNo && p.regNo.toLowerCase().includes(query)) ||
        (p.mobile && p.mobile.includes(query))
    );
  }, [patients, customPatientName]);

  // Select a patient from saved records and populate their details
  const handleSelectPatient = (p: Patient) => {
    setSelectedPatientId(p.id);
    setCustomPatientName(p.name);
    setPatientAge(p.age ? String(p.age) : '');
    setPatientGender(p.gender || '');
    setPatientMobile(p.mobile || '');
    setPatientRegNo(p.regNo || '');
    if (p.chiefComplaint) {
      setChiefComplaint(p.chiefComplaint);
    }
    setShowPatientSuggestions(false);
  };

  // Construct current real-time prescription object for live preview
  const livePrescription: Prescription = useMemo(() => {
    return {
      id: 'rx-draft',
      prescriptionNo: 'RX-' + (1000 + prescriptions.length + 1),
      patientId: selectedPatientId || '',
      patientName: customPatientName,
      patientAge,
      patientGender: patientGender || undefined,
      patientMobile,
      patientRegNo,
      date,
      chiefComplaint,
      patientHistory,
      clinicalNotes,
      diagnosis,
      procedures,
      investigations,
      bp,
      pulse,
      weight,
      temperature,
      remedies: remedies.filter((r) => r.medicineName.trim() || r.potency.trim()),
      foodsToAvoid,
      foodsPermitted,
      generalPrecautions,
      additionalAdvice,
      dietRestrictions,
      specialInstructions,
      warning,
      followUpDate,
      doctorProfile,
    };
  }, [
    prescriptions.length,
    selectedPatientId,
    customPatientName,
    patientAge,
    patientGender,
    patientMobile,
    patientRegNo,
    date,
    chiefComplaint,
    patientHistory,
    clinicalNotes,
    diagnosis,
    procedures,
    investigations,
    bp,
    pulse,
    weight,
    temperature,
    remedies,
    foodsToAvoid,
    foodsPermitted,
    generalPrecautions,
    additionalAdvice,
    dietRestrictions,
    specialInstructions,
    warning,
    followUpDate,
    doctorProfile,
  ]);

  // Remedy helpers
  const handleAddRemedy = () => {
    setRemedies((prev) => [...prev, createEmptyRemedy()]);
  };

  const handleUpdateRemedy = (idx: number, updates: Partial<PrescribedRemedy>) => {
    const updated = [...remedies];
    updated[idx] = { ...updated[idx], ...updates };
    setRemedies(updated);
  };

  const handleRemoveRemedy = (idx: number) => {
    if (remedies.length <= 1) {
      setRemedies([createEmptyRemedy()]);
      return;
    }
    setRemedies(remedies.filter((_, i) => i !== idx));
  };

  const handleSelectSuggestedMedicine = (idx: number, med: Medicine) => {
    handleUpdateRemedy(idx, {
      medicineName: med.name,
      potency: med.availablePotencies && med.availablePotencies.length > 0 ? med.availablePotencies[0] : (remedies[idx].potency || ''),
      form: med.form || (remedies[idx].form || ''),
    });
    setActiveRemedyIndex(null);
  };

  // Save Prescription
  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customPatientName.trim()) {
      setNotification(language === 'bn' ? 'রোগীর নাম পূরণ করুন' : 'Please provide patient name.');
      return;
    }

    const validRemedies = remedies.filter((r) => r.medicineName.trim());
    if (validRemedies.length === 0) {
      setNotification(
        language === 'bn' ? 'কমপক্ষে একটি ওষুধের নাম প্রদান করুন' : 'Please prescribe at least one medicine.'
      );
      return;
    }

    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      prescriptionNo: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: selectedPatientId || `patient-${Date.now()}`,
      patientName: customPatientName.trim(),
      patientAge: patientAge.trim() || undefined,
      patientGender: patientGender || undefined,
      patientMobile: patientMobile.trim() || undefined,
      patientRegNo: patientRegNo.trim() || undefined,
      date,
      chiefComplaint: chiefComplaint.trim() || undefined,
      patientHistory: patientHistory.trim() || undefined,
      clinicalNotes: clinicalNotes.trim() || undefined,
      diagnosis: diagnosis.trim() || undefined,
      procedures: procedures.trim() || undefined,
      investigations: investigations.trim() || undefined,
      bp: bp.trim() || undefined,
      pulse: pulse.trim() || undefined,
      weight: weight.trim() || undefined,
      temperature: temperature.trim() || undefined,
      remedies: validRemedies,
      foodsToAvoid: foodsToAvoid.trim() || undefined,
      foodsPermitted: foodsPermitted.trim() || undefined,
      generalPrecautions: generalPrecautions.trim() || undefined,
      additionalAdvice: additionalAdvice.trim() || undefined,
      dietRestrictions: (dietRestrictions.trim() || foodsToAvoid.trim()) || undefined,
      specialInstructions: (specialInstructions.trim() || additionalAdvice.trim()) || undefined,
      warning: warning.trim() || undefined,
      followUpDate: followUpDate.trim() || undefined,
      doctorProfile,
      createdAt: new Date().toISOString(),
    };

    const updatedList = savePrescriptionToStorage(newRx);
    setPrescriptions(updatedList);
    setNotification(t('rxSaveSuccess'));

    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Load an existing prescription into the builder
  const handleLoadPrescription = (rx: Prescription) => {
    setSelectedPatientId(rx.patientId || '');
    setCustomPatientName(rx.patientName || '');
    setPatientAge(rx.patientAge ? String(rx.patientAge) : '');
    setPatientGender(rx.patientGender || '');
    setPatientMobile(rx.patientMobile || '');
    setPatientRegNo(rx.patientRegNo || '');
    setDate(rx.date || new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB'));
    setChiefComplaint(rx.chiefComplaint || '');
    setPatientHistory(rx.patientHistory || '');
    setClinicalNotes(rx.clinicalNotes || '');
    setDiagnosis(rx.diagnosis || '');
    setProcedures(rx.procedures || '');
    setInvestigations(rx.investigations || '');
    setBp(rx.bp || '');
    setPulse(rx.pulse || '');
    setWeight(rx.weight || '');
    setTemperature(rx.temperature || '');
    setRemedies(
      rx.remedies && rx.remedies.length > 0
        ? rx.remedies.map((r) => ({
            ...createEmptyRemedy(),
            ...r,
          }))
        : [createEmptyRemedy()]
    );
    setFoodsToAvoid(rx.foodsToAvoid || rx.dietRestrictions || '');
    setFoodsPermitted(rx.foodsPermitted || '');
    setGeneralPrecautions(rx.generalPrecautions || '');
    setAdditionalAdvice(rx.additionalAdvice || rx.specialInstructions || '');
    setDietRestrictions(rx.dietRestrictions || '');
    setSpecialInstructions(rx.specialInstructions || '');
    setWarning(rx.warning || '');
    setFollowUpDate(rx.followUpDate || '');
    setActiveTab('builder');
    setMobileSubTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset builder form - ALL fields set back to completely blank
  const handleResetForm = () => {
    setSelectedPatientId('');
    setCustomPatientName('');
    setPatientAge('');
    setPatientGender('');
    setPatientMobile('');
    setPatientRegNo('');
    setDate(new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB'));
    setChiefComplaint('');
    setPatientHistory('');
    setClinicalNotes('');
    setDiagnosis('');
    setProcedures('');
    setInvestigations('');
    setBp('');
    setPulse('');
    setWeight('');
    setTemperature('');
    setFoodsToAvoid('');
    setFoodsPermitted('');
    setGeneralPrecautions('');
    setAdditionalAdvice('');
    setDietRestrictions('');
    setSpecialInstructions('');
    setWarning('');
    setFollowUpDate('');
    setRemedies([createEmptyRemedy()]);
    setShowPatientSuggestions(false);
    setActiveRemedyIndex(null);
  };

  // Dedicated Prescription Print & PDF Export Center (Eliminates AI Studio / Gemini frame)
  const handlePrint = (targetRx?: Prescription) => {
    const rxToPrint = targetRx || livePrescription;
    setPrintModalRx(rxToPrint);
    setIsPrintModalOpen(true);
  };

  // Open standalone clean print tab (detaches from AI Studio frame)
  const handleOpenPrintTab = (targetRx?: Prescription) => {
    const rxToPrint = targetRx || livePrescription;
    const docToUse = rxToPrint.doctorProfile || doctorProfile;
    openStandalonePrintTab(rxToPrint, docToUse, language);
  };

  // Delete Prescription
  const confirmDelete = () => {
    if (!deleteId) return;
    const updated = deletePrescriptionFromStorage(deleteId);
    setPrescriptions(updated);
    setDeleteId(null);
  };

  // Columns for History Table
  const historyColumns: Column<Prescription>[] = [
    {
      key: 'prescriptionNo',
      header: t('rxColNumber'),
      render: (rx) => (
        <span className="font-mono text-xs font-semibold text-[#164E43] bg-[#EFF6F3] px-2 py-0.5 rounded">
          {rx.prescriptionNo}
        </span>
      ),
    },
    {
      key: 'patientName',
      header: t('patientsName'),
      render: (rx) => (
        <div>
          <span className="font-bold text-sm text-[#142620] block">{rx.patientName}</span>
          <span className="text-[11px] text-[#637770]">
            {rx.patientRegNo ? `${rx.patientRegNo} · ` : ''}
            {rx.patientAge ? `${rx.patientAge} Y` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'date',
      header: t('rxColDate'),
      render: (rx) => <span className="text-xs text-[#5D7068]">{rx.date}</span>,
    },
    {
      key: 'remedies',
      header: t('rxColRemedy'),
      render: (rx) => (
        <div className="text-xs space-y-0.5 max-w-xs">
          {rx.remedies.map((r, i) => (
            <span key={i} className="inline-block text-[#164E43] font-medium mr-2">
              {r.medicineName} ({r.potency})
              {i < rx.remedies.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('patientsActions'),
      align: 'right',
      render: (rx) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => handleLoadPrescription(rx)}
            title={language === 'bn' ? 'লোড করুন' : 'Load into Editor'}
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            {t('actionEdit')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => handlePrint(rx)}
            title={t('actionPrint')}
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            {t('actionPrint')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => handleOpenPrintTab(rx)}
            title={language === 'bn' ? 'আলাদা ট্যাবে খুলুন' : 'Open in Separate Tab'}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2 text-red-700 hover:bg-red-50"
            onClick={() => setDeleteId(rx.id)}
            title={t('actionDelete')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="prescriptions-container space-y-5">
      {/* Page Heading & Main Tab Toggle */}
      <div className="no-print">
        <PageHeading
          title={t('rxTitle')}
          subtitle={t('rxSubtitle')}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              {/* Doctor Chamber Profile Button */}
              <Button
                variant="outline"
                size="md"
                leftIcon={<Building2 className="w-4 h-4 text-[#164E43]" />}
                onClick={openProfileModal}
                className="text-xs"
              >
                {t('docEditProfileBtn')}
              </Button>

              {/* Print current button */}
              {activeTab === 'builder' && (
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<Printer className="w-4 h-4" />}
                  onClick={() => handlePrint()}
                  className="text-xs"
                >
                  {t('actionPrint')}
                </Button>
              )}

              {/* Tab Switcher */}
              <div className="flex items-center bg-[#EBF2EE] p-1 rounded-lg border border-[#D3E1DA]">
                <button
                  type="button"
                  onClick={() => setActiveTab('builder')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeTab === 'builder'
                      ? 'bg-white text-[#164E43] shadow-xs'
                      : 'text-[#4F685F] hover:text-[#164E43]'
                  }`}
                >
                  {t('rxTabEditor')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeTab === 'history'
                      ? 'bg-white text-[#164E43] shadow-xs'
                      : 'text-[#4F685F] hover:text-[#164E43]'
                  }`}
                >
                  {t('rxTabSavedList')} ({prescriptions.length})
                </button>
              </div>
            </div>
          }
        />
      </div>

      {/* Doctor Chamber Context Banner (Always visible in app view) */}
      <div className="no-print bg-[#F7FAF8] border border-[#D7E5DE] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#164E43] text-white flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#122A23]">
                {doctorProfile.name}
              </span>
              <span className="text-[10px] font-semibold text-[#164E43] bg-[#E8F2ED] px-2 py-0.5 rounded">
                {language === 'bn' ? 'অ্যাক্টিভ প্রেসক্রিপশন হেডার' : 'Active Header'}
              </span>
            </div>
            <p className="text-xs text-[#526D63] mt-0.5">
              {doctorProfile.qualification} · {doctorProfile.chamberName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={openProfileModal}
            className="text-xs text-[#164E43] hover:bg-[#EBF3EF]"
          >
            {t('docEditProfileBtn')}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="no-print">
          <NotificationBanner
            type="success"
            message={notification}
            onDismiss={() => setNotification(null)}
          />
        </div>
      )}

      {/* TAB 1: BUILDER & LIVE PREVIEW */}
      {activeTab === 'builder' && (
        <div className="space-y-4">
          {/* Mobile sub-tab selector (only on <lg screens) */}
          <div className="no-print lg:hidden flex items-center bg-[#EAEFEA] p-1 rounded-lg border border-[#D5E1DB]">
            <button
              type="button"
              onClick={() => setMobileSubTab('editor')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all text-center ${
                mobileSubTab === 'editor'
                  ? 'bg-white text-[#164E43] shadow-xs'
                  : 'text-[#586F66]'
              }`}
            >
              {t('rxTabEditor')}
            </button>
            <button
              type="button"
              onClick={() => setMobileSubTab('preview')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all text-center ${
                mobileSubTab === 'preview'
                  ? 'bg-white text-[#164E43] shadow-xs'
                  : 'text-[#586F66]'
              }`}
            >
              {t('rxLivePreview')}
            </button>
          </div>

          {/* Responsive Layout: Side-by-Side on Desktop, Toggled on Mobile */}
          <div className="prescriptions-grid grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: PRESCRIPTION FORM EDITOR */}
            <div
              className={`lg:col-span-6 space-y-5 ${
                mobileSubTab === 'preview' ? 'hidden lg:block' : 'block'
              } no-print`}
            >
              <form onSubmit={handleSavePrescription} className="space-y-5">
                {/* 1. Patient Selection & Details */}
                <div className="bg-white border border-[#D5E1DB] rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3ECE7]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#164E43]">
                      {language === 'bn' ? '১. রোগীর তথ্য' : '1. Patient Information'}
                    </h3>
                    <button
                      type="button"
                      onClick={onOpenNewPatient}
                      className="text-xs text-[#164E43] font-semibold hover:underline"
                    >
                      + {t('dashNewPatient')}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {patients.length > 0 && (
                      <Select
                        label={t('rxSelectPatient')}
                        value={selectedPatientId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedPatientId(id);
                          if (!id) return;
                          const p = patients.find((item) => item.id === id);
                          if (p) handleSelectPatient(p);
                        }}
                      >
                        <option value="">
                          {language === 'bn' ? '-- সংরক্ষিত রোগী নির্বাচন করুন --' : '-- Select from Saved Patients --'}
                        </option>
                        {patients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.regNo})
                          </option>
                        ))}
                      </Select>
                    )}

                    <div className="relative">
                      <Input
                        label={t('patientsFieldName') + ' *'}
                        placeholder={t('patientsFieldNamePlaceholder')}
                        value={customPatientName}
                        onChange={(e) => {
                          setCustomPatientName(e.target.value);
                          setShowPatientSuggestions(true);
                        }}
                        onFocus={() => setShowPatientSuggestions(true)}
                        required
                      />

                      {/* Patient Autocomplete Suggestions Dropdown */}
                      {showPatientSuggestions && customPatientName.trim().length > 0 && matchingPatients.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#CBD6D0] rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto">
                          {matchingPatients.slice(0, 6).map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectPatient(p)}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-[#EFF6F3] border-b border-[#F0F5F2] flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-[#142B23]">{p.name}</span>
                                <span className="text-[10px] text-[#556F64] ml-2">
                                  ({p.regNo} · {p.age ? `${p.age} Y` : ''} · {p.gender === 'male' ? (language === 'bn' ? 'পুরুষ' : 'Male') : p.gender === 'female' ? (language === 'bn' ? 'মহিলা' : 'Female') : ''})
                                </span>
                              </div>
                              {p.mobile && (
                                <span className="text-[10px] text-[#164E43] font-mono">
                                  {p.mobile}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Input
                      label={t('patientsFieldAge')}
                      type="number"
                      placeholder={language === 'bn' ? 'যেমন: ৪২' : 'e.g. 42'}
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                    />

                    <Select
                      label={t('patientsFieldGender')}
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as 'male' | 'female' | 'other' | '')}
                    >
                      <option value="">{language === 'bn' ? 'লিঙ্গ নির্বাচন করুন' : 'Select Gender'}</option>
                      <option value="male">{t('patientsGenderMale')}</option>
                      <option value="female">{t('patientsGenderFemale')}</option>
                      <option value="other">{t('patientsGenderOther')}</option>
                    </Select>

                    <Input
                      label={t('patientsFieldMobile')}
                      placeholder={language === 'bn' ? 'যেমন: ০১৭...' : 'e.g. 017...'}
                      value={patientMobile}
                      onChange={(e) => setPatientMobile(e.target.value)}
                    />

                    <Input
                      label={t('rxColDate')}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* 2. Clinical Assessment & Modalities */}
                <div className="bg-white border border-[#D5E1DB] rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
                  <div className="pb-2 border-b border-[#E3ECE7]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#164E43]">
                      {language === 'bn' ? '২. ক্লিনিক্যাল হিস্ট্রি ও শারীরিক পর্যবেক্ষণ' : '2. Clinical History & Assessment'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Input
                      label={t('rxChiefComplaint')}
                      placeholder={t('rxChiefComplaintPlaceholder')}
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                    />

                    <Input
                      label={t('rxClinicalDiagnosis')}
                      placeholder={t('rxClinicalDiagnosisPlaceholder')}
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                    />
                  </div>

                  {/* Vitals Bar: BP, Pulse, Weight, Temperature */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Input
                      label={t('rxBloodPressure')}
                      placeholder={language === 'bn' ? 'যেমন: ১২০/৮০' : 'e.g. 120/80'}
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                    />
                    <Input
                      label={t('rxPulse')}
                      placeholder={language === 'bn' ? 'যেমন: ৭২/মি.' : 'e.g. 72 bpm'}
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                    />
                    <Input
                      label={t('rxWeight')}
                      placeholder={language === 'bn' ? 'যেমন: ৬৫ কেজি' : 'e.g. 65 kg'}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <Input
                      label={t('rxTemperature')}
                      placeholder={language === 'bn' ? 'যেমন: ৯৮.৪°F' : 'e.g. 98.4°F'}
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                  </div>

                  {/* Patient History & Clinical Findings Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-[#2A4138] mb-1">
                        {t('rxPatientHistory')}
                      </label>
                      <textarea
                        rows={2}
                        value={patientHistory}
                        onChange={(e) => setPatientHistory(e.target.value)}
                        placeholder={t('rxPatientHistoryPlaceholder')}
                        className="w-full p-2 text-xs rounded-lg border border-[#CBD6D0] focus:ring-1 focus:ring-[#164E43] focus:border-[#164E43] bg-white text-[#132A23]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#2A4138] mb-1">
                        {t('rxClinicalNotes')}
                      </label>
                      <textarea
                        rows={2}
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        placeholder={t('rxClinicalNotesPlaceholder')}
                        className="w-full p-2 text-xs rounded-lg border border-[#CBD6D0] focus:ring-1 focus:ring-[#164E43] focus:border-[#164E43] bg-white text-[#132A23]"
                      />
                    </div>
                  </div>

                  {/* Procedures and Investigations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Input
                      label={t('rxProcedures')}
                      placeholder={t('rxProceduresPlaceholder')}
                      value={procedures}
                      onChange={(e) => setProcedures(e.target.value)}
                    />
                    <Input
                      label={t('rxInvestigations')}
                      placeholder={t('rxInvestigationsPlaceholder')}
                      value={investigations}
                      onChange={(e) => setInvestigations(e.target.value)}
                    />
                  </div>
                </div>

                {/* 3. Homoeopathic Remedies (Multiple Medicines) */}
                <div className="bg-white border border-[#D5E1DB] rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3ECE7]">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#164E43]">
                        {language === 'bn' ? '৩. প্রেসক্রাইবড ওষুধ (Rx Remedies)' : '3. Prescribed Remedies (Rx)'}
                      </h3>
                      <p className="text-[11px] text-[#637970] mt-0.5">
                        {language === 'bn' ? 'প্রয়োজন অনুযায়ী একাধিক ওষুধ ও পোটেন্সি যুক্ত করুন' : 'Add one or more medicines with potencies and dosage'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('medicines')}
                        className="text-xs text-[#164E43] hover:bg-[#EBF3EF]"
                      >
                        {t('rxManageMedicines')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddRemedy}
                        leftIcon={<Plus className="w-3.5 h-3.5 text-[#164E43]" />}
                        className="text-xs"
                      >
                        {t('rxAddNewRemedy')}
                      </Button>
                    </div>
                  </div>

                  {/* Dynamic Remedy Rows */}
                  <div className="space-y-4">
                    {remedies.map((remedy, idx) => (
                      <div
                        key={remedy.id}
                        className="p-3.5 bg-[#FAFDFB] border border-[#D7E5DE] rounded-xl space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#164E43]">
                            #{idx + 1} {language === 'bn' ? 'ওষুধ' : 'Remedy'}
                          </span>
                          {remedies.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRemedy(idx)}
                              className="text-red-600 hover:text-red-800 p-1 text-xs rounded hover:bg-red-50 flex items-center gap-1"
                              title={t('actionDelete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">{t('actionDelete')}</span>
                            </button>
                          )}
                        </div>

                        {/* Medicine Name with Autocomplete Suggestions */}
                        <div className="relative">
                          <Input
                            label={t('rxMedicineName') + ' *'}
                            placeholder={t('rxMedicineNamePlaceholder')}
                            value={remedy.medicineName}
                            onFocus={() => setActiveRemedyIndex(idx)}
                            onChange={(e) => {
                              handleUpdateRemedy(idx, { medicineName: e.target.value });
                              setActiveRemedyIndex(idx);
                            }}
                            required
                          />

                          {/* Autocomplete Dropdown */}
                          {activeRemedyIndex === idx && remedy.medicineName.trim().length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#CBD6D0] rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto">
                              {medicineCatalog
                                .filter((m: Medicine) =>
                                  m.name.toLowerCase().includes(remedy.medicineName.toLowerCase()) ||
                                  (m.nameBn && m.nameBn.includes(remedy.medicineName)) ||
                                  (m.commonName && m.commonName.toLowerCase().includes(remedy.medicineName.toLowerCase()))
                                )
                                .slice(0, 8)
                                .map((med: Medicine) => (
                                  <button
                                    key={med.id}
                                    type="button"
                                    onClick={() => handleSelectSuggestedMedicine(idx, med)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#EFF6F3] border-b border-[#F0F5F2] flex items-center justify-between"
                                  >
                                    <div>
                                      <span className="font-bold text-[#142B23]">{med.name}</span>
                                      {med.nameBn && (
                                        <span className="text-[10px] text-[#556F64] ml-2">({med.nameBn})</span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-[#164E43] font-semibold bg-[#E8F2ED] px-1.5 py-0.5 rounded">
                                      {med.availablePotencies?.join(', ')}
                                    </span>
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {/* Potency */}
                          <Select
                            label={t('rxPotency')}
                            value={remedy.potency}
                            onChange={(e) => handleUpdateRemedy(idx, { potency: e.target.value })}
                          >
                            <option value="">{language === 'bn' ? '-- পোটেন্সি নির্বাচন করুন --' : '-- Select Potency --'}</option>
                            {COMMON_POTENCIES.map((pot) => (
                              <option key={pot} value={pot}>{pot}</option>
                            ))}
                          </Select>

                          {/* Form */}
                          <Select
                            label={t('rxRemedyColForm')}
                            value={remedy.form || ''}
                            onChange={(e) => handleUpdateRemedy(idx, { form: e.target.value })}
                          >
                            <option value="">{language === 'bn' ? '-- মাধ্যম/আকার নির্বাচন করুন --' : '-- Select Form --'}</option>
                            <option value="globules">{language === 'bn' ? 'দানা (Globules)' : 'Globules'}</option>
                            <option value="liquid">{language === 'bn' ? 'তরল ড্রপস (Liquid)' : 'Liquid Drops'}</option>
                            <option value="tablets">{language === 'bn' ? 'ট্যাবলেট (Tablets)' : 'Tablets'}</option>
                            <option value="powder">{language === 'bn' ? 'পুরিয়া (Powder)' : 'Powder'}</option>
                            <option value="mother_tincture">{language === 'bn' ? 'মাদার টিংচার (Q)' : 'Mother Tincture'}</option>
                          </Select>

                          {/* Dosage */}
                          <div>
                            <Input
                              label={t('rxDosage')}
                              value={remedy.dosage}
                              onChange={(e) => handleUpdateRemedy(idx, { dosage: e.target.value })}
                              placeholder={t('rxDosagePlaceholder')}
                            />
                          </div>

                          {/* Duration */}
                          <div>
                            <Input
                              label={t('rxDuration')}
                              value={remedy.duration}
                              onChange={(e) => handleUpdateRemedy(idx, { duration: e.target.value })}
                              placeholder={t('rxDurationPlaceholder')}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Frequency */}
                          <Input
                            label={t('rxFrequency')}
                            value={remedy.frequency}
                            onChange={(e) => handleUpdateRemedy(idx, { frequency: e.target.value })}
                            placeholder={t('rxFrequencyPlaceholder')}
                          />

                          {/* Quick note */}
                          <Input
                            label={t('rxRemedyColInstructions')}
                            value={remedy.instructions || ''}
                            onChange={(e) => handleUpdateRemedy(idx, { instructions: e.target.value })}
                            placeholder={language === 'bn' ? 'যেমন: কুসুম গরম পানিতে সেব্য...' : 'e.g. Take with lukewarm water...'}
                          />
                        </div>

                        {/* Optional Specific Medicine Instructions (Blank by default) */}
                        <div className="pt-2 border-t border-[#E8F0EC] space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#164E43] block">
                            {language === 'bn' ? 'ঔষধ সেবনের সুনির্দিষ্ট নিয়মাবলী (ঐচ্ছিক):' : 'Specific Medicine Instructions (Optional):'}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Input
                              label={t('rxWhenToTake')}
                              value={remedy.whenToTake || ''}
                              onChange={(e) => handleUpdateRemedy(idx, { whenToTake: e.target.value })}
                              placeholder={t('rxWhenToTakePlaceholder')}
                            />
                            <Input
                              label={t('rxHowToTake')}
                              value={remedy.howToTake || ''}
                              onChange={(e) => handleUpdateRemedy(idx, { howToTake: e.target.value })}
                              placeholder={t('rxHowToTakePlaceholder')}
                            />
                            <Input
                              label={t('rxBeforeAfterFood')}
                              value={remedy.beforeAfterFood || ''}
                              onChange={(e) => handleUpdateRemedy(idx, { beforeAfterFood: e.target.value })}
                              placeholder={t('rxBeforeAfterFoodPlaceholder')}
                            />
                          </div>
                          <div>
                            <Input
                              label={t('rxAdditionalInstructions')}
                              value={remedy.additionalInstructions || ''}
                              onChange={(e) => handleUpdateRemedy(idx, { additionalInstructions: e.target.value })}
                              placeholder={t('rxAdditionalInstructionsPlaceholder')}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddRemedy}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      className="w-full text-xs"
                    >
                      {t('rxAddNewRemedy')}
                    </Button>
                  </div>
                </div>

                {/* 4. Homoeopathic Diet Restrictions & Regimen (Blank by default) */}
                <div className="bg-white border border-[#D5E1DB] rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
                  <div className="pb-2 border-b border-[#E3ECE7] flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#164E43]">
                        {language === 'bn' ? '৪. খাদ্য ও পথ্য বিধিনিষেধ এবং সাধারণ উপদেশ' : '4. Diet Restrictions & General Advice'}
                      </h3>
                      <p className="text-[11px] text-[#556F64] mt-0.5">
                        {t('rxFoodAdviceHelp')}
                      </p>
                    </div>
                  </div>

                  {/* 1. Foods to Avoid */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-[#8B1E1E]">
                        {t('rxFoodsToAvoid')} ({language === 'bn' ? 'ঐচ্ছিক' : 'Optional'})
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-[#637C72]">
                          {language === 'bn' ? 'দ্রুত যুক্ত করুন:' : 'Quick Add:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFoodsToAvoid((p) => p ? `${p}, কাঁচা পেঁয়াজ ও রসুন` : 'কাঁচা পেঁয়াজ, কাঁচা রসুন ও কর্পূর বর্জনীয়')}
                          className="text-[10px] bg-red-50 text-red-800 border border-red-200 px-1.5 py-0.5 rounded hover:bg-red-100"
                        >
                          + কাঁচা পেঁয়াজ/রসুন
                        </button>
                        <button
                          type="button"
                          onClick={() => setFoodsToAvoid((p) => p ? `${p}, টক ও ঠান্ডা পানীয়` : 'টক জাতীয় খাবার ও ঠান্ডা পানীয় পরিহার করুন')}
                          className="text-[10px] bg-red-50 text-red-800 border border-red-200 px-1.5 py-0.5 rounded hover:bg-red-100"
                        >
                          + টক ও ঠান্ডা
                        </button>
                        <button
                          type="button"
                          onClick={() => setFoodsToAvoid((p) => p ? `${p}, কড়া চা-কফি ও তামাক` : 'কড়া চা, কফি ও তামাক বর্জনীয়')}
                          className="text-[10px] bg-red-50 text-red-800 border border-red-200 px-1.5 py-0.5 rounded hover:bg-red-100"
                        >
                          + চা-কফি/তামাক
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={foodsToAvoid}
                      onChange={(e) => setFoodsToAvoid(e.target.value)}
                      placeholder={t('rxFoodsToAvoidPlaceholder')}
                      className="w-full p-2.5 text-xs rounded-lg border border-[#CBD6D0] focus:ring-1 focus:ring-[#164E43] focus:border-[#164E43] bg-white text-[#132A23]"
                    />
                  </div>

                  {/* 2. Foods Permitted or Recommended */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1B6D3B]">
                      {t('rxFoodsPermitted')} ({language === 'bn' ? 'ঐচ্ছিক' : 'Optional'})
                    </label>
                    <textarea
                      rows={2}
                      value={foodsPermitted}
                      onChange={(e) => setFoodsPermitted(e.target.value)}
                      placeholder={t('rxFoodsPermittedPlaceholder')}
                      className="w-full p-2.5 text-xs rounded-lg border border-[#CBD6D0] focus:ring-1 focus:ring-[#164E43] focus:border-[#164E43] bg-white text-[#132A23]"
                    />
                  </div>

                  {/* 3. General Precautions & 4. Additional Advice */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#184F44] mb-1">
                        {t('rxGeneralPrecautions')}
                      </label>
                      <textarea
                        rows={2}
                        value={generalPrecautions}
                        onChange={(e) => setGeneralPrecautions(e.target.value)}
                        placeholder={t('rxGeneralPrecautionsPlaceholder')}
                        className="w-full p-2 text-xs rounded-lg border border-[#CBD6D0] focus:ring-1 focus:ring-[#164E43] focus:border-[#164E43] bg-white text-[#132A23]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#184F44] mb-1">
                        {t('rxAdditionalAdvice')}
                      </label>
                      <textarea
                        rows={2}
                        value={additionalAdvice}
                        onChange={(e) => setAdditionalAdvice(e.target.value)}
                        placeholder={t('rxAdditionalAdvicePlaceholder')}
                        className="w-full p-2 text-xs rounded-lg border border-[#CBD6D0] focus:ring-1 focus:ring-[#164E43] focus:border-[#164E43] bg-white text-[#132A23]"
                      />
                    </div>
                  </div>

                  {/* Follow-up Date */}
                  <div className="pt-1">
                    <Input
                      label={t('rxFollowUpDate')}
                      placeholder="e.g. 25/10/2026"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* 5. Optional Medical Warning / Caution */}
                <div className="bg-white border border-[#D5E1DB] rounded-xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
                  <div className="pb-2 border-b border-[#E3ECE7] flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#164E43] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      {t('rxFieldWarning')}
                    </h3>
                    <span className="text-[11px] text-[#60776E]">
                      {language === 'bn' ? 'ঐচ্ছিক' : 'Optional'}
                    </span>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      value={warning}
                      onChange={(e) => setWarning(e.target.value)}
                      placeholder={t('rxFieldWarningPlaceholder')}
                      className="w-full p-2.5 text-xs rounded-lg border border-[#CBD6D0] focus:ring-1 focus:ring-[#164E43] focus:border-[#164E43] bg-white text-[#132A23]"
                    />
                    <p className="text-[11px] text-[#698177] mt-1">
                      {language === 'bn'
                        ? 'যদি কোনো বিশেষ সতর্কতা বা নিষেধাজ্ঞা থাকে তবে লিখুন। ফাঁকা রাখলে প্রেসক্রিপশন বা প্রিন্টে কোনো সতর্কবার্তা দৃশ্যমান হবে না।'
                        : 'Enter any caution or contraindication if needed. If left blank, no warning will appear in the preview or printout.'}
                    </p>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleResetForm}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    {t('actionReset')}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() => handlePrint()}
                      leftIcon={<Printer className="w-4 h-4" />}
                    >
                      {t('actionPrint')}
                    </Button>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      {t('rxIssuePrescription')}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: REAL-TIME LIVE PREVIEW PAD */}
            <div
              className={`prescription-preview-wrapper lg:col-span-6 sticky top-20 ${
                mobileSubTab === 'editor' ? 'hidden lg:block' : 'block'
              }`}
            >
              <PrescriptionPadPreview
                prescription={livePrescription}
                doctorProfile={doctorProfile}
                onPrint={() => handlePrint()}
                onEditDoctor={openProfileModal}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRESCRIPTION HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4 no-print">
          {prescriptions.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t('rxEmptyTitle')}
              description={t('rxEmptyMsg')}
              actionLabel={t('rxGenerateNew')}
              onAction={() => setActiveTab('builder')}
            />
          ) : (
            <div className="bg-white border border-[#D5E1DB] rounded-xl overflow-hidden shadow-2xs">
              <div className="px-5 py-4 border-b border-[#E3ECE7] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#142620]">
                    {t('rxTabSavedList')}
                  </h3>
                  <p className="text-xs text-[#5D7068] mt-0.5">
                    {language === 'bn'
                      ? `মোট ${prescriptions.length} টি প্রেসক্রিপশন সংরক্ষিত আছে`
                      : `Total ${prescriptions.length} prescriptions issued`}
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setActiveTab('builder')}
                >
                  {t('rxGenerateNew')}
                </Button>
              </div>

              <Table
                columns={historyColumns}
                data={prescriptions}
                keyExtractor={(item) => item.id}
              />
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(deleteId)}
        title={t('rxDeleteConfirmTitle')}
        message={t('rxDeleteConfirmMsg')}
        confirmLabel={t('actionDelete')}
        cancelLabel={t('actionCancel')}
        variant="danger"
        onConfirm={confirmDelete}
        onClose={() => setDeleteId(null)}
      />

      {/* Dedicated Clean Prescription Print & PDF Export Modal */}
      <PrescriptionPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setPrintModalRx(null);
        }}
        prescription={printModalRx || livePrescription}
        doctorProfile={doctorProfile}
      />
    </div>
  );
};
