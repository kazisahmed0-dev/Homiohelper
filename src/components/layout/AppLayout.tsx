import React, { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { NavigationTab, Patient, NotificationMessage } from '../../types';
import { NotificationBanner } from '../ui/NotificationBanner';

export interface AppLayoutProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenNewPatient: () => void;
  onOpenAuthModal?: () => void;
  totalPatientsCount: number;
  notification: NotificationMessage | null;
  onDismissNotification: () => void;
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewPatient,
  onOpenAuthModal,
  totalPatientsCount,
  notification,
  onDismissNotification,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout-root min-h-screen bg-[#F8F9F8] text-[#18221E] flex flex-row overflow-x-hidden">
      {/* Desktop & Mobile Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        totalPatientsCount={totalPatientsCount}
        onOpenAuthModal={onOpenAuthModal}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNewPatientClick={onOpenNewPatient}
          onOpenAuthModal={onOpenAuthModal}
        />

        <main className="app-layout-main flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5">
          {/* Dynamic Flash Notifications (e.g., patient added, action completed) */}
          {notification && (
            <NotificationBanner
              type={notification.type}
              title={notification.title}
              message={notification.message}
              onDismiss={onDismissNotification}
            />
          )}

          {/* Active View / Child Component */}
          {children}
        </main>
      </div>
    </div>
  );
};
