import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Search, 
  Filter, 
  Plus, 
  QrCode, 
  Printer, 
  Trash2, 
  Edit3, 
  Eye, 
  ArrowRightLeft, 
  ChevronRight, 
  ChevronDown,
  FileDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Thermometer,
  Layers,
  LayoutGrid,
  Table2,
  GripVertical,
  X,
  RotateCcw
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SamplesList({ 
  onOpenNewSample, 
  onOpenSampleDetails, 
  onOpenEditSample,
  onOpenPrintSheet,
  onOpenTransferModal,
  globalSearch
}) {
  const { permissions, user } = useAuth();
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(globalSearch || '');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'board'
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [draggedSampleId, setDraggedSampleId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [statusFeedback, setStatusFeedback] = useState('');

  // Sample types matching lab standards
  const sampleTypes = [
    'All Types', 'Blood', 'DNA', 'RNA', 'Serum', 'Enzyme', 'Cell Culture', 'Saliva', 'Proteins'
  ];

  useEffect(() => {
    if (globalSearch !== undefined && globalSearch !== search) {
      setSearch(globalSearch);
    }
  }, [globalSearch]);

  useEffect(() => {
    fetchSamples();
  }, [search, selectedType, selectedStatus]);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedType && selectedType !== 'All Types') params.type = selectedType;
      if (selectedStatus) params.status = selectedStatus;

      const data = await api.getSamples(params);
      setSamples(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve specimen registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sample, e) => {
    e.stopPropagation();
    if (!permissions.canDeleteSample) {
      alert('Access denied: Only Lab Owner/PI (Admin) can delete registered specimens.');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete specimen ${sample.sampleId} (${sample.name})? This will be recorded in the immutable audit log.`)) {
      try {
        await api.deleteSample(sample._id);
        fetchSamples();
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  const statusColors = {
    Stored: 'status-chip-stored',
    'In Transit': 'status-chip-transit',
    Depleted: 'bg-slate-100 text-slate-700 border-slate-200',
    Disposed: 'bg-rose-50 text-rose-700 border-rose-200',
    Quarantined: 'status-chip-expired'
  };

  const getExpiryBadge = (expiryDate) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const expiryDay = new Date(Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth(), expiry.getUTCDate()));
    const days = Math.round((expiryDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold status-chip-expired shadow-xs">
          ⛔ Expired
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold status-chip-transit shadow-xs">
          ⚠️ Exp in {days}d
        </span>
      );
    }
    return (
      <span className="text-[10px] text-slate-400 font-medium">
        Exp: {expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
      </span>
    );
  };

  const getSampleStageProgress = (sample) => {
    switch (sample.status) {
      case 'Stored':
        return { step: 2, pct: 50, label: 'Cryo-Stored', bar: 'from-emerald-500 to-emerald-600' };
      case 'In Transit':
        return { step: 3, pct: 75, label: 'In Transit / Assay', bar: 'from-amber-500 to-rose-500' };
      case 'Quarantined':
        return { step: 3, pct: 75, label: 'Flagged / Quarantined', bar: 'from-red-600 to-amber-500' };
      case 'Depleted':
      case 'Disposed':
        return { step: 4, pct: 100, label: sample.status, bar: 'from-slate-600 to-red-600' };
      default:
        return { step: 1, pct: 25, label: 'Registered', bar: 'from-red-500 to-rose-500' };
    }
  };

  const handleStatusUpdate = async (sampleId, newStatus) => {
    if (!permissions.canEditSample) return;
    const prevSamples = samples;
    const target = samples.find(s => s._id === sampleId);
    if (!target || target.status === newStatus) return;

    setSamples(curr => curr.map(s => (s._id === sampleId ? { ...s, status: newStatus } : s)));
    try {
      await api.updateSample(sampleId, { status: newStatus });
      setStatusFeedback(`Updated ${target.sampleId} status to ${newStatus}`);
      setTimeout(() => setStatusFeedback(''), 3500);
    } catch (err) {
      setSamples(prevSamples);
      alert('Failed to update status: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDropOnColumn = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedSampleId) return;
    const id = draggedSampleId;
    setDraggedSampleId(null);
    await handleStatusUpdate(id, targetStatus);
  };

  const boardColumns = [
    { status: 'Stored', title: 'Stored', subtitle: 'Active Cryo Slots', dot: 'bg-emerald-500' },
    { status: 'In Transit', title: 'In Transit', subtitle: 'Experiment / Move', dot: 'bg-amber-500' },
    { status: 'Quarantined', title: 'Quarantined', subtitle: 'Flagged / Review', dot: 'bg-red-600' },
    { status: 'Depleted', title: 'Depleted', subtitle: 'Exhausted Volume', dot: 'bg-slate-500' },
    { status: 'Disposed', title: 'Disposed', subtitle: 'Autoclaved / Closed', dot: 'bg-rose-500' }
  ];

  const hasActiveFilters = Boolean(search || selectedType || selectedStatus);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Sample Registry
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-200/80 shadow-xs">
              {samples.length} Specimen{samples.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Unique sample identifiers (LAB-2026-XXXX), QR barcoding, and cold-chain coordinates
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle: Table vs Live Status Board */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 shadow-xs">
            <button
              onClick={() => setViewMode('table')}
              title="Interactive Expandable Table"
              className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-red-700 shadow-xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              title="Drag-and-Drop Live Status Board"
              className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'board'
                  ? 'bg-white text-red-700 shadow-xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
              <span>Status Board</span>
            </button>
          </div>

          <button
            onClick={() => onOpenPrintSheet(samples)}
            disabled={samples.length === 0}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
            <span>Print QR Labels</span>
          </button>

          {permissions.canRegisterSample && (
            <button
              onClick={onOpenNewSample}
              className="btn-shimmer inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-sm shadow-red-500/20 hover:shadow-md hover:shadow-red-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Register Sample</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Status Update Feedback Toast */}
      {statusFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="saas-card rounded-2xl p-4 sm:p-5 space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input with Instant Clear */}
          <div className="md:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID (LAB-2026-0001), Specimen name, Donor, Freezer..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 focus:bg-white transition-all shadow-xs placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
            >
              <option value="">All Statuses (Stored, In Transit, etc.)</option>
              <option value="Stored">Stored</option>
              <option value="In Transit">In Transit</option>
              <option value="Depleted">Depleted</option>
              <option value="Quarantined">Quarantined</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>

          {/* Refresh & Reset */}
          <div className="md:col-span-3 flex justify-end gap-2">
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedType('');
                  setSelectedStatus('');
                }}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-all border border-red-200/70 shadow-xs active:scale-95 flex items-center"
                title="Reset all active filters"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Reset</span>
              </button>
            )}
            <button
              onClick={fetchSamples}
              className="flex-1 md:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/60 shadow-xs active:scale-95"
            >
              Refresh Table
            </button>
          </div>
        </div>

        {/* Specimen Type Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center flex-shrink-0">
            <Filter className="w-3.5 h-3.5 mr-1 text-red-600" />
            Type:
          </span>
          {sampleTypes.map(type => {
            const isSelected = (!selectedType && type === 'All Types') || (selectedType === type);
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type === 'All Types' ? '' : type)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-xs shadow-red-500/30'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Samples Table / Live Status Board */}
      <div className="saas-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-5 sm:p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-14 rounded-xl skeleton-shimmer border border-slate-200/60" />
            ))}
          </div>
        ) : samples.length === 0 ? (
          <div className="p-14 text-center text-slate-500">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mx-auto mb-3 shadow-xs">
              <FlaskConical className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Specimens Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {search || selectedType || selectedStatus 
                ? 'Try adjusting your search criteria or resetting filters to find matching specimens.' 
                : 'Get started by registering your first laboratory research sample into the cryogenic ledger.'}
            </p>
            {permissions.canRegisterSample && (
              <button
                onClick={onOpenNewSample}
                className="mt-5 btn-shimmer inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                <span>Register First Specimen</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Specimen Card List (< md) */}
            <div className={`${viewMode === 'table' ? 'block md:hidden' : 'hidden'} divide-y divide-slate-100`}>
              {samples.map((sample) => (
                <div 
                  key={sample._id}
                  onClick={() => onOpenSampleDetails(sample)}
                  className="p-4 hover:bg-rose-50/30 transition-all duration-200 cursor-pointer space-y-3 relative group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/90 p-1 flex-shrink-0 shadow-xs group-hover:border-red-300 group-hover:shadow-sm transition-all">
                        {sample.qrCodeData ? (
                          <img src={sample.qrCodeData} alt="QR" className="w-full h-full object-contain" />
                        ) : (
                          <QrCode className="w-full h-full text-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-red-600 group-hover:text-red-700 font-mono text-xs tracking-tight">
                          {sample.sampleId}
                        </div>
                        <div className="font-bold text-slate-900 text-sm leading-tight mt-0.5">
                          {sample.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${statusColors[sample.status] || 'bg-slate-100 text-slate-700'}`}>
                        {sample.status}
                      </span>
                      {getExpiryBadge(sample.expiryDate)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-lg font-bold text-[10px] border border-red-100 shadow-xs">
                      {sample.type}
                    </span>
                    <span className="font-bold text-slate-800">
                      {sample.quantity} <span className="font-normal text-slate-500">{sample.unit}</span>
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-600 font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                      {sample.storageLocation?.position ? `Slot ${sample.storageLocation.position}` : 'Unassigned'}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-500 text-[10px] font-medium">
                      {sample.temperatureReq || '-80°C'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]" onClick={(e) => e.stopPropagation()}>
                    <span className="text-slate-400 text-[10px]">
                      By <b className="text-slate-600">{sample.registeredBy}</b>
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {permissions.canCreateTransfer && (
                        <button
                          onClick={() => onOpenTransferModal(sample)}
                          className="px-2.5 py-1 rounded-lg text-amber-800 bg-amber-50 hover:bg-amber-100 text-[11px] font-bold flex items-center space-x-1 border border-amber-200/70 transition-colors shadow-xs"
                        >
                          <ArrowRightLeft className="w-3 h-3 mr-0.5" />
                          <span>Move</span>
                        </button>
                      )}
                      {permissions.canEditSample && (
                        <button
                          onClick={() => onOpenEditSample(sample)}
                          className="px-2.5 py-1 rounded-lg text-blue-800 bg-blue-50 hover:bg-blue-100 text-[11px] font-bold flex items-center space-x-1 border border-blue-200/70 transition-colors shadow-xs"
                        >
                          <Edit3 className="w-3 h-3 mr-0.5" />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        onClick={() => onOpenSampleDetails(sample)}
                        className="px-2.5 py-1 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 text-[11px] font-bold flex items-center space-x-1 border border-red-200/70 transition-colors shadow-xs"
                      >
                        <Eye className="w-3 h-3 mr-0.5" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {viewMode === 'board' ? (
              /* Live Drag-and-Drop Status Board */
              <div className="p-4 sm:p-5 bg-slate-50/60 overflow-x-auto">
                <div className="flex items-center justify-between mb-3 text-[11px] text-slate-500">
                  <span>
                    {permissions.canEditSample
                      ? 'Drag and drop specimen cards across columns to update live status, or use the status selector on any card.'
                      : 'Live status overview across biobank stages (read-only for your role).'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3.5 min-w-[280px]">
                  {boardColumns.map((col) => {
                    const colSamples = samples.filter(s => s.status === col.status);
                    const isDropTarget = dragOverColumn === col.status;
                    return (
                      <div
                        key={col.status}
                        onDragOver={(e) => {
                          if (!permissions.canEditSample) return;
                          e.preventDefault();
                          setDragOverColumn(col.status);
                        }}
                        onDragLeave={() => setDragOverColumn(null)}
                        onDrop={(e) => handleDropOnColumn(e, col.status)}
                        className={`rounded-2xl bg-white/90 border border-slate-200/90 p-3 flex flex-col min-h-[260px] transition-all ${
                          isDropTarget ? 'kanban-column-drop' : ''
                        }`}
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900">{col.title}</h4>
                              <p className="text-[10px] text-slate-400">{col.subtitle}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                            {colSamples.length}
                          </span>
                        </div>

                        {/* Column Cards */}
                        <div className="space-y-2.5 flex-1">
                          {colSamples.length === 0 ? (
                            <div className="h-24 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-400">
                              Drop specimen here
                            </div>
                          ) : (
                            colSamples.map((sample) => {
                              const stage = getSampleStageProgress(sample);
                              return (
                                <div
                                  key={sample._id}
                                  draggable={permissions.canEditSample}
                                  onDragStart={() => setDraggedSampleId(sample._id)}
                                  onDragEnd={() => {
                                    setDraggedSampleId(null);
                                    setDragOverColumn(null);
                                  }}
                                  onClick={() => onOpenSampleDetails(sample)}
                                  className={`card-base p-3 rounded-xl bg-white border border-slate-200/90 hover:border-red-300 cursor-pointer space-y-2 ${
                                    draggedSampleId === sample._id ? 'opacity-50 scale-95' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-1.5">
                                    <div className="flex items-center space-x-1.5 min-w-0">
                                      {permissions.canEditSample && (
                                        <GripVertical className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 cursor-grab" />
                                      )}
                                      <span className="font-mono text-[11px] font-extrabold text-red-600 truncate">
                                        {sample.sampleId}
                                      </span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[9px] font-bold border border-red-100 flex-shrink-0">
                                      {sample.type}
                                    </span>
                                  </div>

                                  <div className="font-bold text-xs text-slate-900 line-clamp-1">
                                    {sample.name}
                                  </div>

                                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full bg-gradient-to-r ${stage.bar} stage-progress-fill`}
                                      style={{ width: `${stage.pct}%` }}
                                    />
                                  </div>

                                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                                    <span className="truncate max-w-[110px]">
                                      {sample.storageLocation?.position ? `Slot ${sample.storageLocation.position}` : 'Unassigned'}
                                    </span>
                                    {getExpiryBadge(sample.expiryDate)}
                                  </div>

                                  {permissions.canEditSample && (
                                    <div className="pt-1.5 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                                      <select
                                        aria-label={`Change status for ${sample.sampleId}`}
                                        value={sample.status}
                                        onChange={(e) => handleStatusUpdate(sample._id, e.target.value)}
                                        className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                                      >
                                        {boardColumns.map(c => (
                                          <option key={c.status} value={c.status}>{c.status}</option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Desktop / Tablet Wide Table (>= md) with Expandable Rows */
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="sticky top-0 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 z-10 shadow-xs">
                      <th className="py-3.5 px-4">Sample ID & QR</th>
                      <th className="py-3.5 px-4">Specimen Details</th>
                      <th className="py-3.5 px-4">Quantity & Conc</th>
                      <th className="py-3.5 px-4">Storage Coordinates</th>
                      <th className="py-3.5 px-4">Status & Viability</th>
                      <th className="py-3.5 px-4">Registered By</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {samples.map((sample) => {
                      const isExpanded = expandedRowId === sample._id;
                      const stage = getSampleStageProgress(sample);
                      return (
                        <React.Fragment key={sample._id}>
                          <tr 
                            onClick={() => onOpenSampleDetails(sample)}
                            className={`sample-table-row hover:bg-slate-50/90 transition-colors duration-150 cursor-pointer group ${
                              isExpanded ? 'bg-rose-50/30' : ''
                            }`}
                          >
                            {/* ID & QR Column */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2.5">
                                <button
                                  type="button"
                                  aria-label={isExpanded ? `Collapse ${sample.sampleId} details` : `Expand ${sample.sampleId} details`}
                                  aria-expanded={isExpanded}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedRowId(isExpanded ? null : sample._id);
                                  }}
                                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                                  title="Expand inline journey & quick preview"
                                >
                                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-red-600' : '-rotate-90'}`} />
                                </button>
                                <div className="w-10 h-10 qr-thumb-frame p-1 flex-shrink-0">
                                  {sample.qrCodeData ? (
                                    <img src={sample.qrCodeData} alt="QR" className="w-full h-full object-contain" />
                                  ) : (
                                    <QrCode className="w-full h-full text-slate-300" />
                                  )}
                                </div>
                                <div>
                                  <span className="font-extrabold text-red-600 group-hover:text-red-700 transition-colors font-mono tracking-tight text-xs">
                                    {sample.sampleId}
                                  </span>
                                  <div className="text-[10px] text-slate-400 font-medium">
                                    {sample.donorId ? `Donor: ${sample.donorId}` : 'Primary Batch'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Specimen Details */}
                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-900 group-hover:text-red-900 transition-colors">{sample.name}</div>
                              <div className="flex items-center space-x-1.5 mt-1">
                                <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-md font-bold text-[10px] border border-red-100 shadow-xs">
                                  {sample.type}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {sample.temperatureReq || '-80°C'}
                                </span>
                              </div>
                            </td>

                            {/* Quantity & Concentration */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="font-bold text-slate-800">
                                {sample.quantity} <span className="text-slate-500 font-normal">{sample.unit}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                                {sample.concentration || 'Nominal purity'}
                              </div>
                            </td>

                            {/* Storage Coordinates */}
                            <td className="py-4 px-4">
                              <div className="font-semibold text-slate-700 truncate max-w-[220px]">
                                {sample.storagePath || 'Unassigned'}
                              </div>
                              {sample.storageLocation?.position && (
                                <div className="mt-1">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono font-bold text-[10px] border border-slate-200/80 shadow-xs">
                                    Slot: {sample.storageLocation.position}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Status & Expiry */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${statusColors[sample.status] || 'bg-slate-100 text-slate-700'}`}>
                                  {sample.status}
                                </span>
                                <div>
                                  {getExpiryBadge(sample.expiryDate)}
                                </div>
                              </div>
                            </td>

                            {/* Registered By */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="font-semibold text-slate-800">{sample.registeredBy}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {new Date(sample.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                {/* Quick Transfer */}
                                {permissions.canCreateTransfer && (
                                  <button
                                    onClick={() => onOpenTransferModal(sample)}
                                    title="Move / Transfer Specimen"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                  >
                                    <ArrowRightLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Edit Sample */}
                                {permissions.canEditSample && (
                                  <button
                                    onClick={() => onOpenEditSample(sample)}
                                    title="Edit Specimen / Update Aliquots"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Delete Sample (Admin Only) */}
                                {permissions.canDeleteSample && (
                                  <button
                                    onClick={(e) => handleDelete(sample, e)}
                                    title="Delete Specimen (PI Admin Only)"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Inspect full story */}
                                <button
                                  onClick={() => onOpenSampleDetails(sample)}
                                  title="View Full Forensic Chain"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors group-hover:translate-x-0.5"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Inline Expandable Quick-View Drawer */}
                          {isExpanded && (
                            <tr className="bg-slate-50/80">
                              <td colSpan={7} className="px-6 py-4 border-t border-slate-200/70">
                                <div className="expandable-row-panel grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                  {/* Animated Stage Progress Indicator */}
                                  <div className="lg:col-span-5 space-y-2">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-bold text-slate-700 uppercase tracking-wider">
                                        Specimen Journey Stage: <span className="text-red-700">{stage.label}</span>
                                      </span>
                                      <span className="font-mono font-bold text-slate-600">Step {stage.step}/4</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full bg-gradient-to-r ${stage.bar} stage-progress-fill`}
                                        style={{ width: `${stage.pct}%` }}
                                      />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                      <span className={stage.step >= 1 ? 'text-slate-700 font-bold' : ''}>Registered</span>
                                      <span className={stage.step >= 2 ? 'text-slate-700 font-bold' : ''}>Cryo-Stored</span>
                                      <span className={stage.step >= 3 ? 'text-slate-700 font-bold' : ''}>Assay / Transit</span>
                                      <span className={stage.step >= 4 ? 'text-slate-700 font-bold' : ''}>Closed</span>
                                    </div>
                                  </div>

                                  {/* Quick Metadata */}
                                  <div className="lg:col-span-4 grid grid-cols-2 gap-2 text-[11px]">
                                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                                      <span className="text-slate-400 block text-[10px]">Thermal Spec</span>
                                      <span className="font-bold text-slate-800">{sample.temperatureReq || '-80°C'}</span>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                                      <span className="text-slate-400 block text-[10px]">Concentration</span>
                                      <span className="font-bold text-slate-800 truncate block">{sample.concentration || 'Nominal'}</span>
                                    </div>
                                  </div>

                                  {/* Quick Actions */}
                                  <div className="lg:col-span-3 flex items-center justify-end space-x-2">
                                    <button
                                      onClick={() => onOpenSampleDetails(sample)}
                                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-xs transition-colors flex items-center space-x-1"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Open Timeline</span>
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer Summary Bar */}
            <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <div>
                Showing <b className="text-slate-800">{samples.length}</b> verified specimen{samples.length === 1 ? '' : 's'} in registry
              </div>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                  Stored: {samples.filter(s => s.status === 'Stored').length}
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
                  In Transit: {samples.filter(s => s.status === 'In Transit').length}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
