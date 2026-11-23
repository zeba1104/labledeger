import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Box, 
  ArrowRightLeft, 
  FileText, 
  History, 
  Thermometer, 
  QrCode, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard({ 
  setActiveView, 
  onOpenNewSample, 
  onOpenQRScanner,
  onOpenSampleDetails
}) {
  const { user, permissions } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200/70 rounded-2xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200/60 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalSamples: 0,
    activeStoredSamples: 0,
    totalTransfers: 0,
    totalExperiments: 0,
    totalAuditEntries: 0,
    occupancyRate: 0,
    totalStorageSlots: 0
  };

  const typeCounts = stats?.typeCounts || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-800 p-6 sm:p-8 text-white shadow-xl shadow-red-500/15">
        <div className="absolute right-0 top-0 bottom-0 opacity-15 pointer-events-none flex items-center pr-6">
          <FlaskConical className="w-64 h-64 text-white animate-float-slow" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-md mb-3 border border-white/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <Activity className="w-3.5 h-3.5 text-rose-200" />
            <span>Digital Sample Ledger & Cold Chain Tracking</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-red-100 mt-1.5 leading-relaxed">
            Role: <b className="text-white underline">{user?.role}</b> &bull; Department: {user?.department}.
            The laboratory specimen registry is synchronized with MongoDB Atlas and ready for registration, transfers, and audit queries.
          </p>

          {/* Quick Action Ribbon */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            {permissions.canRegisterSample && (
              <button
                onClick={onOpenNewSample}
                className="btn-shimmer inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-red-700 bg-white hover:bg-rose-50 shadow-md shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5 text-red-600" />
                Register New Sample
              </button>
            )}

            <button
              onClick={onOpenQRScanner}
              className="btn-shimmer inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-700/60 hover:bg-red-700/80 border border-white/20 backdrop-blur-sm shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <QrCode className="w-3.5 h-3.5 mr-1.5" />
              Scan QR Code
            </button>

            <button
              onClick={() => setActiveView('storage')}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Box className="w-3.5 h-3.5 mr-1.5" />
              Open Storage Map
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Samples */}
        <div 
          onClick={() => setActiveView('samples')}
          className="card-interactive bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-red-300 shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Specimens</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-red-600 transition-colors">{metrics.totalSamples}</span>
            <span className="text-xs text-emerald-600 font-semibold">{metrics.activeStoredSamples} Active Stored</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Unique LAB-2026-XXXX format</p>
        </div>

        {/* Storage Occupancy */}
        <div 
          onClick={() => setActiveView('storage')}
          className="card-interactive bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-red-300 shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cryo Occupancy</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors">{metrics.occupancyRate}%</span>
            <span className="text-xs text-slate-500 font-medium">of {metrics.totalStorageSlots} Slots</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-500 to-rose-600 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(metrics.occupancyRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Transfers Logged */}
        <div 
          onClick={() => setActiveView('transfers')}
          className="card-interactive bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-red-300 shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Chain Transfers</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{metrics.totalTransfers}</span>
            <span className="text-xs text-amber-600 font-semibold">Moves Tracked</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Custodian & freezer audit</p>
        </div>

        {/* Audit Log Entries */}
        <div 
          onClick={() => setActiveView('audit')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-red-300 shadow-xs hover:shadow-md hover:shadow-red-500/5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Immutable Audit Trail</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{metrics.totalAuditEntries}</span>
            <span className="text-xs text-slate-500 font-semibold">Events Logged</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Unchangeable GLP ledger</p>
        </div>
      </div>

      {/* Middle Row: Sample Type Distribution + Cold Chain Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specimen Category Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Specimen Types in Biobank</h3>
              <p className="text-xs text-slate-500">Live breakdown across laboratory projects</p>
            </div>
            <button
              onClick={() => setActiveView('samples')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {Object.keys(typeCounts).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No samples registered yet.</p>
            ) : (
              Object.entries(typeCounts).map(([type, count]) => {
                const percent = Math.round((count / (metrics.totalSamples || 1)) * 100);
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{type}</span>
                      <span className="text-slate-500">{count} specimens ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-red-600 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cold Storage & Freezers Monitor */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Storage Environments</h3>
                <p className="text-xs text-slate-500">Target cold-chain checkpoints</p>
              </div>
              <Thermometer className="w-4 h-4 text-red-600" />
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Ultra-Low Freezer 1</h4>
                  <p className="text-[11px] text-slate-500">Main Biobank (Room 104)</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                    -80°C
                  </span>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">● Nominal</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Ultra-Low Freezer 2</h4>
                  <p className="text-[11px] text-slate-500">Backup Cold-Chain (Room 104)</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                    -80°C
                  </span>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">● Nominal</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Enzyme Storage Freezer</h4>
                  <p className="text-[11px] text-slate-500">Genomics Suite (Room 202)</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-cyan-100 text-cyan-800 border border-cyan-200">
                    -20°C
                  </span>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">● Nominal</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('storage')}
            className="w-full mt-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors flex items-center justify-center space-x-1"
          >
            <Box className="w-3.5 h-3.5 mr-1 text-red-600" />
            <span>Open Storage Hierarchy Visualizer</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Recent Transfers & Immutable Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transfers Log */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Recent Specimen Transfers</h3>
              <p className="text-xs text-slate-500">Live chain of custody tracking</p>
            </div>
            <button
              onClick={() => setActiveView('transfers')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center"
            >
              <span>Full Log</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-2.5">
            {(!stats?.recentTransfers || stats.recentTransfers.length === 0) ? (
              <p className="text-xs text-slate-400 py-4 text-center">No transfers recorded.</p>
            ) : (
              stats.recentTransfers.map((t) => (
                <div key={t._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-red-700">{t.sampleId}</span>
                    <span className="text-[10px] text-slate-400">{new Date(t.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700 font-medium truncate">{t.sampleName}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Moved to <b className="text-slate-800">{t.targetLocation}</b> by {t.movedBy}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 italic">Reason: "{t.reason}"</span>
                    <span className="text-emerald-600 font-semibold">● {t.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit History */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">System Audit Trail</h3>
              <p className="text-xs text-slate-500">Automatic unchangeable actions ledger</p>
            </div>
            <button
              onClick={() => setActiveView('audit')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center"
            >
              <span>Full Audit</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-2.5">
            {(!stats?.recentAudit || stats.recentAudit.length === 0) ? (
              <p className="text-xs text-slate-400 py-4 text-center">No audit logs recorded.</p>
            ) : (
              stats.recentAudit.map((a) => (
                <div key={a._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                        {a.action}
                      </span>
                      <span className="font-bold text-slate-800">{a.performedBy}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-700 leading-snug">{a.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
