import React, { useState, useRef, useEffect } from 'react';
import { useMediVault } from '../context/MediVaultContext';

export const Header: React.FC = () => {
  const {
    globalSearch,
    setGlobalSearch,
    setUploadModalOpen,
    setAddAptModalOpen,
    profile,
    setNotificationDrawerOpen,
    setActiveTab,
    setAuthModalOpen,
    backendStatus,
  } = useMediVault();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
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
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white border-b border-neutral-200 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Brand: MediVault with 1mg Coral Accent */}
      <div className="flex items-center gap-3 w-60 shrink-0">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setActiveTab('dashboard')}
          title="Go to MediVault"
        >
          {/* Coral 1mg-styled Rounded Icon */}
          <div className="w-9 h-9 rounded-xl bg-[#ff6f61] text-white flex items-center justify-center font-bold text-base tracking-tight shadow-xs">
            <span className="material-symbols-outlined text-[20px] text-white">biotechnology</span>
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-base text-neutral-900 tracking-tight">MediVault</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff6f61] bg-[#fff2ef] px-1.5 py-0.5 rounded">
                Labs
              </span>
            </div>
            <span className="text-[11px] font-medium text-neutral-500 tracking-tight mt-0.5">
              Smart Health &amp; Diagnostics
            </span>
          </div>
        </div>
      </div>

      {/* Location Selector & 1mg-style Search Bar */}
      <div className="flex-1 max-w-2xl mx-auto flex items-center gap-2.5">
        {/* City Selector */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200 text-xs text-neutral-700 cursor-pointer shrink-0 transition-colors">
          <span className="material-symbols-outlined text-[16px] text-[#ff6f61]">location_on</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-transparent border-none text-xs font-semibold text-neutral-800 focus:outline-none cursor-pointer pr-1"
          >
            <option value="Bengaluru">Bengaluru</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Chennai">Chennai</option>
            <option value="Pune">Pune</option>
          </select>
        </div>

        {/* Search Bar (1mg rounded clean search style) */}
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3.5 text-neutral-400 pointer-events-none text-[18px]">
            search
          </span>
          <input
            className="w-full h-10 pl-10 pr-9 bg-neutral-50 hover:bg-white focus:bg-white rounded-lg border border-neutral-200 text-xs md:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#ff6f61] focus:border-[#ff6f61] transition-all"
            placeholder="Search for lab tests, health packages, doctors, medications..."
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          {globalSearch && (
            <button
              className="absolute right-3 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              onClick={() => setGlobalSearch('')}
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center gap-2.5 justify-end shrink-0">
        {/* Book Lab Test / Consult CTA */}
        <button
          className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 bg-white hover:bg-[#fff2ef] text-[#ff6f61] border border-[#ff6f61]/40 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          type="button"
          onClick={() => setAddAptModalOpen(true)}
        >
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          <span>Book Test</span>
        </button>

        {/* Upload Prescription / Report CTA (1mg Coral) */}
        <button
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-[#ff6f61] hover:bg-[#e55345] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          type="button"
          onClick={() => setUploadModalOpen(true)}
        >
          <span className="material-symbols-outlined text-[16px]">upload_file</span>
          <span>Upload Report</span>
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
          type="button"
          onClick={() => setNotificationDrawerOpen(true)}
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ff6f61] rounded-full"></span>
        </button>

        <div className="h-5 w-px bg-neutral-200 mx-0.5"></div>

        {/* User Account Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 pl-1 cursor-pointer group select-none"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          >
            <img
              alt="Patient Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200"
              src={profile.avatarUrl}
            />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-neutral-800 group-hover:text-[#ff6f61] transition-colors leading-tight">
                {profile.fullName}
              </span>
              <span className="text-[11px] text-[#ff6f61] font-mono font-medium leading-tight">
                ID: {profile.healthId}
              </span>
            </div>
            <span className="material-symbols-outlined text-neutral-400 text-[16px] group-hover:text-neutral-700 transition-colors">
              expand_more
            </span>
          </div>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-11 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50 text-xs">
              <div className="px-3.5 py-2.5 border-b border-neutral-100 bg-[#fff2ef]/40 rounded-t-xl">
                <p className="font-bold text-neutral-900">{profile.fullName}</p>
                <p className="text-neutral-500 text-[11px] truncate mt-0.5">{profile.email}</p>
                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-600 font-mono">Patient ID: {profile.healthId}</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                    Verified
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  className="w-full text-left px-3.5 py-2 text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors cursor-pointer"
                  onClick={() => {
                    setActiveTab('settings');
                    setProfileDropdownOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined text-[16px] text-neutral-400">badge</span>
                  <span>Patient Profile &amp; Emergency Card</span>
                </button>

                <button
                  className="w-full text-left px-3.5 py-2 text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors cursor-pointer"
                  onClick={() => {
                    setActiveTab('appointments');
                    setProfileDropdownOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined text-[16px] text-[#ff6f61]">calendar_month</span>
                  <span>My Lab Tests &amp; Consultations</span>
                </button>

                <button
                  className="w-full text-left px-3.5 py-2 text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors cursor-pointer"
                  onClick={() => {
                    setActiveTab('medical-records');
                    setProfileDropdownOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined text-[16px] text-neutral-400">folder_shared</span>
                  <span>Diagnostic Smart Reports</span>
                </button>

                <button
                  className="w-full text-left px-3.5 py-2 text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors cursor-pointer"
                  onClick={() => {
                    setAuthModalOpen(true);
                    setProfileDropdownOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined text-[16px] text-[#ff6f61]">cloud_sync</span>
                  <span>Cloud Sync &amp; Backup</span>
                </button>
              </div>

              <div className="pt-1 border-t border-neutral-100">
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
