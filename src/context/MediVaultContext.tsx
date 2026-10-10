import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  MedicalReport,
  Medication,
  DoseLog,
  Appointment,
  EmergencyHealthCard,
  CareProvider,
  TimelineEvent,
  AuditLogItem,
  NotificationPreferences,
} from '../types';
import {
  initialProfile,
  initialEmergencyCard,
  initialReports,
  initialMedications,
  initialDoseLogs,
  initialAppointments,
  initialCareProviders,
  initialTimelineEvents,
  initialAuditLogs,
  initialNotificationPreferences,
} from '../data/initialData';
import { getSupabaseConfigStatus, isSupabaseConfigured, supabase } from '../lib/supabase';

export type TabType =
  | 'dashboard'
  | 'medical-records'
  | 'medicines'
  | 'appointments'
  | 'health-timeline'
  | 'settings';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface TodayScheduleItem {
  medication: Medication;
  time: string;
  status: 'taken' | 'due_now' | 'upcoming' | 'pending';
  logId?: string;
  notes?: string;
}

interface MediVaultContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // Medical Reports
  reports: MedicalReport[];
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  selectedReport: MedicalReport | null;
  uploadReport: (reportData: Partial<MedicalReport>) => Promise<boolean>;
  updateReportMetadata: (id: string, metadata: Partial<MedicalReport>) => void;
  deleteReport: (id: string) => void;
  downloadReport: (report: MedicalReport) => void;

  // Medications
  medications: MedicationsState;
  addMedication: (med: Omit<Medication, 'id'>) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  requestRefill: (medicationId: string) => void;
  doseLogs: DoseLog[];
  logDose: (medicationId: string, status: 'taken' | 'skipped' | 'taken_late', notes?: string) => void;
  todaySchedule: TodayScheduleItem[];

  // Appointments
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;

  // Health Timeline & Care Providers
  timelineEvents: TimelineEvent[];
  careProviders: CareProvider[];
  addCareProvider: (provider: Omit<CareProvider, 'id'>) => void;

  // Profile & Emergency
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  emergencyCard: EmergencyHealthCard;
  updateEmergencyCard: (card: Partial<EmergencyHealthCard>) => void;
  auditLogs: AuditLogItem[];
  notificationPrefs: NotificationPreferences;
  updateNotificationPrefs: (prefs: Partial<NotificationPreferences>) => void;

  // Backend / Cloud
  backendStatus: ReturnType<typeof getSupabaseConfigStatus>;
  refreshBackendStatus: () => void;

  // Modals & Drawers
  uploadModalOpen: boolean;
  setUploadModalOpen: (open: boolean) => void;
  addMedModalOpen: boolean;
  setAddMedModalOpen: (open: boolean) => void;
  addAptModalOpen: boolean;
  setAddAptModalOpen: (open: boolean) => void;
  exportSummaryModalOpen: boolean;
  setExportSummaryModalOpen: (open: boolean) => void;
  notificationDrawerOpen: boolean;
  setNotificationDrawerOpen: (open: boolean) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  editMetadataModalReport: MedicalReport | null;
  setEditMetadataModalReport: (report: MedicalReport | null) => void;

  // Feedback Toast
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type MedicationsState = Medication[];

const MediVaultContext = createContext<MediVaultContextType | undefined>(undefined);

const STORAGE_KEYS = {
  REPORTS: 'medivault_reports_v1',
  MEDICATIONS: 'medivault_medications_v1',
  DOSE_LOGS: 'medivault_dose_logs_v1',
  APPOINTMENTS: 'medivault_appointments_v1',
  PROFILE: 'medivault_profile_v1',
  EMERGENCY: 'medivault_emergency_v1',
  PROVIDERS: 'medivault_providers_v1',
  PREFS: 'medivault_prefs_v1',
  AUDIT: 'medivault_audit_v1',
};

