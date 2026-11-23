import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, QrCode, CheckCircle2, Download, Layers } from 'lucide-react';

export default function PrintLabelSheetModal({ isOpen, onClose, samples = [] }) {
  const [labelFormat, setLabelFormat] = useState('tube'); // 'tube' (1.5ml / 2.0ml cryovial) or 'box' (cryobox top)

  if (!isOpen || !samples || samples.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-red-100 max-w-3xl w-full overflow-hidden animate-scale-in my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white relative flex-shrink-0 no-print">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-rose-200 mb-1">
            <Printer className="w-4 h-4" />
            <span>Thermal & Laser Label Printing</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Print Specimen QR Labels</h2>
          <p className="text-xs text-rose-100 mt-0.5">
            Standard 1.5ml / 2.0ml cryogenic tube and microplate label templates
          </p>
        </div>

        {/* Options Toolbar */}
        <div className="p-4 px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 no-print text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Format:</span>
            <button
              onClick={() => setLabelFormat('tube')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${labelFormat === 'tube' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'}`}
            >
              Cryovial / Microtube (Standard)
            </button>
            <button
              onClick={() => setLabelFormat('box')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${labelFormat === 'box' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'}`}
            >
              Box & Rack Header
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print {samples.length} Label{samples.length === 1 ? '' : 's'}</span>
            </button>
          </div>
        </div>

        {/* Printable Sheet Viewport */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/60">
          <div id="printable-label-sheet" className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
            {samples.map((sample) => (
              <div 
                key={sample._id}
                className="p-3.5 rounded-xl border border-slate-300 bg-white flex items-start space-x-3 shadow-2xs break-inside-avoid"
              >
                {/* QR Code thumbnail */}
                <div className="w-20 h-20 bg-white border border-slate-200 p-1 rounded-lg flex-shrink-0">
                  {sample.qrCodeData ? (
                    <img src={sample.qrCodeData} alt="QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode className="w-full h-full text-slate-300" />
                  )}
                </div>

                {/* Label text details */}
                <div className="flex-1 min-w-0 text-[11px] leading-tight space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-xs text-red-800 tracking-wider">
                      {sample.sampleId}
                    </span>
                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 font-bold rounded text-[9px]">
                      {sample.type}
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 truncate">{sample.name}</p>

                  <div className="text-slate-600 text-[10px]">
                    Qty: <b>{sample.quantity} {sample.unit}</b> &bull; {sample.temperatureReq || '-80°C'}
                  </div>

                  <div className="text-slate-500 text-[9px] truncate">
                    Loc: {sample.storagePath || 'Unassigned'}
                  </div>

                  {sample.storageLocation?.position && (
                    <div className="text-[9px] font-mono font-bold text-slate-800">
                      Slot: {sample.storageLocation.position}
                    </div>
                  )}

                  <div className="text-[8px] text-slate-400">
                    Reg: {new Date(sample.createdAt).toLocaleDateString()} &bull; LabLedger
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0 no-print text-xs">
          <span className="text-slate-500">
            Compatible with Avery 5160, Cryo-Babies, and thermal barcode printers.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
