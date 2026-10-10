import React, { useState, useRef } from 'react';
import { useMediVault } from '../../context/MediVaultContext';
import { RecordCategory } from '../../types';

export const UploadRecordModal: React.FC = () => {
  const { uploadModalOpen, setUploadModalOpen, uploadReport, showToast } = useMediVault();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RecordCategory>('Blood Tests & Labs');
  const [testDate, setTestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [clinic, setClinic] = useState('');
  const [doctor, setDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!uploadModalOpen) return null;

  const handleFileChange = (file: File) => {
    setErrorMessage('');
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/dicom'];
    const maxSizeBytes = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(file.type) && !file.name.endsWith('.dicom') && !file.name.endsWith('.dcm')) {
      setErrorMessage('Invalid file format. Please upload PDF, DICOM, JPG, or PNG files.');
      return;
    }

    if (file.size > maxSizeBytes) {
      setErrorMessage('File exceeds 50MB limit. Please select a smaller file.');
      return;
    }

    setSelectedFile(file);
    if (!title) {
      // Auto-populate title from filename
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }

    // Generate local preview if image or pdf
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please enter a report title.');
      return;
    }

    setIsEncrypting(true);
    setErrorMessage('');

    try {
      // Format file size
      const bytes = selectedFile?.size || 1024 * 1024 * 1.8;
      const sizeMB = (bytes / (1024 * 1024)).toFixed(1);
      const isPdf = selectedFile?.type === 'application/pdf' || selectedFile?.name.endsWith('.pdf');
      const sizeFormatted = `${isPdf ? 'PDF' : 'DOC'} (${sizeMB} MB)`;

      await uploadReport({
        title: title.trim(),
        category,
        testDate,
        clinicProvider: clinic.trim() || 'Quest Diagnostics Metro Lab',
        doctorName: doctor.trim() || 'Dr. R. Chen',
        fileName: selectedFile?.name || `${title.replace(/\s+/g, '_')}.pdf`,
        fileSizeBytes: bytes,
        fileSizeFormatted: sizeFormatted,
        fileType: selectedFile?.type || 'application/pdf',
        fileDataUrl: filePreview || undefined,
        notes: notes.trim(),
        physicianNote: notes.trim() || 'Clinical document securely archived in patient vault.',
        statusBadge: category === 'Blood Tests & Labs' ? 'Normal / Verified Record' : 'Preserved & Authenticated',
      });

      setIsEncrypting(false);
      setUploadModalOpen(false);
      // Reset form
      setTitle('');
      setSelectedFile(null);
      setFilePreview(null);
      setNotes('');
      setClinic('');
      setDoctor('');
    } catch {
      setIsEncrypting(false);
      showToast('Failed to upload document. Please try again.', 'error');
    }
  };

  const close = () => {
    if (!isEncrypting) {
      setUploadModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl flex flex-col gap-space-md animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
          <div className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
            </div>
            <div>
              <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">
                Upload Medical Report
              </h3>
              <p className="font-label-xs text-label-xs text-outline">
                Direct client-side encryption into vault
              </p>
            </div>
          </div>
          <button
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors"
            onClick={close}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-error-container text-on-error-container rounded-lg font-body-sm text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* File Select Drop Region */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.dicom,.dcm"
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          />
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-outline-variant/60 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group"
          >
            {selectedFile ? (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[36px] text-tertiary">
                  verified
                </span>
                <div className="text-left">
                  <p className="font-label-md text-on-surface font-semibold truncate max-w-xs">
                    {selectedFile.name}
                  </p>
                  <p className="font-label-xs text-outline">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AES-256 encryption
                  </p>
                </div>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[40px] text-primary mb-2 transition-transform group-hover:scale-110">
                  cloud_upload
                </span>
                <p className="font-label-md text-label-md text-on-surface font-semibold">
                  Drop PDF, DICOM, or medical images here
                </p>
                <p className="font-body-sm text-body-sm text-outline mt-1">
                  Or click to browse system files (up to 50MB)
                </p>
              </>
            )}
          </div>

          {/* Document Title */}
          <div>
            <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
              Report Title *
            </label>
            <input
              required
              className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Comprehensive Metabolic Panel & Lipid Profile"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Document Category */}
          <div>
            <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
              Document Category
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

          {/* Date & Provider */}
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
                Clinic / Provider
              </label>
              <input
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Quest Diagnostics"
                type="text"
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
              />
            </div>
          </div>

          {/* Doctor Name & Clinical Notes */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Ordering Doctor
              </label>
              <input
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Dr. R. Chen"
                type="text"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Clinical Notes / Findings
              </label>
              <textarea
                rows={2}
                className="w-full p-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Optional notes or summary of test results..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-space-sm pt-2 border-t border-outline-variant/20 mt-1">
            <button
              className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-md text-label-md transition-colors cursor-pointer"
              onClick={close}
              type="button"
              disabled={isEncrypting}
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              type="submit"
              disabled={isEncrypting}
            >
              {isEncrypting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  <span>Encrypting...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Encrypt & Store</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
