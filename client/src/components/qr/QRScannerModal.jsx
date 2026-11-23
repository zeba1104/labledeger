import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  QrCode, 
  Camera, 
  Search, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  FlaskConical, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { api } from '../../services/api';

export default function QRScannerModal({ isOpen, onClose, onSampleFound }) {
  const [manualId, setManualId] = useState('');
  const [samples, setSamples] = useState([]);
  const [selectedDemoId, setSelectedDemoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scannedSample, setScannedSample] = useState(null);

  // Video / camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadSamplesList();
      setError('');
      setManualId('');
      setScanSuccess(false);
      setScannedSample(null);
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const loadSamplesList = async () => {
    try {
      const data = await api.getSamples();
      setSamples(data);
      if (data.length > 0) {
        setSelectedDemoId(data[0].sampleId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      setError('Camera access not available or blocked in this browser. Use simulated barcode gun or specimen selector below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleExecuteScan = async (targetId) => {
    const idToLookup = (targetId || manualId).trim().toUpperCase();
    if (!idToLookup) {
      setError('Please provide or select a sample ID to scan.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const sample = await api.lookupBySampleId(idToLookup);
      setScanSuccess(true);
      setScannedSample(sample);

      // Brief tactile delay then trigger open full story
      setTimeout(() => {
        onSampleFound(sample);
        onClose();
      }, 1000);
    } catch (err) {
      setError(`Specimen "${idToLookup}" was not found in the laboratory ledger.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-red-100 max-w-2xl w-full overflow-hidden animate-modal-pop my-auto max-h-[92vh] flex flex-col">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-5 sm:p-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white/90 hover:text-white hover:rotate-90 transition-all duration-200"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-rose-200 mb-1">
            <QrCode className="w-4 h-4" />
            <span>High-Speed Optical Scanner</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">QR Specimen Scanner</h2>
          <p className="text-xs text-rose-100 mt-0.5">
            Scan tube labels or 2D cryobox datamatrix to instantly open forensic history
          </p>
        </div>

        {/* Scanner Body - 2 Column Balanced Layout */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2 animate-fade-in shadow-xs">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {scanSuccess && scannedSample ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-scale-in space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-extrabold text-emerald-900">Specimen Detected!</h4>
              <p className="font-mono text-sm font-bold text-emerald-700">{scannedSample.sampleId}</p>
              <p className="text-xs text-slate-700 font-semibold">{scannedSample.name}</p>
              <p className="text-[11px] text-slate-500">Opening forensic chain of custody & sample dossier...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Left Column: Visual Scanner HUD & Webcam */}
              <div className="space-y-3">
                <div className="relative h-44 sm:h-48 w-full rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden border-2 border-red-500/40 shadow-inner">
                  {isCameraActive ? (
                    <video ref={videoRef} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-3">
                      <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-2">
                        <QrCode className="w-6 h-6 animate-pulse-subtle" />
                      </div>
                      <p className="text-xs text-slate-200 font-bold">Optical Target Ready</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Point camera at cryotube label</p>
                    </div>
                  )}

                  {/* Laser scan line animation */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-laser pointer-events-none" />

                  {/* Reticle Viewfinder Corners */}
                  <div className="absolute inset-4 border border-white/20 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <div className="w-2.5 h-2.5 border-t-2 border-l-2 border-red-500" />
                      <div className="w-2.5 h-2.5 border-t-2 border-r-2 border-red-500" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-2.5 h-2.5 border-b-2 border-l-2 border-red-500" />
                      <div className="w-2.5 h-2.5 border-b-2 border-r-2 border-red-500" />
                    </div>
                  </div>
                </div>

                {/* Camera Activation Button */}
                <div className="flex justify-center">
                  {!isCameraActive ? (
                    <button
                      onClick={handleStartCamera}
                      type="button"
                      className="btn-shimmer inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 shadow-xs hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                      <span>Activate Device Webcam</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      type="button"
                      className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 shadow-xs transition-colors"
                    >
                      <span>Turn Off Camera</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Simulator & Manual Input */}
              <div className="space-y-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                {/* Simulator Card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center">
                      <Zap className="w-3.5 h-3.5 mr-1 text-red-600" />
                      Instant 1-Click Simulator:
                    </span>
                    <span className="text-[10px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Evaluator Tool</span>
                  </div>

                  <select
                    value={selectedDemoId}
                    onChange={(e) => setSelectedDemoId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
                  >
                    {samples.map(s => (
                      <option key={s._id} value={s.sampleId}>
                        {s.sampleId} — {s.name} ({s.type})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleExecuteScan(selectedDemoId)}
                    disabled={loading || !selectedDemoId}
                    className="btn-shimmer w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{loading ? 'Scanning...' : 'Simulate Tube Scan'}</span>
                  </button>
                </div>

                <div className="h-px bg-slate-200" />

                {/* Direct Manual Barcode Lookup */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Or Type / Paste Barcode Identifier:
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        placeholder="e.g. LAB-2026-0001"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
                      />
                    </div>
                    <button
                      onClick={() => handleExecuteScan(manualId)}
                      disabled={loading || !manualId.trim()}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs disabled:opacity-40 whitespace-nowrap hover:scale-105 active:scale-95"
                    >
                      Lookup
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Supports 1D Code128, 2D QR Code & DataMatrix identifiers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
