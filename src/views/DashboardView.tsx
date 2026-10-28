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
SUMMARY:Health Appointment: ${nextAppointment.doctorName} (${nextAppointment.specialty})
DESCRIPTION:${nextAppointment.notes || 'Lab test collection & clinical review'}
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
    a.download = `MediVault_${nextAppointment.doctorName.replace(/\s+/g, '_')}.ics`;
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
    a.download = `MediVault_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Audit log exported to CSV.', 'success');
  };

  // 1mg Labs Health Concern Categories
  const healthConcerns = [
    { name: 'Full Body Checkup', tests: '72 Tests', icon: 'health_metrics', color: 'bg-rose-50 text-[#ff6f61]' },
    { name: 'Diabetes Screening', tests: 'HbA1c + Fasting', icon: 'water_drop', color: 'bg-amber-50 text-amber-600' },
    { name: 'Heart & Lipid Profile', tests: '8 Cardiac Biomarkers', icon: 'favorite', color: 'bg-red-50 text-rose-600' },
    { name: 'Thyroid Care', tests: 'T3, T4, TSH Profile', icon: 'medication_liquid', color: 'bg-purple-50 text-purple-600' },
    { name: 'Liver & Kidney', tests: 'LFT + KFT Complete', icon: 'vital_signs', color: 'bg-blue-50 text-blue-600' },
    { name: 'Vitamins & Iron', tests: 'D3, B12, Ferritin', icon: 'sunny', color: 'bg-emerald-50 text-emerald-600' },
  ];

  // 1mg Labs Signature Popular Packages
  const popularPackages = [
    {
      title: 'Comprehensive Gold Full Body Checkup',
      testsCount: '78 Tests Included',
      turnaround: 'Digital Smart Report in 24 Hrs',
      fasting: '10-12 hrs fasting required',
      sample: 'Blood & Urine sample at home',
      accreditation: 'NABL Certified',
      badge: 'Most Popular',
    },
    {
      title: 'Advanced Cardiac & Lipid Risk Assessment',
      testsCount: '14 Cardiac Markers',
      turnaround: 'Smart Report in 18 Hrs',
      fasting: '12 hrs fasting required',
      sample: 'Blood draw with phlebotomist',
      accreditation: 'CAP Accredited',
      badge: 'Doctor Recommended',
    },
  ];

  return (
    <div className="flex flex-col w-full gap-6 max-w-7xl mx-auto">
      {/* 1mg Style Hero Banner */}
      <div className="bg-gradient-to-r from-[#fff2ef] via-white to-neutral-50 rounded-2xl p-6 sm:p-8 border border-[#ff6f61]/20 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-2 flex-wrap">
              <span className="text-[#ff6f61] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff6f61]"></span>
                NABL Accredited Diagnostics
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-neutral-700">Health ID: {profile.healthId}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold">
                100% Certified Phlebotomists
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
              Diagnostic Health Records &amp; Medicine Tracker
            </h1>
            <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
              Book doorstep lab sample pickup, monitor digital biomarker trends, and manage your daily medication reminders with clinical precision.
            </p>

            {/* Adherence Mini Status Bar (1mg style) */}
            <div className="mt-4 p-3 bg-white/80 rounded-xl border border-neutral-200/80 shadow-2xs max-w-lg">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#ff6f61]">alarm_on</span>
                  <span>Today's Medication Doses</span>
                </span>
                <span className="font-mono font-bold text-[#ff6f61] tabular-nums">
                  {takenDosesCount} of {totalScheduledToday || 4} Confirmed
                </span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#ff6f61] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(((takenDosesCount) / (totalScheduledToday || 4)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Quick Action Buttons (1mg coral + clean white) */}
            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <button
                className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-[#ff6f61] hover:bg-[#e55345] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
                type="button"
                onClick={() => setAddAptModalOpen(true)}
              >
                <span className="material-symbols-outlined text-[18px]">biotechnology</span>
                <span>Book Lab Test / Home Pickup</span>
              </button>

              <button
                className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
                type="button"
                onClick={() => setUploadModalOpen(true)}
              >
                <span className="material-symbols-outlined text-[18px] text-[#ff6f61]">upload_file</span>
                <span>Upload Prescription / Lab Report</span>
              </button>

              <button
                className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                type="button"
                onClick={() => setAddMedModalOpen(true)}
              >
                <span className="material-symbols-outlined text-[16px]">add_alarm</span>
                <span>Add Medicine</span>
              </button>
            </div>
          </div>

          {/* 1mg Home Sample Collection Visual Spotlight Card */}
          <div className="w-full lg:w-72 shrink-0 bg-white rounded-xl border border-[#ff6f61]/25 overflow-hidden shadow-xs flex flex-col">
            <div className="relative h-32 w-full overflow-hidden bg-neutral-100">
              <img
                src="/src/assets/images/home_sample_pickup_1793209760555.jpg"
                alt="Phlebotomist conducting doorstep blood sample collection"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 bg-[#ff6f61] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                Free Home Pickup
              </span>
            </div>
            <div className="p-3 flex flex-col justify-between flex-1 gap-2">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 leading-snug">
                  Doorstep Blood Sample Collection
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">
                  Certified phlebotomists follow 100% sterile protocols with temperature-controlled cold chain.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAddAptModalOpen(true);
                  showToast('Scheduling doorstep phlebotomist collection...', 'info');
                }}
                className="w-full py-1.5 bg-[#fff2ef] hover:bg-[#ffe4de] text-[#ff6f61] text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Schedule Sample Pickup</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1mg Labs 4-Pillar Trust Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#ff6f61]/15 text-xs text-neutral-700">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff6f61] text-[20px]">verified</span>
            <div>
              <span className="font-bold block">100% Certified Labs</span>
              <span className="text-[10px] text-neutral-500">NABL &amp; CAP accredited</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff6f61] text-[20px]">home_health</span>
            <div>
              <span className="font-bold block">Free Home Sample Pickup</span>
              <span className="text-[10px] text-neutral-500">Temperature controlled</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff6f61] text-[20px]">mark_email_read</span>
            <div>
              <span className="font-bold block">Smart Reports in 24h</span>
              <span className="text-[10px] text-neutral-500">Instant PDF &amp; vault sync</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff6f61] text-[20px]">support_agent</span>
            <div>
              <span className="font-bold block">Doctor Consultation</span>
              <span className="text-[10px] text-neutral-500">Post-test guidance</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1mg Labs Health Concern Circles */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 flex flex-col gap-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-neutral-900 tracking-tight">
              Explore Popular Diagnostic Packages &amp; Checkups
            </h2>
            <span className="text-[10px] font-bold text-[#ff6f61] bg-[#fff2ef] px-2 py-0.5 rounded-full">
              Recommended
            </span>
          </div>
          <button
            onClick={() => setActiveTab('medical-records')}
            className="text-xs font-bold text-[#ff6f61] hover:underline cursor-pointer"
          >
            View All Tests &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {healthConcerns.map((item) => (
            <div
              key={item.name}
              onClick={() => {
                setActiveTab('medical-records');
                showToast(`Filtering tests for ${item.name}`, 'info');
              }}
              className="p-3 rounded-xl border border-neutral-200/90 hover:border-[#ff6f61] hover:bg-[#fff2ef]/30 transition-all cursor-pointer group text-center flex flex-col items-center justify-center gap-2"
            >
              <div className={`w-11 h-11 rounded-full ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-800 block leading-tight group-hover:text-[#ff6f61]">
                  {item.name}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5 font-medium">{item.tests}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 4 Summary Metrics (1mg Cards Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Diagnostic Reports */}
        <div
          onClick={() => setActiveTab('medical-records')}
          className="bg-white rounded-xl p-4 border border-neutral-200 hover:border-[#ff6f61] transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-bold text-neutral-700">Diagnostic Reports</span>
            <span className="text-[10px] text-[#ff6f61] font-bold bg-[#fff2ef] px-2 py-0.5 rounded">
              Verified
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-neutral-900 tracking-tight tabular-nums">
                {totalReportsCount}
              </span>
              <span className="text-xs text-neutral-400">reports</span>
            </div>
            <span className="material-symbols-outlined text-[24px] text-[#ff6f61] group-hover:scale-110 transition-transform">
              lab_profile
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Latest: Quest Panel (Normal)</span>
            <span className="text-[#ff6f61] font-bold">Open Vault &rarr;</span>
          </div>
        </div>

        {/* Metric 2: Medication Regimen */}
        <div
          onClick={() => setActiveTab('medicines')}
          className="bg-white rounded-xl p-4 border border-neutral-200 hover:border-[#ff6f61] transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-bold text-neutral-700">Active Regimen</span>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded">
              Refill Sync
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-neutral-900 tracking-tight tabular-nums">
                {activeMedsCount}
              </span>
              <span className="text-xs text-neutral-400">medicines</span>
            </div>
            <span className="material-symbols-outlined text-[24px] text-amber-500 group-hover:scale-110 transition-transform">
              medication
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span className="truncate">Next: Metformin at 1:00 PM</span>
            <span className="text-[#ff6f61] font-bold shrink-0">Log Dose &rarr;</span>
          </div>
        </div>

        {/* Metric 3: Upcoming Consultations */}
        <div
          onClick={() => setActiveTab('appointments')}
          className="bg-white rounded-xl p-4 border border-neutral-200 hover:border-[#ff6f61] transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-bold text-neutral-700">Upcoming Tests &amp; Visits</span>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
              Scheduled
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-neutral-900 tracking-tight tabular-nums">
                {upcomingAptsCount}
              </span>
              <span className="text-xs text-neutral-400">scheduled</span>
            </div>
            <span className="material-symbols-outlined text-[24px] text-blue-600 group-hover:scale-110 transition-transform">
              calendar_month
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span className="truncate">{nextAppointment ? nextAppointment.doctorName : 'None'}</span>
            <span className="text-neutral-800 font-bold shrink-0">Details &rarr;</span>
          </div>
        </div>

        {/* Metric 4: Health Security & Emergency */}
        <div className="bg-white rounded-xl p-4 border border-neutral-200 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-bold text-neutral-700">Emergency Health Pass</span>
            <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
              ICE Ready
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                {emergencyCard.bloodType}
              </span>
              <span className="text-xs text-neutral-500">Blood Group</span>
            </div>
            <span className="material-symbols-outlined text-[24px] text-rose-600">emergency</span>
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>ICE: {emergencyCard.primaryContact.name.split(' ')[0]}</span>
            <span className="text-emerald-700 font-bold">24/7 Active</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: 8 cols left, 4 cols right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Today's Medicine Reminders (1mg Clean Pillbox Style) */}
          <section className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-neutral-900">
                    Today’s Medicine Schedule
                  </h2>
                  <span className="text-[11px] bg-[#fff2ef] text-[#c93325] px-2 py-0.5 rounded-full font-bold">
                    Adherence Tracker
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Automated clinical dosage reminders synced with your digital care plan
                </p>
              </div>

              {/* Segmented Filter */}
              <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs">
                {(['All Times', 'Morning', 'Afternoon', 'Evening'] as const).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setScheduleFilter(slot)}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      scheduleFilter === slot
                        ? 'bg-white text-neutral-900 font-bold shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Items List */}
            <div className="flex flex-col divide-y divide-neutral-100 mt-2">
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
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isTaken
                            ? 'bg-emerald-50 text-emerald-700'
                            : isDue
                            ? 'bg-[#fff2ef] text-[#ff6f61]'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {isTaken ? 'check_circle' : isDue ? 'alarm' : 'schedule'}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-neutral-900">
                            {medication.name}
                          </h3>
                          <span className="text-xs text-neutral-500 font-medium">
                            {medication.dosage}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              isTaken
                                ? 'bg-emerald-50 text-emerald-700'
                                : isDue
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {isTaken ? 'Taken' : isDue ? `Due Now (${time})` : 'Upcoming'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                          <span>Scheduled: {time}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {notes ||
                              (isTaken
                                ? 'Confirmed on-time with water'
                                : medication.mealInstruction || 'Daily maintenance')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      {isTaken ? (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          Dose Confirmed
                        </span>
                      ) : isDue ? (
                        <>
                          <button
                            type="button"
                            onClick={() => logDose(medication.id, 'taken')}
                            className="h-8 px-4 bg-[#ff6f61] hover:bg-[#e55345] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            Take Now
                          </button>
                          <button
                            type="button"
                            onClick={() => logDose(medication.id, 'skipped', 'Skipped by patient')}
                            className="h-8 px-3 text-neutral-600 hover:text-neutral-900 text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Skip
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-neutral-400 font-medium">
                          Alert scheduled
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent Diagnostic Reports (1mg Labs Card Style) */}
          <section className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h2 className="text-base font-extrabold text-neutral-900">
                  Diagnostic Smart Reports
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  NABL accredited pathology and imaging reports with clinical interpretation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('medical-records')}
                className="text-xs font-bold text-[#ff6f61] hover:underline transition-colors cursor-pointer"
              >
                Browse All {totalReportsCount} &rarr;
              </button>
            </div>

            <div className="divide-y divide-neutral-100">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#fff2ef] text-[#ff6f61] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">science</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-neutral-900 truncate">
                          {report.title}
                        </h3>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {report.fileSizeFormatted}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5 flex-wrap">
                        <span className="font-semibold text-[#ff6f61]">{report.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{report.testDate}</span>
                        <span aria-hidden="true">·</span>
                        <span>{report.clinicProvider}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      className="px-3 py-1.5 bg-neutral-50 hover:bg-[#fff2ef] text-neutral-700 hover:text-[#ff6f61] border border-neutral-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      type="button"
                      onClick={() => {
                        setSelectedReportId(report.id);
                        setActiveTab('medical-records');
                      }}
                    >
                      Smart View
                    </button>
                    <button
                      className="p-1.5 text-neutral-500 hover:text-[#ff6f61] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                      title="Download PDF report"
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
          {/* Upcoming Consultation / Home Sample Card */}
          {nextAppointment && (
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
                  Upcoming Appointment
                </span>
                <span className="text-[10px] text-[#ff6f61] font-bold bg-[#fff2ef] px-2 py-0.5 rounded">
                  Confirmed
                </span>
              </div>

              <div className="flex items-start gap-3">
                <img
                  className="w-12 h-12 rounded-xl object-cover shrink-0 ring-1 ring-neutral-200"
                  src={nextAppointment.doctorAvatar}
                  alt={nextAppointment.doctorName}
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-neutral-900 truncate">
                    {nextAppointment.doctorName}
                  </h3>
                  <p className="text-xs text-[#ff6f61] font-semibold truncate">
                    {nextAppointment.specialty}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    {nextAppointment.clinicHospital}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl space-y-1.5 text-xs text-neutral-600">
                <div className="flex items-center gap-2 font-bold text-neutral-900">
                  <span className="material-symbols-outlined text-[16px] text-[#ff6f61]">event</span>
                  <span>{nextAppointment.appointmentDate} · {nextAppointment.appointmentTime}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <span className="material-symbols-outlined text-[16px] text-neutral-400">location_on</span>
                  <span className="truncate">{nextAppointment.locationRoom}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddToCalendar}
                  className="h-8 px-2.5 bg-[#ff6f61] hover:bg-[#e55345] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[15px]">calendar_add_on</span>
                  <span>Calendar</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Opening location directions...', 'info')}
                  className="h-8 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px] text-neutral-500">near_me</span>
                  <span>Directions</span>
                </button>
              </div>
            </div>
          )}

          {/* 1mg Labs Featured Package Spotlight */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs flex flex-col">
            <div className="relative h-32 w-full overflow-hidden bg-neutral-100">
              <img
                src="/src/assets/images/lab_blood_testing_1793209760590.jpg"
                alt="Clinical blood test vacutainers in automated testing lab"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-white bg-[#ff6f61] px-2 py-0.5 rounded shadow-xs">
                  {popularPackages[0].badge}
                </span>
                <span className="text-[10px] font-bold text-neutral-800 bg-white/95 px-2 py-0.5 rounded shadow-xs">
                  NABL Certified
                </span>
              </div>
              <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                <span className="text-[11px] font-bold drop-shadow-xs">100% Barcoded Sample Integrity</span>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-3">
              <div>
                <h4 className="text-sm font-extrabold text-neutral-900 leading-snug">
                  {popularPackages[0].title}
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  {popularPackages[0].testsCount} · {popularPackages[0].turnaround}
                </p>
                <div className="mt-2 text-[11px] text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-neutral-700">
                    <span className="material-symbols-outlined text-[14px] text-emerald-600">check</span>
                    <span>{popularPackages[0].sample}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-700">
                    <span className="material-symbols-outlined text-[14px] text-amber-600">info</span>
                    <span>{popularPackages[0].fasting}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setAddAptModalOpen(true);
                  showToast('Booking Home Sample Collection...', 'success');
                }}
                className="w-full py-2 bg-[#ff6f61] hover:bg-[#e55345] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">home_health</span>
                <span>Book Home Sample Collection</span>
              </button>
            </div>
          </div>

          {/* Emergency SOS Pass */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-1.5 text-rose-700">
                <span className="material-symbols-outlined text-[18px]">emergency</span>
                <span className="text-xs font-bold uppercase tracking-wider">Emergency ICE Card</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">Blood Group: {emergencyCard.bloodType}</span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase font-bold">ICE Contact</span>
                <span className="font-bold text-neutral-900 block">
                  {emergencyCard.primaryContact.name} ({emergencyCard.primaryContact.relationship})
                </span>
                <span className="text-[11px] text-neutral-600 font-mono">
                  {emergencyCard.primaryContact.phone}
                </span>
              </div>
              <a
                className="w-8 h-8 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center justify-center shadow-xs"
                href={`tel:${emergencyCard.primaryContact.phone.replace(/[^0-9]/g, '')}`}
                title="Call ICE Contact"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
              </a>
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleExportAuditCsv}
                className="w-full py-1.5 text-xs text-neutral-600 hover:text-[#ff6f61] hover:bg-neutral-50 rounded-lg font-bold transition-colors cursor-pointer text-center"
              >
                Export Audit Trail (CSV)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
