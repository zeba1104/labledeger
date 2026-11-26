import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, Hash, FlaskConical, Building, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LabSettings() {
  const { user, permissions } = useAuth();
  const [settings, setSettings] = useState(null);
  const [idPrefix, setIdPrefix] = useState('LAB-');
  const [labName, setLabName] = useState('BioLedger Genomics & Specimen Institute');
  const [piName, setPiName] = useState('Dr. Sarah Chen');
  const [sampleTypesInput, setSampleTypesInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setSettings(data);
      setIdPrefix(data.idPrefix || 'LAB-');
      setLabName(data.labName || 'BioLedger Genomics & Specimen Institute');
      setPiName(data.piName || 'Dr. Sarah Chen');
      setSampleTypesInput((data.sampleTypes || []).join(', '));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!permissions.canManageStorage) {
      alert('Only Principal Investigator / Lab Owner (Admin) can configure ID format and lab settings.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const types = sampleTypesInput.split(',').map(t => t.trim()).filter(Boolean);
      await api.updateSettings({
        idPrefix: idPrefix.trim().toUpperCase(),
        sampleTypes: types,
        labName,
        piName
      });
      setMessage('Lab configuration and ID numbering format updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Error updating settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center space-x-2.5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Laboratory Architecture & ID Rules
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-200/80 shadow-xs">
            Admin Only
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Configure sample ID numbering formats, registered specimen categories, and institute credentials
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center space-x-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="saas-card rounded-2xl p-6 sm:p-7 space-y-6 text-xs">
        {/* ID Generation Rule */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3 shadow-inner">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Hash className="w-4 h-4" />
            </div>
            <h3 className="font-bold uppercase tracking-wider text-slate-800">
              Sample ID Format Rules (Standard)
            </h3>
          </div>
          <p className="text-slate-500 text-xs">
            Unique sequential format generated for every specimen registration: <b className="text-slate-700 font-mono">{idPrefix}{new Date().getFullYear()}-0001</b>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Prefix Tag
              </label>
              <input
                type="text"
                value={idPrefix}
                onChange={(e) => setIdPrefix(e.target.value)}
                placeholder="LAB-"
                className="w-full px-3 py-2 bg-white border border-slate-200/90 rounded-xl font-mono font-bold uppercase text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Generated Preview Example
              </label>
              <div className="p-2 bg-white rounded-xl border border-slate-200/90 font-mono font-extrabold text-sm text-red-700 flex items-center h-9 shadow-xs">
                {idPrefix}{new Date().getFullYear()}-0042
              </div>
            </div>
          </div>
        </div>

        {/* Specimen Categories */}
        <div>
          <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
            Allowed Specimen Types (Comma-Separated)
          </label>
          <p className="text-slate-400 text-[11px] mb-2">Controls dropdown filters and sample form choices:</p>
          <textarea
            rows={3}
            value={sampleTypesInput}
            onChange={(e) => setSampleTypesInput(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 focus:bg-white font-medium text-slate-800 text-xs shadow-xs"
          />
        </div>

        {/* Institute Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Laboratory / Facility Name
            </label>
            <input
              type="text"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 focus:bg-white text-xs shadow-xs font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Principal Investigator (PI)
            </label>
            <input
              type="text"
              value={piName}
              onChange={(e) => setPiName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 focus:bg-white text-xs shadow-xs font-semibold text-slate-800"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-shimmer px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/20 hover:shadow-red-500/30 transition-all hover:scale-105 active:scale-95 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Lab Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
