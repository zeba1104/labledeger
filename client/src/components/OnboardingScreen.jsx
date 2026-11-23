import React from 'react';
import { 
  FlaskConical, 
  Dna, 
  QrCode, 
  Box, 
  ArrowRightLeft, 
  FileText, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  LogIn, 
  Users, 
  ArrowRight,
  Shield,
  Eye,
  Microscope,
  Database,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OnboardingScreen({ onOpenLogin }) {
  const { setShowOnboarding, user } = useAuth();

  const features = [
    {
      icon: QrCode,
      title: 'Sample IDs & QR Labels',
      badge: 'Auto-Generated',
      description: 'Every specimen receives a unique ID (e.g. LAB-2026-0001) and high-density printable QR code for instant mobile scan lookup.',
      color: 'from-red-500 to-rose-600'
    },
    {
      icon: Box,
      title: '5-Level Storage Hierarchy',
      badge: 'Interactive Visual Grids',
      description: 'Drill down level-by-level: Room → Freezer → Shelf → Rack → Box → Position. Never lose a cryogenic sample again.',
      color: 'from-rose-600 to-red-700'
    },
    {
      icon: ArrowRightLeft,
      title: 'Chain-of-Custody Transfer Log',
      badge: 'Full Traceability',
      description: 'Records every movement between freezers, labs, and researchers with date, custodian, reason, and PI approval.',
      color: 'from-red-600 to-amber-600'
    },
    {
      icon: FileText,
      title: 'Experiment Notes Linkage',
      badge: 'Assay Protocols',
      description: 'Directly link PCR assays, DNA extractions, and sequencing runs with the exact specimen IDs used in the experiment.',
      color: 'from-rose-500 to-red-600'
    },
    {
      icon: ShieldCheck,
      title: 'Immutable Audit History',
      badge: 'FDA / GLP Compliant',
      description: 'Unchangeable system log tracking every registration, quantity change, transfer, and edit with timestamps and user signatures.',
      color: 'from-red-700 to-slate-900'
    },
    {
      icon: Users,
      title: '4 Role-Based Access Controls',
      badge: 'Strict RBAC',
      description: 'Granular permissions tailored for Principal Investigators, Research Scientists, Lab Technicians, and External Auditors.',
      color: 'from-slate-800 to-red-900'
    }
  ];

  const roles = [
    {
      role: 'Admin',
      name: 'Dr. Sarah Chen',
      title: 'Principal Investigator / PI',
      desc: 'Full administrative authority. Manages team roles, configures cryogenic storage structure, sets ID formats, and approves transfers.',
      permissions: 'Unrestricted Access',
      avatarColor: 'bg-red-600 text-white'
    },
    {
      role: 'Researcher',
      name: 'Dr. Anita Rao',
      title: 'Senior Molecular Biologist',
      desc: 'Conducts laboratory studies. Registers specimens, initiates transfers, documents assay protocols, and prints tube labels.',
      permissions: 'Specimen Registry & Assay Notes',
      avatarColor: 'bg-rose-600 text-white'
    },
    {
      role: 'Technician',
      name: 'Ravi Patel',
      title: 'Lead Specimen Technician',
      desc: 'Handles day-to-day biobank operations. Scans incoming tubes, updates aliquots/quantities, records freezer moves.',
      permissions: 'QR Scan, Quantity & Moves',
      avatarColor: 'bg-amber-600 text-white'
    },
    {
      role: 'Viewer',
      name: 'Dr. Marcus Vance',
      title: 'Compliance Auditor',
      desc: 'Supervisor and external quality reviewer. Read-only inspection of specimens, storage maps, and exportable regulatory audit trails.',
      permissions: 'Read-Only & Audit Reports',
      avatarColor: 'bg-slate-700 text-white'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/30 to-slate-100 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-rose-100/60 bg-white/70 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <FlaskConical className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">Lab<span className="text-red-600">Ledger</span></span>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-red-100 text-red-700 rounded-full border border-red-200">
                v2.0 Clinical
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Digital Research Sample Tracking & Storage System</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {user ? (
            <button
              onClick={() => setShowOnboarding(false)}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md shadow-red-500/20 transition-all duration-200"
            >
              Enter Workspace
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 transition-all duration-200"
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              Sign In to Portal
            </button>
          )}
        </div>
      </header>

      {/* Main Hero & Onboarding Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
        {/* Floating Ambient Biological Elements */}
        <div className="absolute top-12 left-10 text-rose-300/40 pointer-events-none animate-float-slow hidden md:block">
          <Dna className="w-16 h-16" />
        </div>
        <div className="absolute top-28 right-16 text-red-300/35 pointer-events-none animate-float-reverse hidden md:block">
          <FlaskConical className="w-14 h-14" />
        </div>
        <div className="absolute bottom-20 left-20 text-slate-300/40 pointer-events-none animate-float hidden lg:block">
          <Microscope className="w-16 h-16" />
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 relative z-10 animate-fade-up">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/70 shadow-sm mb-5 hover:scale-105 transition-transform duration-300">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 mr-1 text-red-600" />
            Designed Exclusively for Medical, Biotech & Academic Research Labs
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Total Traceability for Every <br />
            <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-800 bg-clip-text text-transparent hover:brightness-110 transition-all duration-300">
              Laboratory Specimen
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            Replace spreadsheets and paper binders with an interactive digital logbook.
            Track what each sample is, exactly where it is stored in cryogenic racks, who moved it, and its linked experiment results.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenLogin}
              className="btn-shimmer w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl shadow-xl shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
            >
              <LogIn className="w-4 h-4 mr-2" />
              <span>Sign In with Email & Password</span>
              <ChevronRight className="w-4 h-4 ml-1.5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Core Laboratory Capabilities</h2>
              <p className="text-sm text-slate-500">Every feature defined in the scientific protocol specifications</p>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Secure Authentication & Real-Time Sync</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div 
                  key={idx}
                  className="card-interactive relative group bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-red-400/80 shadow-xs hover:shadow-xl hover:shadow-red-500/10 flex flex-col justify-between overflow-hidden transition-all duration-300"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {/* Clean, perfectly clipped top accent bar that smoothly fades in on hover */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Ambient subtle warm glow in corner */}
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-red-500/0 group-hover:bg-red-500/5 rounded-full blur-xl transition-all duration-500 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 group-hover:scale-105 group-hover:bg-red-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-red-500/25 transition-all duration-300 shadow-xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 group-hover:border-red-200 group-hover:bg-red-100 transition-colors">
                        {f.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors duration-200 mb-2">
                      {f.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {f.description}
                    </p>
                  </div>

                  <div className="relative z-10 pt-3 border-t border-slate-100 group-hover:border-red-100/60 flex items-center text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 group-hover:scale-110 transition-transform duration-200" />
                    <span>Laboratory Verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The Sample Life Cycle Chain (Matching PDF Page 2) */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-red-100 shadow-md shadow-red-500/5 mb-14">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              Chain of Custody
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">How the System Connects</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Opening one sample page unveils its complete forensic life cycle:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
            {[
              { num: '1', title: 'Register Sample', desc: 'Auto-generates unique ID & printable QR label.' },
              { num: '2', title: 'Storage Map', desc: 'Placed into Room → Freezer → Shelf → Rack → Box position.' },
              { num: '3', title: 'Transfer Log', desc: 'Records moves between freezers or researchers.' },
              { num: '4', title: 'Experiment Notes', desc: 'Assay results & protocols linked to used sample IDs.' },
              { num: '5', title: 'Audit History', desc: 'Unchangeable record of every edit for accountability.' },
            ].map((step, i) => (
              <div key={i} className="card-interactive group flex flex-col items-center text-center p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-red-400 shadow-xs hover:shadow-lg hover:shadow-red-500/10 transition-all overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 group-hover:shadow-md group-hover:shadow-red-500/30 transition-transform">
                  {step.num}
                </div>
                <h4 className="text-xs font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">{step.title}</h4>
                <p className="text-[11px] text-slate-500 leading-normal">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Role Permissions Comparison Matrix (Matching PDF Page 3) */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm mb-12">
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Four Dedicated User Roles</h3>
            <p className="text-xs text-slate-500">Each role requires verified login credentials assigned by the Lab Director</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map(r => (
              <div key={r.role} className="card-interactive group border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-red-400 transition-all bg-white hover:shadow-lg hover:shadow-red-500/10 overflow-hidden">
                <div>
                  <div className="flex items-center space-x-2.5 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${r.avatarColor} flex items-center justify-center text-xs font-bold shadow-sm group-hover:scale-105 transition-transform`}>
                      {r.role[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors">{r.role}</h4>
                      <p className="text-[11px] text-slate-500">{r.title}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">{r.desc}</p>
                </div>
                <div className="mt-2 py-1 px-2.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-[10px] font-semibold text-center flex items-center justify-center space-x-1 group-hover:border-red-200 group-hover:bg-red-50/60 group-hover:text-red-700 transition-colors">
                  <Lock className="w-3 h-3 text-slate-400 group-hover:text-red-600 transition-colors" />
                  <span>Requires Authorized Sign In</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <FlaskConical className="w-4 h-4 text-red-600" />
            <span className="font-semibold text-slate-700">LabLedger Biobank Systems</span>
            <span>— Precision digital logbook for small research teams</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>MERN Stack</span>
            <span>•</span>
            <span>MongoDB Atlas</span>
            <span>•</span>
            <span>GLP Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
