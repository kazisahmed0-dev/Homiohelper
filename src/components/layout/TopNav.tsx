import React from 'react';
import { Menu, Calendar, LogIn, LogOut, User, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useDoctorProfile } from '../../context/DoctorProfileContext';
import { Button } from '../ui/Button';

export interface TopNavProps {
  onOpenMobileMenu: () => void;
  onNewPatientClick: () => void;
  onOpenAuthModal?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenMobileMenu,
  onNewPatientClick,
  onOpenAuthModal,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, logout } = useAuth();
  const { doctorProfile, openProfileModal } = useDoctorProfile();

  // Current formatted date according to active language
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const formattedDate = today.toLocaleDateString(
    language === 'bn' ? 'bn-BD' : 'en-GB',
    dateOptions
  );

  const doctorDisplayName = doctorProfile.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || currentUser?.phoneNumber || t('doctorDefaultName');

  return (
    <header className="no-print sticky top-0 z-10 bg-white/95 backdrop-blur-xs border-b border-[#DCE5E0] h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Left: Mobile hamburger & breadcrumb/practice info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-[#435750] hover:text-[#11241E] rounded-lg hover:bg-[#F2F6F4] -ml-1 transition-colors"
          aria-label={language === 'bn' ? 'মেন্যু খুলুন' : 'Open mobile menu'}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#5C7069]">
          <span className="font-semibold text-[#182C25]">
            {language === 'bn' ? 'হোমিওপ্যাথিক চেম্বার' : 'Chamber'}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#164E43]" />
            <span>{formattedDate}</span>
          </span>
          <span>·</span>
          {/* Real-time Database Status Badge */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#E8F0EC] text-[#164E43] border border-[#CFDFD7]"
            title={
              language === 'bn'
                ? 'ডাটাবেজ: লোকাল ব্রাউজার স্টোরেজ সক্রিয় (অফলাইন-ফার্স্ট)'
                : 'Database: Browser Local Storage Active (Offline-First)'
            }
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>{language === 'bn' ? 'লোকাল স্টোরেজ' : 'Local DB'}</span>
          </span>
        </div>
      </div>

      {/* Right: Quick actions, Language switcher, and Profile/Auth */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <div
          className="flex items-center bg-[#F0F5F2] p-1 rounded-lg border border-[#DCE5E0]"
          role="group"
          aria-label={language === 'bn' ? 'ভাষা পরিবর্তন' : 'Language switcher'}
        >
          <button
            type="button"
            onClick={() => setLanguage('bn')}
            aria-pressed={language === 'bn'}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              language === 'bn'
                ? 'bg-white text-[#164E43] shadow-2xs font-bold'
                : 'text-[#5C7069] hover:text-[#164E43]'
            }`}
          >
            বাংলা
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            aria-pressed={language === 'en'}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              language === 'en'
                ? 'bg-white text-[#164E43] shadow-2xs font-bold'
                : 'text-[#5C7069] hover:text-[#164E43]'
            }`}
          >
            EN
          </button>
        </div>

        {/* New Patient Top CTA */}
        <Button
          variant="primary"
          size="sm"
          onClick={onNewPatientClick}
          className="text-xs shrink-0"
        >
          + {t('dashNewPatient')}
        </Button>

        {/* Auth / Doctor Identity Section */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-[#E2EBE6]">
            <div className="w-8 h-8 rounded-full bg-[#164E43] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'DR'}
            </div>
            <div className="hidden md:block text-left text-xs leading-tight">
              <p className="font-semibold text-[#162721] truncate max-w-[130px]">
                {doctorDisplayName}
              </p>
              <p className="text-[10px] text-[#697D76] truncate max-w-[130px]">
                {currentUser.email}
              </p>
            </div>
            <button
              onClick={() => logout()}
              title={t('authBtnSignOut')}
              className="p-1.5 text-[#6D8078] hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              aria-label={t('authBtnSignOut')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#E2EBE6]">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAuthModal}
              leftIcon={<LogIn className="w-3.5 h-3.5 text-[#164E43]" />}
              className="text-xs py-1 px-2.5"
            >
              {t('authBtnSignIn')}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
