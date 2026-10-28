import React, { useState } from 'react';
import { useMediVault } from '../context/MediVaultContext';
import { Medication } from '../types';

export const MedicinesView: React.FC = () => {
  const {
    medications,
    doseLogs,
    logDose,
    requestRefill,
    deleteMedication,
    setAddMedModalOpen,
    showToast,
  } = useMediVault();

  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'active' | 'past' | 'alerts'>('schedule');
  const [dateRangeFilter, setDateRangeFilter] = useState('Past 7 Days');
  const [loggingMedId, setLoggingMedId] = useState<string | null>(null);

  // Modals for confirmation
  const [skipModalMed, setSkipModalMed] = useState<Medication | null>(null);
  const [skipReason, setSkipReason] = useState<string>('Physician advised temporary pause');
  const [deleteConfirmMed, setDeleteConfirmMed] = useState<Medication | null>(null);

  const activeMeds = medications.filter((m) => m.status === 'active');
  const pastMeds = medications.filter((m) => m.status === 'discontinued');
  const alertMeds = medications.filter((m) => m.status === 'active' && m.remainingPills <= m.refillThresholdDays);

  const handlePrintMedCard = () => {
    window.print();
  };

  const handleExportAdherenceCsv = () => {
    const header = 'Medication,Dose,Date,Scheduled Time,Recorded Time,Status,Clinical Notes\n';
    const rows = doseLogs
      .map(
        (l) =>
          `"${l.medicationName}","${l.dosage}","${l.date}","${l.scheduledTime}","${l.recordedTime}","${l.status}","${l.clinicalNotes || ''}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediVault_Adherence_Log_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Daily Adherence Audit Log exported as CSV.', 'success');
  };

  const handleQuickLog = (medId: string) => {
    setLoggingMedId(medId);
    logDose(medId, 'taken');
    setTimeout(() => {
      setLoggingMedId(null);
    }, 2000);
  };

  const handleConfirmSkip = () => {
    if (!skipModalMed) return;
    logDose(skipModalMed.id, 'skipped', skipReason);
    setSkipModalMed(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmMed) return;
    deleteMedication(deleteConfirmMed.id);
    setDeleteConfirmMed(null);
  };

  const handleSnoozeReminder = (medName: string) => {
    showToast(`Reminder for ${medName} snoozed for 30 minutes.`, 'info');
  };

  // Group medications by time periods for the Healthify-inspired visual Pillbox
  const timePeriodSlots = [
    {
      id: 'Morning',
      label: 'Morning Regimen',
      timeDesc: 'Around 8:00 AM (Breakfast)',
      icon: 'wb_sunny',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      meds: activeMeds.filter((m) => m.timePeriod === 'Morning'),
    },
    {
      id: 'Afternoon',
      label: 'Midday / Afternoon',
      timeDesc: 'Around 1:00 PM (Lunch)',
      icon: 'wb_twilight',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      meds: activeMeds.filter((m) => m.timePeriod === 'Afternoon'),
    },
    {
      id: 'Evening',
      label: 'Evening / Dinner',
      timeDesc: 'Around 8:00 PM (Dinner)',
      icon: 'nightlight_round',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      meds: activeMeds.filter((m) => m.timePeriod === 'Evening' || m.timePeriod === 'Bedtime'),
    },
    {
      id: 'PRN',
      label: 'As-Needed / Rescue Devices (PRN)',
      timeDesc: 'Take only as needed for acute symptoms',
      icon: 'emergency',
      color: 'text-teal-700 bg-teal-50 border-teal-200',
      meds: activeMeds.filter((m) => m.isPrn),
    },
  ];

  return (
    <div className="flex flex-col w-full gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Prescription Management</span>
            <span aria-hidden="true">·</span>
            <span className="text-teal-700 font-medium">{activeMeds.length} Active Regimens</span>
            <span aria-hidden="true">·</span>
            <span>Minimal Healthify Pillbox</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Medicines &amp; Adherence Tracker
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
            type="button"
            onClick={handlePrintMedCard}
          >
            <span className="material-symbols-outlined text-[15px]">print</span>
            <span>Print Medication Card</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-[#ff6f61] hover:bg-[#e55345] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            type="button"
            onClick={() => setAddMedModalOpen(true)}
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Hero Strip: Score (8 cols) + Refill Card (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Score Card */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-neutral-200 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-neutral-100 stroke-current"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    strokeWidth="8"
                  ></circle>
                  <circle
                    className="text-[#ff6f61] stroke-current"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    strokeDasharray="251.32"
                    strokeDashoffset="10.05"
                    strokeLinecap="round"
                    strokeWidth="8"
                  ></circle>
                </svg>
                <span className="absolute text-sm font-bold text-neutral-900 font-mono">96%</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Clinical Target Met
                </span>
                <h2 className="text-base font-extrabold text-neutral-900 mt-1">
                  7-Day Adherence Performance
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  You've taken <strong className="text-neutral-900">27 of 28</strong> scheduled doses this week.
                </p>
              </div>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 border-neutral-100 pt-2 sm:pt-0 w-full sm:w-auto">
              <span className="text-xs text-neutral-400 block">Streak</span>
              <span className="text-xl font-extrabold text-[#ff6f61] font-mono">14 Days</span>
              <span className="text-[11px] text-emerald-700 block mt-0.5">+4.2% vs last month</span>
            </div>
          </div>

          {/* 7-Day Mini Strip */}
          <div className="grid grid-cols-7 gap-2 mt-4 pt-3 border-t border-neutral-100 text-xs">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'TODAY'].map((day) => {
              const isToday = day === 'TODAY';
              const isMissed = day === 'THU';
              return (
                <div
                  key={day}
                  className={`flex flex-col items-center py-2 px-1 rounded-lg text-center ${
                    isToday ? 'bg-[#fff2ef]' : isMissed ? 'bg-amber-50' : 'bg-neutral-50'
                  }`}
                >
                  <span className="text-[10px] text-neutral-400 font-medium">{day}</span>
                  <span
                    className={`material-symbols-outlined text-[16px] my-1 ${
                      isMissed ? 'text-amber-600' : isToday ? 'text-[#ff6f61]' : 'text-emerald-600'
                    }`}
                  >
                    {isMissed ? 'warning' : 'check'}
                  </span>
                  <span
                    className={`text-[11px] font-mono font-medium ${
                      isToday ? 'text-[#ff6f61] font-bold' : isMissed ? 'text-amber-800' : 'text-neutral-700'
                    }`}
                  >
                    {isMissed ? '3/4' : isToday ? '3/4' : '4/4'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Refill Insight Card */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <span className="font-bold text-[#f58220] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">local_pharmacy</span>
                Pharmacy Refill Alert
              </span>
              <span className="text-[11px] font-mono text-rose-600 font-semibold">8 Pills Left</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-3">
              Lisinopril 10 mg
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Prescription running low. Order with fast doorstep delivery to maintain treatment continuity.
            </p>
            <div className="mt-3 p-2.5 bg-orange-50/50 rounded-lg text-xs flex justify-between text-slate-700 border border-orange-100">
              <span className="font-medium text-[#c2410c]">Direct Pharmacy Delivery</span>
              <span className="font-semibold text-slate-900">Dr. Rajesh Sharma</span>
            </div>
          </div>

          <button
            className="w-full mt-4 h-9 bg-[#f58220] hover:bg-[#e06d0c] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            type="button"
            onClick={() => requestRefill('med-lisinopril')}
          >
            <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
            <span>Order Doorstep Refill</span>
          </button>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs">
        <button
          className={`px-3.5 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'schedule'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          onClick={() => setActiveSubTab('schedule')}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">view_timeline</span>
          <span>Daily Pillbox Schedule</span>
        </button>
        <button
          className={`px-3.5 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'active'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          onClick={() => setActiveSubTab('active')}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">medication</span>
          <span>Active Regimens ({activeMeds.length})</span>
        </button>
        <button
          className={`px-3.5 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'past'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          onClick={() => setActiveSubTab('past')}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">history</span>
          <span>Past / Discontinued ({pastMeds.length})</span>
        </button>
        <button
          className={`px-3.5 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'alerts'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          onClick={() => setActiveSubTab('alerts')}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">notifications</span>
          <span>Refill Alerts ({alertMeds.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: HEALTHIFY-INSPIRED MINIMAL DAILY PILLBOX SCHEDULE */}
      {activeSubTab === 'schedule' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">calendar_view_day</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Today's Visual Dose Schedule</h3>
                <p className="text-slate-500">Grouped by time slot according to your physician's regimen instructions.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Tap card action to log instantly</span>
            </div>
          </div>

          <div className="space-y-6">
            {timePeriodSlots.map((slot) => {
              if (slot.meds.length === 0) return null;
              return (
                <div key={slot.id} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-md border text-xs flex items-center justify-center ${slot.color}`}>
                        <span className="material-symbols-outlined text-[16px]">{slot.icon}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">{slot.label}</h3>
                      <span className="text-xs text-slate-400 font-normal">({slot.timeDesc})</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400 font-medium">
                      {slot.meds.length} {slot.meds.length === 1 ? 'dose' : 'doses'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {slot.meds.map((med) => {
                      const isLogging = loggingMedId === med.id;
                      const todaysLog = doseLogs.find((l) => l.medicationId === med.id && l.date.includes('Today'));
                      const isTaken = todaysLog?.status === 'taken' || todaysLog?.status === 'taken_late';
                      const isSkipped = todaysLog?.status === 'skipped';
                      const isDueNow = med.id === 'med-metformin' && !todaysLog;

                      return (
                        <div
                          key={med.id}
                          className={`bg-white rounded-xl p-4 border transition-all flex flex-col justify-between ${
                            isTaken
                              ? 'border-emerald-200 bg-emerald-50/20'
                              : isSkipped
                              ? 'border-rose-200 bg-rose-50/20'
                              : isDueNow
                              ? 'border-amber-300 ring-1 ring-amber-200 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                {/* Pill Form Icon */}
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                    isTaken
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isSkipped
                                      ? 'bg-rose-100 text-rose-800'
                                      : isDueNow
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[20px]">
                                    {med.form.toLowerCase().includes('inhal')
                                      ? 'air'
                                      : med.form.toLowerCase().includes('capsule')
                                      ? 'pill'
                                      : 'medication'}
                                  </span>
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-slate-900">{med.name}</h4>
                                    <span className="text-xs text-slate-500 font-medium">{med.dosage}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {med.mealInstruction || 'Take with water'}
                                  </p>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div>
                                {isTaken ? (
                                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                    Taken {todaysLog?.recordedTime}
                                  </span>
                                ) : isSkipped ? (
                                  <span className="text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">cancel</span>
                                    Skipped
                                  </span>
                                ) : isDueNow ? (
                                  <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded animate-pulse">
                                    Due Now
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    Scheduled
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Clinical Guidance note */}
                            <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                              <span className="truncate">{med.guidance || med.clinicalGuidance || `Rx #${med.rxNumber}`}</span>
                              <span className="text-slate-400 font-mono text-[11px] shrink-0 ml-2">
                                {med.remainingPills} pills left
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions Bar */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-400">
                              {med.isPrn ? 'Rescue Device' : med.nextDoseText || 'Daily Regimen'}
                            </span>

                            <div className="flex items-center gap-2">
                              {!isTaken && !isSkipped && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleSnoozeReminder(med.name)}
                                    title="Snooze reminder for 30m"
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">snooze</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSkipModalMed(med)}
                                    className="px-2.5 py-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md font-medium transition-colors cursor-pointer"
                                  >
                                    Skip
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => handleQuickLog(med.id)}
                                className={`px-3.5 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                                  isTaken
                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
                                }`}
                              >
                                {isLogging ? (
                                  <span>Recorded!</span>
                                ) : isTaken ? (
                                  <>
                                    <span className="material-symbols-outlined text-[14px] text-emerald-600">check</span>
                                    <span>Retake</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="material-symbols-outlined text-[14px]">done</span>
                                    <span>{med.isPrn ? 'Log Puff' : 'Take Now'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: ACTIVE MEDICATIONS GRID */}
      {activeSubTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeMeds.map((med) => {
            const isLow = med.remainingPills <= med.refillThresholdDays;
            const isLogging = loggingMedId === med.id;
            const supplyPct = Math.min(100, Math.round((med.remainingPills / med.totalPills) * 100));

            return (
              <div
                key={med.id}
                className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">{med.name}</h3>
                        <span className="text-xs text-slate-500 font-medium">{med.dosage}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {med.form} · Rx #{med.rxNumber}
                      </p>
                    </div>

                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded font-medium ${
                        isLow ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {med.remainingPills} / {med.totalPills} Left
                    </span>
                  </div>

                  {/* Supply Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isLow ? 'bg-rose-500' : supplyPct > 50 ? 'bg-teal-700' : 'bg-amber-500'
                      }`}
                      style={{ width: `${supplyPct}%` }}
                    ></div>
                  </div>

                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Frequency:</span>
                      <span className="font-medium text-slate-900">{med.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Prescriber:</span>
                      <span>{med.doctorName} ({med.clinic})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Pharmacy:</span>
                      <span>{med.pharmacy}</span>
                    </div>
                    {med.guidance && (
                      <p className="text-slate-500 bg-slate-50 p-2 rounded-lg mt-2 text-[11px] leading-relaxed">
                        {med.guidance}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmMed(med)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    <span>Remove</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isLow && (
                      <button
                        className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-md font-medium cursor-pointer"
                        type="button"
                        onClick={() => requestRefill(med.id)}
                      >
                        Refill
                      </button>
                    )}
                    <button
                      className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md font-medium transition-colors cursor-pointer"
                      type="button"
                      onClick={() => handleQuickLog(med.id)}
                    >
                      {isLogging ? 'Logged!' : med.isPrn ? 'Log Puff' : 'Log Dose'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 3: PAST / DISCONTINUED MEDICATIONS */}
      {activeSubTab === 'past' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500 text-[18px]">history_edu</span>
              <span className="text-slate-700 font-medium">Historical Prescriptions Archive</span>
            </div>
            <span className="text-slate-400">{pastMeds.length} records archived</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastMeds.map((med) => (
              <div key={med.id} className="bg-white rounded-xl p-5 border border-slate-200 opacity-90 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-slate-700 line-through decoration-slate-300">
                        {med.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{med.dosage} · {med.form}</p>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      Discontinued
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg space-y-1">
                    <p><strong className="text-slate-700">Reason:</strong> {med.guidance}</p>
                    <p><strong className="text-slate-700">Prescriber:</strong> {med.doctorName} ({med.clinic})</p>
                    <p><strong className="text-slate-700">Rx Number:</strong> {med.rxNumber}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-right text-xs">
                  <span className="text-slate-400">Archived in HIPAA Clinical Log</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: REFILL ALERTS */}
      {activeSubTab === 'alerts' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-[18px]">warning</span>
              <span className="text-slate-900 font-medium">Medications Requiring Refills</span>
            </div>
            <span className="text-rose-700 font-semibold">{alertMeds.length} Action Needed</span>
          </div>

          {alertMeds.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-xs text-slate-500">
              <span className="material-symbols-outlined text-[32px] text-emerald-600 mb-2">check_circle</span>
              <p className="font-medium text-slate-900">All Prescriptions Well-Stocked</p>
              <p className="mt-1">No active medication has fallen below the safety refill threshold.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alertMeds.map((med) => (
                <div key={med.id} className="bg-white rounded-xl p-5 border border-rose-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{med.name}</h3>
                        <p className="text-xs text-slate-500">{med.dosage} · Rx #{med.rxNumber}</p>
                      </div>
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                        {med.remainingPills} Days Supply Left
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                      Supply has crossed below the safety threshold of {med.refillThresholdDays} days. Request a refill before your next routine dose.
                    </p>

                    <div className="mt-3 p-2 bg-slate-50 rounded text-xs text-slate-600 flex justify-between">
                      <span>{med.pharmacy}</span>
                      <span className="font-medium text-slate-900">{med.doctorName}</span>
                    </div>
                  </div>

                  <button
                    className="w-full mt-4 h-9 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    type="button"
                    onClick={() => requestRefill(med.id)}
                  >
                    Send Refill Request to Pharmacy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Adherence Time Log Table (Minimalist) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Daily Adherence Audit Log
            </h2>
            <p className="text-slate-500 mt-0.5">
              Timestamp verification and recorded patient dose notes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option>Past 7 Days</option>
              <option>Past 14 Days</option>
              <option>Past 30 Days</option>
            </select>
            <button
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg font-medium cursor-pointer"
              type="button"
              onClick={handleExportAdherenceCsv}
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Medication</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Scheduled</th>
                <th className="py-2.5 px-3">Recorded</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {doseLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-medium text-slate-900">
                    {log.medicationName} ({log.dosage})
                  </td>
                  <td className="py-3 px-3 text-slate-500">{log.date}</td>
                  <td className="py-3 px-3 font-mono">{log.scheduledTime}</td>
                  <td className="py-3 px-3 font-mono font-medium">{log.recordedTime}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                        log.status === 'taken'
                          ? 'text-emerald-700 bg-emerald-50'
                          : log.status === 'skipped'
                          ? 'text-rose-700 bg-rose-50'
                          : 'text-blue-700 bg-blue-50'
                      }`}
                    >
                      {log.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{log.clinicalNotes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Disclaimer footer */}
      <div className="p-3 bg-slate-100/70 rounded-xl text-xs text-slate-500 flex items-start gap-2.5 border border-slate-200">
        <span className="material-symbols-outlined text-[18px] text-slate-400 mt-0.5">info</span>
        <p className="leading-relaxed">
          <strong>Important Medical Notice:</strong> MediVault is an intelligent adherence tracking and digital record vault. MediVault does not prescribe medications, recommend dosage adjustments, or provide medical advice. Please consult your physician or pharmacist regarding any changes to your medication schedule.
        </p>
      </div>

      {/* MODAL: SKIP DOSE CONFIRMATION */}
      {skipModalMed && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-lg flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-[20px]">warning</span>
              <h3 className="text-sm font-semibold text-slate-900">Skip {skipModalMed.name}?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Please specify the reason for skipping this scheduled dose ({skipModalMed.dosage}) to maintain an accurate clinical adherence audit log:
            </p>

            <div className="flex flex-col gap-1.5 text-xs">
              {[
                'Physician advised temporary pause',
                'Experiencing adverse side effects',
                'Missed time window / Forgot',
                'Temporarily out of medication stock',
              ].map((reason) => (
                <label key={reason} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="skipReason"
                    checked={skipReason === reason}
                    onChange={() => setSkipReason(reason)}
                    className="text-teal-700 focus:ring-teal-700"
                  />
                  <span className="text-slate-700">{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                onClick={() => setSkipModalMed(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg cursor-pointer"
                onClick={handleConfirmSkip}
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE / REMOVE MEDICATION CONFIRMATION */}
      {deleteConfirmMed && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-lg flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-[20px]">delete</span>
              <h3 className="text-sm font-semibold text-slate-900">Remove Medication?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to remove <strong className="text-slate-900">{deleteConfirmMed.name}</strong> from your active regimen? Past dose logs will remain in your archive.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                onClick={() => setDeleteConfirmMed(null)}
              >
                Keep Regimen
              </button>
              <button
                type="button"
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg cursor-pointer"
                onClick={handleConfirmDelete}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
