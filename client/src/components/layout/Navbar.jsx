import React, { useState, useEffect, useRef } from 'react';
import { 
  FlaskConical, 
  QrCode, 
  Plus, 
  LogOut, 
  ChevronDown, 
  User, 
  HelpCircle, 
  Menu, 
  X, 
  ShieldAlert,
  Sparkles,
  Search,
  Command,
  Activity,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ 
  onOpenQRScanner, 
  onOpenNewSample, 
  mobileOpen, 
  setMobileOpen,
  globalSearch,
  setGlobalSearch,
  activeView,
  setActiveView
}) {
  const { user, logout, permissions, setShowOnboarding } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const menuRef = useRef(null);
  const userButtonRef = useRef(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape' && userMenuOpen) {
        setUserMenuOpen(false);
        userButtonRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userMenuOpen]);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const rolePillConfig = {
    Admin: {
      pill: 'bg-[var(--brand-50)] text-[var(--brand-700)] border-[var(--brand-200)]',
      radar: 'bg-red-400',
      dot: 'bg-[var(--brand)]'
    },
    Researcher: {
      pill: 'bg-rose-50 text-rose-700 border-rose-200',
      radar: 'bg-rose-400',
      dot: 'bg-rose-600'
    },
    Technician: {
      pill: 'bg-[var(--warning-muted)] text-[var(--warning-text)] border-[var(--warning-border)]',
      radar: 'bg-amber-400',
      dot: 'bg-[var(--warning)]'
    },
    Viewer: {
      pill: 'bg-[var(--info-muted)] text-[var(--info-text)] border-[var(--info-border)]',
      radar: 'bg-sky-400',
      dot: 'bg-[var(--info)]'
    }
  };

  const currentRoleConfig = rolePillConfig[user?.role || 'Admin'] || rolePillConfig.Admin;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <button
            id="labledger-mobile-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50/80 lg:hidden transition-all duration-200 active:scale-95"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => setActiveView('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 group-hover:shadow-red-500/30 transition-all duration-200">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Lab<span className="text-red-600">Ledger</span>
                </span>
                <span className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200/60 rounded-md">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block tracking-wide">
                Digital Sample Logbook
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Universal Search Bar with Focus Grow */}
        <div className="hidden md:flex items-center mx-2 lg:mx-4 transition-all duration-[var(--dur-fast)] ease-[var(--ease-standard)] w-60 lg:w-72 focus-within:w-80 lg:focus-within:w-96">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-red-600 transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                if (activeView !== 'samples' && e.target.value) {
                  setActiveView('samples');
                }
              }}
              placeholder="Search by Sample ID (e.g. LAB-2026-0001), donor, type..."
              className="w-full pl-9 pr-14 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/90 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all placeholder:text-slate-400 shadow-xs"
            />
            {globalSearch ? (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-xs">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions, Role Pill & User */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
          {/* QR Code Scanner Trigger */}
          <button
            onClick={onOpenQRScanner}
            title="Scan Tube or Box QR Code"
            className="btn-shimmer inline-flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200/80 shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap flex-shrink-0"
          >
            <QrCode className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1.5 text-red-600 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Scan QR</span>
          </button>

          {/* New Sample Button */}
          {permissions.canRegisterSample && (
            <button
              onClick={onOpenNewSample}
              title="Register New Research Specimen"
              className="btn-shimmer inline-flex items-center justify-center p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-sm shadow-red-500/25 hover:shadow-md hover:shadow-red-500/30 hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1 flex-shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">Register Specimen</span>
              <span className="hidden sm:inline md:hidden whitespace-nowrap">Register</span>
            </button>
          )}

          {/* Semantic Role Status Pill (Desktop/Tablet) */}
          <div className={`hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border select-none cursor-default shadow-xs flex-shrink-0 whitespace-nowrap ${currentRoleConfig.pill}`}>
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className={`animate-radar absolute inline-flex h-full w-full rounded-full opacity-75 ${currentRoleConfig.radar}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${currentRoleConfig.dot}`}></span>
            </span>
            <span className="opacity-75 font-medium">Role:</span>
            <span>{user?.role}</span>
          </div>

          {/* User Menu with Popover */}
          <div className="relative" ref={menuRef}>
            <button
              ref={userButtonRef}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
              className="flex items-center space-x-1 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {getInitials(user?.name)}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <div className="popover-menu absolute right-0 mt-2 w-64 bg-white z-50 py-2">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                      {getInitials(user?.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/60">
                    <span>{user?.role}</span>
                    <span>&bull;</span>
                    <span className="truncate max-w-[120px]">{user?.department}</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowOnboarding(true);
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-rose-50/50 flex items-center space-x-2.5 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-red-600" />
                    <span>Product Tour & Onboarding</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('settings');
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-rose-50/50 flex items-center space-x-2.5 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-slate-500" />
                    <span>Laboratory Preferences</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center space-x-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of LabLedger</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
