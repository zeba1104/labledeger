import React, { useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  FlaskConical, 
  Box, 
  QrCode, 
  ArrowRightLeft, 
  FileText, 
  History, 
  Users, 
  Settings,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ 
  activeView, 
  setActiveView, 
  mobileOpen, 
  setMobileOpen,
  isCollapsed = false,
  onToggleCollapse
}) {
  const { permissions, user } = useAuth();
  const mobileDrawerRef = useRef(null);

  const coreNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'samples', label: 'Sample Registry', icon: FlaskConical, badge: 'IDs & QR' },
    { id: 'storage', label: 'Storage Map', icon: Box, badge: '5-Level' },
    { id: 'scanner', label: 'QR Scanner', icon: QrCode, badge: 'Live' },
    { id: 'transfers', label: 'Transfer Log', icon: ArrowRightLeft, badge: 'Chain' },
  ];

  const complianceNavItems = [
    { id: 'experiments', label: 'Experiment Notes', icon: FileText, badge: 'Assays' },
    { id: 'audit', label: 'Audit History', icon: History, badge: 'Immutable' },
  ];

  const adminNavItems = [];
  if (permissions.isAdmin || permissions.isViewer) {
    adminNavItems.push({ id: 'team', label: 'Team & Roles', icon: Users, badge: permissions.isAdmin ? 'Admin' : 'View' });
  }
  if (permissions.isAdmin) {
    adminNavItems.push({ id: 'settings', label: 'Lab Settings', icon: Settings, badge: 'PI' });
  }

  // Handle route change and close mobile drawer
  const handleNav = (id) => {
    setActiveView(id);
    if (mobileOpen && setMobileOpen) {
      setMobileOpen(false);
      document.getElementById('labledger-mobile-hamburger')?.focus();
    }
  };

  const handleCloseMobile = () => {
    if (setMobileOpen) setMobileOpen(false);
    document.getElementById('labledger-mobile-hamburger')?.focus();
  };

  // Lock body scroll and trap focus when mobile navigation drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          handleCloseMobile();
        } else if (e.key === 'Tab' && mobileDrawerRef.current) {
          const focusable = mobileDrawerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen]);

  const renderNavGroup = (title, items, isMobile = false) => {
    if (!items || items.length === 0) return null;
    const collapsedMode = isCollapsed && !isMobile;

    return (
      <div className="space-y-1 mb-4">
        {!collapsedMode ? (
          <div className="px-3 pt-2 pb-1 text-[0.8rem] font-bold uppercase tracking-[0.04em] text-slate-400 select-none">
            {title}
          </div>
        ) : (
          <div className="h-px bg-slate-200/80 my-2 mx-2" />
        )}

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              title={collapsedMode ? item.label : undefined}
              className={`
                w-full flex items-center ${collapsedMode ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-semibold
                transition-all duration-150 ease-out group relative sidebar-nav-item
                ${isActive 
                  ? 'active bg-[var(--brand-50)] text-[var(--brand-700)] font-bold border border-[var(--brand-200)] shadow-xs' 
                  : 'text-slate-600 hover:text-[var(--brand-strong)] hover:bg-[var(--surface-2)]'
                }
              `}
            >
              {/* 3px brand left indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[var(--brand)] rounded-r-full" />
              )}

              <div className={`flex items-center space-x-2.5 truncate ${collapsedMode ? '' : 'pl-1'}`}>
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[var(--brand)]' : 'text-slate-400 group-hover:text-[var(--brand)]'}`} />
                {!collapsedMode && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsedMode && item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold tracking-tight transition-colors ${
                  isActive 
                    ? 'bg-red-100 text-red-800 border border-red-200/60' 
                    : 'bg-slate-100 text-slate-500 group-hover:bg-red-50 group-hover:text-red-700'
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Hover Tooltip when collapsed */}
              {collapsedMode && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap flex items-center space-x-2">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* ========================================================
          MOBILE NAVIGATION DRAWER (< 1024px / under 768px)
          Off-canvas sliding drawer with backdrop & focus trap
          ======================================================== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop (opacity 0 to 0.5 fade) */}
          <div 
            onClick={handleCloseMobile}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs drawer-backdrop"
            aria-hidden="true"
          />

          {/* Off-canvas Drawer Panel */}
          <aside 
            ref={mobileDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Application Navigation"
            className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col justify-between border-r border-slate-200/90 drawer-panel z-50"
          >
            {/* Mobile Header with Brand & Close */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-base text-slate-900 tracking-tight">Lab<span className="text-red-600">Ledger</span></span>
                  <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-red-100 text-red-700 rounded-md">PRO</span>
                </div>
              </div>
              <button
                onClick={handleCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Groups for Mobile */}
            <div className="p-3.5 space-y-1 overflow-y-auto flex-1">
              {renderNavGroup('Specimen Operations', coreNavItems, true)}
              {renderNavGroup('Research & Regulatory', complianceNavItems, true)}
              {renderNavGroup('Laboratory Governance', adminNavItems, true)}
            </div>

            {/* Bottom Role Info Card for Mobile */}
            <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-rose-50/70 via-red-50/50 to-white border border-red-100/90 shadow-xs flex-shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-bold text-slate-800">Role Status</span>
                </div>
                <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE</span>
                </span>
              </div>
              <p className="text-[11px] font-extrabold text-red-700">{user?.role} Mode</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                {permissions.isAdmin && 'Full PI privileges: storage builder, transfers, roles & registry.'}
                {permissions.isResearcher && 'Scientist privileges: register samples, write assays & transfers.'}
                {permissions.isTechnician && 'Staff privileges: scan QR, update quantities, record freezer moves.'}
                {permissions.isViewer && 'Supervisor privileges: read-only inspection & audit log exports.'}
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================
          DESKTOP FIXED SIDEBAR (lg:flex)
          Supports full width (w-64) or icons-only collapsed (w-20)
          Persisted in localStorage with animated width transition
          ======================================================== */}
      <aside 
        aria-label="Desktop Navigation"
        className={`
          hidden lg:flex fixed top-16 bottom-0 left-0 z-20
          ${isCollapsed ? 'w-20' : 'w-64'} sidebar-container
          flex-col justify-between
          transition-all duration-[var(--dur-base)] ease-[var(--ease-standard)]
        `}
      >
        {/* Navigation list */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          {renderNavGroup('Specimen Operations', coreNavItems, false)}
          {renderNavGroup('Research & Regulatory', complianceNavItems, false)}
          {renderNavGroup('Laboratory Governance', adminNavItems, false)}
        </div>

        {/* Bottom Section: Role Info Card & Collapse Toggle */}
        <div className="p-2 border-t border-slate-100/90 flex-shrink-0 space-y-2 bg-slate-50/40">
          {!isCollapsed ? (
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-50/70 via-red-50/50 to-white border border-red-100/90 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-bold text-slate-800">Role Status</span>
                </div>
                <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE</span>
                </span>
              </div>
              <p className="text-[11px] font-extrabold text-red-700">{user?.role} Mode</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                {permissions.isAdmin && 'Full PI privileges: storage builder, transfers, roles & registry.'}
                {permissions.isResearcher && 'Scientist privileges: register samples, write assays & transfers.'}
                {permissions.isTechnician && 'Staff privileges: scan QR, update quantities, record freezer moves.'}
                {permissions.isViewer && 'Supervisor privileges: read-only inspection & audit log exports.'}
              </p>
            </div>
          ) : (
            <div className="relative group flex justify-center py-1">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 cursor-default">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                {user?.role} Mode (Active)
              </div>
            </div>
          )}

          {/* Sidebar Collapse Toggle Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand sidebar (w-64)' : 'Collapse sidebar (icons-only)'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="w-full flex items-center justify-center py-2 px-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-700 hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-xs group"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
              ) : (
                <div className="flex items-center space-x-2 text-slate-500 group-hover:text-red-700">
                  <PanelLeftClose className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                  <span className="text-[11px]">Collapse Sidebar</span>
                </div>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
