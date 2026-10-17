import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Building2,
  Globe,
  ShieldCheck,
  LogIn,
  LogOut,
  Info,
  Stethoscope,
  Phone,
  Mail,
  Clock,
  FileText,
  Database,
  Cloud,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useDoctorProfile } from '../context/DoctorProfileContext';
import { INITIAL_PREVIEW_PROFILE } from '../services/doctorProfileStorage';
import { firestoreSyncService, SyncMetrics } from '../services/firestoreSyncService';
import { PageHeading } from '../components/ui/PageHeading';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { NotificationBanner } from '../components/ui/NotificationBanner';

export interface SettingsPageProps {
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenAuthModal }) => {
  const { t, language, setLanguage } = useLanguage();
  const { currentUser, isConfigured, missingKeys, logout } = useAuth();
  const { doctorProfile, updateDoctorProfile } = useDoctorProfile();

  const [name, setName] = useState(doctorProfile.name || '');
  const [qualification, setQualification] = useState(doctorProfile.qualification || '');
  const [chamberName, setChamberName] = useState(doctorProfile.chamberName || '');
  const [chamberAddress, setChamberAddress] = useState(doctorProfile.chamberAddress || '');
  const [regNumber, setRegNumber] = useState(doctorProfile.regNumber || '');
  const [phone, setPhone] = useState(doctorProfile.phone || '');
  const [email, setEmail] = useState(doctorProfile.email || '');
  const [additionalInfo, setAdditionalInfo] = useState(doctorProfile.additionalInfo || '');

  const [showSavedAlert, setShowSavedAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const [syncMetrics, setSyncMetrics] = useState<SyncMetrics>(() => firestoreSyncService.getMetrics());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const unsubscribe = firestoreSyncService.subscribe((metrics) => {
      setSyncMetrics(metrics);
    });
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncNotice(null);
    const result = await firestoreSyncService.migrateAndSyncAll(currentUser?.uid);
    setIsSyncing(false);
    if (result.success) {
      setSyncNotice({
        type: 'success',
        message:
          language === 'bn'
            ? `ক্লাউড ফায়ারস্টোর সফলভাবে সিঙ্ক হয়েছে (${result.syncedPatients} জন রোগী, ${result.syncedPrescriptions} টি প্রেসক্রিপশন সংরক্ষিত)।`
            : `Cloud Firestore synced successfully (${result.syncedPatients} patients, ${result.syncedPrescriptions} prescriptions).`,
      });
    } else {
      setSyncNotice({
        type: 'info',
        message:
          result.error ||
          (language === 'bn'
            ? 'ক্লাউড সংযোগের জন্য ফায়ারস্টোর ক্রেডেনশিয়াল প্রয়োজন। সব রেকর্ড নিরাপদে লোকাল স্টোরেজে রক্ষিত রয়েছে।'
            : 'Cloud sync requires Firestore credentials. All clinical records remain 100% safe in local storage.'),
      });
    }
    setTimeout(() => setSyncNotice(null), 6000);
  };

  useEffect(() => {
    setName(doctorProfile.name || '');
    setQualification(doctorProfile.qualification || '');
    setChamberName(doctorProfile.chamberName || '');
    setChamberAddress(doctorProfile.chamberAddress || '');
    setRegNumber(doctorProfile.regNumber || '');
    setPhone(doctorProfile.phone || '');
    setEmail(doctorProfile.email || '');
    setAdditionalInfo(doctorProfile.additionalInfo || '');
  }, [doctorProfile]);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !qualification.trim() || !chamberName.trim() || !chamberAddress.trim()) {
      setErrorMessage(t('docProfileValidationRequired'));
      return;
    }

    const success = await updateDoctorProfile({
      name: name.trim(),
      qualification: qualification.trim(),
      chamberName: chamberName.trim(),
      chamberAddress: chamberAddress.trim(),
      regNumber: regNumber.trim(),
      phone: phone.trim(),
      email: email.trim(),
      additionalInfo: additionalInfo.trim(),
    });

    if (success) {
      setShowSavedAlert(true);
      setTimeout(() => setShowSavedAlert(false), 4000);
    } else {
      setErrorMessage(t('somethingWentWrong'));
    }
  };

  const handleReset = async () => {
    await updateDoctorProfile(INITIAL_PREVIEW_PROFILE);
    setName(INITIAL_PREVIEW_PROFILE.name);
    setQualification(INITIAL_PREVIEW_PROFILE.qualification);
    setChamberName(INITIAL_PREVIEW_PROFILE.chamberName);
    setChamberAddress(INITIAL_PREVIEW_PROFILE.chamberAddress);
    setRegNumber(INITIAL_PREVIEW_PROFILE.regNumber || '');
    setPhone(INITIAL_PREVIEW_PROFILE.phone || '');
    setEmail(INITIAL_PREVIEW_PROFILE.email || '');
    setAdditionalInfo(INITIAL_PREVIEW_PROFILE.additionalInfo || '');
    setShowConfirmReset(false);
    setShowSavedAlert(true);
    setTimeout(() => setShowSavedAlert(false), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title={t('settingsTitle')}
        subtitle={t('settingsSubtitle')}
      />

      {showSavedAlert && (
        <NotificationBanner
          type="success"
          message={t('docProfileSavedSuccess')}
          onDismiss={() => setShowSavedAlert(false)}
        />
      )}

      {errorMessage && (
        <NotificationBanner
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Practice Profile */}
        <div className="bg-white border border-[#D5E1DB] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3ECE7]">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-[#164E43]" />
              <div>
                <h3 className="text-sm font-bold text-[#142620]">
                  {t('docProfileTitle')}
                </h3>
                <p className="text-xs text-[#5E716B]">
                  {t('docProfileSubtitle')}
                </p>
              </div>
            </div>
            <span className="text-[11px] text-[#164E43] font-semibold bg-[#EBF3EF] px-2.5 py-1 rounded-md">
              {language === 'bn' ? 'প্রেসক্রিপশন হেডার' : 'Prescription Header'}
            </span>
          </div>

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

          <p className="text-[11px] text-[#637971] italic pt-1">
            * {language === 'bn' ? 'চিহ্নিত তথ্যগুলো প্রেসক্রিপশনের হেডারে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।' : 'marked fields automatically populate the professional prescription pad header.'}
          </p>
        </div>

        {/* Doctor Account & Firebase Authentication */}
        <div className="bg-white border border-[#D5E1DB] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3ECE7]">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#164E43]" />
              <div>
                <h3 className="text-sm font-bold text-[#142620]">
                  {t('settingsAuthTitle')}
                </h3>
                <p className="text-xs text-[#637770]">
                  {t('settingsAuthSubtitle')}
                </p>
              </div>
            </div>
            {/* Firebase Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isConfigured
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConfigured ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
              />
              {isConfigured
                ? t('settingsFirebaseConnected')
                : t('settingsFirebasePending')}
            </span>
          </div>

          {/* Account Details or Sign In State */}
          {currentUser ? (
            <div className="bg-[#F6FAF8] border border-[#D7E6DF] rounded-lg p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#576B63]">
                      {t('authLoggedInAs')}
                    </span>
                    <span className="text-xs font-bold text-[#152B24]">
                      {doctorProfile.name || currentUser.displayName || currentUser.phoneNumber || currentUser.email?.split('@')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-[#576B63] font-medium">{currentUser.email || currentUser.phoneNumber}</p>
                  <p className="text-[11px] font-mono text-[#7D918A]">
                    {t('settingsUid')}: {currentUser.uid}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  leftIcon={<LogOut className="w-3.5 h-3.5 text-red-700" />}
                  className="text-red-700 hover:bg-red-50 hover:border-red-200 text-xs shrink-0"
                >
                  {t('authBtnSignOut')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-[#F8FAF9] border border-[#DFE8E3] rounded-lg p-4 space-y-3">
              <p className="text-xs text-[#52665F]">
                {t('settingsNotSignedIn')}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                  leftIcon={<LogIn className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  {t('authBtnSignIn')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                  className="text-xs"
                >
                  {t('authBtnRegister')}
                </Button>
              </div>
            </div>
          )}

          {/* Database & Cloud Firestore Synchronization Card */}
          <div className="bg-[#F8FAF9] border border-[#D5E1DB] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#164E43]" />
                <span className="text-xs font-bold text-[#142620]">
                  {language === 'bn' ? 'ডাটাবেজ ও ক্লাউড ফায়ারস্টোর স্ট্যাটাস' : 'Database & Cloud Firestore Status'}
                </span>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                  syncMetrics.isCloudConnected
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    syncMetrics.isCloudConnected ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}
                />
                {syncMetrics.isCloudConnected
                  ? language === 'bn'
                    ? 'ক্লাউড সংযুক্ত'
                    : 'Cloud Connected'
                  : language === 'bn'
                  ? 'লোকাল স্টোরেজ (অফলাইন মোড)'
                  : 'Local Storage (Offline-first)'}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 py-1 text-center">
              <div className="bg-white border border-[#DFE8E3] rounded-md p-2">
                <span className="text-[10px] text-[#5C7069] block">
                  {language === 'bn' ? 'সংরক্ষিত রোগী' : 'Saved Patients'}
                </span>
                <span className="text-sm font-bold text-[#164E43]">{syncMetrics.patientCount}</span>
              </div>
              <div className="bg-white border border-[#DFE8E3] rounded-md p-2">
                <span className="text-[10px] text-[#5C7069] block">
                  {language === 'bn' ? 'প্রেসক্রিপশন' : 'Prescriptions'}
                </span>
                <span className="text-sm font-bold text-[#164E43]">{syncMetrics.prescriptionCount}</span>
              </div>
              <div className="bg-white border border-[#DFE8E3] rounded-md p-2">
                <span className="text-[10px] text-[#5C7069] block">
                  {language === 'bn' ? 'ঔষধ ক্যাটালগ' : 'Medicines'}
                </span>
                <span className="text-sm font-bold text-[#164E43]">{syncMetrics.medicineCount}</span>
              </div>
            </div>

            {/* Sync Feedback Message */}
            {syncNotice && (
              <div
                className={`text-xs p-2.5 rounded-md border ${
                  syncNotice.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-[#F2F6F4] border-[#D1E0D9] text-[#2C483F]'
                }`}
              >
                {syncNotice.message}
              </div>
            )}

            {/* Manual Sync / Migration Action */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#DFE8E3]">
              <div className="text-[11px] text-[#5C7069]">
                {syncMetrics.lastSyncTime
                  ? `${language === 'bn' ? 'সর্বশেষ সিঙ্ক:' : 'Last Sync:'} ${new Date(
                      syncMetrics.lastSyncTime
                    ).toLocaleTimeString()}`
                  : language === 'bn'
                  ? 'লোকাল ডাটা শতভাগ সুরক্ষিত ও অক্ষত রয়েছে।'
                  : 'Local records are safe & never overwritten.'}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleManualSync}
                disabled={isSyncing}
                leftIcon={
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                }
                className="text-xs shrink-0"
              >
                {isSyncing
                  ? language === 'bn'
                    ? 'সিঙ্ক হচ্ছে...'
                    : 'Syncing...'
                  : language === 'bn'
                  ? 'ক্লাউডে সিঙ্ক করুন'
                  : 'Sync with Cloud'}
              </Button>
            </div>

            {!isConfigured && missingKeys.length > 0 && (
              <div className="text-[11px] text-[#5C7069] bg-white p-2.5 rounded border border-[#DFE8E3] space-y-1">
                <div className="font-semibold text-[#182C25]">
                  {language === 'bn' ? 'ক্লাউড ফায়ারস্টোর কানেকশন গাইড:' : 'Cloud Firestore Setup:'}
                </div>
                <p className="text-[10px] text-[#697D76]">
                  {language === 'bn'
                    ? 'ক্লাউড সিঙ্ক্রোনাইজেশনের জন্য নিচের এনভায়রনমেন্ট ভেরিয়েবলগুলো প্রযোজ্য:'
                    : 'To enable live Firestore synchronization, configure the following Vite client environment variables:'}
                </p>
                <code className="text-[10px] block font-mono text-[#164E43] bg-[#F2F6F4] p-1.5 rounded">
                  {missingKeys.join(', ')}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* System Language Preference */}
        <div className="bg-white border border-[#D5E1DB] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E3ECE7]">
            <Globe className="w-5 h-5 text-[#164E43]" />
            <h3 className="text-sm font-bold text-[#142620]">
              {t('settingsLanguage')}
            </h3>
          </div>

          <div className="max-w-xs">
            <Select
              label={t('settingsLanguage')}
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'bn')}
            >
              <option value="bn">{t('settingsLanguageOptionBn')}</option>
              <option value="en">{t('settingsLanguageOptionEn')}</option>
            </Select>
            <p className="text-xs text-[#637770] mt-1.5">
              {t('settingsLanguageDesc')}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={() => setShowConfirmReset(true)}
          >
            {t('settingsResetBtn')}
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
          >
            {t('actionSave')}
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog component verification */}
      <ConfirmationDialog
        isOpen={showConfirmReset}
        title={t('settingsResetDialogTitle')}
        message={t('settingsResetDialogMsg')}
        confirmLabel={t('settingsResetBtn')}
        cancelLabel={t('actionCancel')}
        variant="danger"
        onConfirm={handleReset}
        onClose={() => setShowConfirmReset(false)}
      />
    </div>
  );
};
