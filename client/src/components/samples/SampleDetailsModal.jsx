import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  FlaskConical, 
  QrCode, 
  Box, 
  ArrowRightLeft, 
  FileText, 
  History, 
  Printer, 
  Thermometer, 
  Calendar, 
  User, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ChainOfCustodyTimeline from '../common/ChainOfCustodyTimeline';

export default function SampleDetailsModal({ 
  sample: initialSample, 
  onClose, 
  onOpenTransfer, 
  onOpenPrintSheet 
}) {
  const { permissions } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chain'); // 'chain', 'transfers', 'experiments', 'audit'

  useEffect(() => {
    if (initialSample) {
      loadFullStory(initialSample.sampleId || initialSample._id);
    }
  }, [initialSample]);

  const loadFullStory = async (id) => {
    try {
      setLoading(true);
      const res = await api.getSampleById(id);
      setData(res);
    } catch (err) {
      console.error('Error fetching sample full story:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!initialSample) return null;

  const sample = data?.sample || initialSample;
  const transfers = data?.transfers || [];
  const experiments = data?.experiments || [];
  const auditLogs = data?.auditLogs || [];

  // Calculate expiry status
  let expiryInfo = null;
  if (sample.expiryDate) {
    const expiry = new Date(sample.expiryDate);
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const expiryDay = new Date(Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth(), expiry.getUTCDate()));
    const daysLeft = Math.round((expiryDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

    expiryInfo = {
      daysLeft,
      formattedDate: expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      isExpired: daysLeft < 0,
      isExpiringSoon: daysLeft >= 0 && daysLeft <= 7
    };
  }

  return createPortal(
    <div className="modal-backdrop overflow-y-auto p-3 sm:p-5">
      <div className="relative modal-shell max-w-4xl w-full animate-scale-in my-auto">
        {/* Header Banner */}
        <div className="modal-header-ribbon p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
              {sample.type}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
              Status: {sample.status || 'Stored'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-rose-100">
              Temp: {sample.temperatureReq || '-80°C'}
            </span>
            {expiryInfo && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                expiryInfo.isExpired 
                  ? 'bg-red-950/80 text-rose-200 border border-red-400' 
                  : expiryInfo.isExpiringSoon 
                  ? 'bg-amber-300 text-amber-950 font-extrabold animate-pulse' 
                  : 'bg-emerald-400/30 text-emerald-100 border border-emerald-300/40'
              }`}>
                {expiryInfo.isExpired ? `⛔ Expired (${Math.abs(expiryInfo.daysLeft)}d ago)` : expiryInfo.isExpiringSoon ? `⚠️ Expires in ${expiryInfo.daysLeft}d` : `Exp: ${expiryInfo.formattedDate}`}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center space-x-2">
                <span>{sample.name}</span>
              </h2>
              <p className="text-xs text-rose-100 font-mono mt-0.5">
                Official Identifier: <b className="text-white text-sm">{sample.sampleId}</b>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenPrintSheet([sample])}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition-all flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                <span>Print QR Tube Label</span>
              </button>

              {permissions.canCreateTransfer && (
                <button
                  onClick={() => onOpenTransfer(sample)}
                  className="px-3 py-1.5 rounded-xl bg-white text-red-700 hover:bg-rose-50 text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 mr-1 text-red-600" />
                  <span>Move Sample</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center space-x-2 px-6 pt-3 border-b border-slate-200 bg-slate-50 flex-shrink-0 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('chain')}
            className={`py-2 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'chain' 
                ? 'border-red-600 text-red-700 bg-white rounded-t-lg' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-red-600" />
            <span>Chain of Custody Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className={`py-2 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'transfers' 
                ? 'border-red-600 text-red-700 bg-white rounded-t-lg' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
            <span>Transfer History ({transfers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('experiments')}
            className={`py-2 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'experiments' 
                ? 'border-red-600 text-red-700 bg-white rounded-t-lg' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>Experiment Notes ({experiments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'audit' 
                ? 'border-red-600 text-red-700 bg-white rounded-t-lg' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'chain' && (
            <div className="space-y-6">
              {/* Identity & Storage Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* QR Code & Label Box */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 flex flex-col items-center text-center">
                  <div className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 shadow-xs mb-3">
                    {sample.qrCodeData ? (
                      <img src={sample.qrCodeData} alt="QR" className="w-full h-full object-contain" />
                    ) : (
                      <QrCode className="w-full h-full text-slate-300" />
                    )}
                  </div>
                  <span className="font-mono font-extrabold text-sm text-slate-900">{sample.sampleId}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Scannable Laboratory Barcode</span>
                </div>

                {/* Specimen Properties */}
                <div className="md:col-span-2 bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Specimen Metadata</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Available Quantity</span>
                      <p className="text-sm font-extrabold text-slate-800">{sample.quantity} {sample.unit}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Concentration / Purity</span>
                      <p className="text-xs font-bold text-slate-800">{sample.concentration || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Donor / Batch Number</span>
                      <p className="text-xs font-bold text-slate-800">{sample.donorId || 'Unspecified'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Target Temperature</span>
                      <p className="text-xs font-bold text-slate-800">{sample.temperatureReq || '-80°C'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Registered By</span>
                      <p className="text-xs font-bold text-slate-800">{sample.registeredBy}{sample.registeredRole ? ` (${sample.registeredRole})` : ''}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Registration Date</span>
                      <p className="text-xs font-bold text-slate-800">{new Date(sample.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Storage Expiry Date</span>
                      {expiryInfo ? (
                        <p className={`text-xs font-extrabold ${
                          expiryInfo.isExpired 
                            ? 'text-red-700' 
                            : expiryInfo.isExpiringSoon 
                            ? 'text-amber-700' 
                            : 'text-emerald-700'
                        }`}>
                          {expiryInfo.formattedDate} ({expiryInfo.isExpired ? `Expired ${Math.abs(expiryInfo.daysLeft)}d ago` : `${expiryInfo.daysLeft}d remaining`})
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 font-medium">No limit assigned</p>
                      )}
                    </div>
                  </div>

                  {expiryInfo && (expiryInfo.isExpired || expiryInfo.isExpiringSoon) && (
                    <div className={`p-2.5 rounded-xl border flex items-center space-x-2 text-[11px] font-semibold ${
                      expiryInfo.isExpired 
                        ? 'bg-red-50 text-red-800 border-red-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      <span className="text-sm">{expiryInfo.isExpired ? '⛔' : '⚠️'}</span>
                      <span>
                        {expiryInfo.isExpired 
                          ? `This specimen has passed its maximum storage duration (${expiryInfo.formattedDate}). Quarantine and log disposal.`
                          : `Cold-chain alert: Specimen expires in ${expiryInfo.daysLeft} day(s) on ${expiryInfo.formattedDate}. Replenish stock or schedule assay.`}
                      </span>
                    </div>
                  )}

                  {sample.notes && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase">Specimen Notes</span>
                      <p className="text-slate-700 italic mt-0.5">{sample.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Vertical Chain of Custody Timeline */}
              <ChainOfCustodyTimeline
                sample={sample}
                transfers={transfers}
                auditLogs={auditLogs}
                experiments={experiments}
                onOpenTransfer={onOpenTransfer}
                onOpenPrint={onOpenPrintSheet}
              />
            </div>
          )}

          {activeTab === 'transfers' && (
            <div className="space-y-3">
              {transfers.length === 0 ? (
                <p className="text-center py-8 text-slate-400">No transfers recorded for this sample.</p>
              ) : (
                transfers.map(t => (
                  <div key={t._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">Transfer #{t._id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {t.status}
                      </span>
                    </div>
                    <div className="text-slate-700">
                      <b>Origin:</b> {t.sourceLocation} <br />
                      <b>Destination:</b> {t.targetLocation}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Initiator: {t.movedBy} &bull; Custodian: {t.custodian} &bull; Date: {new Date(t.date).toLocaleString()}
                    </div>
                    <p className="text-xs text-red-700 italic">"{t.reason}"</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'experiments' && (
            <div className="space-y-3">
              {experiments.length === 0 ? (
                <p className="text-center py-8 text-slate-400">No linked experiments found.</p>
              ) : (
                experiments.map(e => (
                  <div key={e._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="text-sm">{e.title}</span>
                      <span className="text-slate-400">{e.date}</span>
                    </div>
                    <div className="text-xs font-semibold text-red-600">{e.protocolName} (Author: {e.author})</div>
                    <p className="text-slate-700 leading-relaxed">{e.notes}</p>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800">
                      <b className="text-emerald-700">Findings & Outcome:</b> {e.results}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-2">
              {auditLogs.length === 0 ? (
                <p className="text-center py-8 text-slate-400">No audit records for this sample.</p>
              ) : (
                auditLogs.map(a => (
                  <div key={a._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">{a.performedBy} ({a.performedRole})</span>
                      <span className="text-[10px] text-slate-400">{new Date(a.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700 font-medium">{a.details}</p>
                    {a.changes && (
                      <div className="mt-1 text-[10px] font-mono bg-white p-1.5 rounded border border-slate-200 text-slate-600">
                        {JSON.stringify(a.changes)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
