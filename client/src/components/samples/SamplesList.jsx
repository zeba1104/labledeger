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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Sample Registry
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-200">
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
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
            <span>Print QR Labels</span>
          </button>

          {permissions.canRegisterSample && (
            <button
              onClick={onOpenNewSample}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-500/20 transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Register Sample</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID (LAB-2026-0001), Specimen name, Donor, Freezer..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
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
              className="w-full md:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Refresh Table
            </button>
          </div>
        </div>

        {/* Specimen Type Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center">
            <Filter className="w-3 h-3 mr-1 text-red-600" />
            Type:
          </span>
          {sampleTypes.map(type => {
            const isSelected = (!selectedType && type === 'All Types') || (selectedType === type);
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type === 'All Types' ? '' : type)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium text-xs transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Samples Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="inline-block w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="font-medium text-slate-600">Loading specimen registry...</p>
          </div>
        ) : samples.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No Specimens Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search || selectedType || selectedStatus 
                ? 'Try adjusting your search criteria or resetting filters.' 
                : 'Get started by registering your first laboratory research sample.'}
            </p>
            {permissions.canRegisterSample && (
              <button
                onClick={onOpenNewSample}
                className="mt-4 inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Register First Sample
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
                  className="p-4 hover:bg-rose-50/40 transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-0.5 flex-shrink-0 shadow-xs">
                        {sample.qrCodeData ? (
                          <img src={sample.qrCodeData} alt="QR" className="w-full h-full object-contain" />
                        ) : (
                          <QrCode className="w-full h-full text-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 font-mono text-xs">{sample.sampleId}</div>
                        <div className="font-bold text-slate-800 text-sm leading-tight">{sample.name}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${statusColors[sample.status] || 'bg-slate-100 text-slate-700'}`}>
                      {sample.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                    <span className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded font-semibold text-[10px] border border-red-100">
                      {sample.type}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {sample.quantity} {sample.unit}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      {sample.storageLocation?.position ? `Slot ${sample.storageLocation.position}` : 'Unassigned'}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-400 text-[10px]">
                      {sample.temperatureReq || '-80°C'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px]" onClick={(e) => e.stopPropagation()}>
                    <span className="text-slate-400 text-[10px]">By {sample.registeredBy}</span>
                    <div className="flex items-center space-x-1.5">
                      {permissions.canCreateTransfer && (
                        <button
                          onClick={() => onOpenTransferModal(sample)}
                          className="px-2 py-1 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 text-[11px] font-semibold flex items-center space-x-1"
                        >
                          <ArrowRightLeft className="w-3 h-3 mr-0.5" />
                          <span>Move</span>
                        </button>
                      )}
                      {permissions.canEditSample && (
                        <button
                          onClick={() => onOpenEditSample(sample)}
                          className="px-2 py-1 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 text-[11px] font-semibold flex items-center space-x-1"
                        >
                          <Edit3 className="w-3 h-3 mr-0.5" />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        onClick={() => onOpenSampleDetails(sample)}
                        className="px-2 py-1 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 text-[11px] font-semibold flex items-center space-x-1"
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
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Sample ID & QR</th>
                  <th className="py-3.5 px-4">Specimen Details</th>
                  <th className="py-3.5 px-4">Quantity & Conc</th>
                  <th className="py-3.5 px-4">Storage Coordinates</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Registered By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {samples.map((sample) => (
                  <tr 
                    key={sample._id}
                    onClick={() => onOpenSampleDetails(sample)}
                    className="hover:bg-rose-50/50 transition-all duration-200 cursor-pointer group hover:shadow-xs"
                  >
                    {/* ID & QR Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-0.5 flex-shrink-0 shadow-xs group-hover:border-red-400 group-hover:scale-110 transition-all duration-200">
                          {sample.qrCodeData ? (
                            <img src={sample.qrCodeData} alt="QR" className="w-full h-full object-contain" />
                          ) : (
                            <QrCode className="w-full h-full text-slate-300" />
                          )}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 group-hover:text-red-700 transition-colors font-mono">
                            {sample.sampleId}
                          </span>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {sample.donorId ? `Donor: ${sample.donorId}` : 'Batch Ref'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Specimen Details */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sample.name}</div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 bg-red-50 text-red-700 rounded font-semibold text-[10px] border border-red-100">
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
                        {sample.concentration || 'Not specified'}
                      </div>
                    </td>

                    {/* Storage Coordinates */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1 font-medium text-slate-700 truncate max-w-[220px]">
                        <span>{sample.storagePath || 'Unassigned'}</span>
                      </div>
                      {sample.storageLocation?.position && (
                        <div className="mt-0.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold text-[10px] border border-slate-200">
                            Slot: {sample.storageLocation.position}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[sample.status] || 'bg-slate-100 text-slate-700'}`}>
                        {sample.status}
                      </span>
                    </td>

                    {/* Registered By */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{sample.registeredBy}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(sample.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
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
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
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
        </>
      )}
      </div>
    </div>
  );
}
