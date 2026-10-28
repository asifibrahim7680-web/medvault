import React, { useState } from 'react';
import { useMediVault } from '../../context/MediVaultContext';

export const AddAppointmentModal: React.FC = () => {
  const { addAptModalOpen, setAddAptModalOpen, addAppointment } = useMediVault();

  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [clinicHospital, setClinicHospital] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('10:45 AM');
  const [locationRoom, setLocationRoom] = useState('Suite 200, Main Clinic');
  const [type, setType] = useState<'Doctor Visit' | 'Laboratory Test' | 'Specialist Consultation' | 'Procedure'>('Doctor Visit');
  const [notes, setNotes] = useState('');
  const [reminderSet, setReminderSet] = useState(true);

  if (!addAptModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim() || !appointmentDate) return;

    addAppointment({
      doctorName: doctorName.trim(),
      specialty,
      clinicHospital: clinicHospital.trim() || 'Central Multi-Specialty Hospital',
      appointmentDate,
      appointmentTime,
      endTime,
      locationRoom: locationRoom.trim() || 'Consultation Pavilion • Suite 402',
      type,
      status: 'upcoming',
      notes: notes.trim(),
      reminderSet,
    });

    setAddAptModalOpen(false);
    setDoctorName('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl flex flex-col gap-space-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
          <div className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
            </div>
            <div>
              <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">
                Schedule Clinical Appointment
              </h3>
              <p className="font-label-xs text-label-xs text-outline">
                Doctor consultations, imaging, and lab tests
              </p>
            </div>
          </div>
          <button
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors"
            onClick={() => setAddAptModalOpen(false)}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Appointment Type
              </label>
              <select
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="Doctor Visit">Doctor Visit</option>
                <option value="Laboratory Test">Laboratory Test</option>
                <option value="Specialist Consultation">Specialist Consultation</option>
                <option value="Procedure">Procedure / Imaging</option>
              </select>
            </div>

            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Specialty / Department
              </label>
              <select
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Family Medicine">Family Medicine / Primary</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Pathology & Phlebotomy">Pathology & Phlebotomy</option>
                <option value="Radiology & Imaging">Radiology & Imaging</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Orthopedics">Orthopedics</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
              Physician or Diagnostic Facility *
            </label>
            <input
              required
              className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Dr. Aris Vance or Quest Diagnostics"
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
              Clinic or Hospital Location
            </label>
            <input
              className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Memorial Hospital Pavilion B"
              type="text"
              value={clinicHospital}
              onChange={(e) => setClinicHospital(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                required
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                type="text"
                placeholder="10:30 AM"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                type="text"
                placeholder="11:15 AM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
              Room / Desk / Kiosk
            </label>
            <input
              className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Pavilion B, Room 402 • Check-in Kiosk 3"
              type="text"
              value={locationRoom}
              onChange={(e) => setLocationRoom(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
              Instructions or Preparation Notes
            </label>
            <textarea
              rows={2}
              className="w-full p-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="e.g. 12-hour fasting prior to blood draw, bring latest ECG report..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="reminderCheck"
              className="rounded text-primary focus:ring-primary"
              checked={reminderSet}
              onChange={(e) => setReminderSet(e.target.checked)}
            />
            <label htmlFor="reminderCheck" className="font-body-sm text-sm text-on-surface cursor-pointer">
              Set automated reminder notification (24 hours prior)
            </label>
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-2 border-t border-outline-variant/20">
            <button
              className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-md text-label-md transition-colors"
              onClick={() => setAddAptModalOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg shadow-sm transition-colors"
              type="submit"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
