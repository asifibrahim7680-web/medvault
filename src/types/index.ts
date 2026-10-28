export type RecordCategory =
  | 'Blood Tests & Labs'
  | 'Prescriptions & Rx'
  | 'Imaging & Scans'
  | 'Specialist Diagnoses'
  | 'Discharge Summaries';

export interface Biomarker {
  name: string;
  value: string;
  unit: string;
  status: 'optimal' | 'normal' | 'mild_elevation' | 'high' | 'low';
  referenceRange?: string;
}

export interface MedicalReport {
  id: string;
  title: string;
  category: RecordCategory;
  testDate: string; // YYYY-MM-DD
  uploadDate: string; // YYYY-MM-DD or formatted
  clinicProvider: string;
  doctorName: string;
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  fileType: string;
  thumbnailUrl?: string;
  fileDataUrl?: string; // Base64 or object URL for preview/download
  notes?: string;
  physicianNote?: string;
  biomarkers?: Biomarker[];
  statusBadge: string;
  statusType: 'primary' | 'secondary' | 'tertiary' | 'error' | 'neutral';
  hashIntegrity?: string;
  preservationStatus?: string;
  storagePath?: string;
  isVerified?: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  form: string;
  rxNumber: string;
  frequency: string;
  scheduleTimes: string[]; // e.g. ["08:00", "13:00"]
  timePeriod: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime' | 'PRN';
  mealInstruction?: string;
  doctorName: string;
  clinic: string;
  pharmacy: string;
  remainingPills: number;
  totalPills: number;
  refillThresholdDays: number;
  autoRefillEnabled: boolean;
  isPrn: boolean;
  status: 'active' | 'discontinued';
  clinicalGuidance?: string;
  guidance?: string;
  nextDoseText?: string;
  colorAccent?: 'primary' | 'secondary' | 'tertiary';
}

export interface DoseLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  date: string; // formatted e.g. "Today, Oct 24" or YYYY-MM-DD
  scheduledTime: string;
  recordedTime: string; // e.g. "8:04 AM" or "--:--"
  status: 'taken' | 'skipped' | 'pending' | 'taken_late';
  clinicalNotes?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  doctorTitle?: string;
  specialty: string;
  clinicHospital: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "10:30 AM"
  endTime?: string; // e.g. "11:15 AM"
  locationRoom: string;
  type: 'Doctor Visit' | 'Laboratory Test' | 'Specialist Consultation' | 'Procedure' | 'Teleconsultation';
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  doctorAvatar?: string;
  reminderSet?: boolean;
}

export interface EmergencyHealthCard {
  bloodType: string;
  bloodTypeDesc: string;
  allergies: string[];
  primaryContact: {
    name: string;
    relationship: string;
    phone: string;
    registeredIce: boolean;
  };
}

export interface CareProvider {
  id: string;
  name: string;
  specialty: string;
  departmentTag: string;
  clinic: string;
  lastVisit: string;
  nextVisit?: string;
  avatar: string;
  phone?: string;
  email?: string;
}

export interface TimelineEvent {
  id: string;
  type: 'lab' | 'consultation' | 'surgery' | 'diagnosis' | 'medication_change';
  typeLabel: string;
  date: string;
  year: number;
  title: string;
  clinic: string;
  doctor: string;
  description: string;
  badge?: {
    text: string;
    variant: 'positive' | 'warning' | 'primary' | 'neutral' | 'error';
  };
  metrics?: {
    label: string;
    value: string;
    unit?: string;
    status: string;
    percentage: number;
  }[];
  ecgStrip?: boolean;
  attachments?: {
    name: string;
    size?: string;
    type: 'pdf' | 'report';
    description?: string;
  }[];
  prescriptionBadge?: {
    name: string;
    detail: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  healthId: string;
  dob: string;
  bloodType: string;
  allergies: string[];
  avatarUrl: string;
}

export interface NotificationPreferences {
  emailAlerts: boolean;
  smsReminders: boolean;
  pushNotifications: boolean;
  refillLeadDays: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface AuditLogItem {
  id: string;
  title: string;
  timestamp: string;
  actor: string;
  type: 'download' | 'upload' | 'dose' | 'sync';
}
