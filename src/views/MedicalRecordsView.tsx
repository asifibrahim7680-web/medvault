import React, { useState, useMemo } from 'react';
import { useMediVault } from '../context/MediVaultContext';
import { RecordCategory } from '../types';

export const MedicalRecordsView: React.FC = () => {
  const {
    reports,
    selectedReportId,
    setSelectedReportId,
    selectedReport,
    setUploadModalOpen,
    downloadReport,
    deleteReport,
    setEditMetadataModalReport,
    setExportSummaryModalOpen,
    globalSearch,
    profile,
  } = useMediVault();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Records');
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'upload' | 'alphabetical' | 'provider'>('newest');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'All Records': reports.length,
      'Blood Tests & Labs': 0,
      'Prescriptions & Rx': 0,
      'Imaging & Scans': 0,
      'Specialist Diagnoses': 0,
      'Discharge Summaries': 0,
    };
    reports.forEach((r) => {
      if (counts[r.category] !== undefined) {
        counts[r.category] += 1;
      }
    });
    return counts;
  }, [reports]);

  const filteredReports = useMemo(() => {
    let result = [...reports];
    const searchTerm = (globalSearch || localSearch).toLowerCase().trim();

    if (searchTerm) {
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm) ||
          r.clinicProvider.toLowerCase().includes(searchTerm) ||
          r.doctorName.toLowerCase().includes(searchTerm) ||
          r.statusBadge.toLowerCase().includes(searchTerm) ||
          (r.physicianNote && r.physicianNote.toLowerCase().includes(searchTerm))
      );
    }

    if (selectedCategory !== 'All Records') {
      result = result.filter((r) => r.category === selectedCategory);
    }

    if (filterStartDate) {
      result = result.filter((r) => r.testDate >= filterStartDate);
    }
    if (filterEndDate) {
      result = result.filter((r) => r.testDate <= filterEndDate);
    }
    if (filterProvider) {
      result = result.filter((r) =>
        r.clinicProvider.toLowerCase().includes(filterProvider.toLowerCase())
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.testDate).getTime() - new Date(a.testDate).getTime();
      if (sortBy === 'upload') return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      if (sortBy === 'provider') return a.clinicProvider.localeCompare(b.clinicProvider);
      return 0;
    });

    return result;
  }, [reports, globalSearch, localSearch, selectedCategory, filterStartDate, filterEndDate, filterProvider, sortBy]);

  const categories = [
    'All Records',
    'Blood Tests & Labs',
    'Prescriptions & Rx',
    'Imaging & Scans',
    'Specialist Diagnoses',
    'Discharge Summaries',
  ];

  const activeDoc = selectedReport || filteredReports[0] || reports[0];

  const handleDeleteDoc = (id: string) => {
    deleteReport(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="flex flex-col w-full gap-6 max-w-7xl mx-auto">
      {/* Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Clinical Repository</span>
            <span aria-hidden="true">·</span>
            <span>{reports.length} Encrypted Documents</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Medical Records Library
          </h1>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setViewMode('grid')}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>Grid</span>
            </button>
            <button
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setViewMode('list')}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
              <span>List</span>
            </button>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-8 px-2.5 bg-white text-slate-700 border border-slate-200 text-xs rounded-lg shadow-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-700"
          >
            <option value="newest">Report Date (Newest)</option>
            <option value="upload">Upload Date</option>
            <option value="alphabetical">Title (A-Z)</option>
            <option value="provider">Provider Name</option>
          </select>

          <button
            className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-[#ff6f61] hover:bg-[#e55345] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            onClick={() => setUploadModalOpen(true)}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Upload Report</span>
          </button>
        </div>
      </div>

      {/* Minimal Search & Filter Bar */}
      <div className="bg-white rounded-xl p-3 border border-neutral-200 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-neutral-400 pl-1 text-[18px]">search</span>
          <input
            className="flex-1 bg-transparent py-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            placeholder="Search by test name, lab package, doctor, or biomarker..."
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="text-neutral-400 hover:text-neutral-700 text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              advancedFiltersOpen
                ? 'bg-[#ff6f61] text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">tune</span>
            <span>Filters</span>
          </button>
        </div>

        {advancedFiltersOpen && (
          <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-neutral-500 mb-1">From Date</label>
              <input
                type="date"
                className="w-full h-8 px-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-neutral-500 mb-1">To Date</label>
              <input
                type="date"
                className="w-full h-8 px-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-neutral-500 mb-1">Provider Filter</label>
              <input
                type="text"
                placeholder="e.g. Central Diagnostic Lab"
                className="w-full h-8 px-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* 1mg Style Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          const count = categoryCounts[cat] || 0;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#fff2ef] text-[#ff6f61] border border-[#ff6f61]/40 shadow-2xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
              type="button"
            >
              <span>{cat}</span>
              <span className={`text-[11px] font-mono ${isActive ? 'text-[#ff6f61]' : 'text-neutral-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 1mg Labs Diagnostic Vault Trust Banner */}
      <div className="bg-gradient-to-r from-[#fff2ef] via-white to-neutral-50 rounded-xl p-4 border border-[#ff6f61]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-neutral-200">
            <img
              src="/src/assets/images/lab_blood_testing_1793209760590.jpg"
              alt="Automated diagnostic blood testing lab"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900">
                Accredited Diagnostic Reports Vault
              </span>
              <span className="text-[10px] text-[#ff6f61] font-bold bg-[#fff2ef] px-1.5 py-0.5 rounded">
                NABL Certified
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              All pathology, imaging, and biochemistry reports are verified with cryptographic hash integrity and smart biomarker parsing.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setUploadModalOpen(true)}
          className="shrink-0 h-8 px-3.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[15px] text-[#ff6f61]">add_photo_alternate</span>
          <span>Upload New Report</span>
        </button>
      </div>

      {/* Main View: Cards Grid (8 cols) + Inspector Flyout (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document Cards */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
              <span className="material-symbols-outlined text-[36px] text-slate-300 mb-2">
                find_in_page
              </span>
              <h3 className="text-sm font-semibold text-slate-900">No medical records found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try selecting another category or clearing your search term.
              </p>
              <button
                className="mt-3 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs cursor-pointer"
                onClick={() => {
                  setSelectedCategory('All Records');
                  setLocalSearch('');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {filteredReports.map((report) => {
                const isSelected = activeDoc?.id === report.id;
                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className={`bg-white rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-700 ring-1 ring-teal-700 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Thumbnail with unboxed overlay */}
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-100 mb-3 relative flex items-center justify-center border border-slate-100">
                        <img
                          className="w-full h-full object-cover"
                          src={report.thumbnailUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9Iz9NyV8zTHvZw9k5EXOoLnSThtTUxkp29TYk3YG35fZMZaTCESbAml6wqR1edF8PCDkQs4sLlmNxkAzU-y_8TWpir9PnFiHZgAr53255YeMAoPCBLazNfHcTJ9NcJ8FEkQs8OJVOtOuA_XAs6HvjAYYEVYXc9ko-ow1-_gPnUl8oxfVaEUSF82GBP5DzQZgW3iF-gy9ozTSe6-YvMUwFwpHN6jHHp6Mc5Tvz_o40OTGhBfL1Hiu_qA'}
                          alt={report.title}
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[11px] font-mono flex items-center gap-1">
                          <span>{report.fileSizeFormatted}</span>
                        </div>
                      </div>

                      {/* Header */}
                      <div className="mb-2">
                        <span className="text-[11px] font-medium text-teal-700 block mb-0.5">
                          {report.category}
                        </span>
                        <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-1">
                          {report.title}
                        </h3>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {report.clinicProvider} · {report.doctorName}
                        </p>
                      </div>

                      {/* Status indicator */}
                      <div className="text-xs text-slate-600 bg-slate-50 rounded px-2.5 py-1 mb-3 truncate">
                        {report.statusBadge}
                      </div>

                      {/* Quiet metadata */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 py-1 border-t border-slate-100 mb-2">
                        <span>Test: {report.testDate}</span>
                        <span>Uploaded: {report.uploadDate}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1 text-slate-500">
                        <button
                          className="p-1 hover:text-slate-900 hover:bg-slate-50 rounded"
                          title="View Details"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReportId(report.id);
                          }}
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          className="p-1 hover:text-slate-900 hover:bg-slate-50 rounded"
                          title="Download"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadReport(report);
                          }}
                        >
                          <span className="material-symbols-outlined text-[18px]">download</span>
                        </button>
                        <button
                          className="p-1 hover:text-slate-900 hover:bg-slate-50 rounded"
                          title="Share Link"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExportSummaryModalOpen(true);
                          }}
                        >
                          <span className="material-symbols-outlined text-[18px]">share</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          className="p-1 hover:text-slate-700 hover:bg-slate-50 rounded"
                          title="Edit"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditMetadataModalReport(report);
                          }}
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(report.id);
                          }}
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Flyout Inspector */}
        {activeDoc && (
          <div className="lg:col-span-4 sticky top-20 bg-white rounded-xl p-5 border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900">Document Details</span>
              <span className="text-[11px] font-mono text-slate-500">
                #DOC-{activeDoc.id.slice(-5).toUpperCase()}
              </span>
            </div>

            {/* Document Preview */}
            <div className="relative rounded-lg overflow-hidden bg-slate-900 h-40 group">
              <img
                className="w-full h-full object-cover opacity-85"
                src={activeDoc.thumbnailUrl}
                alt={activeDoc.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] text-teal-300 uppercase tracking-wider truncate">
                    {activeDoc.clinicProvider}
                  </p>
                  <h4 className="text-xs font-semibold leading-tight truncate mt-0.5">
                    {activeDoc.title}
                  </h4>
                </div>
                <button
                  className="p-1 bg-white/20 hover:bg-white/30 rounded text-white cursor-pointer"
                  onClick={() => setFullscreenPreview(true)}
                  title="Expand"
                >
                  <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>SHA-256 Hash Integrity</span>
              <span className="font-mono text-[11px] text-teal-700">
                {activeDoc.hashIntegrity || '9f83a0bc4...e18a93d'}
              </span>
            </div>

            {/* Biomarkers */}
            {activeDoc.biomarkers && activeDoc.biomarkers.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Extracted Biomarkers
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {activeDoc.biomarkers.map((b) => (
                    <div key={b.name} className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[11px] text-slate-500 block truncate">{b.name}</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-sm font-semibold font-mono text-slate-900">
                          {b.value}
                        </span>
                        <span className="text-[10px] text-slate-400">{b.unit}</span>
                      </div>
                      <span className="text-[10px] text-teal-700 font-medium capitalize mt-0.5 block">
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Physician Note */}
            <div className="p-3 bg-slate-50 rounded-lg text-xs">
              <p className="text-slate-700 italic">
                {activeDoc.physicianNote ||
                  '"Clinical findings within normal ranges. Repeat testing recommended in 6 months."'}
              </p>
              <span className="text-[11px] text-slate-400 block text-right mt-1">
                — {activeDoc.doctorName}
              </span>
            </div>

            {/* Metadata Rows */}
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <span className="font-medium text-slate-900">{profile.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Facility:</span>
                <span className="font-medium text-slate-900 truncate max-w-[180px]">
                  {activeDoc.clinicProvider}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Preservation:</span>
                <span className="font-medium text-emerald-700">Authenticated</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportSummaryModalOpen(true)}
                  className="py-2 px-3 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg text-center cursor-pointer"
                >
                  Share Link
                </button>
                <button
                  type="button"
                  onClick={() => downloadReport(activeDoc)}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-center cursor-pointer"
                >
                  Export PDF
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setEditMetadataModalReport(activeDoc)}
                  className="text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Edit Metadata
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(activeDoc.id)}
                  className="text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  Delete Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-lg flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Delete Medical Document?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently remove this document from your vault? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg cursor-pointer"
                onClick={() => handleDeleteDoc(deleteConfirmId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Preview */}
      {fullscreenPreview && activeDoc && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col p-4">
          <div className="flex items-center justify-between text-white pb-3">
            <h3 className="text-sm font-semibold">{activeDoc.title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadReport(activeDoc)}
                className="px-3 py-1.5 bg-teal-700 rounded-lg text-white text-xs cursor-pointer"
              >
                Download
              </button>
              <button
                onClick={() => setFullscreenPreview(false)}
                className="p-1.5 text-white/70 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-2">
            <img
              src={activeDoc.thumbnailUrl}
              alt={activeDoc.title}
              className="max-h-[82vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
