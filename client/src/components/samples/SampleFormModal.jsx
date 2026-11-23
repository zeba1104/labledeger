import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  FlaskConical, 
  Box, 
  Thermometer, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Layers, 
  Hash, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SampleFormModal({ 
  isOpen, 
  onClose, 
  onSampleSaved, 
  sampleToEdit = null,
  prefilledLocation = null // { boxId, position, path }
}) {
  const { user, permissions } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState('Blood');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('ml');
  const [concentration, setConcentration] = useState('');
  const [donorId, setDonorId] = useState('');
  const [temperatureReq, setTemperatureReq] = useState('-80°C');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Stored');

  // Storage selection
  const [storageTree, setStorageTree] = useState([]);
  const [selectedBoxId, setSelectedBoxId] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [boxData, setBoxData] = useState(null);
  const [boxesList, setBoxesList] = useState([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStorageNodes();
      if (sampleToEdit) {
        setName(sampleToEdit.name || '');
        setType(sampleToEdit.type || 'Blood');
        setQuantity(sampleToEdit.quantity || '');
        setUnit(sampleToEdit.unit || 'ml');
        setConcentration(sampleToEdit.concentration || '');
        setDonorId(sampleToEdit.donorId || '');
        setTemperatureReq(sampleToEdit.temperatureReq || '-80°C');
        setNotes(sampleToEdit.notes || '');
        setStatus(sampleToEdit.status || 'Stored');
        if (sampleToEdit.storageLocation) {
          setSelectedBoxId(sampleToEdit.storageLocation.boxId || '');
          setSelectedPosition(sampleToEdit.storageLocation.position || '');
        }
      } else {
        // Reset form
        setName('');
        setType('Blood');
        setQuantity('');
        setUnit('ml');
        setConcentration('');
        setDonorId('');
        setTemperatureReq('-80°C');
        setNotes('');
        setStatus('Stored');
        if (prefilledLocation) {
          setSelectedBoxId(prefilledLocation.boxId || '');
          setSelectedPosition(prefilledLocation.position || '');
        } else {
          setSelectedBoxId('');
          setSelectedPosition('');
        }
      }
      setError('');
    }
  }, [isOpen, sampleToEdit, prefilledLocation]);

  const loadStorageNodes = async () => {
    try {
      const data = await api.getStorageTree();
      setStorageTree(data.tree || []);
      const boxes = (data.allNodes || []).filter(n => n.type === 'box');
      setBoxesList(boxes);
      if (!selectedBoxId && boxes.length > 0) {
        setSelectedBoxId(boxes[0]._id);
      }
    } catch (err) {
      console.error('Error fetching storage tree:', err);
    }
  };

  useEffect(() => {
    if (selectedBoxId) {
      loadBoxDetails(selectedBoxId);
    }
  }, [selectedBoxId]);

  const loadBoxDetails = async (boxId) => {
    try {
      const res = await api.getBoxGrid(boxId);
      setBoxData(res);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name.trim()) {
      setError('Please provide a specimen name or identifier.');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError('Quantity must be a positive number greater than 0.');
      return;
    }
    if (!unit.trim()) {
      setError('Please specify the specimen measurement unit (e.g. ml, µl, vials).');
      return;
    }

    // Storage path calculation
    let storagePath = 'Unassigned';
    let storageLocation = null;

    if (selectedBoxId) {
      const targetBox = boxesList.find(b => b._id === selectedBoxId);
      const posStr = selectedPosition.trim().toUpperCase();
      storageLocation = {
        boxId: selectedBoxId,
        position: posStr
      };
      storagePath = `${targetBox?.path || targetBox?.name || 'Box'} > Position ${posStr || 'Unassigned'}`;
    }

    setLoading(true);
    try {
      if (sampleToEdit) {
        await api.updateSample(sampleToEdit._id, {
          name,
          type,
          quantity: Number(quantity),
          unit,
          concentration,
          donorId,
          temperatureReq,
          status,
          notes,
          storageLocation,
          storagePath
        });
      } else {
        await api.createSample({
          name,
          type,
          quantity: Number(quantity),
          unit,
          concentration,
          donorId,
          temperatureReq,
          status,
          notes,
          storageLocation,
          storagePath
        });

        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {}
      }

      onSampleSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving sample record.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-red-100 max-w-2xl w-full overflow-hidden animate-scale-in my-auto max-h-[92vh] flex flex-col">
        {/* Modal Ribbon */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-rose-200 mb-1">
            <FlaskConical className="w-4 h-4" />
            <span>Digital Laboratory Specimen Registry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {sampleToEdit ? `Edit Specimen: ${sampleToEdit.sampleId}` : 'Register New Research Specimen'}
          </h2>
          <p className="text-xs text-rose-100 mt-0.5">
            Auto-generates sequential Sample ID (LAB-2026-XXXX) and scannable QR label
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form id="sample-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Row 1: Specimen Name & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Specimen Name / Title *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Purified Genomic DNA (Patient #44)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Specimen Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                >
                  <option value="Blood">Blood (EDTA/Heparin)</option>
                  <option value="DNA">Purified Genomic DNA</option>
                  <option value="RNA">Total RNA Isolate</option>
                  <option value="Serum">Serum Albumin</option>
                  <option value="Enzyme">Enzyme / Polymerase</option>
                  <option value="Cell Culture">Cell Culture / Line</option>
                  <option value="Saliva">Saliva / Swab</option>
                  <option value="Tissue">Tissue Biopsy</option>
                  <option value="Plasma">Plasma</option>
                  <option value="Proteins">Recombinant Protein</option>
                </select>
              </div>
            </div>

            {/* Row 2: Quantity, Unit, Concentration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Unit *
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                >
                  <option value="ml">Milliliters (ml)</option>
                  <option value="µl">Microliters (µl)</option>
                  <option value="mg">Milligrams (mg)</option>
                  <option value="µg">Micrograms (µg)</option>
                  <option value="vials">Cryovials</option>
                  <option value="aliquots">Aliquots</option>
                  <option value="tubes">Tubes</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Concentration / Purity
                </label>
                <input
                  type="text"
                  value={concentration}
                  onChange={(e) => setConcentration(e.target.value)}
                  placeholder="e.g. 150 ng/µl (A260/280: 1.8)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                />
              </div>
            </div>

            {/* Row 3: Donor/Batch & Temperature */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Donor Identifier / Lot #
                </label>
                <input
                  type="text"
                  value={donorId}
                  onChange={(e) => setDonorId(e.target.value)}
                  placeholder="e.g. DONOR-9912 or LOT-2026-B"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Temperature Requirement
                </label>
                <select
                  value={temperatureReq}
                  onChange={(e) => setTemperatureReq(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                >
                  <option value="-80°C">Ultra-Low Cryo (-80°C)</option>
                  <option value="-20°C">Standard Freezer (-20°C)</option>
                  <option value="4°C">Cold Room / Fridge (4°C)</option>
                  <option value="20°C">Room Temperature (20°C)</option>
                  <option value="-196°C">Liquid Nitrogen Vapor (-196°C)</option>
                </select>
              </div>
            </div>

            {/* Storage Box & Position Picker */}
            <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
              <div className="flex items-center space-x-2">
                <Box className="w-4 h-4 text-red-600" />
                <h4 className="font-bold uppercase tracking-wider text-slate-800">
                  Cryogenic Box & Coordinate Assignment
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Target CryoBox
                  </label>
                  <select
                    value={selectedBoxId}
                    onChange={(e) => setSelectedBoxId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                  >
                    <option value="">-- Choose Storage Box --</option>
                    {boxesList.map(b => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.temperature || '-80°C'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Slot Position Coordinate (e.g. A1, B3, C4)
                  </label>
                  <input
                    type="text"
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value.toUpperCase())}
                    placeholder="e.g. A4"
                    maxLength={4}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                  />
                </div>
              </div>

              {boxData && (
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Occupancy: <b>{boxData.dimensions?.occupiedSlots}</b> / {boxData.dimensions?.totalSlots} slots used</span>
                  <span className="text-emerald-700 font-semibold">{boxData.dimensions?.totalSlots - boxData.dimensions?.occupiedSlots} available</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Experiment Notes & Protocol Reference
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="IRB protocol, freeze-thaw cycles, biohazard precautions..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>

          <button
            form="sample-form"
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{sampleToEdit ? 'Save Changes' : 'Confirm & Register Specimen'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
