import React from 'react';
import { useMediVault, TabType } from '../context/MediVaultContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useMediVault();

  const navItems: { id: TabType; label: string; icon: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard & Hub', icon: 'grid_view' },
    { id: 'medical-records', label: 'Lab Reports & Vault', icon: 'science', badge: 'NABL' },
    { id: 'medicines', label: 'Medicine Reminders', icon: 'medication' },
    { id: 'appointments', label: 'Lab Tests & Visits', icon: 'calendar_month' },
    { id: 'health-timeline', label: 'Health Timeline', icon: 'timeline' },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-60 bg-white border-r border-neutral-200 z-40 flex flex-col justify-between p-3.5">
      <div className="flex flex-col gap-4">
        {/* Section Header */}
        <div className="px-3 pt-1 flex items-center justify-between">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Health Services
          </span>
          <span className="text-[10px] text-[#ff6f61] font-bold bg-[#fff2ef] px-1.5 py-0.5 rounded">
            100% Safe
          </span>
        </div>

        {/* Primary Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                type="button"
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition-all cursor-pointer w-full group ${
                  isActive
                    ? 'bg-[#fff2ef] text-[#ff6f61] font-bold border border-[#ff6f61]/30 shadow-2xs'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`material-symbols-outlined text-[19px] transition-colors ${
                      isActive ? 'text-[#ff6f61]' : 'text-neutral-400 group-hover:text-neutral-800'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isActive ? 'bg-[#ff6f61] text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 1mg Labs Style Diagnostic Guarantee Card */}
        <div className="mx-1 p-3.5 bg-gradient-to-br from-[#fff2ef] to-amber-50/50 rounded-xl border border-[#ff6f61]/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#c93325] mb-1">
            <span className="material-symbols-outlined text-[16px] text-[#ff6f61]">home_health</span>
            <span>Free Sample Pickup</span>
          </div>
          <p className="text-[11px] text-neutral-600 leading-snug">
            Safe, temperature-controlled blood sample collection right from your doorstep.
          </p>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#ff6f61] font-bold pt-1.5 border-t border-[#ff6f61]/15">
            <span>Reports in 24 Hrs</span>
            <span
              onClick={() => setActiveTab('appointments')}
              className="flex items-center gap-0.5 cursor-pointer hover:underline"
            >
              Book
              <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="flex flex-col gap-2 pt-3 border-t border-neutral-100">
        <button
          onClick={() => setActiveTab('settings')}
          type="button"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer w-full ${
            activeTab === 'settings'
              ? 'bg-[#fff2ef] text-[#ff6f61] font-bold border border-[#ff6f61]/30'
              : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              activeTab === 'settings' ? 'text-[#ff6f61]' : 'text-neutral-400'
            }`}
          >
            tune
          </span>
          <span>Health ID &amp; Settings</span>
        </button>

        {/* NABL Certification Badge (1mg Labs hallmark) */}
        <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-1.5 text-neutral-800 mb-0.5">
            <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              NABL &amp; CAP Certified
            </span>
          </div>
          <p className="text-[10px] text-neutral-500 leading-tight">
            100% Certified Phlebotomists &amp; Vault
          </p>
        </div>
      </div>
    </aside>
  );
};
