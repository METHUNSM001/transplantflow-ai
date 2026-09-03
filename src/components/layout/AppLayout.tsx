import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLiveDemo } from '../../hooks/useLiveDemo';
import { useTheme } from '../../hooks/useTheme';
import { localStore, subscribeToStore } from '../../lib/storage';
import { DemoBanner } from './DemoBanner';
import { MedicalDisclaimerBanner } from './MedicalDisclaimerBanner';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role, switchRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const demo = useLiveDemo();

  const [activeOrgansCount, setActiveOrgansCount] = useState(0);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  const updateCounts = () => {
    const organs = localStore.getOrgans();
    const activeOrgans = organs.filter((o) => ['AVAILABLE', 'MATCHED', 'IN_TRANSIT'].includes(o.status));
    setActiveOrgansCount(activeOrgans.length);

    const alerts = localStore.getAlerts().filter((a) => a.status === 'ACTIVE');
    setActiveAlertsCount(alerts.length);
  };

  useEffect(() => {
    updateCounts();
    return subscribeToStore(updateCounts);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* 1. Mandatory Clinical Decision Support Disclaimer Banner */}
      <MedicalDisclaimerBanner />

      {/* 2. Live Demo Interactive Controller Banner (conditional) */}
      {demo.isActive && (
        <DemoBanner
          currentStep={demo.currentStep}
          currentStepIndex={demo.currentStepIndex}
          totalSteps={demo.totalSteps}
          isAutoPlaying={demo.isAutoPlaying}
          onNext={demo.nextStep}
          onPrev={demo.prevStep}
          onToggleAutoPlay={demo.toggleAutoPlay}
          onStop={demo.stopDemo}
        />
      )}

      {/* 3. Top Navigation Bar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onStartDemo={demo.startDemo}
        isDemoActive={demo.isActive}
        currentRole={role}
        onSwitchRole={switchRole}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        activeAlertsCount={activeAlertsCount}
      />

      {/* 4. Main Body: Sidebar + Dynamic Routed Page Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeOrgansCount={activeOrgansCount}
          activeAlertsCount={activeAlertsCount}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
