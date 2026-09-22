import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  ArrowRight
} from 'lucide-react';

interface SuperAdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export const SuperAdminLoginModal: React.FC<SuperAdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Super Admin Access Gate',
  description = 'Enter your master administrator password to view other companies and platform-wide configurations.',
}) => {
  const { loginSuperAdmin, setActiveView, currentTenant } = useApp();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your Super Admin master password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = loginSuperAdmin(password);
      setIsSubmitting(false);

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setPassword('');
          onClose();
          if (onSuccess) {
            onSuccess();
          } else {
            setActiveView('super_admin');
          }
        }, 500);
      } else {
        setError(result.message || 'Incorrect Super Admin password. Access denied.');
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white border border-stone-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Security Header */}
        <div className="bg-stone-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
            title="Cancel and close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-stone-300 mt-1 leading-relaxed">{description}</p>

          <div className="mt-3 flex items-center space-x-2 text-[11px] text-amber-300 bg-amber-950/60 border border-amber-800/60 rounded-lg px-2.5 py-1.5 font-mono">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Active Workspace: {currentTenant.name}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2 animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Clearance granted. Unlocking Super Admin portal...</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-800 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-stone-500" />
              <span>Super Admin Password</span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter master password"
                autoFocus
                disabled={isSubmitting || isSuccess}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-600">
              Input characters are hidden to prevent unauthorized viewing.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-2"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Unlock Super Admin'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Security Note */}
          <div className="border-t border-stone-100 pt-3 text-[11px] text-stone-600 flex items-center justify-between">
            <span>Isolation standard: WCS-SEC-01</span>
            <span className="font-mono text-stone-600">Tenant Shield Active</span>
          </div>
        </form>
      </div>
    </div>
  );
};
