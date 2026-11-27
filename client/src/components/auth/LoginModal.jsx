import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Lock, 
  Mail, 
  AlertCircle, 
  LogIn, 
  UserCheck, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Field errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (val) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Laboratory email address is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address (e.g., name@yopmail.com).';
    }
    return '';
  };

  const validatePassword = (val) => {
    if (!val) {
      return 'Password is required to authenticate.';
    }
    if (val.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) {
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      onClose();
    } catch (err) {
      setFormError(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop overflow-y-auto p-4 animate-fade-in">
      <div className="relative modal-shell max-w-md w-full animate-modal-pop my-auto">
        {/* Header Ribbon */}
        <div className="modal-header-ribbon p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white/90 hover:text-white hover:rotate-90 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-rose-200 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-rose-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
            </span>
            <ShieldCheck className="w-4 h-4 text-rose-300" />
            <span>Authorized Personnel Access</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Sign in to LabLedger</h2>
          <p className="text-xs text-rose-100 mt-1">
            Access specimen registries, cryogenic storage, and audit logs
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1">
          {formError && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2.5 animate-fade-in shadow-xs">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block mb-0.5">Authentication Failed</span>
                <span>{formError}</span>
              </div>
            </div>
          )}

          {/* Quick Demo Autofill Pills */}
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Quick 1-Click Role Login:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@yopmail.com');
                  setPassword('password123');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 border border-slate-200 text-left text-[11px] font-semibold transition-all shadow-xs flex items-center justify-between"
              >
                <span className="truncate">Dr. Sarah Chen</span>
                <span className="text-[9px] font-bold bg-red-100 text-red-800 px-1.5 py-0.2 rounded ml-1">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('researcher@yopmail.com');
                  setPassword('password123');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-700 border border-slate-200 text-left text-[11px] font-semibold transition-all shadow-xs flex items-center justify-between"
              >
                <span className="truncate">Dr. Anita Rao</span>
                <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded ml-1">Scientist</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('tech@yopmail.com');
                  setPassword('password123');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-700 border border-slate-200 text-left text-[11px] font-semibold transition-all shadow-xs flex items-center justify-between"
              >
                <span className="truncate">Ravi Patel</span>
                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded ml-1">Tech</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('auditor@yopmail.com');
                  setPassword('password123');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 hover:text-slate-900 border border-slate-200 text-left text-[11px] font-semibold transition-all shadow-xs flex items-center justify-between"
              >
                <span className="truncate">Dr. Marcus Vance</span>
                <span className="text-[9px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded ml-1">Auditor</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Laboratory Email
                </label>
                {email && !emailError && (
                  <span className="text-[11px] text-emerald-600 flex items-center font-semibold">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Valid
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(validateEmail(e.target.value));
                  }}
                  onBlur={() => setEmailError(validateEmail(email))}
                  placeholder="name@yopmail.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all focus:outline-none focus:bg-white ${
                    emailError 
                      ? 'border-red-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-600' 
                      : 'border-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-600'
                  }`}
                  required
                />
              </div>
              {emailError && (
                <p className="mt-1.5 text-[11px] text-red-600 font-medium animate-fade-in flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(validatePassword(e.target.value));
                  }}
                  onBlur={() => setPasswordError(validatePassword(password))}
                  placeholder="Enter your account password"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all focus:outline-none focus:bg-white ${
                    passwordError 
                      ? 'border-red-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-600' 
                      : 'border-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-600'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1.5 text-[11px] text-red-600 font-medium animate-fade-in flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>Keep me signed in on this workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-shimmer w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25 hover:shadow-red-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate to Logbook</span>
                </>
              )}
            </button>
          </form>

          {/* Security & Provisioning Note */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              🔒 <b>Security Notice:</b> Personnel accounts are strictly provisioned by the <b>Laboratory Director / PI (Admin)</b>. Login credentials and role privileges are delivered directly to your official email.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
