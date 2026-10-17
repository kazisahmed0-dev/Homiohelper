import React, { useState, useEffect } from 'react';
import { X, Building2, Stethoscope, FileText, Phone, Mail, Clock, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useDoctorProfile } from '../../context/DoctorProfileContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface DoctorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const { doctorProfile, updateDoctorProfile } = useDoctorProfile();

  const [name, setName] = useState(doctorProfile.name || '');
  const [qualification, setQualification] = useState(doctorProfile.qualification || '');
  const [chamberName, setChamberName] = useState(doctorProfile.chamberName || '');
  const [chamberAddress, setChamberAddress] = useState(doctorProfile.chamberAddress || '');
  const [regNumber, setRegNumber] = useState(doctorProfile.regNumber || '');
  const [phone, setPhone] = useState(doctorProfile.phone || '');
  const [email, setEmail] = useState(doctorProfile.email || '');
  const [additionalInfo, setAdditionalInfo] = useState(doctorProfile.additionalInfo || '');
  const [logoUrl, setLogoUrl] = useState(doctorProfile.logoUrl || '');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state whenever modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      setName(doctorProfile.name || '');
      setQualification(doctorProfile.qualification || '');
      setChamberName(doctorProfile.chamberName || '');
      setChamberAddress(doctorProfile.chamberAddress || '');
      setRegNumber(doctorProfile.regNumber || '');
      setPhone(doctorProfile.phone || '');
      setEmail(doctorProfile.email || '');
      setAdditionalInfo(doctorProfile.additionalInfo || '');
      setLogoUrl(doctorProfile.logoUrl || '');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, doctorProfile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate required fields
    if (!name.trim()) {
      setErrorMsg(t('docFieldName') + ' - ' + (language === 'bn' ? 'পূরণ করা আবশ্যক' : 'is required.'));
      return;
    }
    if (!qualification.trim()) {
      setErrorMsg(t('docFieldQualification') + ' - ' + (language === 'bn' ? 'পূরণ করা আবশ্যক' : 'is required.'));
      return;
    }
    if (!chamberName.trim()) {
      setErrorMsg(t('docFieldChamberName') + ' - ' + (language === 'bn' ? 'পূরণ করা আবশ্যক' : 'is required.'));
      return;
    }
    if (!chamberAddress.trim()) {
      setErrorMsg(t('docFieldChamberAddress') + ' - ' + (language === 'bn' ? 'পূরণ করা আবশ্যক' : 'is required.'));
      return;
    }

    setLoading(true);
    try {
      const ok = await updateDoctorProfile({
        name: name.trim(),
        qualification: qualification.trim(),
        chamberName: chamberName.trim(),
        chamberAddress: chamberAddress.trim(),
        regNumber: regNumber.trim(),
        phone: phone.trim(),
        email: email.trim(),
        additionalInfo: additionalInfo.trim(),
        logoUrl: logoUrl.trim(),
      });

      if (ok) {
        setSuccessMsg(t('docProfileSavedSuccess'));
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMsg(t('somethingWentWrong'));
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A1612]/50 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-doctor-profile-title"
        className="relative w-full max-w-2xl bg-white rounded-xl border border-[#CBD6D0] p-5 sm:p-6 shadow-2xl z-10 my-8 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#E3ECE7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#164E43] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-doctor-profile-title" className="text-base sm:text-lg font-bold text-[#142620]">
                {t('docProfileTitle')}
              </h2>
              <p className="text-xs text-[#5D7068] mt-0.5">
                {t('docProfileSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6D8078] hover:text-[#182622] p-1.5 rounded-lg hover:bg-[#F0F5F2] transition-colors"
            aria-label={t('actionClose')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="flex items-start gap-2 p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2 p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('docFieldName') + ' *'}
              placeholder={t('docFieldNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<Stethoscope className="w-4 h-4" />}
              required
            />

            <Input
              label={t('docFieldQualification') + ' *'}
              placeholder={t('docFieldQualificationPlaceholder')}
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('docFieldChamberName') + ' *'}
              placeholder={t('docFieldChamberNamePlaceholder')}
              value={chamberName}
              onChange={(e) => setChamberName(e.target.value)}
              leftIcon={<Building2 className="w-4 h-4" />}
              required
            />

            <Input
              label={t('docFieldRegNumber')}
              placeholder={t('docFieldRegNumberPlaceholder')}
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              leftIcon={<FileText className="w-4 h-4" />}
            />
          </div>

          <Input
            label={t('docFieldChamberAddress') + ' *'}
            placeholder={t('docFieldChamberAddressPlaceholder')}
            value={chamberAddress}
            onChange={(e) => setChamberAddress(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="tel"
              label={t('docFieldPhone')}
              placeholder={t('docFieldPhonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Input
              type="email"
              label={t('docFieldEmail')}
              placeholder={t('docFieldEmailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />
          </div>

          <Input
            label={t('docFieldAdditionalInfo')}
            placeholder={t('docFieldAdditionalInfoPlaceholder')}
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            leftIcon={<Clock className="w-4 h-4" />}
          />

          <Input
            label={t('docFieldLogoUrl')}
            placeholder={t('docFieldLogoUrlPlaceholder')}
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            leftIcon={<Building2 className="w-4 h-4" />}
          />

          <p className="text-[11px] text-[#637971] italic pt-1">
            * {language === 'bn' ? 'চিহ্নিত তথ্যসমূহ প্রেসক্রিপশন ও প্রাতিষ্ঠানিক নথির জন্য আবশ্যকীয়।' : 'marked fields are required for official prescription pad headers.'}
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3ECE7]">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              {t('actionCancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save className="w-4 h-4" />}
              isLoading={loading}
            >
              {t('actionSave')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
