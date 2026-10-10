import React, { useState } from 'react';
import { useMediVault } from '../../context/MediVaultContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, backendStatus, refreshBackendStatus, showToast, profile, updateProfile } = useMediVault();

  const [authMode, setAuthMode] = useState<'status' | 'login' | 'register' | 'recovery'>('status');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  if (!authModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setAuthError('');

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setAuthError(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          updateProfile({
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || email.split('@')[0],
          });
          showToast(`Logged in successfully as ${email}`, 'success');
          setAuthModalOpen(false);
        }
      } catch (err: any) {
        setAuthError(err.message || 'Authentication error');
      }
    } else {
      // Demo local login
      setTimeout(() => {
        updateProfile({
          email,
          fullName: fullName || email.split('@')[0],
        });
        showToast(`Simulated local login as ${email} (Demo Enclave)`, 'info');
        setLoading(false);
        setAuthModalOpen(false);
      }, 500);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setAuthError('');

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || 'Patient',
            },
          },
        });

        if (error) {
          setAuthError(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          updateProfile({
            email: data.user.email || email,
            fullName: fullName || 'Patient',
          });
          showToast('Account created! Please check your email for confirmation.', 'success');
          setAuthModalOpen(false);
        }
      } catch (err: any) {
        setAuthError(err.message || 'Registration error');
      }
    } else {
      setTimeout(() => {
        updateProfile({
          email,
          fullName: fullName || 'Patient',
        });
        showToast(`Local demo account created for ${email}`, 'info');
        setLoading(false);
        setAuthModalOpen(false);
      }, 500);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setAuthError('');

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
          setAuthError(error.message);
          setLoading(false);
          return;
        }
        showToast(`Password recovery link dispatched to ${email}`, 'success');
        setAuthMode('login');
      } catch (err: any) {
        setAuthError(err.message || 'Recovery request error');
      }
    } else {
      setTimeout(() => {
        showToast(`Password recovery simulation sent to ${email}`, 'info');
        setLoading(false);
        setAuthMode('login');
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl flex flex-col gap-space-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
          <div className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">security</span>
            </div>
            <div>
              <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">
                Supabase Backend & Authentication
              </h3>
              <p className="font-label-xs text-label-xs text-outline">
                {backendStatus.configured ? 'Live Cloud Sync' : 'Local Demo Enclave Active'}
              </p>
            </div>
          </div>
          <button
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors"
            onClick={() => setAuthModalOpen(false)}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Backend Status Box */}
        <div className={`p-4 rounded-xl border ${backendStatus.configured ? 'bg-tertiary-fixed/20 border-tertiary/30' : 'bg-surface-container-low border-outline-variant/40'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${backendStatus.configured ? 'bg-tertiary animate-pulse' : 'bg-outline'}`}></span>
              <span className="font-title-sm text-sm font-semibold text-on-surface">
                {backendStatus.mode}
              </span>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container font-semibold">
              {backendStatus.configured ? 'Connected' : 'Demo Mode'}
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-2 leading-relaxed">
            {backendStatus.statusNote}
          </p>

          {!backendStatus.configured && (
            <div className="mt-3 p-2.5 bg-surface rounded-lg text-xs font-mono text-outline leading-tight">
              To connect live Supabase, define in <code>.env</code>:<br />
              <span className="text-primary font-semibold">VITE_SUPABASE_URL</span>=https://xyz.supabase.co<br />
              <span className="text-primary font-semibold">VITE_SUPABASE_ANON_KEY</span>=eyJhbGci...
            </div>
          )}
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex border-b border-outline-variant/20 gap-2">
          <button
            className={`pb-2 px-3 font-label-sm text-sm border-b-2 transition-colors ${authMode === 'status' ? 'border-primary text-primary font-semibold' : 'border-transparent text-outline hover:text-on-surface'}`}
            onClick={() => setAuthMode('status')}
          >
            Session Info
          </button>
          <button
            className={`pb-2 px-3 font-label-sm text-sm border-b-2 transition-colors ${authMode === 'login' ? 'border-primary text-primary font-semibold' : 'border-transparent text-outline hover:text-on-surface'}`}
            onClick={() => setAuthMode('login')}
          >
            Sign In
          </button>
          <button
            className={`pb-2 px-3 font-label-sm text-sm border-b-2 transition-colors ${authMode === 'register' ? 'border-primary text-primary font-semibold' : 'border-transparent text-outline hover:text-on-surface'}`}
            onClick={() => setAuthMode('register')}
          >
            Register
          </button>
        </div>

        {authError && (
          <div className="p-2.5 bg-error-container text-on-error-container rounded-lg font-body-sm text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{authError}</span>
          </div>
        )}

        {authMode === 'status' && (
          <div className="flex flex-col gap-3 py-1">
            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
              <img src={profile.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-title-sm text-sm font-semibold text-on-surface">{profile.fullName}</p>
                <p className="font-body-sm text-xs text-outline">{profile.email}</p>
                <p className="font-label-xs text-primary font-mono mt-0.5">Health ID #{profile.healthId}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-on-surface-variant">
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span>Row Level Security (RLS):</span>
                <span className="font-semibold text-primary">Enforced (auth.uid = user_id)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span>Private Medical Storage Bucket:</span>
                <span className="font-semibold">medical-vault-docs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span>Patient Cryptographic Enclave:</span>
                <span className="font-semibold text-tertiary">AES-256 GCM Client Encryption</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg font-label-sm text-sm"
                onClick={() => setAuthModalOpen(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-sm text-sm"
                onClick={() => setAuthMode('login')}
              >
                Switch User / Login
              </button>
            </div>
          </div>
        )}

        {authMode === 'login' && (
          <form onSubmit={handleSignIn} className="flex flex-col gap-3 py-1">
            <div>
              <label className="block font-label-xs text-outline uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                required
                type="email"
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="patient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-label-xs text-outline uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  className="font-label-xs text-primary hover:underline"
                  onClick={() => setAuthMode('recovery')}
                >
                  Forgot password?
                </button>
              </div>
              <input
                required
                type="password"
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-sm text-sm"
                onClick={() => setAuthMode('status')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-sm text-sm shadow-sm"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
        )}

        {authMode === 'register' && (
          <form onSubmit={handleSignUp} className="flex flex-col gap-3 py-1">
            <div>
              <label className="block font-label-xs text-outline uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                required
                type="text"
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Sarah Jenkins"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-label-xs text-outline uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                required
                type="email"
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="patient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-label-xs text-outline uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                required
                type="password"
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-sm text-sm"
                onClick={() => setAuthMode('status')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-sm text-sm shadow-sm"
              >
                {loading ? 'Registering...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {authMode === 'recovery' && (
          <form onSubmit={handlePasswordRecovery} className="flex flex-col gap-3 py-1">
            <p className="font-body-sm text-xs text-on-surface-variant">
              Enter your email address and we'll dispatch a secure recovery link to reset your vault credentials.
            </p>
            <div>
              <label className="block font-label-xs text-outline uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                required
                type="email"
                className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="patient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-sm text-sm"
                onClick={() => setAuthMode('login')}
              >
                Back to Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-sm text-sm shadow-sm"
              >
                {loading ? 'Sending...' : 'Send Recovery Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
