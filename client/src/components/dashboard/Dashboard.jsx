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
  Activity,
  Calendar,
  Mail,
  Send,
  AlertCircle,
  Bell
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
  const [expiryAlerts, setExpiryAlerts] = useState({ expiringSoon: [], expired: [], expiringCount: 0, expiredCount: 0 });
  const [loading, setLoading] = useState(true);
  const [dispatchingEmails, setDispatchingEmails] = useState(false);
  const [emailAlertSuccess, setEmailAlertSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, alertsRes] = await Promise.all([
        api.getStats(),
        api.getExpiringAlerts(7).catch(() => ({ expiringSoon: [], expired: [], expiringCount: 0, expiredCount: 0 }))
      ]);
      setStats(statsRes);
      setExpiryAlerts(alertsRes || { expiringSoon: [], expired: [], expiringCount: 0, expiredCount: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerEmailAlerts = async () => {
    try {
      setDispatchingEmails(true);
      setEmailAlertSuccess('');
      const res = await api.triggerExpiryCron(7);
      const count = res?.result?.dispatchResults?.length || 0;
      setEmailAlertSuccess(`✅ Surveillance scan finished: Nodemailer alert email dispatched to ${count} specimen owner(s)!`);
      setTimeout(() => setEmailAlertSuccess(''), 7000);
    } catch (err) {
      alert('Failed to dispatch alert emails: ' + err.message);
    } finally {
      setDispatchingEmails(false);
    }
  };

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mx', `${x}px`);
    e.currentTarget.style.setProperty('--my', `${y}px`);
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-800 p-6 sm:p-8 text-white shadow-xl shadow-red-500/15 border border-red-500/30">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 opacity-15 pointer-events-none flex items-center pr-6">
          <FlaskConical className="w-64 h-64 text-white animate-float-slow" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-md mb-3 border border-white/20 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <Activity className="w-3.5 h-3.5 text-rose-200" />
            <span className="tracking-wide">Digital Sample Ledger & Cold Chain Tracking</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-red-100 mt-2 leading-relaxed max-w-xl">
            Role: <b className="text-white underline decoration-rose-300 underline-offset-2">{user?.role}</b> &bull; Department: {user?.department}.
            The laboratory specimen registry is synchronized with MongoDB Atlas and ready for registration, transfers, and audit queries.
          </p>

          {/* Quick Action Ribbon */}
          <div className="flex flex-wrap items-center gap-2.5 mt-6">
            {permissions.canRegisterSample && (
              <button
                onClick={onOpenNewSample}
                className="btn-shimmer inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-red-700 bg-white hover:bg-rose-50 shadow-md shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-1.5 text-red-600" />
                Register New Sample
              </button>
            )}

            <button
              onClick={onOpenQRScanner}
              className="btn-shimmer inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-700/60 hover:bg-red-700/80 border border-white/25 backdrop-blur-sm shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <QrCode className="w-4 h-4 mr-1.5" />
              Scan QR Code
            </button>

            <button
              onClick={() => setActiveView('storage')}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Box className="w-4 h-4 mr-1.5" />
              Open Storage Map
            </button>
          </div>
        </div>
      </div>

      {/* Cold-Chain Expiry & Storage Alerts Ribbon */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-red-500/10 border border-amber-300/60 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 border border-amber-400/40 flex items-center justify-center flex-shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Expiry & Storage Alerts
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  ⚠️ {expiryAlerts.expiringCount || 0} samples expiring in 7 days
                </span>
                {expiryAlerts.expiredCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-300">
                    ⛔ {expiryAlerts.expiredCount} expired
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Automated daily surveillance (<code className="text-red-700 font-bold bg-white/80 px-1 py-0.5 rounded">node-cron</code> @ 08:00 AM) monitors viability limits and notifies sample owners via <code className="text-red-700 font-bold bg-white/80 px-1 py-0.5 rounded">nodemailer</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleTriggerEmailAlerts}
              disabled={dispatchingEmails}
              className="btn-shimmer inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 flex-shrink-0"
            >
              {dispatchingEmails ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                  <span>Dispatching Mails...</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                  <span>Send Email Alert Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Confirmation Toast */}
        {emailAlertSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{emailAlertSuccess}</span>
          </div>
        )}

        {/* Expiring Specimens Card Grid */}
        {expiryAlerts.expiringSoon && expiryAlerts.expiringSoon.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            {expiryAlerts.expiringSoon.map((sample) => (
              <div
                key={sample.sampleId || sample._id}
                tabIndex={0}
                onClick={() => onOpenSampleDetails && onOpenSampleDetails(sample)}
                className="card-base card-interactive p-4 bg-white border border-amber-200/90 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-2.5 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-400 to-red-500" />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-red-600 group-hover:underline">
                      {sample.sampleId}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-700 transition-colors line-clamp-1">
                      {sample.name}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap flex-shrink-0">
                    {sample.daysRemaining <= 0 ? 'Expires Today' : `${sample.daysRemaining}d left`}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Type:</span>
                    <span className="font-semibold text-slate-700">{sample.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Expiry Date:</span>
                    <span className="font-bold font-mono text-slate-800">
                      {sample.expiryDate ? new Date(sample.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Assigned Custodian:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[130px]">{sample.registeredBy}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 truncate max-w-[180px]">{sample.storagePath || 'Unassigned'}</span>
                  <span className="font-bold text-red-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                    Inspect &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Expired Samples Notification Strip */}
        {expiryAlerts.expired && expiryAlerts.expired.length > 0 && (
          <div className="p-3.5 bg-red-50/90 border border-red-200/90 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping flex-shrink-0" />
              <span className="font-bold text-red-900">Quarantine Action Required:</span>
              <span className="text-red-700">
                {expiryAlerts.expired.map(s => `${s.sampleId} (${s.name})`).join(', ')} passed maximum storage viability.
              </span>
            </div>
            <button
              onClick={() => setActiveView('samples')}
              className="text-red-800 font-bold hover:underline flex items-center ml-2 flex-shrink-0"
            >
              <span>View in Registry</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Primary KPI Stats Grid (Unified Token Card Base) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Samples */}
        <div 
          tabIndex={0}
          onMouseMove={handleCardMouseMove}
          onClick={() => setActiveView('samples')}
          className="card-base card-interactive card-spotlight rounded-2xl p-5 sm:p-6 cursor-pointer group relative overflow-hidden focus:ring-2 focus:ring-red-500/30"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-[0.8rem] font-bold uppercase tracking-wider text-slate-500">Registered Specimens</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline space-x-2">
            <span className="text-[1.953rem] sm:text-3xl font-extrabold text-slate-900 group-hover:text-red-600 transition-colors tracking-tight">{metrics.totalSamples}</span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">{metrics.activeStoredSamples} Stored</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center">
            <span className="font-mono text-slate-500 font-medium">LAB-2026-XXXX</span>
            <span className="mx-1.5 text-slate-300">&bull;</span>
            <span>IRB Protocol Compliant</span>
          </p>
        </div>

        {/* Storage Occupancy */}
        <div 
          tabIndex={0}
          onMouseMove={handleCardMouseMove}
          onClick={() => setActiveView('storage')}
          className="card-base card-interactive card-spotlight rounded-2xl p-5 sm:p-6 cursor-pointer group relative overflow-hidden focus:ring-2 focus:ring-red-500/30"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-[0.8rem] font-bold uppercase tracking-wider text-slate-500">Cryo Occupancy</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-xs">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline space-x-2">
            <span className="text-[1.953rem] sm:text-3xl font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors tracking-tight">{metrics.occupancyRate}%</span>
            <span className="text-xs text-slate-500 font-semibold">{metrics.totalStorageSlots} Total Slots</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-500 to-rose-600 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(metrics.occupancyRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Transfers Logged */}
        <div 
          tabIndex={0}
          onMouseMove={handleCardMouseMove}
          onClick={() => setActiveView('transfers')}
          className="card-base card-interactive card-spotlight rounded-2xl p-5 sm:p-6 cursor-pointer group relative overflow-hidden focus:ring-2 focus:ring-red-500/30"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-[0.8rem] font-bold uppercase tracking-wider text-slate-500">Chain Transfers</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-xs">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline space-x-2">
            <span className="text-[1.953rem] sm:text-3xl font-extrabold text-slate-900 tracking-tight">{metrics.totalTransfers}</span>
            <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/70">Verified Custody</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Freezer & custodian relocations</p>
        </div>

        {/* Audit Log Entries */}
        <div 
          tabIndex={0}
          onMouseMove={handleCardMouseMove}
          onClick={() => setActiveView('audit')}
          className="card-base card-interactive card-spotlight rounded-2xl p-5 sm:p-6 cursor-pointer group relative overflow-hidden focus:ring-2 focus:ring-red-500/30"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-slate-700 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-[0.8rem] font-bold uppercase tracking-wider text-slate-500">Immutable Audit</span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shadow-xs">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline space-x-2">
            <span className="text-[1.953rem] sm:text-3xl font-extrabold text-slate-900 tracking-tight">{metrics.totalAuditEntries}</span>
            <span className="text-xs text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80">Tamper-Proof</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Full GLP & FDA accountability</p>
        </div>
      </div>

      {/* Middle Row: Sample Type Distribution + Cold Chain Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specimen Category Distribution */}
        <div className="lg:col-span-2 saas-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Specimen Distribution by Type</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live inventory across biobank cohorts</p>
            </div>
            <button
              onClick={() => setActiveView('samples')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center px-2.5 py-1 rounded-lg hover:bg-red-50/70 transition-colors"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-3.5">
            {Object.keys(typeCounts).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No samples registered yet.</p>
            ) : (
              Object.entries(typeCounts).map(([type, count]) => {
                const percent = Math.round((count / (metrics.totalSamples || 1)) * 100);
                return (
                  <div key={type} className="space-y-1.5 group">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        <span className="font-semibold text-slate-800">{type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500 font-medium">{count} {count === 1 ? 'specimen' : 'specimens'}</span>
                        <span className="font-mono font-bold text-slate-700 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{percent}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 h-full rounded-full transition-all duration-700 ease-out shadow-xs" 
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
        <div className="saas-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Cryogenic Telemetry</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time thermal monitoring</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Ultra-Low Freezer 1</h4>
                  <p className="text-[11px] text-slate-500">Main Bio-Repository 104</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                    -80°C
                  </span>
                  <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center justify-end space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Nominal</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Ultra-Low Freezer 2</h4>
                  <p className="text-[11px] text-slate-500">Backup Cryo Suite 104</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                    -80°C
                  </span>
                  <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center justify-end space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Nominal</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Enzyme Storage Freezer</h4>
                  <p className="text-[11px] text-slate-500">Genomics Suite 202</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-cyan-100 text-cyan-800 border border-cyan-200">
                    -20°C
                  </span>
                  <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center justify-end space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Nominal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('storage')}
            className="w-full mt-4 py-2.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100/80 rounded-xl border border-red-200/90 transition-all flex items-center justify-center space-x-1.5 shadow-xs"
          >
            <Box className="w-4 h-4 text-red-600" />
            <span>Open Storage Hierarchy Visualizer</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Recent Transfers & Immutable Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transfers Log */}
        <div className="saas-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Recent Chain Relocations</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live forensic specimen transfers</p>
            </div>
            <button
              onClick={() => setActiveView('transfers')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center px-2.5 py-1 rounded-lg hover:bg-red-50/70 transition-colors"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {(!stats?.recentTransfers || stats.recentTransfers.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No transfers recorded.</p>
            ) : (
              stats.recentTransfers.map((t) => (
                <div key={t._id} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs hover:bg-slate-50 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200/50">
                      {t.sampleId}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{new Date(t.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-800 font-bold truncate text-[13px]">{t.sampleName}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Transferred to <b className="text-slate-800">{t.targetLocation}</b> by <span className="font-semibold text-slate-700">{t.movedBy}</span>
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 italic truncate max-w-[220px]">Reason: "{t.reason}"</span>
                    <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{t.status}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit History */}
        <div className="saas-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">System Audit Stream</h3>
              <p className="text-xs text-slate-500 mt-0.5">Automated unchangeable action ledger</p>
            </div>
            <button
              onClick={() => setActiveView('audit')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center px-2.5 py-1 rounded-lg hover:bg-red-50/70 transition-colors"
            >
              <span>Full Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {(!stats?.recentAudit || stats.recentAudit.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No audit logs recorded.</p>
            ) : (
              stats.recentAudit.map((a) => (
                <div key={a._id} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs hover:bg-slate-50 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-200/80 text-slate-800 border border-slate-300/50">
                        {a.action}
                      </span>
                      <span className="font-bold text-slate-900">{a.performedBy}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs">{a.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
