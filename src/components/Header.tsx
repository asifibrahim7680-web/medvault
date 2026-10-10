import React, { useState, useRef, useEffect } from 'react';
import { useMediVault } from '../context/MediVaultContext';

export const Header: React.FC = () => {
  const {
    globalSearch,
    setGlobalSearch,
    setUploadModalOpen,
    profile,
    setNotificationDrawerOpen,
    setActiveTab,
    setAuthModalOpen,
    backendStatus,
  } = useMediVault();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-6">
      {/* Brand */}
      <div className="flex items-center gap-6 w-60 shrink-0">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
            MV
          </div>
          <span className="font-semibold text-base text-slate-900 tracking-tight">
            MediVault
          </span>
        </div>
      </div>

      {/* Minimal Search Bar */}
      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3 text-slate-400 pointer-events-none text-[18px]">
            search
          </span>
          <input
            className="w-full h-9 pl-9 pr-8 bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition-all"
            placeholder="Search records, medications, appointments..."
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          {globalSearch && (
            <button
              className="absolute right-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              onClick={() => setGlobalSearch('')}
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 justify-end shrink-0">
        {/* Upload Action */}
        <button
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          type="button"
          onClick={() => setUploadModalOpen(true)}
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Upload Record</span>
        </button>

        {/* Notifications Icon */}
        <button
          aria-label="Notifications"
          className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
          type="button"
          onClick={() => setNotificationDrawerOpen(true)}
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1"></div>

        {/* User Profile Pill */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 pl-1 cursor-pointer group select-none"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          >
            <img
              alt="Profile"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
              src={profile.avatarUrl}
            />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-800 group-hover:text-teal-700 transition-colors leading-tight">
                {profile.fullName}
              </span>
              <span className="text-[11px] text-slate-400 font-mono leading-tight">
                #{profile.healthId}
              </span>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[16px] group-hover:text-slate-700 transition-colors">
              expand_more
            </span>
          </div>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-11 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">{profile.fullName}</p>
                <p className="text-slate-400 truncate mt-0.5">{profile.email}</p>
                <div className="mt-1 flex items-center gap-1.5 text-slate-500">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      backendStatus.configured ? 'bg-emerald-500' : 'bg-teal-600'
                    }`}
                  ></span>
                  <span>{backendStatus.mode}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                  onClick={() => {
                    setActiveTab('settings');
                    setProfileDropdownOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">badge</span>
                  <span>Profile &amp; Emergency Info</span>
                </button>

                <button
                  className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                  onClick={() => {
                    setAuthModalOpen(true);
                    setProfileDropdownOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined text-[16px] text-teal-700">cloud_sync</span>
                  <span>Supabase Backend &amp; Auth</span>
                </button>

                <button
                  className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                  onClick={() => {
                    setActiveTab('settings');
                    setProfileDropdownOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">settings</span>
                  <span>Settings &amp; Preferences</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                  onClick={() => {
                    setAuthModalOpen(true);
                    setProfileDropdownOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Switch Account / Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
