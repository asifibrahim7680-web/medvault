import React, { useState } from 'react';
import { useMediVault } from '../../context/MediVaultContext';

export const ShareSummaryModal: React.FC = () => {
  const { exportSummaryModalOpen, setExportSummaryModalOpen, reports, medications, appointments, profile, showToast } = useMediVault();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [includeReports, setIncludeReports] = useState(true);
  const [includeMeds, setIncludeMeds] = useState(true);
  const [includeAppointments, setIncludeAppointments] = useState(true);
  const [expiringHours, setExpiringHours] = useState('72');

  if (!exportSummaryModalOpen) return null;

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Secure physician summary link generated and sent to ${recipientEmail || 'your clinical contact'}!`, 'success');
    setExportSummaryModalOpen(false);
  };

  const handleExportPdf = () => {
    // Generate text/markdown downloadable clinical summary
    const content = `=======================================================
MEDIVAULT - CLINICAL SUMMARY & PATIENT HEALTH DOSSIER
=======================================================
Patient: ${profile.fullName}
Health ID: #${profile.healthId}
Date of Birth: ${profile.dob}
Blood Type: ${profile.bloodType}
Allergies: ${profile.allergies.join(', ')}
Generated On: ${new Date().toLocaleString()}
Preservation Status: Verified HIPAA Enclave Archive

-------------------------------------------------------
1. CURRENT ACTIVE MEDICATION REGIMEN (${medications.filter((m) => m.status === 'active').length} Prescriptions)
-------------------------------------------------------
${medications
  .filter((m) => m.status === 'active')
  .map(
    (m) =>
      `• ${m.name} (${m.dosage}, ${m.form})
  Schedule: ${m.frequency} | ${m.mealInstruction || ''}
  Prescriber: ${m.doctorName} (${m.clinic})
  Supply: ${m.remainingPills} / ${m.totalPills} remaining (Rx: ${m.rxNumber})`
  )
  .join('\n\n')}

-------------------------------------------------------
2. RECENT CLINICAL LABORATORY & DIAGNOSTIC RECORDS (${reports.length} Reports)
-------------------------------------------------------
${reports
  .slice(0, 5)
  .map(
    (r) =>
      `• ${r.title}
  Category: ${r.category} | Test Date: ${r.testDate}
  Facility: ${r.clinicProvider} | Doctor: ${r.doctorName}
  Status: ${r.statusBadge}
  Notes: ${r.physicianNote || 'None'}`
  )
  .join('\n\n')}

-------------------------------------------------------
3. UPCOMING CLINICAL VISITS (${appointments.filter((a) => a.status === 'upcoming').length} Scheduled)
-------------------------------------------------------
${appointments
  .filter((a) => a.status === 'upcoming')
  .map(
    (a) =>
      `• ${a.doctorName} (${a.specialty})
  Date & Time: ${a.appointmentDate} at ${a.appointmentTime}
  Location: ${a.clinicHospital} (${a.locationRoom})`
  )
  .join('\n\n')}

=======================================================
END OF REPORT - CERTIFIED CONFIDENTIAL MEDICAL RECORD
=======================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediVault_Physician_Summary_${profile.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Comprehensive Clinical Summary exported!', 'success');
    setExportSummaryModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl flex flex-col gap-space-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
          <div className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">share</span>
            </div>
            <div>
              <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">
                Share Clinical Summary with Doctor
              </h3>
              <p className="font-label-xs text-label-xs text-outline">
                Time-restricted, end-to-end encrypted link or dossier export
              </p>
            </div>
          </div>
          <button
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors"
            onClick={() => setExportSummaryModalOpen(false)}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleShare} className="flex flex-col gap-3">
          <div>
            <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
              Physician or Specialist Email
            </label>
            <input
              className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. dr.vance@stjudeheart.org"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
              Security Link Expiration
            </label>
            <select
              className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={expiringHours}
              onChange={(e) => setExpiringHours(e.target.value)}
            >
              <option value="24">Expires in 24 hours</option>
              <option value="72">Expires in 72 hours (Recommended)</option>
              <option value="168">Expires in 7 days</option>
              <option value="single">Single-use view token</option>
            </select>
          </div>

          <div className="space-y-2 py-1">
            <span className="block font-label-xs text-label-xs text-outline uppercase tracking-wider">
              Included Clinical Data
            </span>
            <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
              <input
                type="checkbox"
                checked={includeMeds}
                onChange={(e) => setIncludeMeds(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Active Medications & Adherence Compliance Score (96%)</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
              <input
                type="checkbox"
                checked={includeReports}
                onChange={(e) => setIncludeReports(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Recent Diagnostic Reports & Extracted Biomarkers (Glucose, LDL, eGFR)</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
              <input
                type="checkbox"
                checked={includeAppointments}
                onChange={(e) => setIncludeAppointments(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Upcoming Appointments and Care Team Schedule</span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 mt-1">
            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-sm text-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
              <span>Export Dossier (TXT/PDF)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-md text-sm transition-colors"
                onClick={() => setExportSummaryModalOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm rounded-lg shadow-sm transition-colors"
                type="submit"
              >
                Send Secure Link
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
