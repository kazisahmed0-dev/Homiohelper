import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileClock,
  CalendarCheck,
  FileText,
  Pill,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  X,
  Stethoscope,
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useDoctorProfile } from '../../context/DoctorProfileContext';

export interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  totalPatientsCount?: number;
  onOpenAuthModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  totalPatientsCount = 0,
  onOpenAuthModal,
}) => {
  const { t, language } = useLanguage();
  const { currentUser, isConfigured } = useAuth();

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }[] = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    {
      id: 'patients',
      label: t('navPatients'),
      icon: Users,
      badge: totalPatientsCount > 0 ? totalPatientsCount : undefined,
    },
    { id: 'patient-history', label: t('navPatientHistory'), icon: FileClock },
    { id: 'visits', label: t('navVisits'), icon: CalendarCheck },
    { id: 'prescriptions', label: t('navPrescriptions'), icon: FileText },
    { id: 'medicines', label: t('navMedicines'), icon: Pill },
    { id: 'inventory', label: t('navInventory'), icon: Package },
    { id: 'sales-dispensing', label: t('navSalesDispensing'), icon: ShoppingBag },
    { id: 'reports', label: t('navReports'), icon: BarChart3 },
    { id: 'settings', label: t('navSettings'), icon: Settings },
  ];

  const { doctorProfile, openProfileModal } = useDoctorProfile();

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const renderNavContent = (isMobileDrawer: boolean = false) => (
    <div className="flex flex-col h-full bg-white border-r border-[#DAE4DF]">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E1EAE5]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#164E43] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-[#11241E] tracking-tight">
                {t('appName')}
              </span>
              <span className="text-[10px] font-semibold text-[#164E43] bg-[#E8F1EC] px-1.5 py-0.5 rounded">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-[#637770] truncate leading-tight mt-0.5">
              {t('appTagline')}
            </p>
          </div>
        </div>

        {/* Mobile close button - only in mobile drawer */}
        {isMobileDrawer && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 text-[#637770] hover:text-[#11241E] rounded-md hover:bg-[#F0F5F2]"
            aria-label={language === 'bn' ? 'মেন্যু বন্ধ করুন' : 'Close navigation'}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#7A8E87]">
          {t('navSectionModules')}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[#164E43] text-white shadow-2xs font-semibold'
                  : 'text-[#384C45] hover:bg-[#F2F6F4] hover:text-[#11241E]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-[#6A7F77] group-hover:text-[#164E43]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#EBF1EE] text-[#164E43]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Practice Context */}
      <div className="p-3.5 border-t border-[#E1EAE5] bg-[#F9FBFA]">
        <div className="rounded-lg p-2.5 border border-[#DFE8E3] bg-white group hover:border-[#164E43]/40 transition-colors">
          <div className="flex items-start justify-between gap-1">
            <p className="text-[11px] font-semibold text-[#182B24] truncate flex-1">
              {doctorProfile.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || currentUser?.phoneNumber || t('doctorDefaultName')}
            </p>
            <button
              type="button"
              onClick={openProfileModal}
              title={t('docEditProfileBtn')}
              className="text-[10px] text-[#164E43] hover:underline shrink-0"
            >
              {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
            </button>
          </div>
          <p className="text-[10px] text-[#657972] truncate">
            {doctorProfile.qualification || doctorProfile.chamberName || t('doctorDefaultDegree')}
          </p>
          <div className="mt-1.5 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-[#164E43]">
              <span className={`w-1.5 h-1.5 rounded-full ${currentUser ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
              <span>{currentUser ? (language === 'bn' ? 'সংযুক্ত' : 'Connected') : t('chamberBadgeActive')}</span>
            </div>
            {!currentUser && onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="text-[10px] text-[#164E43] font-semibold hover:underline"
              >
                {t('authBtnSignIn')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="no-print hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-20">
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer Backdrop & Panel */}
      {isOpenMobile && (
        <>
          <div
            className="no-print fixed inset-0 bg-[#0C1713]/40 backdrop-blur-2xs z-40 lg:hidden transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="no-print fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 lg:hidden shadow-xl">
            {renderNavContent(true)}
          </aside>
        </>
      )}
    </>
  );
};