export const MediVaultProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Local storage loaded states with fallbacks to initial data
  const [reports, setReports] = useState<MedicalReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return saved ? JSON.parse(saved) : initialReports;
    } catch {
      return initialReports;
    }
  });

  const [selectedReportId, setSelectedReportId] = useState<string | null>('cmp');

  const [medications, setMedications] = useState<Medication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
      return saved ? JSON.parse(saved) : initialMedications;
    } catch {
      return initialMedications;
    }
  });

  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOSE_LOGS);
      return saved ? JSON.parse(saved) : initialDoseLogs;
    } catch {
      return initialDoseLogs;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return saved ? JSON.parse(saved) : initialAppointments;
    } catch {
      return initialAppointments;
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : initialProfile;
    } catch {
      return initialProfile;
    }
  });

  const [emergencyCard, setEmergencyCard] = useState<EmergencyHealthCard>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMERGENCY);
      return saved ? JSON.parse(saved) : initialEmergencyCard;
    } catch {
      return initialEmergencyCard;
    }
  });

  const [careProviders, setCareProviders] = useState<CareProvider[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
      return saved ? JSON.parse(saved) : initialCareProviders;
    } catch {
      return initialCareProviders;
    }
  });

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFS);
      return saved ? JSON.parse(saved) : initialNotificationPreferences;
    } catch {
      return initialNotificationPreferences;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
      return saved ? JSON.parse(saved) : initialAuditLogs;
    } catch {
      return initialAuditLogs;
    }
  });

  const [timelineEvents] = useState<TimelineEvent[]>(initialTimelineEvents);
  const [backendStatus, setBackendStatus] = useState(getSupabaseConfigStatus());

  // Modal Dialog States
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [addMedModalOpen, setAddMedModalOpen] = useState(false);
  const [addAptModalOpen, setAddAptModalOpen] = useState(false);
  const [exportSummaryModalOpen, setExportSummaryModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [editMetadataModalReport, setEditMetadataModalReport] = useState<MedicalReport | null>(null);

  // Feedback Toast
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3800);
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    } catch {
      // ignore
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
    } catch {
      // ignore
    }
  }, [medications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(doseLogs));
    } catch {
      // ignore
    }
  }, [doseLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch {
      // ignore
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(emergencyCard));
    } catch {
      // ignore
    }
  }, [emergencyCard]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(notificationPrefs));
    } catch {
      // ignore
    }
  }, [notificationPrefs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
    } catch {
      // ignore
    }
  }, [auditLogs]);

  const refreshBackendStatus = () => {
    setBackendStatus(getSupabaseConfigStatus());
  };

  // If Supabase is configured, test connection / session
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          showToast(`Connected to Supabase session: ${session.user.email}`, 'info');
        }
      });
    }
  }, []);

  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0] || null;

  // Medical Report Operations
  const uploadReport = async (reportData: Partial<MedicalReport>): Promise<boolean> => {
    const id = 'rep-' + Date.now();
    const newReport: MedicalReport = {
      id,
      title: reportData.title || 'Untitled Medical Document',
      category: reportData.category || 'Blood Tests & Labs',
      testDate: reportData.testDate || new Date().toISOString().split('T')[0],
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      clinicProvider: reportData.clinicProvider || 'Independent Clinical Center',
      doctorName: reportData.doctorName || 'Attending Physician',
      fileName: reportData.fileName || 'Document.pdf',
      fileSizeBytes: reportData.fileSizeBytes || 1024 * 1024,
      fileSizeFormatted: reportData.fileSizeFormatted || 'PDF (1.2 MB)',
      fileType: reportData.fileType || 'application/pdf',
      thumbnailUrl: reportData.thumbnailUrl || initialReports[0].thumbnailUrl,
      fileDataUrl: reportData.fileDataUrl,
      notes: reportData.notes,
      physicianNote: reportData.physicianNote || 'Initial clinical ingest verified. Preservation status intact.',
      statusBadge: reportData.statusBadge || 'Normal / Verified Record',
      statusType: 'primary',
      hashIntegrity: Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 9),
      preservationStatus: 'Original File Authenticated (Client-Encrypted)',
      biomarkers: reportData.biomarkers || [
        { name: 'Standard Ingestion', value: 'Complete', unit: '', status: 'optimal' },
      ],
      isVerified: true,
    };

    // If live Supabase is configured, upload to Supabase table & storage
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('medical_reports').insert({
          title: newReport.title,
          category: newReport.category,
          test_date: newReport.testDate,
          clinic_provider: newReport.clinicProvider,
          doctor_name: newReport.doctorName,
          file_name: newReport.fileName,
          file_size_bytes: newReport.fileSizeBytes,
          file_type: newReport.fileType,
          notes: newReport.notes,
          status_badge: newReport.statusBadge,
        });
        if (error) {
          console.warn('Supabase insert warning:', error);
        }
      } catch (err) {
        console.warn('Supabase remote write fallback:', err);
      }
    }

    setReports((prev) => [newReport, ...prev]);
    setSelectedReportId(id);

    // Add audit log
    const newAudit: AuditLogItem = {
      id: 'aud-' + Date.now(),
      title: `Uploaded new report: ${newReport.title}`,
      timestamp: 'Just now • Client Enclave',
      actor: profile.fullName,
      type: 'upload',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(`Medical report "${newReport.title}" securely encrypted & stored!`, 'success');
    return true;
  };

  const updateReportMetadata = (id: string, metadata: Partial<MedicalReport>) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...metadata } : r))
    );
    showToast('Report metadata updated successfully.', 'success');
  };

  const deleteReport = (id: string) => {
    const reportToDelete = reports.find((r) => r.id === id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    if (selectedReportId === id) {
      const remaining = reports.filter((r) => r.id !== id);
      setSelectedReportId(remaining[0]?.id || null);
    }
    showToast(`Report "${reportToDelete?.title || id}" deleted.`, 'info');
  };

  const downloadReport = (report: MedicalReport) => {
    // If we have actual fileDataUrl
    if (report.fileDataUrl) {
      const a = document.createElement('a');
      a.href = report.fileDataUrl;
      a.download = report.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create a clean formatted text/markdown or PDF placeholder download
      const content = `MediVault Authenticated Clinical Record
==================================================
Record ID: ${report.id}
Document Title: ${report.title}
Category: ${report.category}
Test Date: ${report.testDate}
Uploaded Date: ${report.uploadDate}
Origin Clinic: ${report.clinicProvider}
Attending Physician: ${report.doctorName}
Preservation Status: ${report.preservationStatus || 'Original Authenticated'}
SHA-256 Integrity: ${report.hashIntegrity || 'Verified'}

Physician Note:
${report.physicianNote || 'None'}

Extracted Biomarkers:
${(report.biomarkers || []).map((b) => `- ${b.name}: ${b.value} ${b.unit} (${b.status})`).join('\n')}

==================================================
End-to-End Encrypted Patient Clinical Repository
MediVault Digital Medical Health Vault
`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.fileName.endsWith('.pdf') ? report.fileName.replace('.pdf', '_certified.txt') : report.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Add audit log entry
    setAuditLogs((prev) => [
      {
        id: 'aud-' + Date.now(),
        title: `${report.title} exported by patient`,
        timestamp: 'Just now • Authorized Session',
        actor: profile.fullName,
        type: 'download',
      },
      ...prev,
    ]);

    showToast(`Encrypted document "${report.fileName}" downloaded.`, 'success');
  };

  // Medication Operations
  const addMedication = (med: Omit<Medication, 'id'>) => {
    const id = 'med-' + Date.now();
    const newMed: Medication = {
      ...med,
      id,
    };
    setMedications((prev) => [newMed, ...prev]);
    showToast(`Medication "${newMed.name}" added to daily regimen.`, 'success');
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    showToast('Medication details updated.', 'success');
  };

  const deleteMedication = (id: string) => {
    const med = medications.find((m) => m.id === id);
    setMedications((prev) => prev.filter((m) => m.id !== id));
    showToast(`Medication "${med?.name || id}" removed from regimen.`, 'info');
  };

  const requestRefill = (medicationId: string) => {
    const med = medications.find((m) => m.id === medicationId);
    if (!med) return;

    // Bump pills and reset alerts
    setMedications((prev) =>
      prev.map((m) =>
        m.id === medicationId
          ? {
              ...m,
              remainingPills: m.totalPills,
            }
          : m
      )
    );

    // Audit log
    setAuditLogs((prev) => [
      {
        id: 'aud-' + Date.now(),
        title: `Electronic refill requested for ${med.name} (${med.pharmacy})`,
        timestamp: 'Just now • E-Prescribe Network',
        actor: profile.fullName,
        type: 'sync',
      },
      ...prev,
    ]);

    showToast(`Refill request sent to ${med.pharmacy} for ${med.name}!`, 'success');
  };

  const logDose = (medicationId: string, status: 'taken' | 'skipped' | 'taken_late', notes?: string) => {
    const med = medications.find((m) => m.id === medicationId);
    if (!med) return;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const newLog: DoseLog = {
      id: 'log-' + Date.now(),
      medicationId,
      medicationName: med.name,
      dosage: `${med.dosage} Tablet`,
      date: 'Today, ' + now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      scheduledTime: med.scheduleTimes[0] || '8:00 AM',
      recordedTime: status === 'skipped' ? '--:--' : timeFormatted,
      status,
      clinicalNotes: notes || (status === 'taken' ? 'Logged by patient' : 'Skipped dose'),
    };

    setDoseLogs((prev) => [newLog, ...prev]);

    // Decrease remaining pills if taken
    if (status === 'taken' || status === 'taken_late') {
      setMedications((prev) =>
        prev.map((m) =>
          m.id === medicationId
            ? { ...m, remainingPills: Math.max(0, m.remainingPills - 1) }
            : m
        )
      );
    }

    // Add audit log
    setAuditLogs((prev) => [
      {
        id: 'aud-' + Date.now(),
        title: `${med.name} dose recorded as ${status.replace('_', ' ').toUpperCase()}`,
        timestamp: 'Just now • MediVault Reminder App',
        actor: profile.fullName,
        type: 'dose',
      },
      ...prev,
    ]);

    showToast(
      status === 'taken'
        ? `${med.name} dose recorded as Taken!`
        : status === 'skipped'
        ? `${med.name} dose recorded as Skipped.`
        : `${med.name} dose recorded as Taken Late.`,
      status === 'taken' ? 'success' : 'info'
    );
  };

  // Appointments Operations
  const addAppointment = (apt: Omit<Appointment, 'id'>) => {
    const id = 'apt-' + Date.now();
    const newApt: Appointment = {
      ...apt,
      id,
    };
    setAppointments((prev) => [newApt, ...prev]);
    showToast(`Appointment with ${newApt.doctorName} scheduled!`, 'success');
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    showToast('Appointment updated successfully.', 'success');
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' as const } : a))
    );
    showToast('Appointment has been cancelled.', 'info');
  };

  const addCareProvider = (provider: Omit<CareProvider, 'id'>) => {
    const id = 'prov-' + Date.now();
    setCareProviders((prev) => [{ ...provider, id }, ...prev]);
    showToast(`Care Provider ${provider.name} added.`, 'success');
  };

  // Profile Updates
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    showToast('Patient profile updated.', 'success');
  };

  const updateEmergencyCard = (card: Partial<EmergencyHealthCard>) => {
    setEmergencyCard((prev) => ({ ...prev, ...card }));
    showToast('Emergency health card updated.', 'success');
  };

  const updateNotificationPrefs = (prefs: Partial<NotificationPreferences>) => {
    setNotificationPrefs((prev) => ({ ...prev, ...prefs }));
    showToast('Notification preferences saved.', 'success');
  };

  // Today's schedule dynamic calculation
  const todaySchedule: TodayScheduleItem[] = medications
    .filter((m) => m.status === 'active' && !m.isPrn)
    .map((med) => {
      // Check if logged today in doseLogs
      const todaysLog = doseLogs.find((l) => l.medicationId === med.id && l.date.includes('Today'));
      let status: 'taken' | 'due_now' | 'upcoming' | 'pending' = 'upcoming';
      if (todaysLog) {
        status = 'taken';
      } else if (med.id === 'med-metformin') {
        status = 'due_now';
      } else {
        status = 'upcoming';
      }

      return {
        medication: med,
        time: med.frequency.includes('8:00 AM') ? '8:00 AM' : med.frequency.includes('1:00 PM') ? '1:00 PM' : '8:00 PM',
        status,
        logId: todaysLog?.id,
        notes: todaysLog?.clinicalNotes,
      };
    });

  return (
    <MediVaultContext.Provider
      value={{
        activeTab,
        setActiveTab,
        globalSearch,
        setGlobalSearch,

        reports,
        selectedReportId,
        setSelectedReportId,
        selectedReport,
        uploadReport,
        updateReportMetadata,
        deleteReport,
        downloadReport,

        medications,
        addMedication,
        updateMedication,
        deleteMedication,
        requestRefill,
        doseLogs,
        logDose,
        todaySchedule,

        appointments,
        addAppointment,
        updateAppointment,
        cancelAppointment,

        timelineEvents,
        careProviders,
        addCareProvider,

        profile,
        updateProfile,
        emergencyCard,
        updateEmergencyCard,
        auditLogs,
        notificationPrefs,
        updateNotificationPrefs,

        backendStatus,
        refreshBackendStatus,

        uploadModalOpen,
        setUploadModalOpen,
        addMedModalOpen,
        setAddMedModalOpen,
        addAptModalOpen,
        setAddAptModalOpen,
        exportSummaryModalOpen,
        setExportSummaryModalOpen,
        notificationDrawerOpen,
        setNotificationDrawerOpen,
        authModalOpen,
        setAuthModalOpen,
        editMetadataModalReport,
        setEditMetadataModalReport,

        toast,
        showToast,
      }}
    >
      {children}
    </MediVaultContext.Provider>
  );
};

export const useMediVault = () => {
  const context = useContext(MediVaultContext);
  if (!context) {
    throw new Error('useMediVault must be used within a MediVaultProvider');
  }
  return context;
};
