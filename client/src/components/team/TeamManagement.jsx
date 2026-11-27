import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  Shield, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Building2, 
  Calendar,
  Sparkles,
  Plus,
  Mail,
  Lock,
  X,
  Send,
  UserPlus,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Wand2,
  ArrowLeft
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TeamManagement() {
  const { user: currentUser, permissions } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [mailFeedback, setMailFeedback] = useState(null);

  // Register Modal state (Admin only)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Technician');
  const [department, setDepartment] = useState('Specimen Biobank');
  const [password, setPassword] = useState('');
  const [passwordMode, setPasswordMode] = useState('auto'); // 'auto' or 'custom'
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Random Password Generator
  const generateRandomPassword = () => {
    const prefixes = ['Lab', 'Bio', 'Specimen', 'Cryo', 'Gene', 'Helix', 'Vault', 'Pulse'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let salt = '';
    for (let i = 0; i < 3; i++) {
      salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const specialChars = ['!', '@', '#', '$', '%', '&'];
    const special = specialChars[Math.floor(Math.random() * specialChars.length)];
    const generated = `${prefix}@${num}${salt}${special}`;
    setPassword(generated);
    setCopied(false);
    return generated;
  };

  const handleCopyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenAddModal = () => {
    setAddError('');
    setMailFeedback(null);
    setPasswordMode('auto');
    setShowPassword(true);
    setCopied(false);
    generateRandomPassword();
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!permissions.canManageTeam) {
      alert('Access Denied: Only Principal Investigator / Lab Owner (Admin) can modify personnel permissions.');
      return;
    }

    try {
      await api.updateUserRole(userId, newRole);
      setMessage(`Successfully updated role to ${newRole}`);
      setTimeout(() => setMessage(''), 3000);
      fetchUsers();
    } catch (err) {
      alert('Error updating role: ' + err.message);
    }
  };

  const handleRegisterNewMember = async (e) => {
    e.preventDefault();
    setAddError('');
    setMailFeedback(null);

    if (!name.trim()) {
      setAddError('Please provide the full name and title.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setAddError('Please provide a valid laboratory email address.');
      return;
    }

    let finalPassword = password.trim();
    if (passwordMode === 'custom') {
      if (!finalPassword || finalPassword.length < 6) {
        setAddError('Please enter a custom password of at least 6 characters.');
        return;
      }
    } else {
      if (!finalPassword) {
        finalPassword = generateRandomPassword();
      }
    }

    setAddLoading(true);
    try {
      const res = await api.register({
        name: name.trim(),
        email: email.trim(),
        role,
        department: department.trim(),
        password: finalPassword
      });

      setMessage(`✅ ${name} registered as ${role}!`);
      setMailFeedback(res.mailStatus);

      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err) {
      setAddError(err.message || 'Error registering team member.');
    } finally {
      setAddLoading(false);
    }
  };

  const roleColors = {
    Admin: 'bg-red-100 text-red-800 border-red-200',
    Researcher: 'bg-rose-100 text-rose-800 border-rose-200',
    Technician: 'bg-amber-100 text-amber-800 border-amber-200',
    Viewer: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Team & Role Governance
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-200/80 shadow-xs">
              {users.length} Personnel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Admin exclusively enrolls Technicians, Viewers, and Researchers with automatic email credential dispatch
          </p>
        </div>

        {/* Admin Register Action Button */}
        {permissions.canManageTeam && (
          <button
            onClick={handleOpenAddModal}
            className="btn-shimmer inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/20 hover:shadow-red-500/30 transition-all hover:scale-105 active:scale-95 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            <span>Enroll Team Member</span>
          </button>
        )}
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start justify-between space-x-2 animate-fade-in shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold">{message}</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Onboarding email containing access URL and credentials was transmitted.
              </p>
            </div>
          </div>
          <button onClick={() => setMessage('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="saas-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Enrolled Laboratory Staff</h3>
            <p className="text-xs text-slate-400">Personnel authorized to interact with cryogenic inventory</p>
          </div>
          {!permissions.canManageTeam && (
            <span className="text-xs text-slate-400 italic">Read-only view for your role ({currentUser?.role})</span>
          )}
        </div>

        {loading && users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="inline-block w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="font-medium text-slate-600">Loading authorized personnel directory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Scientist / Staff</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Role Assignment</th>
                  <th className="py-3 px-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 font-bold flex items-center justify-center text-xs">
                          {u.name[0]}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{u.department}</td>
                    <td className="py-3 px-4">
                      {permissions.canManageTeam ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none ${roleColors[u.role]}`}
                        >
                          <option value="Admin">Admin (PI / Owner)</option>
                          <option value="Researcher">Researcher</option>
                          <option value="Technician">Technician</option>
                          <option value="Viewer">Viewer / Auditor</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${roleColors[u.role]}`}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Permissions Comparison Matrix (Exact matching PDF Page 3) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
          Role-Based Access Control (RBAC) Specification
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Four roles use the site, and each sees only the screens and actions that fit its job
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[11px] text-slate-600">
                <th className="p-3">Role</th>
                <th className="p-3">Who</th>
                <th className="p-3 text-emerald-700">Can Do</th>
                <th className="p-3 text-rose-700">Cannot Do</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-3 font-bold text-red-700">Admin</td>
                <td className="p-3 text-slate-700 font-medium">Lab owner / PI</td>
                <td className="p-3 text-slate-700">
                  Manage team and roles, build the storage structure, set sample types and ID format, approve transfers, see everything
                </td>
                <td className="p-3 text-slate-400 italic">Nothing is restricted</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-rose-700">Researcher</td>
                <td className="p-3 text-slate-700 font-medium">Scientist running studies</td>
                <td className="p-3 text-slate-700">
                  Register and edit samples, create transfers, write and edit experiment notes, print QR labels
                </td>
                <td className="p-3 text-rose-700 font-medium">
                  Manage users, change storage structure or settings
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-700">Technician</td>
                <td className="p-3 text-slate-700 font-medium">Lab staff handling day-to-day work</td>
                <td className="p-3 text-slate-700">
                  Scan QR codes, receive and store samples, update quantity and status, record transfers, print labels
                </td>
                <td className="p-3 text-rose-700 font-medium">
                  Delete samples, edit others' experiment notes, manage users
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-700">Viewer / Auditor</td>
                <td className="p-3 text-slate-700 font-medium">Supervisor, reviewer, external auditor</td>
                <td className="p-3 text-slate-700">
                  Read samples, storage, transfers, notes; view audit history; export reports
                </td>
                <td className="p-3 text-rose-700 font-medium">
                  Create, edit or delete anything (Strictly Read-Only)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Personnel Registration Modal (Portaled directly to document.body to cover navbar completely) */}
      {isAddModalOpen && createPortal(
        <div className="modal-backdrop overflow-y-auto p-3 sm:p-5 animate-fade-in">
          <div className="relative modal-shell max-w-xl sm:max-w-2xl w-full animate-modal-pop my-auto">
            {/* Header Ribbon */}
            <div className="modal-header-ribbon p-5 sm:p-6 relative flex-shrink-0">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white/90 hover:text-white hover:rotate-90 transition-all duration-200"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-rose-200 mb-1">
                <UserCheck className="w-4 h-4" />
                <span>Admin Governance</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Enroll Team Member</h2>
              <p className="text-xs text-rose-100 mt-0.5">
                Register Technician, Researcher, or Viewer with automated credentials email
              </p>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {addError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2 animate-fade-in shadow-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{addError}</span>
                </div>
              )}

              <form id="enroll-member-form" onSubmit={handleRegisterNewMember} className="space-y-4">
                {/* Row 1: Name and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Personnel Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Alex Morgan"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Laboratory Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex.morgan@yopmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Role and Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Assigned Role *
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs transition-colors"
                    >
                      <option value="Technician">Technician (Lab Staff)</option>
                      <option value="Researcher">Researcher (Scientist)</option>
                      <option value="Viewer">Viewer (Auditor)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Specimen Biobank"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs transition-colors"
                    />
                  </div>
                </div>

                {/* Row 3: Initial Password Governance */}
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold uppercase tracking-wider text-slate-700">
                      Initial Password *
                    </label>
                    {/* Mode Switcher */}
                    <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordMode('auto');
                          if (!password) generateRandomPassword();
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center space-x-1 ${
                          passwordMode === 'auto'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>⚡ Auto Pass</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordMode('custom');
                          setPassword('');
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center space-x-1 ${
                          passwordMode === 'custom'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>✍️ Custom Pass</span>
                      </button>
                    </div>
                  </div>

                  {passwordMode === 'auto' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            readOnly
                            className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl font-mono text-xs font-bold text-slate-800 tracking-wider shadow-inner select-all"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-xs transition-colors"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyPassword}
                          className={`p-2 rounded-xl border transition-all shadow-xs ${
                            copied 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold' 
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                          title="Copy Password"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs transition-colors"
                          title="Generate New Random Password"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">New Pass</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {copied ? '✅ Password copied to clipboard!' : 'Random secure password generated. Delivered to user via email.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Type custom secure password (min 6 chars)"
                          className="w-full pl-9 pr-24 py-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-xs"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600"
                            title={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPasswordMode('auto');
                              generateRandomPassword();
                            }}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                            title="Switch to Auto Pass"
                          >
                            ⚡ Auto
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Will be dispatched to user in their welcome email.</span>
                        {password && password.length < 6 && (
                          <span className="text-red-500 font-semibold">Min 6 characters</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Row 4: Email notice callout */}
                <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200/60 flex items-start space-x-2.5 text-[11px] text-rose-900">
                  <Send className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <b>Automatic Email Delivery:</b> Upon registration, an official email will be dispatched to <b>{email || 'the recipient'}</b> with portal login URL (<code>http://localhost:3000</code>) and their assigned credentials.
                  </span>
                </div>
              </form>
            </div>

            {/* Pinned Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-slate-500">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted bcrypt credentials</span>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="enroll-member-form"
                  disabled={addLoading}
                  className="btn-shimmer px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {addLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Register & Dispatch Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
