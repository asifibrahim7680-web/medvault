import React, { useState } from 'react';
import { useMediVault } from '../../context/MediVaultContext';

export const AddMedicationModal: React.FC = () => {
  const { addMedModalOpen, setAddMedModalOpen, addMedication } = useMediVault();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState('Oral Tablet');
  const [rxNumber, setRxNumber] = useState('');
  const [frequency, setFrequency] = useState('Once Daily (8:00 AM)');
  const [timePeriod, setTimePeriod] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Bedtime' | 'PRN'>('Morning');
  const [mealInstruction, setMealInstruction] = useState('With meals');
  const [doctorName, setDoctorName] = useState('');
  const [clinic, setClinic] = useState('');
  const [pharmacy, setPharmacy] = useState('CVS Pharmacy #4210');
  const [totalPills, setTotalPills] = useState(30);
  const [refillThreshold, setRefillThreshold] = useState(7);
  const [autoRefill, setAutoRefill] = useState(false);
  const [isPrn, setIsPrn] = useState(false);
  const [guidance, setGuidance] = useState('');

  if (!addMedModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    addMedication({
      name: name.trim(),
      dosage: dosage.trim(),
      form,
      rxNumber: rxNumber.trim() || `RX-${Math.floor(100000 + Math.random() * 900000)}`,
      frequency,
      scheduleTimes: isPrn ? [] : [timePeriod === 'Morning' ? '08:00' : timePeriod === 'Afternoon' ? '13:00' : '20:00'],
      timePeriod,
      mealInstruction,
      doctorName: doctorName.trim() || 'Dr. Robert Chen',
      clinic: clinic.trim() || 'Primary Care Center',
      pharmacy: pharmacy.trim() || 'Local Pharmacy',
      remainingPills: Number(totalPills) || 30,
      totalPills: Number(totalPills) || 30,
      refillThresholdDays: Number(refillThreshold) || 7,
      autoRefillEnabled: autoRefill,
      isPrn,
      status: 'active',
      guidance: guidance.trim() || 'Follow prescribed guidance as provided by attending physician.',
      colorAccent: 'primary',
    });

    setAddMedModalOpen(false);
    // Reset
    setName('');
    setDosage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl flex flex-col gap-space-md animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
          <div className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">medication</span>
            </div>
            <div>
              <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">
                Add New Prescription Schedule
              </h3>
              <p className="font-label-xs text-label-xs text-outline">
                Automated reminders & adherence tracking
              </p>
            </div>
          </div>
          <button
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors"
            onClick={() => setAddMedModalOpen(false)}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Clinical Disclaimer per requirement #3 */}
        <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-start gap-2">
          <span className="material-symbols-outlined text-outline text-[16px] mt-0.5">verified_user</span>
          <p className="font-label-xs text-on-surface-variant leading-tight">
            MediVault manages personal medication reminders. Never modify dosages or frequencies without direct guidance from your licensed healthcare provider.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Medication Name *
              </label>
              <input
                required
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Metformin HCl"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Dosage / Strength *
              </label>
              <input
                required
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. 500 mg"
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Form
              </label>
              <select
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form}
                onChange={(e) => setForm(e.target.value)}
              >
                <option value="Oral Tablet">Oral Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Inhalation Aerosol">Inhalation Aerosol</option>
                <option value="Liquid Suspension">Liquid Suspension</option>
                <option value="Subcutaneous Injection">Subcutaneous Injection</option>
                <option value="Topical Gel">Topical Gel</option>
              </select>
            </div>
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Prescription / Rx #
              </label>
              <input
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. RX-992014"
                type="text"
                value={rxNumber}
                onChange={(e) => setRxNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Frequency
              </label>
              <select
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="Once Daily (8:00 AM)">Once Daily (Morning)</option>
                <option value="Twice Daily (8:00 AM, 1:00 PM)">Twice Daily (Morning, Lunch)</option>
                <option value="Once Daily (8:00 PM)">Once Daily (Evening)</option>
                <option value="Once Daily (Bedtime)">Once Daily (Bedtime)</option>
                <option value="As Needed (PRN)">As Needed (PRN)</option>
              </select>
            </div>

            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Day Slot / Window
              </label>
              <select
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as any)}
              >
                <option value="Morning">Morning (8:00 AM)</option>
                <option value="Afternoon">Afternoon (1:00 PM)</option>
                <option value="Evening">Evening (8:00 PM)</option>
                <option value="Bedtime">Bedtime (10:00 PM)</option>
                <option value="PRN">PRN (As Needed)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
              Instructions
            </label>
            <input
              className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. With meals (within 30 mins)"
              type="text"
              value={mealInstruction}
              onChange={(e) => setMealInstruction(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Prescribing Doctor
              </label>
              <input
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Dr. Emily Clark"
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Pharmacy
              </label>
              <input
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="CVS Pharmacy #4210"
                type="text"
                value={pharmacy}
                onChange={(e) => setPharmacy(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Total Quantity / Pills
              </label>
              <input
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                type="number"
                min="1"
                value={totalPills}
                onChange={(e) => setTotalPills(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block font-label-xs text-label-xs text-outline uppercase tracking-wider mb-1">
                Refill Alert Days
              </label>
              <input
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                type="number"
                min="1"
                value={refillThreshold}
                onChange={(e) => setRefillThreshold(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 py-1">
            <label className="flex items-center gap-2 cursor-pointer font-body-sm text-sm">
              <input
                type="checkbox"
                className="rounded text-primary focus:ring-primary"
                checked={autoRefill}
                onChange={(e) => setAutoRefill(e.target.checked)}
              />
              <span>Enable Pharmacy Auto-Refill</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-body-sm text-sm">
              <input
                type="checkbox"
                className="rounded text-primary focus:ring-primary"
                checked={isPrn}
                onChange={(e) => setIsPrn(e.target.checked)}
              />
              <span>PRN / As-Needed Med</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-2 border-t border-outline-variant/20">
            <button
              className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-md text-label-md transition-colors"
              onClick={() => setAddMedModalOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg shadow-sm transition-colors"
              type="submit"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
