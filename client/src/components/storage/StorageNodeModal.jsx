import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Box, AlertCircle, CheckCircle2, Layers } from 'lucide-react';
import { api } from '../../services/api';

export default function StorageNodeModal({ isOpen, onClose, onNodeSaved, parentNodes = [] }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('box');
  const [parentId, setParentId] = useState('');
  const [temperature, setTemperature] = useState('-80°C');
  const [notes, setNotes] = useState('');
  const [gridRows, setGridRows] = useState(9);
  const [gridCols, setGridCols] = useState(9);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setType('box');
      setParentId(parentNodes.length > 0 ? parentNodes[0]._id : '');
      setTemperature('-80°C');
      setNotes('');
      setGridRows(9);
      setGridCols(9);
      setError('');
    }
  }, [isOpen, parentNodes]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a name for this storage element.');
      return;
    }

    setLoading(true);
    try {
      await api.createStorageNode({
        name,
        type,
        parentId: type === 'room' ? null : parentId,
        temperature,
        notes,
        gridRows: Number(gridRows),
        gridCols: Number(gridCols)
      });
      onNodeSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Error creating storage element.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-red-100 max-w-md w-full overflow-hidden animate-scale-in my-auto max-h-[92vh] flex flex-col">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-rose-200 mb-1">
            <Layers className="w-4 h-4" />
            <span>Admin Architecture Builder</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Add Storage Element</h2>
          <p className="text-xs text-rose-100 mt-0.5">Build Room &rarr; Freezer &rarr; Shelf &rarr; Rack &rarr; Box hierarchy</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Element Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              >
                <option value="room">Room (Top Level)</option>
                <option value="freezer">Freezer (-80°C / -20°C)</option>
                <option value="shelf">Shelf</option>
                <option value="rack">Rack (Stainless Frame)</option>
                <option value="box">CryoBox (Grid Container)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Name / Label *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CryoBox Red #4 (9x9) or Freezer -80°C #3"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 focus:bg-white"
                required
              />
            </div>

            {type !== 'room' && (
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Parent Container *
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                  required
                >
                  <option value="">-- Select Parent Container --</option>
                  {parentNodes.map(p => (
                    <option key={p._id} value={p._id}>
                      [{p.type.toUpperCase()}] {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nominal Temperature
              </label>
              <select
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              >
                <option value="-80°C">Ultra-Low Cryo (-80°C)</option>
                <option value="-20°C">Sub-Zero Freezer (-20°C)</option>
                <option value="4°C">Refrigerated (4°C)</option>
                <option value="20°C">Room Temp (20°C)</option>
                <option value="-196°C">Liquid Nitrogen (-196°C)</option>
              </select>
            </div>

            {type === 'box' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Rows (Letters)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={gridRows}
                    onChange={(e) => setGridRows(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Columns (Numbers)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={gridCols}
                    onChange={(e) => setGridCols(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-center"
                  />
                </div>
                <div className="col-span-2 text-[10px] text-slate-500 text-center">
                  Total Capacity: <b>{Number(gridRows) * Number(gridCols)} slots</b>
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Description / Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Manufacturer, model, serial #, designated samples..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
              />
            </div>

            <div className="pt-3 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all"
              >
                {loading ? 'Creating...' : 'Create Element'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
