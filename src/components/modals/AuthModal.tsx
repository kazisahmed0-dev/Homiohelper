import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  Stethoscope,
  CheckCircle2,
  Building2,
  FileText,
  Phone,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDoctorProfile } from '../../context/DoctorProfileContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'forgot-password';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { t, language } = useLanguage();
  const { login, registerDoctor, resetPassword, isConfigured, missingKeys } = useAuth();
  const { updateDoctorProfile } = useDoctorProfile();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(defaultMode);

  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Doctor professional profile fields for registration
  const [doctorName, setDoctorName] = useState('');
  const [qualification, setQualification] = useState('');
  const [chamberName, setChamberName] = useState('');
  const [chamberAddress, setChamberAddress] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset state on modal open/close or mode switch
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(null);
      setErrorCode(null);
      setSuccessMsg(null);
      setLoading(false);
    } else {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const mapAuthError = (code?: string, defaultMsg?: string): string => {
    if (!code) return defaultMsg || t('authErrorGeneral');

    if (code === 'CONFIG_MISSING' || code.includes('config-missing')) {
      return t('authConfigMissingDetails');
    }
    if (code.includes('operation-not-allowed')) {
      return t('authErrorEmailNotEnabled');
    }
    if (
      code.includes('invalid-credential') ||
      code.includes('wrong-password') ||
      code.includes('user-not-found')
    ) {
      return t('authErrorInvalidCreds');
    }
    if (code.includes('email-already-in-use')) {
      return t('authErrorEmailInUse');
    }
    if (code.includes('weak-password')) {
      return t('authErrorWeakPassword');
    }
    if (code.includes('invalid-email')) {
      return language === 'bn'
        ? 'দয়া করে একটি সঠিক ইমেইল ঠিকানা প্রদান করুন (যেমন: doctor@gmail.com)।'
        : 'Please enter a valid email address (e.g. doctor@gmail.com).';
    }
    if (code.includes('too-many-requests')) {
      return t('authErrorTooManyRequests');
    }
    if (code.includes('network-request-failed')) {
      return language === 'bn'
        ? 'ইন্টারনেট সংযোগে সমস্যা হয়েছে। আপনার নেটওয়ার্ক চেক করে আবার চেষ্টা করুন।'
        : 'Network request failed. Please check your internet connection.';
    }

    return defaultMsg || t('authErrorGeneral');
  };

  /**
   * Handle Practitioner Sign In
   */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setErrorCode(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg(t('authValidationEmailRequired'));
      return;
    }
    if (!password) {
      setErrorMsg(t('authValidationPasswordRequired'));
      return;
    }

    setLoading(true);

    try {
      const res = await login(cleanEmail, password);
      if (res.success && res.user) {
        setSuccessMsg(t('authSuccessLogin'));
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorCode(res.errorCode || null);
        setErrorMsg(mapAuthError(res.errorCode, res.error));
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || t('authErrorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Practitioner Registration
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setErrorCode(null);
    setSuccessMsg(null);

    // Validate Doctor Profile inputs
    if (!doctorName.trim()) {
      setErrorMsg(
        t('docFieldName') + ' - ' + (language === 'bn' ? 'পূরণ করা আবশ্যক' : 'is required.')
      );
      return;
    }
    if (!qualification.trim()) {
      setErrorMsg(
        t('docFieldQualification') +
          ' - ' +
          (language === 'bn' ? 'পূরণ করা আবশ্যক' : 'is required.')
      );
      return;
    }
    if (!chamberName.trim()) {
      setErrorMsg(
        t('docFieldChamberName') + ' - ' + (language === 'bn' ? 'পূরণ করা আবশ্যক' : 'is required.')
      );
      return;
    }
    if (!chamberAddress.trim()) {
      setErrorMsg(
        t('docFieldChamberAddress') +
          ' - ' +
          (language === 'bn' ? 'পূরণ করা আবশ্যক' : 'is required.')
      );
      return;
    }

    // Validate Credentials
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg(t('authValidationEmailRequired'));
      return;
    }
    if (!password) {
      setErrorMsg(t('authValidationPasswordRequired'));
      return;
    }
    if (password.length < 6) {
      setErrorMsg(t('authValidationPasswordLength'));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(t('authErrorPasswordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        name: doctorName.trim(),
        qualification: qualification.trim(),
        chamberName: chamberName.trim(),
        chamberAddress: chamberAddress.trim(),
        regNumber: regNumber.trim(),
        phone: contactPhone.trim(),
        email: cleanEmail,
      };

      const res = await registerDoctor(cleanEmail, password, profileData);

      if (res.success && res.user) {
        // Save doctor profile in context, localStorage, and Cloud Firestore
        await updateDoctorProfile({
          name: profileData.name,
          qualification: profileData.qualification,
          chamberName: profileData.chamberName,
          chamberAddress: profileData.chamberAddress,
          regNumber: profileData.regNumber,
          phone: profileData.phone,
          email: cleanEmail,
          userId: res.user.uid,
        });

        setSuccessMsg(t('authSuccessRegister'));
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorCode(res.errorCode || null);
        setErrorMsg(mapAuthError(res.errorCode, res.error));
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || t('authErrorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Password Reset Link
   */
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setErrorCode(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg(t('authValidationEmailRequired'));
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(cleanEmail);
      if (res.success) {
        setSuccessMsg(t('authSuccessPasswordReset'));
      } else {
        setErrorCode(res.errorCode || null);
        setErrorMsg(mapAuthError(res.errorCode, res.error));
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || t('authErrorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  const isInvalidCredential =
    errorCode === 'auth/invalid-credential' ||
    errorCode === 'auth/user-not-found' ||
    errorCode === 'auth/wrong-password';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A1612]/55 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-auth-title"
        className={`relative w-full ${
          mode === 'register' ? 'max-w-xl' : 'max-w-md'
        } bg-white rounded-xl border border-[#CBD6D0] p-6 shadow-2xl z-10 my-8 space-y-4 max-h-[92vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#E3ECE7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#164E43] text-white flex items-center justify-center shrink-0 shadow-xs">
              {mode === 'login' && <Lock className="w-5 h-5" />}
              {mode === 'register' && <Stethoscope className="w-5 h-5" />}
              {mode === 'forgot-password' && <KeyRound className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="modal-auth-title" className="text-base sm:text-lg font-bold text-[#142620]">
                {mode === 'login' && t('authLoginTitle')}
                {mode === 'register' && t('authRegisterTitle')}
                {mode === 'forgot-password' && t('authForgotPasswordTitle')}
              </h2>
              <p className="text-xs text-[#5D7068] mt-0.5">
                {mode === 'login' && t('authLoginSubtitle')}
                {mode === 'register' && t('authRegisterSubtitle')}
                {mode === 'forgot-password' && t('authForgotPasswordSubtitle')}
              </p>
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

        {/* Configuration Status Notice */}
        {!isConfigured && (
          <div className="p-3 bg-[#F0F7F4] border border-[#CDE1D7] rounded-lg text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[#164E43]">
              <Info className="w-4 h-4 shrink-0 text-[#164E43]" />
              <span>{t('authConfigMissingNotice')}</span>
            </div>
            <p className="text-[#485E55] leading-relaxed text-[11px]">
              {t('authConfigMissingDetails')}
            </p>
            {missingKeys.length > 0 && (
              <div className="pt-1 font-mono text-[10px] text-[#2E453C]">
                Missing: {missingKeys.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="space-y-1.5 flex-1">
              <span className="font-medium">{errorMsg}</span>

              {/* Actionable prompt when credentials fail: user may not be registered yet */}
              {mode === 'login' && isInvalidCredential && (
                <div className="pt-1.5 border-t border-red-200/70 text-[11px] text-[#3D5248]">
                  <span>{t('authNotRegisteredPrompt')} </span>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setErrorCode(null);
                      setMode('register');
                    }}
                    className="font-bold text-[#164E43] underline hover:text-[#0E352D]"
                  >
                    {t('authRegisterNowLink')} &rarr;
                  </button>
                </div>
              )}

              {/* Instructions if Email/Password provider is disabled in Firebase Console */}
              {errorCode === 'auth/operation-not-allowed' && (
                <div className="text-[11px] text-red-800 font-medium pt-1.5 border-t border-red-200">
                  <div className="font-bold mb-1 flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    {language === 'bn'
                      ? 'ফায়ারবেস কনসোলে Email/Password সক্রিয় করার নিয়ম:'
                      : 'How to enable Email/Password in Firebase Console:'}
                  </div>
                  <ol className="list-decimal pl-4 space-y-0.5 font-normal">
                    <li>
                      {language === 'bn'
                        ? 'console.firebase.google.com এ প্রজেক্ট thinking-keep-7khlb খুলুন'
                        : 'Open console.firebase.google.com and select project thinking-keep-7khlb'}
                    </li>
                    <li>
                      {language === 'bn'
                        ? 'বাম মেন্যু থেকে Build > Authentication > Sign-in method এ যান'
                        : 'In left menu, click Build > Authentication > Sign-in method tab'}
                    </li>
                    <li>
                      {language === 'bn'
                        ? 'Email/Password নির্বাচন করে Enable (অন) করুন এবং Save দিন'
                        : 'Click Email/Password, toggle Enable ON, and click Save'}
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="flex items-start gap-2.5 p-3.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex-1 font-medium">{successMsg}</div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODE 1: PRACTITIONER SIGN IN                         */}
        {/* ---------------------------------------------------- */}
        {mode === 'login' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-left">
            <Input
              label={t('authFieldEmail')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('authFieldEmailPlaceholder')}
              leftIcon={<Mail className="w-4 h-4 text-[#5D7068]" />}
              required
              autoFocus
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#182C25]">
                  {t('authFieldPassword')}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setErrorCode(null);
                    setMode('forgot-password');
                  }}
                  className="text-xs text-[#164E43] hover:underline font-medium"
                >
                  {t('authForgotPassword')}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('authFieldPasswordPlaceholder')}
                  leftIcon={<Lock className="w-4 h-4 text-[#5D7068]" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8077] hover:text-[#182C25] p-1"
                  aria-label={showPassword ? t('authHidePassword') : t('authShowPassword')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Access Policy Note */}
            <div className="p-2.5 bg-[#FAFDFB] border border-[#E2EDE7] rounded-lg text-[11px] text-[#556961] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#164E43] shrink-0" />
              <span>{t('authRegistrationPolicyNote')}</span>
            </div>

            <div className="pt-2 space-y-2.5">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={loading}
                leftIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t('authBtnSignIn')}
              </Button>

              <div className="text-center pt-1.5 border-t border-[#EDF3F0]">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setErrorCode(null);
                    setSuccessMsg(null);
                    setMode('register');
                  }}
                  className="text-xs text-[#164E43] font-semibold hover:underline"
                >
                  {t('authSwitchToRegister')}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODE 2: REGISTER AUTHORIZED PRACTITIONER             */}
        {/* ---------------------------------------------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 text-left">
            {/* Professional Doctor Profile Details */}
            <div className="space-y-3 bg-[#FAFDFB] p-4 rounded-xl border border-[#D9E6DF]">
              <div className="flex items-center gap-2 pb-1 border-b border-[#E3EEE8]">
                <Stethoscope className="w-4 h-4 text-[#164E43]" />
                <span className="text-xs font-bold text-[#142620]">
                  {language === 'bn'
                    ? 'চিকিৎসকের পেশাগত তথ্য (প্রেসক্রিপশন হেডার)'
                    : 'Practitioner & Chamber Details (Prescription Header)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={t('docFieldName') + ' *'}
                  placeholder={t('docFieldNamePlaceholder')}
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  leftIcon={<Stethoscope className="w-4 h-4 text-[#5D7068]" />}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={t('docFieldChamberName') + ' *'}
                  placeholder={t('docFieldChamberNamePlaceholder')}
                  value={chamberName}
                  onChange={(e) => setChamberName(e.target.value)}
                  leftIcon={<Building2 className="w-4 h-4 text-[#5D7068]" />}
                  required
                />

                <Input
                  label={t('docFieldRegNumber')}
                  placeholder={t('docFieldRegNumberPlaceholder')}
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  leftIcon={<FileText className="w-4 h-4 text-[#5D7068]" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={t('docFieldChamberAddress') + ' *'}
                  placeholder={t('docFieldChamberAddressPlaceholder')}
                  value={chamberAddress}
                  onChange={(e) => setChamberAddress(e.target.value)}
                  required
                />

                <Input
                  label={t('authFieldPhone')}
                  placeholder={t('authFieldPhonePlaceholder')}
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4 text-[#5D7068]" />}
                />
              </div>
            </div>

            {/* Account Credentials */}
            <div className="space-y-3 bg-[#FAFDFB] p-4 rounded-xl border border-[#D9E6DF]">
              <div className="flex items-center gap-2 pb-1 border-b border-[#E3EEE8]">
                <Lock className="w-4 h-4 text-[#164E43]" />
                <span className="text-xs font-bold text-[#142620]">
                  {language === 'bn'
                    ? 'লগইন তথ্য (ইমেইল ও পাসওয়ার্ড)'
                    : 'Account Credentials (Email & Password)'}
                </span>
              </div>

              <Input
                label={t('authFieldEmail') + ' *'}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('authFieldEmailPlaceholder')}
                leftIcon={<Mail className="w-4 h-4 text-[#5D7068]" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Input
                    label={t('authFieldPassword') + ' *'}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('authFieldPasswordPlaceholder')}
                    leftIcon={<Lock className="w-4 h-4 text-[#5D7068]" />}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-[#6B8077] hover:text-[#182C25] p-1"
                    aria-label={showPassword ? t('authHidePassword') : t('authShowPassword')}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label={t('authFieldConfirmPassword') + ' *'}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('authFieldConfirmPasswordPlaceholder')}
                    leftIcon={<Lock className="w-4 h-4 text-[#5D7068]" />}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[34px] text-[#6B8077] hover:text-[#182C25] p-1"
                    aria-label={
                      showConfirmPassword ? t('authHidePassword') : t('authShowPassword')
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Registration Policy Note */}
            <div className="text-[11px] text-[#596E66] leading-relaxed">
              {t('authRegistrationPolicyNote')}
            </div>

            <div className="pt-2 space-y-2.5">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={loading}
                leftIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t('authBtnRegister')}
              </Button>

              <div className="text-center pt-1.5 border-t border-[#EDF3F0]">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setErrorCode(null);
                    setSuccessMsg(null);
                    setMode('login');
                  }}
                  className="text-xs text-[#164E43] font-semibold hover:underline"
                >
                  {t('authSwitchToLogin')}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODE 3: FORGOT PASSWORD                              */}
        {/* ---------------------------------------------------- */}
        {mode === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-left">
            <div className="p-3 bg-[#F0F7F4] border border-[#CCE1D7] rounded-lg text-xs space-y-1.5 text-[#374C43]">
              <p className="font-semibold text-[#164E43]">
                {language === 'bn' ? 'পাসওয়ার্ড রিসেট নির্দেশনা' : 'Password Reset Instructions'}
              </p>
              <p className="leading-relaxed text-[11px]">
                {language === 'bn'
                  ? 'আপনার চেম্বার অ্যাকাউন্টের ইমেইল ঠিকানা দিন। ফায়ারবেস থেকে একটি সুরক্ষিত পাসওয়ার্ড রিসেট লিঙ্ক আপনার ইনবক্সে পাঠানো হবে।'
                  : 'Enter your registered doctor email address. A secure link will be sent to your inbox to reset your account password.'}
              </p>
            </div>

            <Input
              label={t('authFieldEmail')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('authFieldEmailPlaceholder')}
              leftIcon={<Mail className="w-4 h-4 text-[#5D7068]" />}
              required
              autoFocus
            />

            <div className="pt-2 space-y-2.5">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={loading}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                {t('authBtnSendResetLink')}
              </Button>

              <div className="text-center pt-1.5 border-t border-[#EDF3F0]">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setErrorCode(null);
                    setSuccessMsg(null);
                    setMode('login');
                  }}
                  className="text-xs text-[#164E43] font-semibold hover:underline"
                >
                  &larr; {t('authBackToLogin')}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
