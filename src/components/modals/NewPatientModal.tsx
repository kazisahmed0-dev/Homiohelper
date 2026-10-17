import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { Patient } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

export interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: Patient) => void;
  nextRegNo: string;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onAddPatient,
  nextRegNo,
}) => {
  const { t, language } = useLanguage();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [bloodGroup, setBloodGroup] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [address, setAddress] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('patientsValidationNameRequired'));
      return;
    }
    if (!mobile.trim()) {
      setError(t('patientsValidationMobileRequired'));
      return;
    }
    if (!age || Number(age) <= 0) {
      setError(t('patientsValidationAgeInvalid'));
      return;
    }

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      regNo: nextRegNo,
      name: name.trim(),
      mobile: mobile.trim(),
      age: Number(age),
      gender,
      bloodGroup: bloodGroup || undefined,
      district: district || undefined,
      address: address.trim() || undefined,
      chiefComplaint: chiefComplaint.trim() || undefined,
      registeredAt: new Date().toISOString(),
      lastVisitAt: new Date().toISOString(),
      totalVisits: 1,
    };

    onAddPatient(newPatient);

    // Reset form
    setName('');
    setMobile('');
    setAge('');
    setGender('male');
    setBloodGroup('');
    setDistrict('Dhaka');
    setAddress('');
    setChiefComplaint('');
    setError(null);
    onClose();
  };

  const bdDistricts = [
    { en: 'Dhaka', bn: 'ঢাকা' },
    { en: 'Chittagong', bn: 'চট্টগ্রাম' },
    { en: 'Rajshahi', bn: 'রাজশাহী' },
    { en: 'Khulna', bn: 'খুলনা' },
    { en: 'Sylhet', bn: 'সিলেট' },
    { en: 'Barisal', bn: 'বরিশাল' },
    { en: 'Rangpur', bn: 'রংপুর' },
    { en: 'Mymensingh', bn: 'ময়মনসিংহ' },
    { en: 'Comilla', bn: 'কুমিল্লা' },
    { en: 'Gazipur', bn: 'গাজীপুর' },
    { en: 'Narayanganj', bn: 'নারায়ণগঞ্জ' },
    { en: 'Bogra', bn: 'বগুড়া' },
    { en: 'Jessore', bn: 'যশোর' },
    { en: 'Tangail', bn: 'টাঙ্গাইল' },
    { en: 'Dinajpur', bn: 'দিনাজপুর' },
    { en: 'Kushtia', bn: 'কুষ্টিয়া' },
    { en: 'Faridpur', bn: 'ফরিদপুর' },
    { en: 'Pabna', bn: 'পাবনা' },
    { en: 'Noakhali', bn: 'নোয়াখালী' },
    { en: 'Brahmanbaria', bn: 'ব্রাহ্মণবাড়িয়া' },
    { en: 'Jamalpur', bn: 'জামালপুর' },
    { en: 'Cox\'s Bazar', bn: 'কক্সবাজার' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A1612]/45 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-patient-title"
        className="relative w-full max-w-xl bg-white rounded-xl border border-[#CBD6D0] p-5 sm:p-6 shadow-2xl z-10 my-8"
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E3ECE7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EBF3EF] text-[#164E43] flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="modal-patient-title" className="text-base sm:text-lg font-bold text-[#142620]">
                  {t('patientsModalTitle')}
                </h2>
                <span className="text-xs font-mono font-semibold text-[#164E43] bg-[#E8F1EC] px-2 py-0.5 rounded">
                  {nextRegNo}
                </span>
              </div>
              <p className="text-xs text-[#5D7068] mt-0.5">{t('patientsModalSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6D8078] hover:text-[#182622] p-1.5 rounded-lg hover:bg-[#F0F5F2] transition-colors"
            aria-label={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label={t('patientsFieldName')}
              placeholder={t('patientsFieldNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label={t('patientsFieldMobile')}
              placeholder={t('patientsFieldMobilePlaceholder')}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            <Input
              type="number"
              label={t('patientsFieldAge')}
              placeholder="34"
              min="0"
              max="125"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
            <Select
              label={t('patientsFieldGender')}
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
            >
              <option value="male">{t('patientsGenderMale')}</option>
              <option value="female">{t('patientsGenderFemale')}</option>
              <option value="other">{t('patientsGenderOther')}</option>
            </Select>
            <Select
              label={t('patientsFieldBloodGroup')}
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              <option value="">{t('patientsBloodUnknown')}</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Select
              label={t('patientsFieldDistrict')}
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              {bdDistricts.map((d) => (
                <option key={d.en} value={d.en}>
                  {language === 'bn' ? d.bn : d.en}
                </option>
              ))}
            </Select>
            <Input
              label={t('patientsFieldAddress')}
              placeholder={t('patientsFieldAddressPlaceholder')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <Textarea
            label={t('patientsFieldComplaint')}
            placeholder={t('patientsFieldComplaintPlaceholder')}
            rows={3}
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3ECE7]">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              {t('actionCancel')}
            </Button>
            <Button type="submit" variant="primary" size="md">
              {t('patientsRegisterNew')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
