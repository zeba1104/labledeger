import React, { useState, useEffect, useRef } from 'react';
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
  Lock,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OnboardingScreen({ onOpenLogin }) {
  const { setShowOnboarding, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hamburgerRef = useRef(null);
  const drawerRef = useRef(null);

  // Throttled scroll listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 24);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    setIsScrolled(window.scrollY > 24);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open & trap focus
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
          hamburgerRef.current?.focus();
        } else if (e.key === 'Tab' && drawerRef.current) {
          const focusableElements = drawerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length > 0) {
            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const handleCloseDrawer = () => {
    setMobileMenuOpen(false);
    hamburgerRef.current?.focus();
  };

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
      {/* Scroll-Aware Sticky Public Header */}
      <header
        data-scrolled={isScrolled ? 'true' : 'false'}
        className="public-header sticky top-0 z-30 w-full"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
              <FlaskConical className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">Lab<span className="text-red-600">Ledger</span></span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-red-100 text-red-700 rounded-full border border-red-200">
                  v2.0 Clinical
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Digital Research Sample Tracking & Storage System</p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>GLP / 21 CFR Part 11</span>
            </div>
            {user ? (
              <button
                onClick={() => setShowOnboarding(false)}
                className="btn-shimmer inline-flex items-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 transition-all duration-200 active:scale-95"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4 ml-1.5 sm:ml-2" />
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="btn-shimmer inline-flex items-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 transition-all duration-200 active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                <span>Sign In to Portal</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger Trigger (< 768px) */}
          <div className="flex md:hidden items-center space-x-2">
            {user ? (
              <button
                onClick={() => setShowOnboarding(false)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                <span>Enter</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                <LogIn className="w-3 h-3 mr-1" />
                <span>Sign In</span>
              </button>
            )}
            <button
              ref={hamburgerRef}
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:text-red-600 hover:bg-red-50/80 border border-slate-200/80 bg-white/90 shadow-xs transition-colors"
              aria-label="Open mobile navigation"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer for Public Header */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            onClick={handleCloseDrawer}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs drawer-backdrop"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col justify-between border-r border-slate-200/90 drawer-panel"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-base text-slate-900">Lab<span className="text-red-600">Ledger</span></span>
                  <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-red-100 text-red-700 rounded-md">v2.0</span>
                </div>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="p-3 bg-red-50/60 rounded-xl border border-red-100">
                <p className="text-xs font-bold text-red-900 mb-0.5">Clinical Biobank Platform</p>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Precision digital research sample logbook with cryogenic hierarchy and immutable audit history.
                </p>
              </div>

              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Core Capabilities
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <div className="px-2.5 py-2 flex items-center space-x-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <QrCode className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Sample IDs & QR Codes</span>
                  </div>
                  <div className="px-2.5 py-2 flex items-center space-x-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <Box className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>5-Level Cryo Hierarchy</span>
                  </div>
                  <div className="px-2.5 py-2 flex items-center space-x-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <ArrowRightLeft className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Chain-of-Custody Log</span>
                  </div>
                  <div className="px-2.5 py-2 flex items-center space-x-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>21 CFR Part 11 Audit Trail</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50">
              {user ? (
                <button
                  onClick={() => {
                    handleCloseDrawer();
                    setShowOnboarding(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95"
                >
                  <span>Enter Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleCloseDrawer();
                    onOpenLogin();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Portal</span>
                </button>
              )}
              <div className="text-[10px] text-center text-slate-400 pt-1">
                MERN Stack · MongoDB Atlas · GLP Compliant
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Hero & Onboarding Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 relative overflow-hidden">
        {/* Layered Backdrop (GPU-friendly, pointer-events-none, behind content) */}
        {/* (a) Soft radial brand glow top-right */}
        <div 
          className="absolute -top-16 -right-16 w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] bg-[radial-gradient(circle,rgba(244,63,94,0.12)_0%,rgba(220,38,38,0.04)_45%,transparent_70%)] pointer-events-none rounded-full blur-3xl z-0" 
          aria-hidden="true" 
        />
        <div 
          className="absolute top-1/2 -left-20 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(225,29,72,0.06)_0%,transparent_70%)] pointer-events-none rounded-full blur-2xl z-0" 
          aria-hidden="true" 
        />

        {/* (b) Faint grid texture at low opacity */}
        <div 
          className="absolute inset-0 bg-clinical-grid opacity-35 pointer-events-none z-0" 
          aria-hidden="true" 
        />

        {/* (c) Floating orbs (drifting slowly: GPU transform/opacity only, hidden on mobile for performance) */}
        <div 
          className="absolute top-16 left-12 w-64 h-64 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-orb-1 hidden md:block z-0" 
          aria-hidden="true" 
        />
        <div 
          className="absolute bottom-24 right-16 w-72 h-72 rounded-full bg-red-500/8 blur-3xl pointer-events-none animate-orb-2 hidden md:block z-0" 
          aria-hidden="true" 
        />

        {/* (d) Enlarged biological flask/DNA motif, positioned as an off-center accent with slow float */}
        <div 
          className="animate-hero-motif absolute top-12 right-6 sm:right-16 lg:right-24 pointer-events-none z-0 hidden sm:block" 
          aria-hidden="true"
        >
          <div className="animate-motif-float relative">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-gradient-to-tr from-rose-500/10 via-red-500/10 to-amber-500/10 border border-red-200/50 backdrop-blur-xs flex items-center justify-center text-red-500/70 shadow-lg shadow-red-500/5">
              <FlaskConical className="w-12 h-12 lg:w-16 lg:h-16" />
            </div>
            <div className="absolute -bottom-3 -left-5 w-11 h-11 lg:w-12 lg:h-12 rounded-2xl bg-white/90 border border-rose-200/70 shadow-sm flex items-center justify-center text-rose-500/80">
              <Dna className="w-5 h-5 lg:w-6 lg:h-6 animate-pulse-subtle" />
            </div>
          </div>
        </div>

        {/* Left off-center accent motif */}
        <div 
          className="animate-hero-motif absolute bottom-12 left-6 lg:left-14 pointer-events-none z-0 hidden lg:block" 
          style={{ animationDelay: '350ms' }} 
          aria-hidden="true"
        >
          <div className="animate-bio-float text-slate-300/50">
            <Microscope className="w-14 h-14" />
          </div>
        </div>

        {/* Hero Section: Staggered Entrance Composition */}
        <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20 relative z-10">
          {/* Eyebrow / Kicker Label (Stagger Step 1: 0ms) */}
          <div className="animate-hero-eyebrow inline-flex items-center px-4 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200/80 shadow-xs mb-6 hover:scale-105 transition-transform duration-300 select-none">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-red-600 flex-shrink-0" />
            <span className="hero-eyebrow-text text-[11px] font-bold uppercase tracking-wider">
              Designed Exclusively for Medical, Biotech & Academic Research Labs
            </span>
          </div>

          {/* Clamped Oversized Headline (Stagger Step 2: 80ms) */}
          <h1 className="animate-hero-headline hero-headline text-slate-900 tracking-tight mb-5">
            Total Traceability for Every <br />
            <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-800 bg-clip-text text-transparent hover:brightness-110 transition-all duration-300">
              Laboratory Specimen
            </span>
          </h1>

          {/* Clamped Readable Subhead (Stagger Step 3: 160ms) */}
          <p className="animate-hero-subhead hero-subhead text-base sm:text-lg text-slate-600 leading-relaxed mb-8 mx-auto">
            Replace spreadsheets and paper binders with an interactive digital logbook.
            Track what each sample is, exactly where it is stored in cryogenic racks, who moved it, and its linked experiment results.
          </p>

          {/* Focal CTA Button with Arrow Nudge & Glow (Stagger Step 4: 240ms) */}
          <div className="animate-hero-cta flex flex-col sm:flex-row items-center justify-center gap-3">
            {user ? (
              <button
                onClick={() => setShowOnboarding(false)}
                className="hero-cta-btn btn-shimmer group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98]"
              >
                <span>Enter Workspace</span>
                <ChevronRight className="cta-arrow-icon w-4 h-4 ml-2 opacity-80" />
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="hero-cta-btn btn-shimmer group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4 mr-2.5 flex-shrink-0" />
                <span>Sign In with Email & Password</span>
                <ChevronRight className="cta-arrow-icon w-4 h-4 ml-2 opacity-80" />
              </button>
            )}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative">
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

      {/* Redesigned Multi-Column Public Footer */}
      <footer className="w-full border-t border-slate-200/90 bg-slate-50/90 py-12 sm:py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* Column 1: Brand & Clinical Blurb */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base text-slate-900 tracking-tight">
                  Lab<span className="text-red-600">Ledger</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold text-red-700 bg-red-100 rounded-md">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                LabLedger Biobank Systems — Precision digital logbook for small research teams and medical biobanks. Engineered for rigorous traceability, cryogenic cold-chain management, and GLP scientific standards.
              </p>
              <div className="flex items-center space-x-2 pt-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>GLP Compliant & 21 CFR Part 11 Architecture</span>
              </div>
            </div>

            {/* Column 2: System Architecture Badges */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                System Architecture
              </h4>
              <div className="flex flex-col space-y-2">
                <div className="inline-flex items-center space-x-2 text-xs text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0"></span>
                  <span><strong>MERN Stack:</strong> React + Node + Express</span>
                </div>
                <div className="inline-flex items-center space-x-2 text-xs text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0"></span>
                  <span><strong>MongoDB Atlas:</strong> Encrypted Cryo Cluster</span>
                </div>
                <div className="inline-flex items-center space-x-2 text-xs text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-600 flex-shrink-0"></span>
                  <span><strong>GLP Compliant:</strong> Verified System Integrity</span>
                </div>
                <div className="inline-flex items-center space-x-2 text-xs text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-600 flex-shrink-0"></span>
                  <span><strong>QR Barcoding:</strong> High-Density Cryo-Labels</span>
                </div>
              </div>
            </div>

            {/* Column 3: Platform Capabilities */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Specimen Capabilities
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <ChevronRight className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>Unique Sample IDs (LAB-2026-XXXX)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ChevronRight className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>5-Level Storage Grids & Position Matrix</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ChevronRight className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>Chain-of-Custody Custodian Log</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ChevronRight className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>Assay & Protocol Linkage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ChevronRight className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>Immutable Timestamped Audit Trail</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Role Governance */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Access Governance
              </h4>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Principal Investigator</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">Admin</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Research Scientist</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Researcher</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Specimen Technician</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Technician</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Compliance Auditor</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Viewer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Hairline Sub-bar */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="font-semibold text-slate-700">LabLedger Biobank Systems</span>
              <span>— Precision digital logbook for small research teams</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600 font-medium">
              <span>MERN Stack</span>
              <span>•</span>
              <span>MongoDB Atlas</span>
              <span>•</span>
              <span>GLP Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
