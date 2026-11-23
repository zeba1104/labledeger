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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'samples', label: 'Sample Registry', icon: FlaskConical, badge: 'IDs & QR' },
    { id: 'storage', label: 'Storage Map', icon: Box, badge: '5-Level' },
    { id: 'scanner', label: 'QR Scanner', icon: QrCode, badge: 'Live' },
    { id: 'transfers', label: 'Transfer Log', icon: ArrowRightLeft, badge: 'Chain' },
    { id: 'experiments', label: 'Experiment Notes', icon: FileText, badge: 'Assays' },
    { id: 'audit', label: 'Audit History', icon: History, badge: 'Immutable' },
  ];

  // Admin / Supervisor views
  if (permissions.isAdmin || permissions.isViewer) {
    navItems.push({ id: 'team', label: 'Team & Roles', icon: Users, badge: permissions.isAdmin ? 'Admin' : 'View' });
  }

  if (permissions.isAdmin) {
    navItems.push({ id: 'settings', label: 'Lab Settings', icon: Settings, badge: 'PI' });
  }

  const handleNav = (id) => {
    setActiveView(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static top-16 bottom-0 left-0 z-30
        w-64 bg-white border-r border-slate-200/90
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Navigation list */}
        <div className="p-3.5 space-y-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Digital Logbook Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold
                  transition-all duration-200 group
                  ${isActive 
                    ? 'bg-red-50 text-red-700 font-bold border border-red-200/70 shadow-xs translate-x-1' 
                    : 'text-slate-600 hover:text-red-700 hover:bg-slate-50 hover:translate-x-1'
                  }
                `}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-115 ${isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-red-600'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium transition-colors ${
                    isActive 
                      ? 'bg-red-200/80 text-red-800' 
                      : 'bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Role Info Card */}
        <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 border border-red-100/90">
          <div className="flex items-center space-x-2 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-slate-800">Role Status</span>
          </div>
          <p className="text-[11px] font-semibold text-red-700">{user?.role} Mode</p>
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
