import React, { useState } from 'react';
import { useMediVault } from '../context/MediVaultContext';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    emergencyCard,
    updateEmergencyCard,
    notificationPrefs,
    updateNotificationPrefs,
    backendStatus,
    setAuthModalOpen,
    showToast,
  } = useMediVault();

  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [dob, setDob] = useState(profile.dob);
  const [bloodType, setBloodType] = useState(emergencyCard.bloodType);
  const [allergiesText, setAllergiesText] = useState(emergencyCard.allergies.join(', '));
  const [contactName, setContactName] = useState(emergencyCard.primaryContact.name);
  const [contactPhone, setContactPhone] = useState(emergencyCard.primaryContact.phone);
  const [contactRelation, setContactRelation] = useState(emergencyCard.primaryContact.relationship);

  const [emailAlerts, setEmailAlerts] = useState(notificationPrefs.emailAlerts);
  const [smsReminders, setSmsReminders] = useState(notificationPrefs.smsReminders);
  const [pushNotifications, setPushNotifications] = useState(notificationPrefs.pushNotifications);
  const [refillDays, setRefillDays] = useState(notificationPrefs.refillLeadDays);
  const [quietHours, setQuietHours] = useState(notificationPrefs.quietHoursEnabled);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      email,
      dob,
    });

    const parsedAllergies = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updateEmergencyCard({
      bloodType,
      allergies: parsedAllergies,
      primaryContact: {
        name: contactName,
        phone: contactPhone,
        relationship: contactRelation,
        registeredIce: true,
      },
    });

    showToast('Patient profile & emergency contact updated.', 'success');
  };

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationPrefs({
      emailAlerts,
      smsReminders,
      pushNotifications,
      refillLeadDays: Number(refillDays),
      quietHoursEnabled: quietHours,
    });
    showToast('Notification preferences saved.', 'success');
  };

  return (
    <div className="flex flex-col w-full gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
          <span>Account &amp; Security</span>
          <span aria-hidden="true">·</span>
          <span>Vault Preferences</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Settings &amp; Medical Identity
        </h1>
      </div>

      {/* Supabase Persistence Card */}
      <section className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Supabase Backend Persistence
            </h2>
            <p className="text-xs text-slate-500">
              Row Level Security (RLS) &amp; Private Storage Bucket
            </p>
          </div>
          <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2.5 py-1 rounded">
            {backendStatus.mode}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-lg text-xs space-y-2">
          <p className="text-slate-600 leading-relaxed">{backendStatus.statusNote}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
            <span className="text-slate-400 font-mono">
              Database: <strong className="text-slate-700">{backendStatus.url}</strong>
            </span>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md font-medium cursor-pointer"
            >
              Configure Supabase / Auth &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Patient Profile Form */}
      <section className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col gap-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Patient Information</h2>
          <p className="text-xs text-slate-500">Demographic details and ICE contact</p>
        </div>

        <form onSubmit={handleSaveProfile} className="flex flex-col gap-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 mb-1">Full Name</label>
              <input
                required
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Email Address</label>
              <input
                required
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Date of Birth</label>
              <input
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 mb-1">Blood Type</label>
              <select
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
              >
                <option value="O+">O+ (Universal Red Cell Acceptor)</option>
                <option value="O-">O- (Universal Red Cell Donor)</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Allergies (comma-separated)</label>
              <input
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none"
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
              />
            </div>
          </div>

          {/* ICE Contact */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Primary Emergency Contact (ICE)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">Contact Name</label>
                <input
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Relationship</label>
                <input
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none"
                  type="text"
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Phone Number</label>
                <input
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none"
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#ff6f61] hover:bg-[#e55345] text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </section>

      {/* Notification Preferences */}
      <section className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col gap-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Notification Preferences</h2>
          <p className="text-xs text-slate-500">Alert channels and quiet hours</p>
        </div>

        <form onSubmit={handleSavePrefs} className="flex flex-col gap-3 text-xs">
          <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg cursor-pointer">
            <div>
              <span className="font-medium text-slate-900 block">Email Notifications</span>
              <span className="text-[11px] text-slate-400">Weekly summaries and visit reminders</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-teal-700"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg cursor-pointer">
            <div>
              <span className="font-medium text-slate-900 block">SMS / Text Reminders</span>
              <span className="text-[11px] text-slate-400">Instant dose alarm alerts</span>
            </div>
            <input
              type="checkbox"
              checked={smsReminders}
              onChange={(e) => setSmsReminders(e.target.checked)}
              className="w-4 h-4 rounded text-teal-700"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg cursor-pointer">
            <div>
              <span className="font-medium text-slate-900 block">Browser Push Alarms</span>
              <span className="text-[11px] text-slate-400">Desktop notifications when medication is due</span>
            </div>
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              className="w-4 h-4 rounded text-teal-700"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-slate-500 mb-1">Refill Lead Time (Days)</label>
              <input
                type="number"
                min="1"
                max="30"
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                value={refillDays}
                onChange={(e) => setRefillDays(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={quietHours}
                  onChange={(e) => setQuietHours(e.target.checked)}
                  className="rounded text-teal-700"
                />
                <span>Quiet Hours (10 PM – 7 AM)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#ff6f61] hover:bg-[#e55345] text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
