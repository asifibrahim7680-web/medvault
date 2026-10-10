import React from 'react';
import { useMediVault, TabType } from '../context/MediVaultContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useMediVault();

  const navItems: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'medical-records', label: 'Medical Records', icon: 'folder_shared' },
    { id: 'medicines', label: 'Medicines', icon: 'medication' },
    { id: 'appointments', label: 'Appointments', icon: 'calendar_today' },
    { id: 'health-timeline', label: 'Health Timeline', icon: 'timeline' },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-60 bg-white border-r border-slate-200 z-40 flex flex-col justify-between p-4">
      <div className="flex flex-col gap-3">
        <div className="px-3 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Clinical Portal
          </span>
        </div>

        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                type="button"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer w-full ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    isActive ? 'text-teal-700' : 'text-slate-400'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => setActiveTab('settings')}
          type="button"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer w-full ${
            activeTab === 'settings'
              ? 'bg-teal-50 text-teal-900 font-medium'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              activeTab === 'settings' ? 'text-teal-700' : 'text-slate-400'
            }`}
          >
            settings
          </span>
          <span>Settings</span>
        </button>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-teal-700 mb-0.5">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              HIPAA Protected
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Client-encrypted clinical records vault
          </p>
        </div>
      </div>
    </aside>
  );
};
