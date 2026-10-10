/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MediVaultProvider, useMediVault } from './context/MediVaultContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { DashboardView } from './views/DashboardView';
import { MedicalRecordsView } from './views/MedicalRecordsView';
import { MedicinesView } from './views/MedicinesView';
import { AppointmentsView } from './views/AppointmentsView';
import { TimelineView } from './views/TimelineView';
import { SettingsView } from './views/SettingsView';

import { UploadRecordModal } from './components/modals/UploadRecordModal';
import { EditMetadataModal } from './components/modals/EditMetadataModal';
import { AddMedicationModal } from './components/modals/AddMedicationModal';
import { AddAppointmentModal } from './components/modals/AddAppointmentModal';
import { ShareSummaryModal } from './components/modals/ShareSummaryModal';
import { AuthModal } from './components/modals/AuthModal';
import { NotificationDrawer } from './components/modals/NotificationDrawer';

const AppContent: React.FC = () => {
  const { activeTab } = useMediVault();

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex flex-col">
      {/* Top Fixed Header */}
      <Header />

      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Clinical Portal Workspace */}
      <div className="pl-60">
        <main className="w-full min-h-screen pt-16 bg-slate-50 px-6 lg:px-8 pb-10">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'medical-records' && <MedicalRecordsView />}
          {activeTab === 'medicines' && <MedicinesView />}
          {activeTab === 'appointments' && <AppointmentsView />}
          {activeTab === 'health-timeline' && <TimelineView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modals & Overlays */}
      <UploadRecordModal />
      <EditMetadataModal />
      <AddMedicationModal />
      <AddAppointmentModal />
      <ShareSummaryModal />
      <AuthModal />
      <NotificationDrawer />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <MediVaultProvider>
      <AppContent />
    </MediVaultProvider>
  );
}
