import React, { useState } from 'react';
import { useMediVault } from '../context/MediVaultContext';

export const DashboardView: React.FC = () => {
  const {
    reports,
    medications,
    appointments,
    profile,
    emergencyCard,
    auditLogs,
    todaySchedule,
    logDose,
    downloadReport,
    setSelectedReportId,
    setActiveTab,
    setUploadModalOpen,
    setAddMedModalOpen,
    setAddAptModalOpen,
    setExportSummaryModalOpen,
    showToast,
  } = useMediVault();

  const [scheduleFilter, setScheduleFilter] = useState<'All Times' | 'Morning' | 'Afternoon' | 'Evening'>('All Times');

  const totalReportsCount = reports.length;
  const activeMedsCount = medications.filter((m) => m.status === 'active').length;
  const upcomingAptsCount = appointments.filter((a) => a.status === 'upcoming').length;

  const nextAppointment = appointments.find((a) => a.status === 'upcoming');
  const recentReports = reports.slice(0, 3);

  const filteredSchedule = todaySchedule.filter((item) => {
    if (scheduleFilter === 'All Times') return true;
    if (scheduleFilter === 'Morning') return item.medication.timePeriod === 'Morning';
    if (scheduleFilter === 'Afternoon') return item.medication.timePeriod === 'Afternoon';
    if (scheduleFilter === 'Evening') return item.medication.timePeriod === 'Evening' || item.medication.timePeriod === 'Bedtime';
    return true;
  });

  const takenDosesCount = todaySchedule.filter((s) => s.status === 'taken').length;
  const totalScheduledToday = todaySchedule.length;

  const handleAddToCalendar = () => {
    if (!nextAppointment) return;
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MediVault Health//EN
BEGIN:VEVENT
SUMMARY:Doctor Visit: ${nextAppointment.doctorName} (${nextAppointment.specialty})
DESCRIPTION:${nextAppointment.notes || 'Clinical consultation'}
LOCATION:${nextAppointment.clinicHospital}, ${nextAppointment.locationRoom}
DTSTART:${nextAppointment.appointmentDate.replace(/-/g, '')}T103000Z
DTEND:${nextAppointment.appointmentDate.replace(/-/g, '')}T111500Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Appointment_${nextAppointment.doctorName.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Appointment with ${nextAppointment.doctorName} added to calendar file!`, 'success');
  };

  const handleExportAuditCsv = () => {
    const header = 'ID,Action Title,Timestamp,Actor,Log Type\n';
    const rows = auditLogs
      .map((log) => `"${log.id}","${log.title}","${log.timestamp}","${log.actor}","${log.type}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediVault_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Full HIPAA Audit Log exported to CSV.', 'success');
  };

  return (
    <div className="flex flex-col w-full gap-6 max-w-7xl mx-auto">
      {/* Minimal Header / Welcome Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-teal-700 font-semibold">HIPAA Encrypted Vault</span>
              <span aria-hidden="true">·</span>
              <span>Synced Today at 08:42 AM</span>
              <span aria-hidden="true">·</span>
              <span>Thursday, Nov 07, 2024</span>
            </div>

            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mt-1">
              Good morning, {profile.fullName.split(' ')[0]}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your medical documents and daily adherence schedule in one private vault. You are on track with{' '}
              <strong className="text-slate-900 font-semibold">
                {takenDosesCount} of {totalScheduledToday || 4} doses
              </strong>{' '}
              scheduled for today.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
            <button
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              type="button"
              onClick={() => setUploadModalOpen(true)}
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>Upload Report</span>
            </button>
            <button
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              type="button"
              onClick={() => setAddMedModalOpen(true)}
            >
              <span className="material-symbols-outlined text-[16px] text-teal-700">alarm_add</span>
              <span>Add Reminder</span>
            </button>
            <button
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              type="button"
              onClick={() => setAddAptModalOpen(true)}
            >
              <span className="material-symbols-outlined text-[16px] text-blue-600">event</span>
              <span>Book Appointment</span>
            </button>
            <button
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              type="button"
              onClick={() => setExportSummaryModalOpen(true)}
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">share</span>
              <span>Share Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Summary Metrics (Flat & Minimal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div
          onClick={() => setActiveTab('medical-records')}
          className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Medical Records</span>
            <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Vault Backed</span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-slate-900 tracking-tight tabular-nums">
                {totalReportsCount}
              </span>
              <span className="text-xs text-slate-400">documents</span>
            </div>
            <span className="material-symbols-outlined text-[22px] text-slate-400">folder_open</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>+3 this month</span>
            <span className="text-teal-700 font-medium">View library &rarr;</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => setActiveTab('medicines')}
          className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Active Regimen</span>
            <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Active Plan</span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-slate-900 tracking-tight tabular-nums">
                {activeMedsCount}
              </span>
              <span className="text-xs text-slate-400">prescriptions</span>
            </div>
            <span className="material-symbols-outlined text-[22px] text-slate-400">medication</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="truncate">Next: Metformin at 1:00 PM</span>
            <span className="text-blue-700 font-medium shrink-0">Log &rarr;</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => setActiveTab('appointments')}
          className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Appointments</span>
            <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Confirmed</span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-slate-900 tracking-tight tabular-nums">
                {upcomingAptsCount}
              </span>
              <span className="text-xs text-slate-400">scheduled</span>
            </div>
            <span className="material-symbols-outlined text-[22px] text-slate-400">calendar_today</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="truncate">{nextAppointment?.doctorName || 'None'}</span>
            <span className="text-slate-700 font-medium shrink-0">Schedule &rarr;</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Vault Storage</span>
            <span className="text-[11px] text-slate-500 font-mono">AES-256</span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-slate-900 tracking-tight tabular-nums">
                1.4
              </span>
              <span className="text-xs text-slate-400">/ 15 GB</span>
            </div>
            <span className="text-xs font-semibold text-teal-700 font-mono">9%</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Client Enclave</span>
            <span className="text-teal-700">Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Split: 8 cols left, 4 cols right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Today's Medication Schedule */}
          <section className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Today’s Medication Schedule
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated clinical reminders synced with Dr. Chen's care protocol
                </p>
              </div>

              {/* Segmented Filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                {(['All Times', 'Morning', 'Afternoon', 'Evening'] as const).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setScheduleFilter(slot)}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      scheduleFilter === slot
                        ? 'bg-white text-slate-900 font-medium shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Items List */}
            <div className="flex flex-col divide-y divide-slate-100 mt-2">
              {filteredSchedule.map(({ medication, time, status, notes }) => {
                const isTaken = status === 'taken';
                const isDue = status === 'due_now';

                return (
                  <div
                    key={medication.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isTaken
                            ? 'bg-emerald-50 text-emerald-700'
                            : isDue
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {isTaken ? 'check' : isDue ? 'alarm' : 'schedule'}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-slate-900">
                            {medication.name}
                          </h3>
                          <span className="text-xs text-slate-500 font-medium">
                            {medication.dosage}
                          </span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                              isTaken
                                ? 'bg-emerald-50 text-emerald-700'
                                : isDue
                                ? 'bg-amber-100 text-amber-900 font-semibold'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isTaken ? 'Taken' : isDue ? `Due at ${time}` : 'Upcoming'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span>Scheduled: {time}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {notes ||
                              (isTaken
                                ? 'Logged on time with water'
                                : medication.mealInstruction || 'Daily maintenance')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      {isTaken ? (
                        <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Confirmed
                        </span>
                      ) : isDue ? (
                        <>
                          <button
                            type="button"
                            onClick={() => logDose(medication.id, 'taken')}
                            className="h-8 px-3.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                          >
                            Take Now
                          </button>
                          <button
                            type="button"
                            onClick={() => logDose(medication.id, 'skipped', 'Skipped by patient')}
                            className="h-8 px-3 text-slate-600 hover:text-slate-900 text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Skip
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Alert set (7:45 PM)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent Medical Records */}
          <section className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Recent Medical Records
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified clinical reports and laboratory summaries
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('medical-records')}
                className="text-xs font-medium text-teal-700 hover:text-teal-800 cursor-pointer"
              >
                Browse All {totalReportsCount} &rarr;
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">description</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                          {report.title}
                        </h3>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {report.fileSizeFormatted}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                        <span>{report.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{report.testDate}</span>
                        <span aria-hidden="true">·</span>
                        <span>{report.clinicProvider}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      type="button"
                      onClick={() => {
                        setSelectedReportId(report.id);
                        setActiveTab('medical-records');
                      }}
                    >
                      View
                    </button>
                    <button
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Download document"
                      type="button"
                      onClick={() => downloadReport(report)}
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Next Appointment Card */}
          {nextAppointment && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Next Appointment</span>
                <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                  In 7 Days
                </span>
              </div>

              <div className="flex items-start gap-3">
                <img
                  className="w-11 h-11 rounded-lg object-cover shrink-0"
                  src={nextAppointment.doctorAvatar}
                  alt={nextAppointment.doctorName}
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {nextAppointment.doctorName}
                  </h3>
                  <p className="text-xs text-slate-600 truncate">{nextAppointment.doctorTitle}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {nextAppointment.clinicHospital}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">event</span>
                  <span>{nextAppointment.appointmentDate} · {nextAppointment.appointmentTime}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                  <span className="truncate">{nextAppointment.locationRoom}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddToCalendar}
                  className="h-8 px-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">event</span>
                  <span>Add to Calendar</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Opening facility directions...', 'info')}
                  className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Directions</span>
                </button>
              </div>
            </div>
          )}

          {/* Emergency Health Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900">Emergency Health Card</span>
              <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium">
                ICE Profile
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block">Blood Type</span>
                <span className="text-2xl font-bold text-slate-900 mt-0.5 block">
                  {emergencyCard.bloodType}
                </span>
                <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                  Universal Acceptor
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block">Known Allergies</span>
                <div className="mt-1 space-y-1 text-xs font-medium text-rose-700">
                  {emergencyCard.allergies.map((a) => (
                    <div key={a} className="flex items-center gap-1">
                      <span>•</span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Emergency Contact</span>
                <span className="text-xs font-semibold text-slate-900 block">
                  {emergencyCard.primaryContact.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  {emergencyCard.primaryContact.relationship}
                </span>
              </div>
              <a
                className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white transition-colors flex items-center justify-center"
                href={`tel:${emergencyCard.primaryContact.phone.replace(/[^0-9]/g, '')}`}
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
              </a>
            </div>
          </div>

          {/* Audit Log (Minimalist) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900">Vault Access Trail</span>
              <span className="text-[11px] text-slate-400">Audit Log</span>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 3).map((item) => (
                <div key={item.id} className="text-xs">
                  <p className="font-medium text-slate-800 leading-snug">{item.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.timestamp}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleExportAuditCsv}
                className="w-full py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors cursor-pointer text-center"
              >
                Export Audit Log (CSV)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
