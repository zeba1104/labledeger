import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowRightLeft, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Filter, 
  User, 
  ShieldCheck, 
  ChevronRight,
  FlaskConical,
  X,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ChemicalMixingLoader from '../common/ChemicalMixingLoader';

export default function TransferLogView({ 
  onOpenSampleDetails, 
  isModalOpen, 
  setIsModalOpen,
  preselectedSample = null 
}) {
  const { user, permissions } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Transfer form modal state
  const [samplesList, setSamplesList] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [custodian, setCustodian] = useState(user?.name || '');
  const [reason, setReason] = useState('experiment');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchTransfers();
  }, [search, statusFilter]);

  useEffect(() => {
    if (isModalOpen) {
      loadSamples();
      if (preselectedSample) {
        setSelectedSampleId(preselectedSample.sampleId);
      }
      setCustodian(user?.name || '');
      setFormError('');
    }
  }, [isModalOpen, preselectedSample, user]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.sampleId = search;
      if (statusFilter) params.status = statusFilter;
      const data = await api.getTransfers(params);
      setTransfers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSamples = async () => {
    try {
      const data = await api.getSamples();
      setSamplesList(data);
      if (!selectedSampleId && data.length > 0) {
        setSelectedSampleId(data[0].sampleId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedSampleId) {
      setFormError('Please select a specimen to move.');
      return;
    }
    if (!targetLocation.trim()) {
      setFormError('Please specify the destination freezer, room, or shelf location.');
      return;
    }
    if (!reason.trim()) {
      setFormError('Please specify the reason for transfer (e.g. experiment, PCR test, quality inspection).');
      return;
    }

    setFormLoading(true);
    try {
      await api.createTransfer({
        sampleId: selectedSampleId,
        targetLocation,
        custodian: custodian || user?.name,
        reason
      });
      setIsModalOpen(false);
      setTargetLocation('');
      setReason('experiment');
      fetchTransfers();
    } catch (err) {
      setFormError(err.message || 'Error recording specimen transfer.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprove = async (transferId) => {
    if (!permissions.canApproveTransfer) {
      alert('Only PI/Lab Owner (Admin) can officially approve specimen transfers.');
      return;
    }
    try {
      await api.approveTransfer(transferId);
      fetchTransfers();
    } catch (err) {
      alert('Approval failed: ' + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Transfer Log & Chain of Custody
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {transfers.length} Movements
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Unbroken record of every time a sample moves between freezers, racks, or researchers
          </p>
        </div>

        {permissions.canCreateTransfer && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Initiate Transfer</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 max-w-sm relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Sample ID (e.g. LAB-2026-0001)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
          >
            <option value="">All Transfer Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending Approval">Pending Approval</option>
          </select>

          <button
            onClick={fetchTransfers}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Transfers Timeline / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <ChemicalMixingLoader 
            size="sm"
            text="Tracking Chain of Custody..."
            subtext="Verifying cold-chain relocation signatures and custodian approvals"
          />
        ) : transfers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <ArrowRightLeft className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700">No Transfers Logged</h4>
            <p className="text-slate-400 mt-1">Every sample relocation between freezers will be documented here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transfers.map((t) => (
              <div key={t._id} className="p-4 sm:p-5 hover:bg-rose-50/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-extrabold text-xs text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {t.sampleId}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{t.sampleName}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-400 font-medium">
                      {new Date(t.date).toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {t.status}
                    </span>
                  </div>
                </div>

                {/* Location movement banner (PDF style) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold block sm:inline mr-1">Path:</span>
                    <span className="line-through text-slate-400 mr-2">{t.sourceLocation}</span>
                    <span className="font-bold text-red-700">&rarr; {t.targetLocation}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Moved by: <b>{t.movedBy}</b> &bull; Custodian: <b>{t.custodian}</b>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <p className="text-slate-500 italic">
                    Reason: "{t.reason}"
                  </p>
                  {t.approvedBy && (
                    <span className="text-[10px] text-slate-400 flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                      Approved by {t.approvedBy}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Initiate Transfer Modal (Portaled directly to document.body to cover navbar completely) */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl border border-red-100 max-w-md w-full overflow-hidden animate-scale-in my-auto max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 text-white relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-rose-200 mb-1">
                <ArrowRightLeft className="w-4 h-4" />
                <span>Chain of Custody Tracking</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">Initiate Specimen Transfer</h2>
              <p className="text-xs text-rose-100 mt-0.5">Move specimen between freezers, racks, or research labs</p>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              {formError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateTransfer} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Select Specimen *
                  </label>
                  <select
                    value={selectedSampleId}
                    onChange={(e) => setSelectedSampleId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                    required
                  >
                    {samplesList.map(s => (
                      <option key={s._id} value={s.sampleId}>
                        {s.sampleId} — {s.name} ({s.storagePath || 'Unassigned'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Target Destination Location *
                  </label>
                  <input
                    type="text"
                    value={targetLocation}
                    onChange={(e) => setTargetLocation(e.target.value)}
                    placeholder="e.g. Ultra-Low Freezer 2 > Shelf 3 > Box Blue #2 > Pos B4"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Designated Custodian
                  </label>
                  <input
                    type="text"
                    value={custodian}
                    onChange={(e) => setCustodian(e.target.value)}
                    placeholder="Custodian receiving or moving sample"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Reason for Relocation *
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. experiment, PCR test, quality inspection, cold-chain backup"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                    required
                  />
                </div>

                <div className="pt-3 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all"
                  >
                    {formLoading ? 'Logging...' : 'Confirm Transfer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
