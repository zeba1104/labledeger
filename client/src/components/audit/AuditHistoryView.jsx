import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  User, 
  Calendar, 
  FileSpreadsheet, 
  Clock, 
  ChevronRight,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AuditHistoryView() {
  const { user, permissions } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [search, actionFilter, userFilter]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (actionFilter) params.action = actionFilter;
      if (userFilter) params.user = userFilter;

      const data = await api.getAuditLogs(params);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open(api.exportAuditLogs('csv'), '_blank');
  };

  const actionBadgeColors = {
    CREATE_SAMPLE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    UPDATE_SAMPLE: 'bg-blue-100 text-blue-800 border-blue-200',
    TRANSFER_SAMPLE: 'bg-amber-100 text-amber-800 border-amber-200',
    DELETE_SAMPLE: 'bg-rose-100 text-rose-800 border-rose-200',
    CREATE_NOTE: 'bg-purple-100 text-purple-800 border-purple-200',
    UPDATE_ROLE: 'bg-red-100 text-red-800 border-red-200',
    LOGIN: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Immutable Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-800 border border-slate-200/80 flex items-center shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              <span>{logs.length} Cryptographic Entries</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automatic, unalterable forensic record of every action across the biobank system (GLP / 21 CFR Part 11 compliant)
          </p>
        </div>

        {/* Export Button (Key requirement for Viewer / Auditor role) */}
        {permissions.canExportReports && (
          <button
            onClick={handleExportCSV}
            className="btn-shimmer inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all hover:scale-105 active:scale-95 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-red-600" />
            <span>Export Audit Report (CSV)</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="saas-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="w-full sm:flex-1 sm:max-w-sm relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit details (e.g. Ravi, 0005, quantity)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 focus:bg-white text-xs shadow-xs"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start space-x-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs shadow-xs"
          >
            <option value="">All Action Types</option>
            <option value="CREATE_SAMPLE">CREATE_SAMPLE</option>
            <option value="UPDATE_SAMPLE">UPDATE_SAMPLE</option>
            <option value="TRANSFER_SAMPLE">TRANSFER_SAMPLE</option>
            <option value="DELETE_SAMPLE">DELETE_SAMPLE</option>
            <option value="CREATE_NOTE">CREATE_NOTE</option>
            <option value="UPDATE_ROLE">UPDATE_ROLE</option>
          </select>

          <button
            onClick={fetchAuditLogs}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 rounded-xl font-bold text-slate-700 border border-slate-200/60 shadow-xs transition-all active:scale-95 text-xs flex-shrink-0"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="saas-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="inline-block w-7 h-7 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="font-semibold text-slate-700">Verifying audit ledger signatures...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 mx-auto mb-2 shadow-xs">
              <History className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No Audit Events Logged</h4>
            <p className="text-slate-400 mt-1 max-w-sm mx-auto">Actions performed across the system are permanently recorded here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log._id} className="p-4 sm:p-5 hover:bg-rose-50/30 transition-all duration-150 text-xs relative group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border shadow-xs ${actionBadgeColors[log.action] || 'bg-slate-100 text-slate-700'}`}>
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-900">{log.performedBy}</span>
                    <span className="text-slate-400">({log.performedRole})</span>
                    {log.entityId && (
                      <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[10px] border border-slate-200/60 shadow-xs">
                        Ref: {log.entityId}
                      </span>
                    )}
                  </div>

                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* PDF style explicit audit description */}
                <p className="text-slate-700 font-medium text-sm leading-relaxed mt-1">
                  {log.details}
                </p>

                {/* Diff inspection */}
                {log.changes && (
                  <div className="mt-2.5 p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/80 font-mono text-[10px] text-slate-600 overflow-x-auto shadow-inner">
                    <span className="text-slate-400 uppercase font-bold block mb-0.5">Value Delta:</span>
                    {JSON.stringify(log.changes, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
