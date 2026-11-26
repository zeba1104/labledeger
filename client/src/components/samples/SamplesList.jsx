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
  FileDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Thermometer,
  Layers
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
    Stored: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'In Transit': 'bg-amber-50 text-amber-700 border-amber-200',
    Depleted: 'bg-slate-100 text-slate-700 border-slate-200',
    Disposed: 'bg-rose-50 text-rose-700 border-rose-200',
    Quarantined: 'bg-red-50 text-red-800 border-red-300'
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
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
          ⛔ Expired
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          ⚠️ Exp in {days}d
        </span>
      );
    }
    return (
      <span className="text-[10px] text-slate-400">
        Exp: {expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
      </span>
    );
  };

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

      {/* Filter and Search Toolbar */}
      <div className="saas-card rounded-2xl p-4 sm:p-5 space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID (LAB-2026-0001), Specimen name, Donor, Freezer..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 focus:bg-white transition-all shadow-xs placeholder:text-slate-400"
            />
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

          {/* Refresh button */}
          <div className="md:col-span-3 flex justify-end">
            <button
              onClick={fetchSamples}
              className="w-full md:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/60 shadow-xs active:scale-95"
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

      {/* Samples Table / Cards */}
      <div className="saas-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-14 text-center text-slate-500 text-xs">
            <div className="inline-block w-7 h-7 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="font-semibold text-slate-700">Querying specimen registry...</p>
            <p className="text-[11px] text-slate-400 mt-1">Filtering barcodes and cold-chain coordinates</p>
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
            <div className="block md:hidden divide-y divide-slate-100">
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

            {/* Desktop / Tablet Wide Table (>= md) */}
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
                  {samples.map((sample) => (
                    <tr 
                      key={sample._id}
                      onClick={() => onOpenSampleDetails(sample)}
                      className="hover:bg-rose-50/40 transition-all duration-150 cursor-pointer group"
                    >
                      {/* ID & QR Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-0.5 flex-shrink-0 shadow-xs group-hover:border-red-400 group-hover:scale-105 transition-all duration-200">
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
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-red-900 transition-colors">{sample.name}</div>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-md font-bold text-[10px] border border-red-100 shadow-xs">
                            {sample.type}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {sample.temperatureReq || '-80°C'}
                          </span>
                        </div>
                      </td>

                      {/* Quantity & Concentration */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">
                          {sample.quantity} <span className="text-slate-500 font-normal">{sample.unit}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                          {sample.concentration || 'Nominal purity'}
                        </div>
                      </td>

                      {/* Storage Coordinates */}
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{sample.registeredBy}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(sample.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
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
                  ))}
                </tbody>
              </table>
            </div>

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
