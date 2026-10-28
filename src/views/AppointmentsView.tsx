import React, { useState } from 'react';
import { useMediVault } from '../context/MediVaultContext';
import { Appointment } from '../types';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    careProviders,
    setAddAptModalOpen,
    cancelAppointment,
    updateAppointment,
    showToast,
  } = useMediVault();

  const [viewType, setViewType] = useState<'calendar' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [selectedMonth, setSelectedMonth] = useState('November 2024');
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === 'all') return true;
    return apt.status === statusFilter;
  });

  const handleToggleReminder = (apt: Appointment) => {
    const updated = !apt.reminderSet;
    updateAppointment(apt.id, { reminderSet: updated });
    showToast(
      updated
        ? `Reminder alert enabled for ${apt.doctorName} on ${apt.appointmentDate}`
        : `Reminder removed for ${apt.doctorName}`,
      'info'
    );
  };

  const handleConfirmCancel = () => {
    if (cancelConfirmId) {
      cancelAppointment(cancelConfirmId);
      setCancelConfirmId(null);
    }
  };

  const handleAddToCalendar = (apt: Appointment) => {
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MediVault Health//EN
BEGIN:VEVENT
SUMMARY:Doctor Visit: ${apt.doctorName} (${apt.specialty})
DESCRIPTION:${apt.notes || 'Clinical consultation'}
LOCATION:${apt.clinicHospital}, ${apt.locationRoom}
DTSTART:${apt.appointmentDate.replace(/-/g, '')}T103000Z
DTEND:${apt.appointmentDate.replace(/-/g, '')}T111500Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Appointment_${apt.doctorName.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Appointment with ${apt.doctorName} exported to Calendar file.`, 'success');
  };

  const calendarDays = [
    { day: 27, currentMonth: false, apts: [] },
    { day: 28, currentMonth: false, apts: [] },
    { day: 29, currentMonth: false, apts: [] },
    { day: 30, currentMonth: false, apts: [] },
    { day: 31, currentMonth: false, apts: [] },
    { day: 1, currentMonth: true, apts: [] },
    { day: 2, currentMonth: true, apts: ['Routine Lab - Dr. Chen'] },
    { day: 3, currentMonth: true, apts: [] },
    { day: 4, currentMonth: true, apts: [] },
    { day: 5, currentMonth: true, apts: [] },
    { day: 6, currentMonth: true, apts: [] },
    { day: 7, currentMonth: true, apts: [] },
    { day: 8, currentMonth: true, apts: [] },
    { day: 9, currentMonth: true, apts: [] },
    { day: 10, currentMonth: true, apts: [] },
    { day: 11, currentMonth: true, apts: [] },
    { day: 12, currentMonth: true, apts: [] },
    { day: 13, currentMonth: true, apts: [] },
    { day: 14, currentMonth: true, apts: ['Dr. Aris Vance (10:30 AM)'] },
    { day: 15, currentMonth: true, apts: [] },
    { day: 16, currentMonth: true, apts: [] },
    { day: 17, currentMonth: true, apts: [] },
    { day: 18, currentMonth: true, apts: [] },
    { day: 19, currentMonth: true, apts: [] },
    { day: 20, currentMonth: true, apts: [] },
    { day: 21, currentMonth: true, apts: [] },
    { day: 22, currentMonth: true, apts: [] },
    { day: 23, currentMonth: true, apts: [] },
    { day: 24, currentMonth: true, apts: [] },
    { day: 25, currentMonth: true, apts: [] },
    { day: 26, currentMonth: true, apts: [] },
    { day: 27, currentMonth: true, apts: [] },
    { day: 28, currentMonth: true, apts: [] },
    { day: 29, currentMonth: true, apts: [] },
    { day: 30, currentMonth: true, apts: [] },
  ];

  return (
    <div className="flex flex-col w-full gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Clinical Scheduling</span>
            <span aria-hidden="true">·</span>
            <span>{filteredAppointments.length} Appointments</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Appointments &amp; Lab Schedule
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewType === 'list'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setViewType('list')}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">view_agenda</span>
              <span>List</span>
            </button>
            <button
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewType === 'calendar'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setViewType('calendar')}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              <span>Calendar</span>
            </button>
          </div>

          <button
            className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-[#ff6f61] hover:bg-[#e55345] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            type="button"
            onClick={() => setAddAptModalOpen(true)}
          >
            <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
            <span>Book Lab Test / Visit</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200 pb-1 text-xs">
        {(['upcoming', 'completed', 'cancelled', 'all'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
              statusFilter === filter
                ? 'bg-[#ff6f61] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            {filter === 'upcoming' ? 'Upcoming Visits' : filter}
          </button>
        ))}
      </div>

      {/* Main View Area */}
      {viewType === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.length === 0 ? (
            <div className="col-span-2 bg-white rounded-xl p-12 text-center border border-slate-200">
              <span className="material-symbols-outlined text-[36px] text-slate-300 mb-2">
                event_busy
              </span>
              <h3 className="text-sm font-semibold text-slate-900">No appointments found</h3>
              <p className="text-xs text-slate-500 mt-1">
                You have no appointments matching this view.
              </p>
              <button
                onClick={() => setAddAptModalOpen(true)}
                className="mt-3 px-3.5 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Schedule Consultation
              </button>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const isUpcoming = apt.status === 'upcoming';
              const isCancelled = apt.status === 'cancelled';

              return (
                <div
                  key={apt.id}
                  className={`bg-white rounded-xl p-5 border transition-all flex flex-col justify-between ${
                    isCancelled ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{apt.type}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500">{apt.specialty}</span>
                      </div>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
                          isUpcoming
                            ? 'text-blue-700 bg-blue-50'
                            : isCancelled
                            ? 'text-rose-700 bg-rose-50'
                            : 'text-slate-600 bg-slate-100'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={apt.doctorAvatar}
                        alt={apt.doctorName}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 text-xs">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                          {apt.doctorName}
                        </h3>
                        <p className="text-slate-600 truncate">{apt.doctorTitle || apt.specialty}</p>
                        <p className="text-slate-400 truncate mt-0.5">{apt.clinicHospital}</p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs mb-3">
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <span className="material-symbols-outlined text-[15px] text-blue-600">event</span>
                        <span>{apt.appointmentDate} · {apt.appointmentTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
                        <span className="truncate">{apt.locationRoom}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleReminder(apt)}
                      className={`inline-flex items-center gap-1 font-bold cursor-pointer ${
                        apt.reminderSet ? 'text-[#ff6f61]' : 'text-neutral-400 hover:text-neutral-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {apt.reminderSet ? 'notifications_active' : 'notifications_off'}
                      </span>
                      <span>{apt.reminderSet ? 'Reminder On' : 'Set Reminder'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {isUpcoming && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAddToCalendar(apt)}
                            className="p-1 text-slate-400 hover:text-slate-900 rounded cursor-pointer"
                            title="Add to Calendar"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancelConfirmId(apt.id)}
                            className="text-rose-600 hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Minimal Monthly Calendar */
        <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <h3 className="text-sm font-semibold text-slate-900">{selectedMonth}</h3>
            <div className="flex items-center gap-1">
              <button
                className="p-1 rounded hover:bg-slate-100 cursor-pointer"
                onClick={() => setSelectedMonth('October 2024')}
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                className="p-1 rounded hover:bg-slate-100 cursor-pointer"
                onClick={() => setSelectedMonth('November 2024')}
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 uppercase py-1 border-b border-slate-100">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => {
              const hasApt = item.apts.length > 0;
              return (
                <div
                  key={idx}
                  className={`min-h-[64px] p-1.5 rounded-lg border text-left flex flex-col justify-between ${
                    item.currentMonth
                      ? hasApt
                        ? 'bg-blue-50/60 border-blue-200'
                        : 'bg-white border-slate-100'
                      : 'bg-slate-50/40 border-transparent text-slate-300'
                  }`}
                >
                  <span
                    className={`text-xs font-mono ${
                      hasApt ? 'text-blue-700 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {item.day}
                  </span>
                  {hasApt && (
                    <div className="mt-1">
                      {item.apts.map((a, i) => (
                        <span
                          key={i}
                          className="block text-[10px] leading-tight font-medium text-blue-700 truncate"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 1mg Style Consult Top Doctors & Diagnostic Centers Online */}
      <section className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-2xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-neutral-900">
                Consult Verified Specialists &amp; Book Labs Online
              </h2>
              <span className="text-[10px] text-[#ff6f61] font-bold bg-[#fff2ef] px-2 py-0.5 rounded">
                Verified Medical Team
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Connect via encrypted teleconsultation or schedule certified phlebotomist sample collection
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddAptModalOpen(true)}
            className="text-xs font-bold text-[#ff6f61] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Schedule Consultation &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {careProviders.map((prov) => (
            <div
              key={prov.id}
              className="bg-neutral-50/70 hover:bg-white rounded-xl p-4 border border-neutral-200/80 hover:border-[#ff6f61] transition-all flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={prov.avatar}
                    alt={prov.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-neutral-200 group-hover:ring-[#ff6f61]/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#ff6f61] block uppercase tracking-wider truncate">
                      {prov.departmentTag || 'Specialist'}
                    </span>
                    <h3 className="text-xs font-bold text-neutral-900 truncate">
                      {prov.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {prov.specialty}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-600 bg-white p-2.5 rounded-lg border border-neutral-200/60 space-y-1 mb-3">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Facility:</span>
                    <span className="font-semibold text-neutral-800 truncate ml-1">{prov.clinic}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Last Consult:</span>
                    <span className="font-mono text-neutral-700">{prov.lastVisit || 'Initial Visit'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAddAptModalOpen(true);
                  showToast(`Initiating booking for ${prov.name}...`, 'info');
                }}
                className="w-full py-1.5 bg-[#fff2ef] hover:bg-[#ff6f61] text-[#ff6f61] hover:text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                <span>Book Slot</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Cancel Modal */}
      {cancelConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-lg flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Cancel Appointment?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel this appointment? The clinical facility will be notified.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                onClick={() => setCancelConfirmId(null)}
              >
                Keep
              </button>
              <button
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg cursor-pointer"
                onClick={handleConfirmCancel}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
