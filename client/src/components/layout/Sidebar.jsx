import React from 'react';
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
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ activeView, setActiveView, mobileOpen, setMobileOpen }) {
  const { permissions, user } = useAuth();

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

  const handleNav = (id) => {
    setActiveView(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  const renderNavGroup = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-1 mb-4">
        <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none">
          {title}
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold
                transition-all duration-200 group relative sidebar-nav-item
                ${isActive 
                  ? 'active bg-red-50 text-red-700 font-bold border border-red-200/80 shadow-xs' 
                  : 'text-slate-600 hover:text-red-700 hover:bg-slate-50/80'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-red-600 rounded-r-full" />
              )}
              <div className="flex items-center space-x-2.5 truncate pl-1">
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-red-600'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold tracking-tight transition-colors ${
                  isActive 
                    ? 'bg-red-100 text-red-800 border border-red-200/60' 
                    : 'bg-slate-100 text-slate-500 group-hover:bg-red-50 group-hover:text-red-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container - FIXED on screen with proper mobile z-index */}
      <aside className={`
        fixed top-16 bottom-0 left-0 z-50 lg:z-20
        w-64 sidebar-container shadow-xl lg:shadow-none
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Navigation list */}
        <div className="p-3.5 space-y-1 overflow-y-auto flex-1">
          <div className="lg:hidden flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Close menu"
            >
              ✕
            </button>
          </div>

          {renderNavGroup('Specimen Operations', coreNavItems)}
          {renderNavGroup('Research & Regulatory', complianceNavItems)}
          {renderNavGroup('Laboratory Governance', adminNavItems)}
        </div>

        {/* Bottom Role Info Card */}
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
    </>
  );
}
