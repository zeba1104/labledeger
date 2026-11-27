import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Tag, 
  Calendar, 
  User, 
  FlaskConical, 
  CheckCircle2, 
  X, 
  AlertCircle,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ExperimentNotesView({ onOpenSampleDetails }) {
  const { user, permissions } = useAuth();
  const [experiments, setExperiments] = useState([]);
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [protocolName, setProtocolName] = useState('Standard High-Fidelity PCR Assay');
  const [selectedSampleIds, setSelectedSampleIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [results, setResults] = useState('');
  const [tagsInput, setTagsInput] = useState('PCR, Genomics');
  const [status, setStatus] = useState('Completed');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchExperiments();
    loadSamples();
  }, [search]);

  const fetchExperiments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      const data = await api.getExperiments(params);
      setExperiments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSamples = async () => {
    try {
      const data = await api.getSamples();
      setSamples(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateExperiment = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Please provide an Experiment Title.');
      return;
    }
    if (!notes.trim()) {
      setFormError('Please record the experimental observations and procedure notes.');
      return;
    }

    setFormLoading(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      await api.createExperiment({
        title,
        protocolName,
        sampleIds: selectedSampleIds,
        notes,
        results,
        tags,
        status,
        date: new Date().toISOString().split('T')[0]
      });

      setIsModalOpen(false);
      setTitle('');
      setNotes('');
      setResults('');
      setSelectedSampleIds([]);
      fetchExperiments();
    } catch (err) {
      setFormError(err.message || 'Error recording experiment note.');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleSampleSelection = (sampleId) => {
    setSelectedSampleIds(prev =>
      prev.includes(sampleId) ? prev.filter(id => id !== sampleId) : [...prev, sampleId]
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Experiment Notes & Assays
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs">
              {experiments.length} Protocol{experiments.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Laboratory protocols, PCR assay results, and observations directly linked to used specimen IDs
          </p>
        </div>

        {permissions.canWriteExperiments && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-shimmer inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/20 hover:shadow-red-500/30 transition-all hover:scale-105 active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Record Experiment Note</span>
          </button>
        )}
      </div>

      {/* Search Toolbar */}
      <div className="saas-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="w-full sm:flex-1 sm:max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search experiments by title, protocol, author, or results..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 focus:bg-white text-xs shadow-xs"
          />
        </div>

        <button
          onClick={fetchExperiments}
          className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200/80 rounded-xl font-bold text-slate-700 border border-slate-200/60 shadow-xs transition-all active:scale-95 text-xs"
        >
          Refresh
        </button>
      </div>

      {/* Experiments Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="inline-block w-7 h-7 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="font-semibold text-slate-700">Loading experiment protocols...</p>
          </div>
        ) : experiments.length === 0 ? (
          <div className="saas-card rounded-2xl p-12 text-center text-slate-500 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-2 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No Experiment Notes Found</h4>
            <p className="text-slate-400 mt-1 max-w-sm mx-auto">Record PCR tests, assay runs, or sequencing protocols linked to specimens.</p>
          </div>
        ) : (
          experiments.map((exp) => (
            <div 
              key={exp._id}
              className="saas-card rounded-2xl p-5 sm:p-6 space-y-3 relative group overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-red-700 transition-colors">{exp.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                    <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100 shadow-xs">{exp.protocolName}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-500">Author: <b className="text-slate-800">{exp.author}</b> ({exp.authorRole})</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-400 font-mono">{exp.date}</span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs self-start">
                  {exp.status}
                </span>
              </div>

              {/* Linked Specimens Badge Row */}
              {exp.sampleIds && exp.sampleIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center">
                    <FlaskConical className="w-3 h-3 mr-1 text-red-600" />
                    Linked Specimens:
                  </span>
                  {exp.sampleIds.map(id => (
                    <span 
                      key={id}
                      onClick={() => onOpenSampleDetails && onOpenSampleDetails({ sampleId: id })}
                      className="px-2 py-0.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 font-mono font-bold text-[11px] border border-red-200/80 shadow-xs cursor-pointer transition-colors"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              )}

              {/* Protocol Notes */}
              <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed shadow-inner">
                {exp.notes}
              </div>

              {/* Results & Findings */}
              {exp.results && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs text-slate-800 shadow-xs">
                  <span className="font-bold text-emerald-800 uppercase text-[10px] block mb-0.5">
                    Assay Results & Conclusions:
                  </span>
                  <p>{exp.results}</p>
                </div>
              )}

              {/* Tags */}
              {exp.tags && exp.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {exp.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200/60 shadow-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Record Experiment Modal (Portaled directly to document.body to cover navbar completely) */}
      {isModalOpen && createPortal(
        <div className="modal-backdrop overflow-y-auto p-3 sm:p-5">
          <div className="relative modal-shell max-w-2xl w-full animate-scale-in my-auto">
            <div className="modal-header-ribbon p-6 relative flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-rose-200 mb-1">
                <FileText className="w-4 h-4" />
                <span>Assay & Notebook Documentation</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Record Experiment Note</h2>
              <p className="text-xs text-rose-100 mt-0.5">Link assay procedures with specimens used</p>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form id="exp-form" onSubmit={handleCreateExperiment} className="space-y-3.5">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Experiment Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Targeted PCR Amplification for Exon 7 Variant"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Standard Protocol Name / SOP
                  </label>
                  <input
                    type="text"
                    value={protocolName}
                    onChange={(e) => setProtocolName(e.target.value)}
                    placeholder="e.g. Standard High-Fidelity PCR Assay v3.2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                  />
                </div>

                {/* Multi-Select Specimens Used */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Select Linked Specimen IDs (Used in Experiment)
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">Click to attach specimens from the biobank ledger:</p>
                  <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    {samples.map(s => {
                      const isSelected = selectedSampleIds.includes(s.sampleId);
                      return (
                        <div
                          key={s._id}
                          onClick={() => toggleSampleSelection(s.sampleId)}
                          className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                            isSelected ? 'bg-red-50 text-red-800 border border-red-200 font-bold' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="accent-red-600 rounded"
                            />
                            <span className="font-mono">{s.sampleId}</span>
                            <span className="text-slate-500 font-normal truncate max-w-[200px]">{s.name}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">{s.type}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Procedure & Observations *
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Used samples 0001 and 0002 for PCR test, results attached. 35 cycles at 60C..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Results & Findings
                  </label>
                  <textarea
                    rows={2}
                    value={results}
                    onChange={(e) => setResults(e.target.value)}
                    placeholder="Clear 450 bp band detected on 1.5% agarose gel electrophoresis..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Assay Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Inconclusive">Inconclusive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Protocol Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="PCR, Genomics, Gel"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                form="exp-form"
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all"
              >
                {formLoading ? 'Saving...' : 'Save Experiment Note'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
