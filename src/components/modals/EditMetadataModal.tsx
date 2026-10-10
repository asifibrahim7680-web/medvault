import React, { useState, useEffect } from 'react';
import { useMediVault } from '../../context/MediVaultContext';
import { RecordCategory } from '../../types';

export const EditMetadataModal: React.FC = () => {
  const { editMetadataModalReport, setEditMetadataModalReport, updateReportMetadata } = useMediVault();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RecordCategory>('Blood Tests & Labs');
  const [testDate, setTestDate] = useState('');
  const [clinic, setClinic] = useState('');
  const [doctor, setDoctor] = useState('');
  const [physicianNote, setPhysicianNote] = useState('');
  const [statusBadge, setStatusBadge] = useState('');

  useEffect(() => {
    if (editMetadataModalReport) {
      setTitle(editMetadataModalReport.title);
      setCategory(editMetadataModalReport.category);
      setTestDate(editMetadataModalReport.testDate);
      setClinic(editMetadataModalReport.clinicProvider);
      setDoctor(editMetadataModalReport.doctorName);
      setPhysicianNote(editMetadataModalReport.physicianNote || '');
      setStatusBadge(editMetadataModalReport.statusBadge);
    }
  }, [editMetadataModalReport]);

  if (!editMetadataModalReport) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateReportMetadata(editMetadataModalReport.id, {
      title: title.trim(),
      category,
      testDate,
      clinicProvider: clinic.trim(),
      doctorName: doctor.trim(),
      physicianNote: physicianNote.trim(),
      statusBadge: statusBadge.trim(),
    });
    setEditMetadataModalReport(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl flex flex-col gap-space-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[22px]">edit_note</span>
            <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">
              Edit Report Metadata
            </h3>
          </div>
          <button
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors"
            onClick={() => setEditMetadataModalReport(null)}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
              Report Title
            </label>
            <input
              required
              className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={category}
              onChange={(e) => setCategory(e.target.value as RecordCategory)}
            >
              <option value="Blood Tests & Labs">Blood Tests & Labs</option>
              <option value="Prescriptions & Rx">Prescriptions & Rx</option>
              <option value="Imaging & Scans">Imaging & Scans</option>
              <option value="Specialist Diagnoses">Specialist Diagnoses</option>
              <option value="Discharge Summaries">Discharge Summaries</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Test Date
              </label>
              <input
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Clinical Status Tag
              </label>
              <input
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                type="text"
                value={statusBadge}
                onChange={(e) => setStatusBadge(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Clinic / Provider
              </label>
              <input
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                type="text"
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Physician
              </label>
              <input
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                type="text"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
              Physician Review Notes
            </label>
            <textarea
              rows={3}
              className="w-full p-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              value={physicianNote}
              onChange={(e) => setPhysicianNote(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-2 border-t border-outline-variant/20">
            <button
              className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-md text-label-md transition-colors"
              onClick={() => setEditMetadataModalReport(null)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg shadow-sm transition-colors"
              type="submit"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
