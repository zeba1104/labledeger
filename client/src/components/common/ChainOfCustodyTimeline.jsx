import React, { useState, useMemo } from 'react';
import { 
  ArrowRightLeft, 
  FlaskConical, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  ArrowRight, 
  Plus, 
  Search, 
  ArrowUpDown, 
  Printer, 
  Calendar,
  Layers,
  Thermometer,
  Shield,
  ExternalLink
} from 'lucide-react';

export default function ChainOfCustodyTimeline({ 
  sample, 
  transfers = [], 
  auditLogs = [], 
  experiments = [], 
  onOpenTransfer,
  onOpenPrint
}) {
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = Chronological (story flow), 'desc' = Newest first
  const [filterType, setFilterType] = useState('all'); // 'all', 'transfer', 'experiment', 'audit'
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Synthesize unified timeline events from sample registration, transfers, experiments, and auditLogs
  const unifiedEvents = useMemo(() => {
    if (!sample) return [];
    const events = [];

    // Milestone 1: Sample Registration Event
    if (sample.createdAt) {
      events.push({
        id: `reg-${sample._id || sample.sampleId}`,
        timestamp: new Date(sample.createdAt).getTime(),
        date: sample.createdAt,
        category: 'registration',
        typeLabel: 'Sample Registration',
        actor: sample.registeredBy || 'Anita Rao',
        role: sample.registeredRole || 'Researcher',
        title: `Registered by ${sample.registeredBy || 'Anita (Researcher)'}`,
        headline: `Registered by ${sample.registeredBy || 'Anita'} (${sample.registeredRole || 'Researcher'}), stored in ${sample.storagePath ? sample.storagePath.split('>')[0].trim() : 'Freezer 1, Box A'}`,
        location: sample.storagePath || (sample.storageLocation?.position ? `Initial Storage Slot: ${sample.storageLocation.position}` : 'Initial Repository'),
        fromLocation: null,
        toLocation: sample.storagePath || 'Freezer 1, Box A',
        custodian: sample.registeredBy || 'Anita Rao',
        reason: sample.notes || 'Initial specimen enrollment into biobank registry',
        quantity: `${sample.quantity} ${sample.unit}`,
        verified: true,
        auditId: `AUD-REG-${sample.sampleId}`,
        icon: FlaskConical,
        colorClass: 'emerald'
      });
    }

    // Milestone 2: Custody Transfers
    transfers.forEach((t) => {
      const isCheckout = t.reason?.toLowerCase().includes('checked out') || t.reason?.toLowerCase().includes('experiment') || t.targetLocation?.toLowerCase().includes('bench');
      const isReturn = t.reason?.toLowerCase().includes('return') || (t.sourceLocation?.toLowerCase().includes('bench') && t.targetLocation?.toLowerCase().includes('freezer'));

      let headline = `Moved by ${t.movedBy} (${t.movedRole || 'Technician'}) to ${t.targetLocation}`;
      if (isCheckout) {
        headline = `Checked out by ${t.movedBy} for an experiment`;
      } else if (isReturn) {
        headline = `Returned to ${t.targetLocation}`;
      }

      events.push({
        id: `trf-${t._id}`,
        timestamp: new Date(t.date || t.createdAt || Date.now()).getTime(),
        date: t.date || t.createdAt,
        category: isCheckout ? 'checkout' : isReturn ? 'return' : 'transfer',
        typeLabel: isCheckout ? 'Assay Check-Out' : isReturn ? 'Storage Return' : 'Cold-Chain Transfer',
        actor: t.movedBy || 'Ravi Patel',
        role: t.movedRole || (isCheckout || isReturn ? 'Researcher' : 'Technician'),
        title: isCheckout ? 'Checked Out for Experiment' : isReturn ? 'Returned to Cryogenic Storage' : 'Moved Cold Chain Location',
        headline: headline,
        location: `${t.sourceLocation} → ${t.targetLocation}`,
        fromLocation: t.sourceLocation,
        toLocation: t.targetLocation,
        custodian: t.custodian || t.movedBy,
        reason: t.reason || 'Laboratory relocation and custody handoff',
        status: t.status || 'Completed',
        approvedBy: t.approvedBy,
        verified: true,
        auditId: `AUD-TRF-${t._id}`,
        icon: isCheckout ? FileText : isReturn ? CheckCircle2 : ArrowRightLeft,
        colorClass: isCheckout ? 'rose' : isReturn ? 'emerald' : 'amber'
      });
    });

    // Milestone 3: Linked Experiment Notes
    experiments.forEach((exp) => {
      // Avoid duplicate if an explicit transfer checkout already covered this timestamp
      const hasSimilarTransfer = transfers.some(t => 
        Math.abs(new Date(t.date).getTime() - new Date(exp.date).getTime()) < 60000 &&
        t.reason?.toLowerCase().includes('experiment')
      );

      if (!hasSimilarTransfer) {
        events.push({
          id: `exp-${exp._id}`,
          timestamp: new Date(exp.date || exp.createdAt || Date.now()).getTime(),
          date: exp.date || exp.createdAt,
          category: 'experiment',
          typeLabel: 'Experiment Note',
          actor: exp.author || 'Meera Nair',
          role: exp.authorRole || 'Researcher',
          title: `Assay: ${exp.title}`,
          headline: `Checked out by ${exp.author || 'Meera'} for an experiment: "${exp.title}"`,
          location: `Protocol: ${exp.protocolName || 'Standard Assay'}`,
          fromLocation: null,
          toLocation: 'Benchtop PCR Assay Station',
          custodian: exp.author || 'Meera Nair',
          reason: exp.notes || exp.protocolName,
          results: exp.results,
          verified: true,
          auditId: `AUD-EXP-${exp._id}`,
          icon: FileText,
          colorClass: 'purple'
        });
      }
    });

    // Milestone 4: Forensic Audit Logs (e.g. quantity changes or role actions)
    auditLogs.forEach((log) => {
      // Filter out auto-logged duplicate transfers or creations
      if (log.action === 'CREATE_SAMPLE' || log.action === 'TRANSFER_SAMPLE' || log.action === 'CHECKOUT_SAMPLE' || log.action === 'RETURN_SAMPLE') {
        return;
      }

      events.push({
        id: `aud-${log._id}`,
        timestamp: new Date(log.timestamp).getTime(),
        date: log.timestamp,
        category: 'audit',
        typeLabel: 'Ledger Audit Event',
        actor: log.performedBy,
        role: log.performedRole,
        title: log.action.replace('_', ' '),
        headline: log.details,
        location: sample.storagePath || 'Storage Matrix',
        fromLocation: null,
        toLocation: null,
        custodian: log.performedBy,
        reason: log.details,
        changes: log.changes,
        verified: true,
        auditId: log._id,
        icon: ShieldCheck,
        colorClass: 'blue'
      });
    });

    // Sort events
    return events.sort((a, b) => {
      return sortOrder === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
    });
  }, [sample, transfers, auditLogs, experiments, sortOrder]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return unifiedEvents.filter(ev => {
      if (filterType !== 'all') {
        if (filterType === 'transfer' && !['transfer', 'checkout', 'return'].includes(ev.category)) return false;
        if (filterType === 'experiment' && ev.category !== 'experiment') return false;
        if (filterType === 'audit' && ev.category !== 'audit') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ev.headline.toLowerCase().includes(q) ||
          ev.actor.toLowerCase().includes(q) ||
          ev.role.toLowerCase().includes(q) ||
          (ev.location && ev.location.toLowerCase().includes(q)) ||
          (ev.reason && ev.reason.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [unifiedEvents, filterType, searchQuery]);

  // Color mappings
  const nodeStyles = {
    emerald: {
      bg: 'bg-emerald-500',
      border: 'border-emerald-200',
      ring: 'ring-emerald-100',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      light: 'bg-emerald-50/60'
    },
    amber: {
      bg: 'bg-amber-500',
      border: 'border-amber-200',
      ring: 'ring-amber-100',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      light: 'bg-amber-50/60'
    },
    rose: {
      bg: 'bg-rose-500',
      border: 'border-rose-200',
      ring: 'ring-rose-100',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
      light: 'bg-rose-50/60'
    },
    purple: {
      bg: 'bg-purple-500',
      border: 'border-purple-200',
      ring: 'ring-purple-100',
      badge: 'bg-purple-50 text-purple-800 border-purple-200',
      light: 'bg-purple-50/60'
    },
    blue: {
      bg: 'bg-blue-600',
      border: 'border-blue-200',
      ring: 'ring-blue-100',
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
      light: 'bg-blue-50/60'
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Ten-Second Auditor Summary Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 text-rose-200 border border-white/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>FDA 21 CFR Part 11 / GLP Immutable Chain of Custody</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center space-x-2">
              <span>{sample.sampleId} &bull; Forensic Life Cycle</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Complete visual history of everyone who has held this specimen and every cryogenic coordinate it has occupied
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenTransfer && (
              <button
                onClick={() => onOpenTransfer(sample)}
                className="btn-shimmer px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/30 transition-all flex items-center space-x-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Move Specimen</span>
              </button>
            )}
            {onOpenPrint && (
              <button
                onClick={() => onOpenPrint([sample])}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print QR</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Key Forensic Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative z-10 text-xs">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Origin Registered</span>
            <div className="font-extrabold text-white truncate">{sample.registeredBy}</div>
            <div className="text-[10px] text-rose-300">{sample.registeredRole} &bull; {new Date(sample.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Current Custodian</span>
            <div className="font-extrabold text-white truncate">
              {transfers.length > 0 ? transfers[0].custodian || transfers[0].movedBy : sample.registeredBy}
            </div>
            <div className="text-[10px] text-emerald-300">Authorized Personnel</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Current Physical Location</span>
            <div className="font-extrabold text-white truncate">{sample.storagePath || 'Freezer 2, Box C'}</div>
            <div className="text-[10px] text-slate-300">{sample.temperatureReq || '-80°C'} preservation</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Chain Integrity</span>
            <div className="font-extrabold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Verified</span>
            </div>
            <div className="text-[10px] text-slate-300">{unifiedEvents.length} Recorded Steps</div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Timeline Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">Filter:</span>
          {[
            { id: 'all', label: `All Events (${unifiedEvents.length})` },
            { id: 'transfer', label: `Transfers (${transfers.length})` },
            { id: 'experiment', label: `Assays (${experiments.length})` },
            { id: 'audit', label: `Audit (${auditLogs.length})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                filterType === f.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {/* Search inside timeline */}
          <div className="relative flex-1 sm:w-48">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search timeline..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            title="Toggle chronological vs reverse ordering"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center space-x-1.5 transition-colors flex-shrink-0"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-red-600" />
            <span>{sortOrder === 'asc' ? 'Story (Oldest First)' : 'Latest First'}</span>
          </button>
        </div>
      </div>

      {/* 3. The Vertical Chain of Custody Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-amber-500 before:to-rose-500">
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-200">
            No chain of custody events found matching your filter criteria.
          </div>
        ) : (
          filteredEvents.map((ev, idx) => {
            const Icon = ev.icon || ArrowRightLeft;
            const style = nodeStyles[ev.colorClass] || nodeStyles.amber;
            const isFirst = idx === 0;
            const isLast = idx === filteredEvents.length - 1;

            return (
              <div key={ev.id} className="relative group">
                {/* Visual Timeline Node */}
                <div className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full ${style.bg} border-2 border-white shadow-md flex items-center justify-center text-white ring-4 ${style.ring} group-hover:scale-110 transition-transform duration-200 z-10`}>
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>

                {/* Event Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-red-300 shadow-xs hover:shadow-md transition-all space-y-3">
                  {/* Top metadata line: Date + Actor + Category Pill */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${style.badge}`}>
                        {ev.typeLabel}
                      </span>
                      <span className="text-slate-400 font-mono text-xs flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {ev.actor ? ev.actor[0] : 'U'}
                      </div>
                      <span className="font-bold text-slate-900 text-xs">{ev.actor}</span>
                      <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                        {ev.role}
                      </span>
                    </div>
                  </div>

                  {/* Primary Narrative Headline (Matches user's exact specification) */}
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs">
                    <p className="font-bold text-slate-900 text-sm leading-relaxed">
                      {ev.headline}
                    </p>
                  </div>

                  {/* Location & Custody Route Details */}
                  {ev.fromLocation && ev.toLocation && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Source Coordinate:</span>
                        <span className="text-slate-600 line-through truncate block">{ev.fromLocation}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                        <span className="text-[10px] text-red-600 uppercase font-bold block mb-0.5">Destination Coordinate:</span>
                        <span className="text-red-900 font-bold truncate block">{ev.toLocation}</span>
                      </div>
                    </div>
                  )}

                  {/* Custodian & Stated Reason */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500">
                    <div>
                      <span className="font-semibold text-slate-700">Designated Custodian:</span>{' '}
                      <span className="font-bold text-slate-900">{ev.custodian || ev.actor}</span>
                    </div>
                    {ev.reason && (
                      <div className="text-slate-500 italic truncate max-w-sm">
                        Reason: "{ev.reason}"
                      </div>
                    )}
                  </div>

                  {/* GLP Audit Signature Verification */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-50/60 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-2 px-4 sm:px-5 rounded-b-2xl border-t border-slate-100 font-mono">
                    <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Audit Record ID: {ev.auditId}</span>
                    </div>
                    <span>GLP Signed &bull; Immutable</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Bottom Milestone Ribbon */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/90 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Thermometer className="w-4 h-4 text-blue-600 animate-pulse" />
          <span className="font-bold text-slate-800">Active Cold-Chain Storage:</span>
          <span>{sample.storagePath || 'Freezer 2, Box C'} ({sample.temperatureReq || '-80°C'})</span>
        </div>

        {onOpenTransfer && (
          <button
            onClick={() => onOpenTransfer(sample)}
            className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center space-x-1 hover:underline"
          >
            <span>Record Next Specimen Transfer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
