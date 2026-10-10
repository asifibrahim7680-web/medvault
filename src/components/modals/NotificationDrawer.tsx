import React from 'react';
import { useMediVault } from '../../context/MediVaultContext';

export const NotificationDrawer: React.FC = () => {
  const { notificationDrawerOpen, setNotificationDrawerOpen, medications, appointments, requestRefill, setActiveTab } = useMediVault();

  if (!notificationDrawerOpen) return null;

  const lowMeds = medications.filter(
    (m) => m.status === 'active' && m.remainingPills <= m.refillThresholdDays
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-on-background/30 backdrop-blur-xs transition-opacity"
        onClick={() => setNotificationDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-container-lowest shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-space-md border-b border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">notifications</span>
              <h3 className="font-title-sm text-on-surface font-semibold">Notifications & Clinical Alerts</h3>
            </div>
            <button
              className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors"
              onClick={() => setNotificationDrawerOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-space-md space-y-3">
            {/* Urgent Refill Notice */}
            {lowMeds.map((med) => (
              <div
                key={med.id}
                className="p-3.5 rounded-xl bg-error-container/20 border border-error/30 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-error uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-error"></span>
                    Refill Warning
                  </span>
                  <span className="font-label-xs text-error font-mono">{med.remainingPills} pills left</span>
                </div>
                <div>
                  <h4 className="font-label-md text-on-surface font-semibold">{med.name} ({med.dosage})</h4>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    Remaining supply is below the threshold. Refill takes 24–48 hours at {med.pharmacy}.
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-label-xs text-xs font-semibold transition-colors"
                    onClick={() => {
                      requestRefill(med.id);
                      setNotificationDrawerOpen(false);
                    }}
                  >
                    Refill Now
                  </button>
                </div>
              </div>
            ))}

            {/* Upcoming Dose */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[14px]">alarm</span>
                  Upcoming Dose
                </span>
                <span className="font-label-xs text-outline">1:00 PM Today</span>
              </div>
              <div>
                <h4 className="font-label-md text-on-surface font-semibold">Metformin HCl (500 mg)</h4>
                <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                  Scheduled with lunch. Take with glass of water.
                </p>
              </div>
            </div>

            {/* Next Appointment Alert */}
            {appointments.slice(0, 1).map((apt) => (
              <div
                key={apt.id}
                className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">event</span>
                    Upcoming Appointment
                  </span>
                  <span className="font-label-xs text-outline">{apt.appointmentDate}</span>
                </div>
                <div>
                  <h4 className="font-label-md text-on-surface font-semibold">{apt.doctorName}</h4>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    {apt.specialty} • {apt.appointmentTime} at {apt.clinicHospital}
                  </p>
                </div>
                <button
                  className="text-xs text-primary font-semibold hover:underline text-left"
                  onClick={() => {
                    setActiveTab('appointments');
                    setNotificationDrawerOpen(false);
                  }}
                >
                  View Details in Calendar &rarr;
                </button>
              </div>
            ))}

            {/* Enclave Sync */}
            <div className="p-3 rounded-xl bg-surface-container flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-tertiary">verified_user</span>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Enclave key rotation verified. All 42 records client-side synchronized.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
