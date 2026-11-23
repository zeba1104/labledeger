import React, { useState } from 'react';
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
  Search
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

  const roleBadgeColors = {
    Admin: 'bg-red-100 text-red-800 border-red-200',
    Researcher: 'bg-rose-100 text-rose-800 border-rose-200',
    Technician: 'bg-amber-100 text-amber-800 border-amber-200',
    Viewer: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 lg:hidden transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => setActiveView('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">Lab<span className="text-red-600">Ledger</span></span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Digital Sample Logbook</p>
            </div>
          </div>
        </div>

        {/* Middle: Universal Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                if (activeView !== 'samples' && e.target.value) {
                  setActiveView('samples');
                }
              }}
              placeholder="Search by Sample ID (e.g. LAB-2026-0001), donor, type, or freezer..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all placeholder:text-slate-400"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions, Role Pill & User */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* QR Code Scanner Trigger */}
          <button
            onClick={onOpenQRScanner}
            title="Scan Tube or Box QR Code"
            className="btn-shimmer inline-flex items-center px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 shadow-xs hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <QrCode className="w-3.5 h-3.5 sm:mr-1.5 text-red-600 animate-pulse-subtle flex-shrink-0" />
            <span className="hidden sm:inline">Scan QR Code</span>
            <span className="hidden xs:inline sm:hidden">Scan</span>
          </button>

          {/* New Sample Button */}
          {permissions.canRegisterSample && (
            <button
              onClick={onOpenNewSample}
              className="btn-shimmer inline-flex items-center px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 hover:scale-105 active:scale-95 transition-all duration-200 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Register Specimen</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}

          {/* Static Logged-in Role Badge with live radar */}
          <div className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 rounded-xl text-xs font-bold border select-none cursor-default shadow-xs flex-shrink-0 ${roleBadgeColors[user?.role || 'Admin']}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="hidden sm:inline">Role:</span>
            <span>{user?.role}</span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <User className="w-4 h-4" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-modal-pop">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <p className="text-[10px] text-red-600 font-medium mt-0.5">{user?.department}</p>
                </div>

                <button
                  onClick={() => {
                    setShowOnboarding(true);
                    setUserMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-red-600" />
                  <span>Product Tour & Onboarding</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-red-700 hover:bg-red-50 flex items-center space-x-2 border-t border-slate-100 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
