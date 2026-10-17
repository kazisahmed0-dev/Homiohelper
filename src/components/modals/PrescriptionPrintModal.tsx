import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Prescription, DoctorProfile } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useDoctorProfile } from '../../context/DoctorProfileContext';
import {
  createPrescriptionPrintBlobUrl,
  printPrescriptionIsolated,
  downloadPrescriptionPdf,
  openStandalonePrintTab,
} from '../../services/prescriptionPrintService';
import { Button } from '../ui/Button';

export interface PrescriptionPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription | null;
  doctorProfile?: DoctorProfile;
}

export const PrescriptionPrintModal: React.FC<PrescriptionPrintModalProps> = ({
  isOpen,
  onClose,
  prescription,
  doctorProfile: propDoctor,
}) => {
  const { language } = useLanguage();
  const { doctorProfile: contextDoctor } = useDoctorProfile();
  const isBn = language === 'bn';

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string>('');

  const doctor: DoctorProfile = React.useMemo(() => {
    if (prescription?.doctorProfile && prescription.doctorProfile.name) {
      return prescription.doctorProfile;
    }
    if (propDoctor && propDoctor.name) {
      return propDoctor;
    }
    return contextDoctor;
  }, [prescription, propDoctor, contextDoctor]);

  // Generate blob URL whenever modal opens or prescription changes
  useEffect(() => {
    if (isOpen && prescription) {
      try {
        const url = createPrescriptionPrintBlobUrl(prescription, doctor, language);
        setBlobUrl(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error generating blob URL:', err);
      }
    }
  }, [isOpen, prescription, doctor, language]);

  if (!isOpen || !prescription) return null;

  // Handle direct isolated iframe print
  const handlePrintIsolated = () => {
    const success = printPrescriptionIsolated(prescription, doctor, language);
    if (success) {
      setExportSuccess(
        isBn
          ? 'প্রিন্ট ডায়ালগ চালু হয়েছে। প্রিন্টারে প্রেসক্রিপশন পাঠানো হচ্ছে।'
          : 'Print dialog initiated. Printing isolated prescription.'
      );
      setTimeout(() => setExportSuccess(null), 4000);
    } else {
      setExportError(
        isBn
          ? 'সরাসরি প্রিন্ট সম্ভব হয়নি। অনুগ্রহ করে "আলাদা ব্রাউজার ট্যাব" অথবা "PDF ডাউনলোড" ব্যবহার করুন।'
          : 'Direct print was intercepted. Please use "Open in Clean Tab" or "Download PDF".'
      );
    }
  };

  // Handle PDF export
  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    setExportError(null);
    setExportSuccess(null);
    try {
      const ok = await downloadPrescriptionPdf(prescription, doctor, language);
      if (ok) {
        setExportSuccess(
          isBn
            ? 'প্রেসক্রিপশন PDF সফলভাবে ডাউনলোড হয়েছে।'
            : 'Prescription PDF downloaded successfully.'
        );
        setTimeout(() => setExportSuccess(null), 4000);
      } else {
        setExportError(
          isBn
            ? 'PDF তৈরিতে সমস্যা হয়েছে। আলাদা ট্যাবে খুলে প্রিন্ট করুন।'
            : 'Could not generate PDF. Please open in clean tab to print.'
        );
      }
    } catch (err) {
      console.error(err);
      setExportError(
        isBn
          ? 'PDF ডাউনলোড ত্রুটি। অনুগ্রহ করে সরাসরি প্রিন্ট বা আলাদা ট্যাব ব্যবহার করুন।'
          : 'PDF export error. Please use direct print or separate tab.'
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handle opening standalone tab
  const handleOpenTab = () => {
    openStandalonePrintTab(prescription, doctor, language);
  };

  // Doctor details
  const doctorName = doctor.name || (isBn ? 'ডা. এম. এ. রহমান' : 'Dr. M. A. Rahman');
  const doctorQual = doctor.qualification || '';
  const doctorReg = doctor.regNumber || '';
  const chamberName = doctor.chamberName || (isBn ? 'হোমিওপ্যাথিক চেম্বার ও আরোগ্য নিকেতন' : 'Homoeopathic Clinic & Chamber');
  const chamberAddr = doctor.chamberAddress || '';
  const phone = doctor.phone || '';
  const email = doctor.email || '';
  const visitingHours = doctor.additionalInfo || '';
  const logoUrl = doctor.logoUrl || '';

  // Patient details
  const patientName = prescription.patientName || (isBn ? 'নাম উল্লেখ নেই' : 'Not Specified');
  const patientRegNo = prescription.patientRegNo || prescription.prescriptionNo || '';
  const patientAge = prescription.patientAge ? `${prescription.patientAge} ${isBn ? 'বছর' : 'Y'}` : '';
  const patientGender = prescription.patientGender === 'male'
    ? (isBn ? 'পুরুষ' : 'Male')
    : prescription.patientGender === 'female'
    ? (isBn ? 'মহিলা' : 'Female')
    : prescription.patientGender === 'other'
    ? (isBn ? 'অন্যান্য' : 'Other')
    : '';
  const patientAgeGender = [patientAge, patientGender].filter(Boolean).join(' / ') || '—';
  const rxDate = prescription.date || new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-GB');
  const patientMobile = prescription.patientMobile || '';
  const patientAddress = prescription.patientAddress || '';

  // Clinical findings (only include if entered)
  const hasVitals = Boolean(
    (prescription.bp && prescription.bp.trim()) ||
    (prescription.pulse && prescription.pulse.trim()) ||
    (prescription.weight && prescription.weight.trim()) ||
    (prescription.temperature && prescription.temperature.trim())
  );

  const hasClinicalDetails = Boolean(
    (prescription.chiefComplaint && prescription.chiefComplaint.trim()) ||
    (prescription.patientHistory && prescription.patientHistory.trim()) ||
    (prescription.diagnosis && prescription.diagnosis.trim()) ||
    (prescription.clinicalNotes && prescription.clinicalNotes.trim()) ||
    (prescription.procedures && prescription.procedures.trim())
  );

  const remedies = (prescription.remedies || []).filter(
    (r) => (r.medicineName && r.medicineName.trim()) || (r.potency && r.potency.trim())
  );

  // Optional food restrictions & advice
  const foodsToAvoid = (prescription.foodsToAvoid || prescription.dietRestrictions || '').trim();
  const foodsPermitted = (prescription.foodsPermitted || '').trim();
  const generalPrecautions = (prescription.generalPrecautions || '').trim();
  const additionalAdvice = (prescription.additionalAdvice || prescription.specialInstructions || '').trim();
  const hasAdviceSection = Boolean(foodsToAvoid || foodsPermitted || generalPrecautions || additionalAdvice);

  const investigations = (prescription.investigations || '').trim();
  const warning = (prescription.warning || '').trim();
  const followUpDate = (prescription.followUpDate || '').trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#07130F]/60 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-4xl bg-[#F0F4F2] rounded-2xl border border-[#CBD6D0] shadow-2xl z-10 flex flex-col max-h-[95vh] overflow-hidden"
      >
        {/* Header Toolbar */}
        <div className="bg-[#164E43] text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold leading-tight">
                {isBn ? 'প্রেসক্রিপশন প্রিন্ট ও সংরক্ষণ কেন্দ্র (A4)' : 'Prescription Print & PDF Export (A4)'}
              </h2>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 inline" />
                <span>
                  {isBn
                    ? 'গুগল এআই স্টুডিও বা বাইরের কোনো ইন্টারফেস ছাড়াই নিটোল প্রিন্ট'
                    : '100% clean document: AI Studio, Gemini, and dev chrome excluded'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Open in New Tab with real anchor link (bypasses popup blockers) */}
            {blobUrl && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
                title={isBn ? 'সম্পূর্ণ নতুন ট্যাবে খুলুন' : 'Open in a clean standalone browser tab'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isBn ? 'আলাদা ট্যাব' : 'Clean Tab'}
                </span>
              </a>
            )}

            {/* Direct PDF Download button */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              leftIcon={
                isExportingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#164E43]" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-[#164E43]" />
                )
              }
              className="text-xs bg-white text-[#164E43] hover:bg-[#E8F1EC] border-transparent font-bold py-1.5"
            >
              {isExportingPdf
                ? isBn
                  ? 'তৈরি হচ্ছে...'
                  : 'Generating...'
                : isBn
                ? 'A4 PDF ডাউনলোড'
                : 'Download A4 PDF'}
            </Button>

            {/* Primary Print Button */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePrintIsolated}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-transparent font-bold py-1.5 shadow-xs"
            >
              {isBn ? 'সরাসরি প্রিন্ট' : 'Direct Print'}
            </Button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Strip */}
        <div className="bg-[#E7F0EB] border-b border-[#CFDFD6] px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs text-[#204035]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" />
            <span>
              {isBn
                ? 'কাগজের মাপ: A4 পোর্ট্রেট (১০মিমি মার্জিন) · চিকিৎসকের সম্পূর্ণ হেডার ও স্বাক্ষর সংবলিত'
                : 'Page: Standard A4 Portrait (10mm margins) · Complete doctor chamber header & signature'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenTab}
            className="text-[#164E43] hover:underline font-semibold flex items-center gap-1 hidden md:flex"
          >
            <span>{isBn ? 'ফুলস্ক্রিন প্রিন্ট প্রিভিউ' : 'Fullscreen Print View'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Alerts */}
        {exportSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportSuccess}</span>
          </div>
        )}

        {exportError && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        {/* Document Preview Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center bg-[#5A6862]/10">
          <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-[#11231D] shadow-xl border border-[#CBD6D0] p-6 sm:p-10 flex flex-col justify-between font-sans">
            <div className="space-y-4">
              {/* 1. Complete Doctor Header */}
              <header className="border-b-2 border-[#164E43] pb-3.5 flex items-start justify-between gap-4">
                {/* Left: Doctor info */}
                <div className="flex-1 space-y-0.5">
                  <h1 className="text-xl sm:text-2xl font-black text-[#0F2D25] tracking-tight">
                    {doctorName}
                  </h1>
                  {doctorQual && (
                    <p className="text-xs font-semibold text-[#164E43]">
                      {doctorQual}
                    </p>
                  )}
                  {doctorReg && (
                    <p className="text-[11px] font-mono text-[#516A60]">
                      {doctorReg}
                    </p>
                  )}
                </div>

                {/* Center: Clinic Logo / Emblem */}
                <div className="flex flex-col items-center justify-center shrink-0 px-2">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Clinic Logo"
                      className="max-h-12 max-w-[70px] object-contain rounded-xs"
                    />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-full border-1.5 border-[#164E43] bg-[#F1F6F3] text-[#164E43] flex items-center justify-center font-serif text-xl font-bold shadow-2xs"
                      title="Homoeopathy Symbol"
                    >
                      ⚕
                    </div>
                  )}
                </div>

                {/* Right: Chamber info */}
                <div className="flex-1 text-right space-y-0.5 text-xs text-[#40584F]">
                  <h2 className="font-bold text-sm text-[#0F2D25]">
                    {chamberName}
                  </h2>
                  {chamberAddr && <p className="text-[11px] leading-tight">{chamberAddr}</p>}
                  {phone && (
                    <p className="text-[11px] font-semibold text-[#164E43]">
                      {isBn ? 'মোবাইল' : 'Phone'}: {phone}
                    </p>
                  )}
                  {email && <p className="text-[11px] text-[#556F64]">{email}</p>}
                  {visitingHours && (
                    <p className="text-[10px] italic text-[#5B7268] mt-1">
                      {visitingHours}
                    </p>
                  )}
                </div>
              </header>

              {/* 2. Patient Details Strip */}
              <div className="bg-[#F8FAF9] border border-[#C5D6CD] rounded-md p-2.5 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#5E756C]">
                    {isBn ? 'রোগীর নাম' : 'Patient Name'}
                  </span>
                  <span className="font-bold text-[#0E221C] truncate block">
                    {patientName}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#5E756C]">
                    {isBn ? 'রেজি নং' : 'Reg No'}
                  </span>
                  <span className="font-semibold text-[#0E221C]">
                    {patientRegNo || '—'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#5E756C]">
                    {isBn ? 'বয়স ও লিঙ্গ' : 'Age & Gender'}
                  </span>
                  <span className="font-semibold text-[#0E221C]">
                    {patientAgeGender}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#5E756C]">
                    {isBn ? 'তারিখ' : 'Date'}
                  </span>
                  <span className="font-semibold text-[#0E221C]">{rxDate}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#5E756C]">
                    {isBn ? 'যোগাযোগ / ঠিকানা' : 'Contact / Address'}
                  </span>
                  <span className="font-medium text-[#0E221C] text-[11px] truncate block">
                    {patientMobile || patientAddress || '—'}
                  </span>
                </div>
              </div>

              {/* 3. Clinical Findings (ONLY if entered) */}
              {(hasVitals || hasClinicalDetails) && (
                <div className="bg-[#FCFDFC] border border-[#D7E5DE] rounded-md p-3 text-xs space-y-1.5">
                  {hasVitals && (
                    <div className="flex flex-wrap gap-4 pb-1.5 border-b border-[#E5EEE9] text-[#476257]">
                      {prescription.bp && prescription.bp.trim() && (
                        <span>
                          <strong className="text-[#122922]">{isBn ? 'রক্তচাপ (BP):' : 'BP:'}</strong>{' '}
                          {prescription.bp.trim()}
                        </span>
                      )}
                      {prescription.pulse && prescription.pulse.trim() && (
                        <span>
                          <strong className="text-[#122922]">{isBn ? 'পালস (Pulse):' : 'Pulse:'}</strong>{' '}
                          {prescription.pulse.trim()}
                        </span>
                      )}
                      {prescription.weight && prescription.weight.trim() && (
                        <span>
                          <strong className="text-[#122922]">{isBn ? 'ওজন (Weight):' : 'Weight:'}</strong>{' '}
                          {prescription.weight.trim()}
                        </span>
                      )}
                      {prescription.temperature && prescription.temperature.trim() && (
                        <span>
                          <strong className="text-[#122922]">{isBn ? 'তাপমাত্রা (Temp):' : 'Temp:'}</strong>{' '}
                          {prescription.temperature.trim()}
                        </span>
                      )}
                    </div>
                  )}

                  {prescription.chiefComplaint && prescription.chiefComplaint.trim() && (
                    <div className="text-[#274037] leading-relaxed">
                      <strong className="text-[#164E43]">
                        {isBn ? 'প্রধান উপসর্গ (Chief Complaints):' : 'Chief Complaints:'}
                      </strong>{' '}
                      {prescription.chiefComplaint.trim()}
                    </div>
                  )}

                  {prescription.patientHistory && prescription.patientHistory.trim() && (
                    <div className="text-[#274037] leading-relaxed">
                      <strong className="text-[#164E43]">
                        {isBn ? 'রোগীর অতীত ইতিহাস (Patient History):' : 'Patient History:'}
                      </strong>{' '}
                      {prescription.patientHistory.trim()}
                    </div>
                  )}

                  {prescription.diagnosis && prescription.diagnosis.trim() && (
                    <div className="text-[#274037] leading-relaxed">
                      <strong className="text-[#164E43]">
                        {isBn ? 'রোগ নির্ণয় (Diagnosis):' : 'Clinical Diagnosis:'}
                      </strong>{' '}
                      {prescription.diagnosis.trim()}
                    </div>
                  )}

                  {prescription.clinicalNotes && prescription.clinicalNotes.trim() && (
                    <div className="text-[#274037] leading-relaxed">
                      <strong className="text-[#164E43]">
                        {isBn ? 'ক্লিনিক্যাল ফাইন্ডিংস (Clinical Findings):' : 'Clinical Findings:'}
                      </strong>{' '}
                      {prescription.clinicalNotes.trim()}
                    </div>
                  )}

                  {prescription.procedures && prescription.procedures.trim() && (
                    <div className="text-[#274037] leading-relaxed">
                      <strong className="text-[#164E43]">
                        {isBn ? 'পদ্ধতি ও মডালিটিজ (Procedures):' : 'Procedures & Modalities:'}
                      </strong>{' '}
                      {prescription.procedures.trim()}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Remedies Table (Rx) */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-serif font-black italic text-[#164E43] leading-none">
                    ℞
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#122821]">
                    {isBn ? 'প্রেসক্রাইবড হোমিওপ্যাথিক ঔষধ' : 'Prescribed Homoeopathic Remedies'}
                  </span>
                </div>

                <div className="border border-[#B8CCC2] rounded-md overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#EFF5F2] text-[#17352B] border-b border-[#B8CCC2]">
                      <tr>
                        <th className="py-2 px-2.5 font-bold w-8 text-center">#</th>
                        <th className="py-2 px-3 font-bold">
                          {isBn ? 'ঔষধের নাম ও শক্তি' : 'Medicine & Potency'}
                        </th>
                        <th className="py-2 px-3 font-bold w-24">
                          {isBn ? 'মাত্রা' : 'Dosage'}
                        </th>
                        <th className="py-2 px-3 font-bold w-36">
                          {isBn ? 'সেবনবিধি' : 'Frequency'}
                        </th>
                        <th className="py-2 px-3 font-bold w-24">
                          {isBn ? 'সময়কাল' : 'Duration'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1ECE6]">
                      {remedies.length > 0 ? (
                        remedies.map((remedy, idx) => {
                          const hasInstructions = Boolean(
                            (remedy.whenToTake && remedy.whenToTake.trim()) ||
                            (remedy.howToTake && remedy.howToTake.trim()) ||
                            (remedy.beforeAfterFood && remedy.beforeAfterFood.trim()) ||
                            (remedy.additionalInstructions && remedy.additionalInstructions.trim()) ||
                            (remedy.instructions && remedy.instructions.trim())
                          );

                          return (
                            <tr key={remedy.id || idx} className="hover:bg-[#FAFDFB]">
                              <td className="py-2 px-2.5 text-center text-[#5B756C] font-semibold align-top">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-3 align-top">
                                <div className="font-bold text-[#0F2A21] text-sm">
                                  {remedy.medicineName || '—'}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  {remedy.potency && (
                                    <span className="font-bold text-[#164E43] bg-[#E8F2ED] px-1.5 py-0.5 rounded text-[11px]">
                                      {remedy.potency}
                                    </span>
                                  )}
                                  {remedy.form && (
                                    <span className="text-[11px] text-[#647B72]">
                                      ({remedy.form})
                                    </span>
                                  )}
                                </div>

                                {hasInstructions && (
                                  <div className="mt-1.5 p-1.5 bg-[#F4F8F6] border-l-2 border-[#164E43] rounded-xs text-[11px] space-y-0.5 text-[#2F4B40]">
                                    {remedy.whenToTake && remedy.whenToTake.trim() && (
                                      <div>
                                        <span className="font-bold text-[#164E43]">
                                          {isBn ? 'কখন সেব্য:' : 'When:'}
                                        </span>{' '}
                                        {remedy.whenToTake.trim()}
                                      </div>
                                    )}
                                    {remedy.howToTake && remedy.howToTake.trim() && (
                                      <div>
                                        <span className="font-bold text-[#164E43]">
                                          {isBn ? 'কীভাবে সেব্য:' : 'How:'}
                                        </span>{' '}
                                        {remedy.howToTake.trim()}
                                      </div>
                                    )}
                                    {remedy.beforeAfterFood && remedy.beforeAfterFood.trim() && (
                                      <div>
                                        <span className="font-bold text-[#164E43]">
                                          {isBn ? 'খাবারের সময়:' : 'Food timing:'}
                                        </span>{' '}
                                        {remedy.beforeAfterFood.trim()}
                                      </div>
                                    )}
                                    {remedy.additionalInstructions && remedy.additionalInstructions.trim() && (
                                      <div>
                                        <span className="font-bold text-[#164E43]">
                                          {isBn ? 'নির্দেশনা:' : 'Directions:'}
                                        </span>{' '}
                                        {remedy.additionalInstructions.trim()}
                                      </div>
                                    )}
                                    {!remedy.additionalInstructions && remedy.instructions && remedy.instructions.trim() && (
                                      <div>
                                        <span className="font-bold text-[#164E43]">
                                          {isBn ? 'পরামর্শ:' : 'Note:'}
                                        </span>{' '}
                                        {remedy.instructions.trim()}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="py-2 px-3 font-semibold text-[#1E372F] align-top">
                                {remedy.dosage || '—'}
                              </td>
                              <td className="py-2 px-3 text-[#233D35] align-top">
                                {remedy.frequency || '—'}
                              </td>
                              <td className="py-2 px-3 font-semibold text-[#1E372F] align-top">
                                {remedy.duration || '—'}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-[#7B8F86] italic">
                            {isBn ? 'কোনো ওষুধ যুক্ত করা হয়নি' : 'No remedies entered.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. Optional Investigations */}
              {investigations && (
                <div className="bg-[#FAFDFB] border border-[#CFDFD6] rounded-md p-2.5 text-xs text-[#254035]">
                  <strong className="text-[#164E43]">
                    {isBn ? 'প্রয়োজনীয় পরীক্ষা-নিরীক্ষা:' : 'Investigations & Tests:'}
                  </strong>{' '}
                  {investigations}
                </div>
              )}

              {/* 6. Food Restrictions & Advice (ONLY if entered) */}
              {hasAdviceSection && (
                <div className="bg-[#F9FCFA] border border-[#C9DBD1] rounded-md p-3 text-xs space-y-1">
                  <div className="font-bold uppercase tracking-wider text-[#164E43] text-[11px] pb-1 border-b border-dashed border-[#D2E2D9]">
                    {isBn ? 'উপদেশ ও পথ্য নির্দেশিকা (Health Regimen)' : 'Advice & Health Regimen'}
                  </div>

                  {foodsToAvoid && (
                    <div className="text-[#254035] leading-relaxed">
                      <strong className="text-red-700">
                        {isBn ? 'বর্জনীয় খাদ্য ও পথ্য:' : 'Foods to Avoid:'}
                      </strong>{' '}
                      {foodsToAvoid}
                    </div>
                  )}

                  {foodsPermitted && (
                    <div className="text-[#254035] leading-relaxed">
                      <strong className="text-emerald-700">
                        {isBn ? 'অনুমোদিত ও উপকারী খাদ্য:' : 'Foods Permitted:'}
                      </strong>{' '}
                      {foodsPermitted}
                    </div>
                  )}

                  {generalPrecautions && (
                    <div className="text-[#254035] leading-relaxed">
                      <strong className="text-[#0E5E52]">
                        {isBn ? 'সাধারণ সতর্কতা ও যত্ন:' : 'General Precautions:'}
                      </strong>{' '}
                      {generalPrecautions}
                    </div>
                  )}

                  {additionalAdvice && (
                    <div className="text-[#254035] leading-relaxed">
                      <strong className="text-[#1C3B30]">
                        {isBn ? 'অতিরিক্ত পরামর্শ:' : 'Additional Advice:'}
                      </strong>{' '}
                      {additionalAdvice}
                    </div>
                  )}
                </div>
              )}

              {/* 7. Optional Warning */}
              {warning && (
                <div className="bg-red-50 border border-red-200 rounded-md p-2.5 text-xs text-red-800">
                  <strong className="font-bold uppercase text-[11px]">
                    {isBn ? 'সতর্কতা:' : 'Warning:'}
                  </strong>{' '}
                  {warning}
                </div>
              )}

              {/* 8. Optional Follow-Up Date */}
              {followUpDate && (
                <div className="inline-block bg-[#EBF4F0] border border-[#CDE0D6] rounded-md px-3 py-1 text-xs font-bold text-[#164E43]">
                  {isBn ? 'পরবর্তী সাক্ষাতের সম্ভাব্য তারিখ:' : 'Follow-up Date:'} {followUpDate}
                </div>
              )}
            </div>

            {/* 9. Doctor's Signature Area & Footer */}
            <footer className="mt-8 pt-4 border-t border-[#CBDAD1] flex items-end justify-between gap-4 text-xs">
              <div className="text-[11px] text-[#557165] space-y-0.5 max-w-[65%]">
                {phone && (
                  <div>
                    <strong className="text-[#164E43]">
                      {isBn ? 'জরুরি যোগাযোগ:' : 'Emergency Contact:'}
                    </strong>{' '}
                    {phone}
                  </div>
                )}
                {chamberAddr && <div>{chamberAddr}</div>}
                <div className="text-[10px] text-[#7B8F87] pt-1">
                  {isBn
                    ? 'ঔষধ শিশুদের নাগালের বাইরে রাখুন। নির্দেশিত মাত্রা ছাড়া অতিরিক্ত সেবন করবেন না।'
                    : 'Keep medicines out of reach of children. Do not alter dosage without physician consultation.'}
                </div>
              </div>

              <div className="text-center min-w-[170px] space-y-1">
                <div className="border-b-1.5 border-[#203B31] h-10 flex items-end justify-center pb-0.5">
                  <span className="font-serif italic text-xs text-[#536C61]">
                    {doctorName}
                  </span>
                </div>
                <div className="font-bold text-[#112821] text-xs">
                  {isBn ? 'চিকিৎসকের স্বাক্ষর' : 'Doctor Signature'}
                </div>
                <div className="text-[10px] text-[#556D63]">
                  {doctorQual || doctorName}
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};
