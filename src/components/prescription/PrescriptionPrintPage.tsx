import React, { useEffect, useState } from 'react';
import { Printer, X, ArrowLeft, AlertCircle, Download, Loader2 } from 'lucide-react';
import { Prescription, DoctorProfile } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useDoctorProfile } from '../../context/DoctorProfileContext';
import { getSavedPrescriptions } from '../../services/prescriptionStorage';
import { downloadPrescriptionPdf } from '../../services/prescriptionPrintService';

export interface PrescriptionPrintPageProps {
  prescription?: Prescription | null;
  onClose?: () => void;
}

export const PrescriptionPrintPage: React.FC<PrescriptionPrintPageProps> = ({
  prescription: propRx,
  onClose,
}) => {
  const { language } = useLanguage();
  const { doctorProfile: activeDoctor } = useDoctorProfile();
  const isBn = language === 'bn';

  // Resolve prescription: from prop, or from localStorage print buffer, or from saved list
  const [prescription, setPrescription] = React.useState<Prescription | null>(() => {
    if (propRx) return propRx;
    try {
      const buffered = localStorage.getItem('homiohelper_active_print_rx');
      if (buffered) {
        return JSON.parse(buffered) as Prescription;
      }
      const params = new URLSearchParams(window.location.search);
      const rxId = params.get('rxId');
      if (rxId) {
        const saved = getSavedPrescriptions();
        const found = saved.find((item) => item.id === rxId);
        if (found) return found;
      }
      const saved = getSavedPrescriptions();
      return saved[0] || null;
    } catch (e) {
      return null;
    }
  });

  // Resolve doctor profile
  const doctor: DoctorProfile = React.useMemo(() => {
    if (prescription?.doctorProfile && prescription.doctorProfile.name) {
      return prescription.doctorProfile;
    }
    try {
      const bufferedDoc = localStorage.getItem('homiohelper_active_print_doctor');
      if (bufferedDoc) {
        const parsed = JSON.parse(bufferedDoc) as DoctorProfile;
        if (parsed.name) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return activeDoctor;
  }, [prescription, activeDoctor]);

  // Auto trigger print if ?auto=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auto') === '1') {
      const timer = setTimeout(() => {
        window.focus();
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handlePrint = () => {
    window.focus();
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!prescription) return;
    setIsExportingPdf(true);
    try {
      await downloadPrescriptionPdf(prescription, doctor, language);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Remove ?print=true parameter from URL without full reload
      const url = new URL(window.location.href);
      url.searchParams.delete('print');
      url.searchParams.delete('auto');
      url.searchParams.delete('rxId');
      window.location.href = url.pathname + (url.hash || '#prescriptions');
    }
  };

  if (!prescription) {
    return (
      <div className="min-h-screen bg-[#F5F8F6] p-8 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-[#164E43] mb-3" />
        <h2 className="text-lg font-bold text-[#11231D]">
          {isBn ? 'প্রেসক্রিপশন পাওয়া যায়নি' : 'Prescription Document Not Found'}
        </h2>
        <p className="text-xs text-[#526B60] mt-1 mb-4">
          {isBn ? 'অনুগ্রহ করে প্রেসক্রিপশন তালিকা থেকে নির্বাচন করুন।' : 'Please select a prescription from the clinic list.'}
        </p>
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 bg-[#164E43] text-white text-xs font-semibold rounded-lg hover:bg-[#113B33]"
        >
          {isBn ? 'তালিকায় ফিরে যান' : 'Back to Prescriptions'}
        </button>
      </div>
    );
  }

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
    <div className="min-h-screen bg-[#4B5563] print:bg-white text-[#11231D] flex flex-col items-center">
      {/* Top Floating Control Bar (Hidden in Print) */}
      <div className="no-print w-full bg-[#164E43] text-white px-4 py-3 shadow-md flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-md hover:bg-[#113B33] text-white transition-colors"
            title={isBn ? 'ফিরে যান' : 'Back to App'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold tracking-tight">
              {isBn ? 'হোমিওহেল্পার প্রেসক্রিপশন প্রিন্ট প্রিভিউ' : 'HomioHelper Prescription Document'}
            </h1>
            <p className="text-[11px] text-[#A2C7BC]">
              {prescription.prescriptionNo} · {patientName} · {isBn ? 'কাগজ: A4 পোর্ট্রেট (১০০% স্কেল)' : 'Format: A4 Portrait (100% Scale)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-md border border-white/20 transition-all disabled:opacity-50"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isBn ? 'PDF ডাউনলোড' : 'Download PDF'}</span>
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1.5 text-xs text-white border border-[#3C7B6E] rounded-md hover:bg-[#113B33] transition-colors"
          >
            {isBn ? 'বাতিল / বন্ধ' : 'Close'}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-md shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>{isBn ? 'প্রিন্ট করুন (A4)' : 'Print Prescription (A4)'}</span>
          </button>
        </div>
      </div>

      {/* Screen Wrapper with A4 Centered Sheet & Padding */}
      <div className="w-full flex-1 p-4 sm:p-8 flex justify-center print:p-0 print:m-0 print:block">
        <div
          className="bg-white shadow-2xl rounded-xs print:shadow-none print:rounded-none w-full max-w-[210mm] min-h-[285mm] p-8 sm:p-10 flex flex-col justify-between print:w-full print:max-w-none print:min-h-0 print:p-0"
          style={{ boxSizing: 'border-box' }}
        >
          <div className="space-y-4">
            {/* 1. Doctor & Chamber Header */}
            <header className="pb-3 border-b-2 border-[#164E43] flex items-start justify-between gap-4">
              {/* Doctor Details (Left) */}
              <div className="flex-1 space-y-0.5">
                <h1 className="text-2xl font-black text-[#0F2D25] tracking-tight">
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

              {/* Clinic Emblem / Logo (Center) */}
              <div className="shrink-0 flex items-center justify-center px-2">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Clinic Logo"
                    className="max-h-14 max-w-[90px] object-contain"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full border border-[#164E43] bg-[#F1F6F3] text-[#164E43] flex items-center justify-center font-serif text-2xl font-bold shadow-2xs"
                    title="Homoeopathy Symbol"
                  >
                    ⚕
                  </div>
                )}
              </div>

              {/* Chamber Details (Right) */}
              <div className="flex-1 text-right space-y-0.5 text-xs text-[#40584F]">
                <p className="font-bold text-sm text-[#0F2D25]">
                  {chamberName}
                </p>
                {chamberAddr && (
                  <p className="text-[11px] leading-tight">
                    {chamberAddr}
                  </p>
                )}
                {phone && (
                  <p className="text-[11px] font-semibold text-[#164E43]">
                    {isBn ? 'মোবাইল' : 'Phone'}: {phone}
                  </p>
                )}
                {email && (
                  <p className="text-[10px] text-[#556F64]">
                    {email}
                  </p>
                )}
                {visitingHours && (
                  <p className="text-[10px] italic text-[#5B7268]">
                    {visitingHours}
                  </p>
                )}
              </div>
            </header>

            {/* 2. Patient Details Strip */}
            <div className="border border-[#C5D6CD] rounded-md bg-[#F8FAF9] p-2.5 text-xs grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-[#5E756C] block">
                  {isBn ? 'রোগীর নাম' : 'Patient Name'}
                </span>
                <span className="font-bold text-[#0E221C] text-sm">
                  {patientName}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5E756C] block">
                  {isBn ? 'রেজি নং' : 'Reg No'}
                </span>
                <span className="font-semibold text-[#0E221C]">
                  {patientRegNo || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5E756C] block">
                  {isBn ? 'বয়স ও লিঙ্গ' : 'Age & Gender'}
                </span>
                <span className="font-semibold text-[#0E221C]">
                  {patientAgeGender}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5E756C] block">
                  {isBn ? 'তারিখ' : 'Date'}
                </span>
                <span className="font-semibold text-[#0E221C]">
                  {rxDate}
                </span>
              </div>
            </div>

            {/* 3. Clinical Information & History (Rendered ONLY if entered) */}
            {(hasVitals || hasClinicalDetails) && (
              <div className="p-3 bg-[#FCFDFC] border border-[#D7E5DE] rounded-md text-xs space-y-1.5">
                {hasVitals && (
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#476257] pb-1.5 border-b border-[#E5EEE9]">
                    {prescription.bp && prescription.bp.trim() && (
                      <span>
                        <strong className="text-[#122922]">{isBn ? 'রক্তচাপ (BP):' : 'BP:'}</strong> {prescription.bp.trim()}
                      </span>
                    )}
                    {prescription.pulse && prescription.pulse.trim() && (
                      <span>
                        <strong className="text-[#122922]">{isBn ? 'পালস (Pulse):' : 'Pulse:'}</strong> {prescription.pulse.trim()}
                      </span>
                    )}
                    {prescription.weight && prescription.weight.trim() && (
                      <span>
                        <strong className="text-[#122922]">{isBn ? 'ওজন (Weight):' : 'Weight:'}</strong> {prescription.weight.trim()}
                      </span>
                    )}
                    {prescription.temperature && prescription.temperature.trim() && (
                      <span>
                        <strong className="text-[#122922]">{isBn ? 'তাপমাত্রা (Temp):' : 'Temp:'}</strong> {prescription.temperature.trim()}
                      </span>
                    )}
                  </div>
                )}

                {prescription.chiefComplaint && prescription.chiefComplaint.trim() && (
                  <p className="text-xs text-[#274037]">
                    <strong className="text-[#164E43] font-bold">{isBn ? 'প্রধান উপসর্গ (Chief Complaints):' : 'Chief Complaints:'}</strong>{' '}
                    {prescription.chiefComplaint.trim()}
                  </p>
                )}

                {prescription.patientHistory && prescription.patientHistory.trim() && (
                  <p className="text-xs text-[#274037]">
                    <strong className="text-[#164E43] font-bold">{isBn ? 'অতীত ইতিহাস (Patient History):' : 'Patient History:'}</strong>{' '}
                    {prescription.patientHistory.trim()}
                  </p>
                )}

                {prescription.diagnosis && prescription.diagnosis.trim() && (
                  <p className="text-xs text-[#274037]">
                    <strong className="text-[#164E43] font-bold">{isBn ? 'রোগ নির্ণয় (Diagnosis):' : 'Clinical Diagnosis:'}</strong>{' '}
                    {prescription.diagnosis.trim()}
                  </p>
                )}

                {prescription.clinicalNotes && prescription.clinicalNotes.trim() && (
                  <p className="text-xs text-[#274037]">
                    <strong className="text-[#164E43] font-bold">{isBn ? 'ক্লিনিক্যাল নোট (Findings):' : 'Clinical Findings:'}</strong>{' '}
                    {prescription.clinicalNotes.trim()}
                  </p>
                )}

                {prescription.procedures && prescription.procedures.trim() && (
                  <p className="text-xs text-[#274037]">
                    <strong className="text-[#164E43] font-bold">{isBn ? 'পদ্ধতি ও মডালিটিজ:' : 'Procedures & Modalities:'}</strong>{' '}
                    {prescription.procedures.trim()}
                  </p>
                )}
              </div>
            )}

            {/* 4. Prescribed Remedies Table */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif font-black text-[#164E43] italic leading-none select-none">
                  ℞
                </span>
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#122821]">
                  {isBn ? 'ব্যবস্থাপত্র / প্রেসক্রাইবড হোমিওপ্যাথিক ঔষধ' : 'Prescribed Homoeopathic Remedies'}
                </span>
              </div>

              <table className="w-full text-left text-xs border border-[#B8CCC2] rounded-md overflow-hidden">
                <thead className="bg-[#EFF5F2] text-[#17352B] font-bold border-b border-[#B8CCC2]">
                  <tr>
                    <th className="py-2 px-3 w-8 text-center">#</th>
                    <th className="py-2 px-3">{isBn ? 'ঔষধের নাম ও শক্তি' : 'Medicine & Potency'}</th>
                    <th className="py-2 px-3 w-28">{isBn ? 'মাত্রা' : 'Dosage'}</th>
                    <th className="py-2 px-3 w-36">{isBn ? 'সেবনবিধি' : 'Frequency'}</th>
                    <th className="py-2 px-3 w-24">{isBn ? 'সময়কাল' : 'Duration'}</th>
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
                        <tr key={remedy.id || idx}>
                          <td className="py-2.5 px-3 text-center text-[#5B756C] font-semibold align-top">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 align-top">
                            <span className="font-bold text-[#0F2A21] text-[13px] block">
                              {remedy.medicineName || '—'}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {remedy.potency && (
                                <span className="font-semibold text-[#164E43] bg-[#E8F2ED] px-1.5 py-0.5 rounded text-[10px]">
                                  {remedy.potency}
                                </span>
                              )}
                              {remedy.form && (
                                <span className="text-[10px] text-[#647B72]">
                                  ({remedy.form})
                                </span>
                              )}
                            </div>

                            {/* Optional Specific Medicine Instructions (Rendered ONLY if entered) */}
                            {hasInstructions && (
                              <div className="mt-1.5 p-1.5 bg-[#F4F8F6] border-l-2 border-[#164E43] rounded-xs text-[11px] text-[#2F4B40] space-y-0.5">
                                {remedy.whenToTake && remedy.whenToTake.trim() && (
                                  <div>
                                    <strong className="text-[#164E43] font-semibold">{isBn ? 'কখন সেব্য:' : 'When:'}</strong>{' '}
                                    {remedy.whenToTake.trim()}
                                  </div>
                                )}
                                {remedy.howToTake && remedy.howToTake.trim() && (
                                  <div>
                                    <strong className="text-[#164E43] font-semibold">{isBn ? 'কীভাবে সেব্য:' : 'How:'}</strong>{' '}
                                    {remedy.howToTake.trim()}
                                  </div>
                                )}
                                {remedy.beforeAfterFood && remedy.beforeAfterFood.trim() && (
                                  <div>
                                    <strong className="text-[#164E43] font-semibold">{isBn ? 'খাবারের সময়:' : 'Food timing:'}</strong>{' '}
                                    {remedy.beforeAfterFood.trim()}
                                  </div>
                                )}
                                {remedy.additionalInstructions && remedy.additionalInstructions.trim() && (
                                  <div>
                                    <strong className="text-[#164E43] font-semibold">{isBn ? 'নির্দেশনা:' : 'Directions:'}</strong>{' '}
                                    {remedy.additionalInstructions.trim()}
                                  </div>
                                )}
                                {!remedy.additionalInstructions && remedy.instructions && remedy.instructions.trim() && (
                                  <div>
                                    <strong className="text-[#164E43] font-semibold">{isBn ? 'পরামর্শ:' : 'Note:'}</strong>{' '}
                                    {remedy.instructions.trim()}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[#1E372F] align-top">
                            {remedy.dosage || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-[#233D35] align-top">
                            {remedy.frequency || '—'}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[#1E372F] align-top">
                            {remedy.duration || '—'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[#7B8F86] italic">
                        {isBn ? 'কোনো ওষুধ যুক্ত করা হয়নি' : 'No remedies entered.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 5. Optional Investigations (Rendered ONLY if entered) */}
            {investigations && (
              <div className="p-2.5 bg-[#FAFDFB] border border-[#CFDFD6] rounded-md text-xs">
                <strong className="text-[#164E43] font-bold">
                  {isBn ? 'প্রয়োজনীয় পরীক্ষা-নিরীক্ষা (Investigations / Tests):' : 'Investigations & Tests:'}
                </strong>{' '}
                <span>{investigations}</span>
              </div>
            )}

            {/* 6. Optional Food Restrictions & Advice (Rendered ONLY if entered) */}
            {hasAdviceSection && (
              <div className="p-3 bg-[#F9FCFA] border border-[#C9DBD1] rounded-md text-xs space-y-1.5">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#164E43] pb-1 border-b border-dashed border-[#D2E2D9]">
                  {isBn ? 'উপদেশ ও পথ্য নির্দেশিকা (Advice & Health Regimen)' : 'Advice & Health Regimen'}
                </h4>
                {foodsToAvoid && (
                  <p className="text-xs text-[#254035] leading-relaxed">
                    <strong className="text-[#A31B1B] font-bold">{isBn ? 'বর্জনীয় খাদ্য ও পথ্য:' : 'Foods to Avoid:'}</strong>{' '}
                    {foodsToAvoid}
                  </p>
                )}
                {foodsPermitted && (
                  <p className="text-xs text-[#254035] leading-relaxed">
                    <strong className="text-[#1A6B3A] font-bold">{isBn ? 'অনুমোদিত ও উপকারী খাদ্য:' : 'Foods Permitted:'}</strong>{' '}
                    {foodsPermitted}
                  </p>
                )}
                {generalPrecautions && (
                  <p className="text-xs text-[#254035] leading-relaxed">
                    <strong className="text-[#0E5E52] font-bold">{isBn ? 'সাধারণ সতর্কতা ও যত্ন:' : 'General Precautions:'}</strong>{' '}
                    {generalPrecautions}
                  </p>
                )}
                {additionalAdvice && (
                  <p className="text-xs text-[#254035] leading-relaxed">
                    <strong className="text-[#1C3B30] font-bold">{isBn ? 'অতিরিক্ত পরামর্শ:' : 'Additional Advice:'}</strong>{' '}
                    {additionalAdvice}
                  </p>
                )}
              </div>
            )}

            {/* 7. Optional Warning (Rendered ONLY if entered) */}
            {warning && (
              <div className="p-2.5 bg-[#FFF5F5] border border-[#F5C6CB] rounded-md text-xs text-[#721C24]">
                <strong className="font-bold uppercase tracking-wider text-[11px]">
                  {isBn ? 'সতর্কতা ও নিষেধাজ্ঞা:' : 'Warning & Precaution:'}
                </strong>{' '}
                <span>{warning}</span>
              </div>
            )}

            {/* 8. Follow-up date (Rendered ONLY if entered) */}
            {followUpDate && (
              <div className="inline-block px-3 py-1 bg-[#EBF4F0] border border-[#CDE0D6] rounded-md text-xs font-bold text-[#164E43]">
                {isBn ? 'পরবর্তী সাক্ষাতের সম্ভাব্য তারিখ:' : 'Follow-up Date:'} {followUpDate}
              </div>
            )}
          </div>

          {/* 9. Doctor Signature Area & Footer */}
          <footer className="pt-6 mt-8 border-t border-[#CBDAD1] space-y-4">
            <div className="flex items-end justify-between">
              <div className="text-[11px] text-[#557165] space-y-0.5 max-w-sm">
                {phone && (
                  <p className="font-semibold text-[#112821]">
                    {isBn ? 'জরুরি যোগাযোগ:' : 'Emergency Contact:'} {phone}
                  </p>
                )}
                {chamberAddr && (
                  <p className="text-[10px] text-[#637C72]">
                    {chamberAddr}
                  </p>
                )}
                <p className="text-[9px] text-[#7B8F87] pt-1">
                  {isBn ? 'ঔষধ শিশুদের নাগালের বাইরে রাখুন। নির্দেশিত মাত্রা ছাড়া সেবন করবেন না।' : 'Keep medicines out of reach of children. Consult doctor before changing dosage.'}
                </p>
              </div>

              <div className="text-center w-48 shrink-0">
                <div className="border-b-1.5 border-[#203B31] h-10 mb-1 flex items-end justify-center pb-1">
                  <span className="font-serif italic text-xs text-[#536C61]">
                    {doctorName}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#112821]">
                  {isBn ? 'চিকিৎসকের স্বাক্ষর' : 'Doctor Signature'}
                </p>
                <p className="text-[10px] text-[#556D63]">
                  {doctorQual || doctorName}
                </p>
              </div>
            </div>

            <div className="text-center text-[10px] text-[#7A9188] border-t border-[#EBF1EE] pt-2">
              HomioHelper Clinic Management System · Bangladesh Homoeopathic Practice Standard
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
