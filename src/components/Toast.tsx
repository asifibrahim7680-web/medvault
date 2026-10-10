import React from 'react';
import { useMediVault } from '../context/MediVaultContext';

export const Toast: React.FC = () => {
  const { toast } = useMediVault();

  if (!toast) return null;

  const bgClasses = {
    success: 'bg-primary text-on-primary',
    error: 'bg-error text-on-error',
    info: 'bg-secondary text-on-secondary',
  }[toast.type];

  const iconName = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  }[toast.type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg font-label-md ${bgClasses}`}>
        <span className="material-symbols-outlined text-[20px]">{iconName}</span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
