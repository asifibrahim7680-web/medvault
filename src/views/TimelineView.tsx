import React, { useState, useMemo } from 'react';
import { useMediVault } from '../context/MediVaultContext';

export const TimelineView: React.FC = () => {
  const {
    timelineEvents,
    careProviders,
    downloadReport,
    reports,
    setExportSummaryModalOpen,
    setAddAptModalOpen,
    showToast,
  } = useMediVault();

  const [selectedYear, setSelectedYear] = useState<'2024' | '2023' | '2022' | 'All Time'>('2024');
  const [selectedFilter, setSelectedFilter] = useState<string>('All Events');
  const [eventSearch, setEventSearch] = useState('');
  const [syncing, setSyncing] = useState(false);

  const filters = [
    { label: 'All Events (18)', value: 'All Events' },
    { label: 'Diagnoses', value: 'diagnosis' },
    { label: 'Procedures', value: 'surgery' },
    { label: 'Lab Milestones', value: 'lab' },
    { label: 'Consultations', value: 'consultation' },
  ];

  const filteredEvents = useMemo(() => {
    return timelineEvents.filter((evt) => {
      if (selectedYear !== 'All Time' && evt.year.toString() !== selectedYear) return false;
      if (selectedFilter !== 'All Events' && evt.type !== selectedFilter) return false;
      if (eventSearch.trim()) {
        const query = eventSearch.toLowerCase();
        return (
          evt.title.toLowerCase().includes(query) ||
          evt.description.toLowerCase().includes(query) ||
          evt.clinic.toLowerCase().includes(query) ||
          evt.doctor.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [timelineEvents, selectedYear, selectedFilter, eventSearch]);

  const handleSyncNow = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      showToast('FHIR Health gateway synchronized. All 6 clinical providers up to date.', 'success');
    }, 1200);
  };

  const handleDownloadAttachment = (attachmentName: string) => {
    const matchingReport = reports.find(
      (r) =>
        r.fileName.toLowerCase().includes(attachmentName.toLowerCase()) ||
        r.title.toLowerCase().includes(attachmentName.toLowerCase())
    );
    if (matchingReport) {
      downloadReport(matchingReport);
    } else {
      const blob = new Blob(
        [`Authentic Medical Document: ${attachmentName}\nPatient: Sarah Jenkins\nEnclave Verified`],
        { type: 'text/plain' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachmentName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Attachment ${attachmentName} downloaded.`, 'success');
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Verified Clinical History</span>
            <span aria-hidden="true">·</span>
            <span>Record #MV-7749</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Medical History &amp; Health Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological journey of diagnoses, clinical procedures, and laboratory milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
            type="button"
            onClick={() => setExportSummaryModalOpen(true)}
          >
            <span className="material-symbols-outlined text-[15px]">share</span>
            <span>Share with Doctor</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
            type="button"
            onClick={() => setExportSummaryModalOpen(true)}
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>Export Summary</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Year segmented control */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
          {(['2024', '2023', '2022', 'All Time'] as const).map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedYear === year
                  ? 'bg-white text-slate-900 font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[16px]">
            search
          </span>
          <input
            className="w-full h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white"
            placeholder="Filter health events..."
            type="text"
            value={eventSearch}
            onChange={(e) => setEventSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        {filters.map((f) => {
          const isActive = selectedFilter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setSelectedFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* 8 cols Timeline + 4 cols Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Spine Stream */}
        <div className="lg:col-span-8 flex flex-col pl-6 relative">
          {/* Hairline connector line */}
          <div className="absolute left-2.5 top-3 bottom-6 w-px bg-slate-200"></div>

          <div className="space-y-6">
            {filteredEvents.map((evt) => (
              <div key={evt.id} className="relative group">
                {/* Clean dot pin */}
                <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-teal-700 flex items-center justify-center shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-700"></div>
                </div>

                {/* Event Card */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-teal-700">{evt.typeLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{evt.date}</span>
                    </div>

                    {evt.badge && (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {evt.badge.text}
                      </span>
                    )}
                  </div>

                  <h2 className="text-base font-semibold text-slate-900">{evt.title}</h2>

                  <div className="text-xs text-slate-500 mt-1 mb-2">
                    {evt.clinic} · {evt.doctor}
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                    {evt.description}
                  </p>

                  {/* Metrics */}
                  {evt.metrics && (
                    <div className="grid grid-cols-3 gap-2 mb-3 pt-2 border-t border-slate-100 text-xs">
                      {evt.metrics.map((m) => (
                        <div key={m.label} className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-[11px] text-slate-400 block">{m.label}</span>
                          <span className="text-sm font-semibold text-slate-900 font-mono">
                            {m.value}
                          </span>
                          <span className="text-[10px] text-emerald-700 block">{m.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline ECG Lead II trace */}
                  {evt.ecgStrip && (
                    <div className="p-2.5 bg-slate-50 rounded-lg mb-3">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>12-Lead Rhythm Strip Lead II (Sinus Rhythm)</span>
                        <span className="font-mono">68 BPM · QTc 410ms</span>
                      </div>
                      <div className="w-full h-10 bg-white rounded flex items-center px-2 border border-slate-100 overflow-hidden">
                        <svg className="w-full h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 600 40">
                          <path
                            d="M0 20 L40 20 L50 20 L55 16 L60 20 L68 20 L72 32 L78 2 L84 26 L88 20 L96 20 L106 14 L114 20 L160 20 L170 20 L175 16 L180 20 L188 20 L192 32 L198 2 L204 26 L208 20 L216 20 L226 14 L234 20 L280 20 L290 20 L295 16 L300 20 L308 20 L312 32 L318 2 L324 26 L328 20 L336 20 L346 14 L354 20 L400 20 L410 20 L415 16 L420 20 L428 20 L432 32 L438 2 L444 26 L448 20 L456 20 L466 14 L474 20 L520 20 L530 20 L535 16 L540 20 L548 20 L552 32 L558 2 L564 26 L568 20 L576 20 L586 14 L594 20 L600 20"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {evt.attachments && evt.attachments.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      {evt.attachments.map((att) => (
                        <div
                          key={att.name}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">
                              description
                            </span>
                            <span className="font-medium text-slate-800">{att.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownloadAttachment(att.name)}
                            className="text-teal-700 hover:underline cursor-pointer"
                          >
                            View &rarr;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {evt.prescriptionBadge && (
                    <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <span className="font-medium text-slate-900 block">
                          {evt.prescriptionBadge.name}
                        </span>
                        <span className="text-slate-500">{evt.prescriptionBadge.detail}</span>
                      </div>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                        Active Rx
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Insights Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Condition Trajectory Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <span className="font-semibold text-slate-900">Condition Trajectory</span>
              <span className="text-slate-400">2024 Overview</span>
            </div>

            {/* Blood Pressure */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Systolic Blood Pressure</span>
                <span className="font-bold font-mono text-emerald-700">122 mmHg (-16)</span>
              </div>
              <div className="h-12 w-full pt-1">
                <svg className="w-full h-full" viewBox="0 0 240 40">
                  <path
                    d="M 0 8 Q 60 14 120 24 T 240 32"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2"
                  ></path>
                  <circle cx="0" cy="8" r="3" fill="#059669"></circle>
                  <circle cx="80" cy="18" r="3" fill="#059669"></circle>
                  <circle cx="160" cy="28" r="3" fill="#059669"></circle>
                  <circle cx="240" cy="32" r="3.5" fill="#059669"></circle>
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>Jan (138)</span>
                <span>Apr (132)</span>
                <span>Aug (126)</span>
                <span>Nov (122)</span>
              </div>
            </div>

            <div className="h-px bg-slate-100"></div>

            {/* Total Cholesterol */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Total Cholesterol</span>
                <span className="font-bold font-mono text-teal-700">184 mg/dL</span>
              </div>
              <div className="h-12 w-full pt-1">
                <svg className="w-full h-full" viewBox="0 0 240 40">
                  <path
                    d="M 0 10 Q 60 15 120 22 T 240 30"
                    fill="none"
                    stroke="#0f766e"
                    strokeWidth="2"
                  ></path>
                  <circle cx="0" cy="10" r="3" fill="#0f766e"></circle>
                  <circle cx="120" cy="22" r="3" fill="#0f766e"></circle>
                  <circle cx="240" cy="30" r="3.5" fill="#0f766e"></circle>
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>Jan (218)</span>
                <span>Jun (198)</span>
                <span>Nov (184)</span>
              </div>
            </div>
          </div>

          {/* Care Team Directory */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <span className="font-semibold text-slate-900">Care Team Directory</span>
              <span className="text-slate-400">{careProviders.length} Providers</span>
            </div>

            <div className="space-y-3">
              {careProviders.map((physician) => (
                <div key={physician.id} className="flex items-center gap-3">
                  <img
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                    src={physician.avatar}
                    alt={physician.name}
                  />
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-semibold text-slate-900 truncate">{physician.name}</p>
                    <p className="text-slate-400 truncate">{physician.specialty} · {physician.clinic}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setAddAptModalOpen(true)}
              className="mt-2 py-1.5 w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg text-center cursor-pointer transition-colors"
            >
              Add Care Provider / Book Visit
            </button>
          </div>

          {/* FHIR Gateway Sync */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 text-xs flex flex-col gap-2">
            <span className="font-semibold text-slate-900">FHIR Health Gateway Sync</span>
            <p className="text-slate-500">
              4 clinics and 2 labs connected. All new diagnostic reports sync automatically to your timeline.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {syncing ? 'Syncing...' : 'Last sync: 14m ago'}
              </span>
              <button
                type="button"
                onClick={handleSyncNow}
                className="text-teal-700 font-medium hover:underline cursor-pointer"
              >
                Sync Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
