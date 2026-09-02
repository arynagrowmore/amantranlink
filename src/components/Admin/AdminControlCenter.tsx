import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Camera, 
  Sparkles, 
  Search, 
  Filter, 
  DollarSign, 
  Wallet, 
  BarChart3, 
  FileText, 
  Settings, 
  Layers, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock, 
  ArrowLeft, 
  ArrowRight, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  TrendingUp, 
  Eye, 
  Edit3, 
  UserX, 
  UserCheck, 
  Plus, 
  History,
  Crown,
  X,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SystemObservabilityView } from './SystemObservabilityView';
import { 
  fetchAdminDashboardMetrics, 
  fetchAdminUsers, 
  updateUserAccountStatus,
  fetchAdminPartners,
  fetchAdminTemplates,
  updateTemplateMetadata,
  fetchAdminPricingTiers,
  updatePricingTier,
  updateInvitationSuspension,
  createFinancialAdjustment,
  fetchAdminAuditLogs,
  AdminDashboardMetrics,
  AdminUser,
  AdminPartner,
  AdminTemplateMeta,
  AdminPricingTier,
  AdminAuditLog
} from '../../services/adminService';
import { supabase } from '../../lib/supabase';

interface AdminControlCenterProps {
  onBackToHome: () => void;
  onBackToStudio: () => void;
}

export const AdminControlCenter: React.FC<AdminControlCenterProps> = ({
  onBackToHome,
  onBackToStudio,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'partners' | 'invitations' | 'orders' | 'templates' | 'pricing' | 'adjustments' | 'audit' | 'observability'>('dashboard');

  const [metrics, setMetrics] = useState<AdminDashboardMetrics>({
    totalUsers: 0,
    totalEndCustomers: 0,
    totalPartners: 0,
    activePartners: 0,
    suspendedUsers: 0,
    totalInvitations: 0,
    draftInvitations: 0,
    liveInvitations: 0,
    lockedInvitations: 0,
    totalOrders: 0,
    successfulPayments: 0,
    failedPayments: 0,
    totalRevenue: 0,
    partnerRevenue: 0,
    totalCommission: 0,
    pendingCommission: 0,
    settledCommission: 0,
  });

  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [partnersList, setPartnersList] = useState<AdminPartner[]>([]);
  const [invitationsList, setInvitationsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [templatesList, setTemplatesList] = useState<AdminTemplateMeta[]>([]);
  const [pricingTiers, setPricingTiers] = useState<AdminPricingTier[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Financial Adjustment Modal State
  const [isAdjModalOpen, setIsAdjModalOpen] = useState<boolean>(false);
  const [adjPartnerId, setAdjPartnerId] = useState<string>('');
  const [adjAmount, setAdjAmount] = useState<string>('');
  const [adjType, setAdjType] = useState<'CREDIT' | 'DEBIT' | 'BONUS' | 'PENALTY' | 'CORRECTION'>('BONUS');
  const [adjReason, setAdjReason] = useState<string>('');
  const [isSubmittingAdj, setIsSubmittingAdj] = useState<boolean>(false);

  // Status feedback toast
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => setToastNotification(null), 4000);
  };

  // 🔒 STRICT ADMIN ROUTE PROTECTION
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#140508] text-[#F7F0DD] flex flex-col items-center justify-center p-6 text-center font-manrope">
        <div className="max-w-md w-full bg-[#2D080E] border-2 border-[#C49A35] rounded-3xl p-8 shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-cormorant font-bold text-3xl text-white">ACCESS RESTRICTED</h2>
          <p className="text-sm text-gray-300">
            This terminal requires elevated System Administrator credentials.
          </p>
          <button
            type="button"
            onClick={onBackToStudio}
            className="px-6 py-2.5 rounded-xl bg-[#C49A35] text-[#140508] font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            Return to Studio
          </button>
        </div>
      </div>
    );
  }

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [m, u, p, t, pr, a] = await Promise.all([
        fetchAdminDashboardMetrics(),
        fetchAdminUsers(searchQuery, roleFilter, statusFilter),
        fetchAdminPartners(),
        fetchAdminTemplates(),
        fetchAdminPricingTiers(),
        fetchAdminAuditLogs(),
      ]);

      setMetrics(m);
      setUsersList(u);
      setPartnersList(p);
      setTemplatesList(t);
      setPricingTiers(pr);
      setAuditLogs(a);

      // Load Invitations
      const { data: sites } = await supabase.from('wedding_sites').select('*').order('created_at', { ascending: false });
      setInvitationsList(sites || []);

      // Load Orders
      const { data: commissions } = await supabase.from('commissions_ledger').select('*').order('created_at', { ascending: false });
      setOrdersList(commissions || []);
    } catch (e) {
      console.warn('[AdminControlCenter] Data load note:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [searchQuery, roleFilter, statusFilter]);

  const handleToggleUserSuspension = async (targetUser: AdminUser) => {
    const nextStatus = targetUser.accountStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to change ${targetUser.name}'s status to ${nextStatus.toUpperCase()}?`)) return;

    const ok = await updateUserAccountStatus(targetUser.id, nextStatus, user.uid);
    if (ok) {
      showToast(`User status updated to ${nextStatus.toUpperCase()}`, 'success');
      await loadAdminData();
    } else {
      showToast('Failed to update user status.', 'error');
    }
  };

  const handleToggleInvitationSuspension = async (site: any) => {
    const nextSuspended = !site.is_suspended;
    if (!confirm(`Are you sure you want to ${nextSuspended ? 'SUSPEND' : 'REACTIVATE'} this wedding invitation?`)) return;

    const ok = await updateInvitationSuspension(site.id, nextSuspended, user.uid);
    if (ok) {
      showToast(`Invitation ${nextSuspended ? 'suspended' : 'reactivated'}`, 'success');
      await loadAdminData();
    } else {
      showToast('Failed to update invitation status.', 'error');
    }
  };

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjPartnerId || !adjAmount || !adjReason.trim()) return;

    setIsSubmittingAdj(true);
    const amt = parseInt(adjAmount, 10);
    const ok = await createFinancialAdjustment(adjPartnerId, amt, adjType, adjReason.trim(), user.uid);
    setIsSubmittingAdj(false);

    if (ok) {
      setIsAdjModalOpen(false);
      setAdjPartnerId('');
      setAdjAmount('');
      setAdjReason('');
      showToast('Financial adjustment recorded successfully.', 'success');
      await loadAdminData();
    } else {
      showToast('Failed to create financial adjustment.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1726] text-[#E2E8F0] flex flex-col font-manrope">
      
      {/* 👑 ADMIN HEADER */}
      <header className="min-h-[70px] bg-[#070D18] border-b border-[#1E293B] px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBackToStudio}
            className="w-10 h-10 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#38BDF8] flex items-center justify-center transition-colors cursor-pointer"
            title="Back to Studio"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6E1020] to-[#C49A35] text-white flex items-center justify-center border border-[#C49A35]/50 shadow-sm shrink-0">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cormorant font-bold text-lg sm:text-xl text-white leading-tight">
                  AmantranLink Control Center
                </h1>
                <span className="text-[9px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Authoritative Master Platform &amp; Financial Governance CMS
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAdminData}
            className="px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-xs font-bold flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#38BDF8] ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={onBackToHome}
            className="px-4 py-2 rounded-xl bg-[#6E1020] hover:bg-[#8A1428] text-white text-xs font-bold uppercase tracking-wider cursor-pointer min-h-[44px]"
          >
            Exit Admin
          </button>
        </div>
      </header>

      {/* 🧭 NAVIGATION TAB BAR */}
      <div className="bg-[#0B132B] border-b border-[#1E293B] px-4 sm:px-8">
        <div className="max-w-7xl w-full mx-auto flex items-center gap-1.5 overflow-x-auto py-1.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'partners', label: 'Partners', icon: Camera },
            { id: 'invitations', label: 'Invitations', icon: Eye },
            { id: 'orders', label: 'Orders & Payments', icon: DollarSign },
            { id: 'templates', label: 'Templates CMS', icon: Layers },
            { id: 'pricing', label: 'Pricing Engine', icon: Tag },
            { id: 'adjustments', label: 'Adjustments', icon: Wallet },
            { id: 'audit', label: 'Audit Logs', icon: History },
            { id: 'observability', label: 'Observability & DR', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
                  isActive
                    ? 'bg-[#38BDF8] text-[#070D18] shadow-md'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN ADMIN WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        
        {/* ══════════════════════════════════════════════════════════════════
            TAB 1: 2. ADMIN DASHBOARD (16 Authoritative KPI Cards)
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-cormorant font-bold text-2xl text-white">Platform Overview</h2>
              <p className="text-xs text-[#94A3B8]">Authoritative metrics derived from PostgreSQL database records.</p>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#047857] border border-emerald-500/40 text-white shadow-md">
                <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">TOTAL REVENUE (GMV)</span>
                <span className="text-2xl font-cormorant font-bold text-white mt-1 block">₹{metrics.totalRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B2545] to-[#133C55] border border-sky-500/40 text-white shadow-md">
                <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wider block">PARTNER REVENUE</span>
                <span className="text-2xl font-cormorant font-bold text-white mt-1 block">₹{metrics.partnerRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-gray-700 text-white shadow-md">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">TOTAL COMMISSION</span>
                <span className="text-2xl font-cormorant font-bold text-amber-300 mt-1 block">₹{metrics.totalCommission.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-gray-700 text-white shadow-md">
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">PENDING SETTLEMENTS</span>
                <span className="text-2xl font-cormorant font-bold text-purple-300 mt-1 block">₹{metrics.pendingCommission.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Users & Partners Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-gray-700 text-white">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">TOTAL REGISTERED USERS</span>
                <span className="text-2xl font-cormorant font-bold text-white mt-1 block">{metrics.totalUsers}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-gray-700 text-white">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">END CUSTOMERS</span>
                <span className="text-2xl font-cormorant font-bold text-white mt-1 block">{metrics.totalEndCustomers}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-gray-700 text-white">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">PHOTOGRAPHER PARTNERS</span>
                <span className="text-2xl font-cormorant font-bold text-emerald-400 mt-1 block">{metrics.totalPartners}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-gray-700 text-white">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">SUSPENDED USERS</span>
                <span className="text-2xl font-cormorant font-bold text-red-400 mt-1 block">{metrics.suspendedUsers}</span>
              </div>
            </div>

            {/* Invitations & Orders Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-gray-700 text-white">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">TOTAL WEDDING SITES</span>
                <span className="text-2xl font-cormorant font-bold text-white mt-1 block">{metrics.totalInvitations}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-gray-700 text-white">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">LIVE PUBLISHED</span>
                <span className="text-2xl font-cormorant font-bold text-emerald-400 mt-1 block">{metrics.liveInvitations}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-gray-700 text-white">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">SUCCESSFUL ORDERS</span>
                <span className="text-2xl font-cormorant font-bold text-sky-400 mt-1 block">{metrics.successfulPayments}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-gray-700 text-white">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">DRAFT SITES</span>
                <span className="text-2xl font-cormorant font-bold text-amber-400 mt-1 block">{metrics.draftInvitations}</span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 2: 3. USER MANAGEMENT (Search, Filters, Suspension)
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap bg-[#1E293B] p-4 rounded-2xl border border-gray-700">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, studio, or partner handle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#0F172A] border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#38BDF8] min-h-[44px]"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-[#0F172A] border border-gray-700 rounded-xl text-xs font-bold text-white focus:outline-none min-h-[44px] cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="end_customer">End Customers</option>
                  <option value="partner">Photographer Partners</option>
                  <option value="admin">Admins</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#0F172A] border border-gray-700 rounded-xl text-xs font-bold text-white focus:outline-none min-h-[44px] cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-x-auto shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F172A] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-700">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Studio / Handle</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-[#0F172A]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-gray-400 text-[11px] font-mono">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                          u.role === 'partner' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">
                        {u.studioName ? `${u.studioName} (@${u.partnerSlug})` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.accountStatus === 'active' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                        }`}>
                          {u.accountStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 font-mono">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleToggleUserSuspension(u)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                              u.accountStatus === 'active'
                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                            }`}
                          >
                            {u.accountStatus === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 3: 4. PARTNER MANAGEMENT
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'partners' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-cormorant font-bold text-2xl text-white">Photographer Partner Network</h3>
                <p className="text-xs text-[#94A3B8]">Manage studio partners, view commissions, and record auditable adjustments.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Record Financial Adjustment</span>
              </button>
            </div>

            <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-x-auto shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F172A] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-700">
                  <tr>
                    <th className="py-3.5 px-4">Studio / Handle</th>
                    <th className="py-3.5 px-4">Invitations</th>
                    <th className="py-3.5 px-4">Orders (GMV)</th>
                    <th className="py-3.5 px-4">Total Commission</th>
                    <th className="py-3.5 px-4">Available Balance</th>
                    <th className="py-3.5 px-4">Payout UPI</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {partnersList.map((p) => (
                    <tr key={p.id} className="hover:bg-[#0F172A]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{p.studioName}</div>
                        <div className="text-sky-400 text-[11px] font-mono">@{p.partnerSlug}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{p.invitationsCount}</td>
                      <td className="py-3.5 px-4 text-emerald-300 font-mono">₹{p.totalRevenue.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-amber-300 font-mono">₹{p.totalCommission.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-purple-300 font-mono font-bold">₹{p.availableCredit.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-300">{p.payoutUpi || '—'}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.accountStatus === 'active' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                        }`}>
                          {p.accountStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 4: 8. INVITATIONS MANAGEMENT
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'invitations' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-cormorant font-bold text-2xl text-white">All Wedding Invitations</h3>
              <p className="text-xs text-[#94A3B8]">Monitor all client invitations across customer and partner accounts.</p>
            </div>

            <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-x-auto shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F172A] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-700">
                  <tr>
                    <th className="py-3.5 px-4">Couple Name</th>
                    <th className="py-3.5 px-4">Template</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Partner Attribution</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {invitationsList.map((site) => {
                    const groom = site.content?.couple?.groomEn || 'Groom';
                    const bride = site.content?.couple?.brideEn || 'Bride';
                    const couple = `${groom} & ${bride}`;
                    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://amantranlink.com';
                    const publicUrl = `${origin}/i/${site.published_url || site.slug || site.id}`;

                    return (
                      <tr key={site.id} className="hover:bg-[#0F172A]/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{couple}</td>
                        <td className="py-3.5 px-4 font-mono text-[#38BDF8]">{site.content?.theme || 'rajmahal'}</td>
                        <td className="py-3.5 px-4">
                          {site.is_suspended ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                              SUSPENDED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300">
                              {site.status || 'DRAFT'}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-gray-300">{site.studio_badge || 'Direct Customer'}</td>
                        <td className="py-3.5 px-4 font-mono text-gray-400">
                          {new Date(site.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-[#0F172A] hover:bg-black text-[#38BDF8] font-bold text-[11px]"
                          >
                            Live URL
                          </a>
                          <button
                            type="button"
                            onClick={() => handleToggleInvitationSuspension(site)}
                            className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer ${
                              site.is_suspended
                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                            }`}
                          >
                            {site.is_suspended ? 'Reactivate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 5: 7. ORDER AND PAYMENT MANAGEMENT
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-cormorant font-bold text-2xl text-white">Platform Orders &amp; Razorpay Ledger</h3>
              <p className="text-xs text-[#94A3B8]">Immutable ledger of orders, HMAC-verified transactions, and payouts.</p>
            </div>

            <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-x-auto shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F172A] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-700">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Payment ID</th>
                    <th className="py-3.5 px-4">Retail Price</th>
                    <th className="py-3.5 px-4">Commission</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {ordersList.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#0F172A]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#38BDF8]">{ord.order_id || ord.id}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-300">{ord.payment_id || '—'}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-300 font-bold">₹{ord.retail_price || 1299}</td>
                      <td className="py-3.5 px-4 font-mono text-amber-300 font-bold">₹{ord.commission_amount || 0}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300">
                          {ord.status || 'PAID'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-400">
                        {new Date(ord.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 6: 5. TEMPLATE MANAGEMENT CMS
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-cormorant font-bold text-2xl text-white">7 Royal Themes CMS Layer</h3>
              <p className="text-xs text-[#94A3B8]">Configure template metadata, pricing overrides, and featured visibility.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatesList.map((t) => (
                <div key={t.templateId} className="bg-[#1E293B] rounded-2xl border border-gray-700 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase font-mono text-[#38BDF8]">{t.category}</span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-300">
                      <input
                        type="checkbox"
                        checked={t.active}
                        onChange={async (e) => {
                          await updateTemplateMetadata(t.templateId, { active: e.target.checked }, user.uid);
                          await loadAdminData();
                          showToast(`${t.name} ${e.target.checked ? 'activated' : 'deactivated'}`);
                        }}
                        className="rounded accent-emerald-500"
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  <h4 className="font-cormorant font-bold text-xl text-white">{t.name}</h4>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#0F172A] p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Retail Price:</span>
                      <strong className="text-emerald-400">₹{t.retailPrice}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Partner Price:</span>
                      <strong className="text-sky-400">₹{t.partnerPrice}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-amber-300 font-bold">Commission: ₹{t.partnerCommission}</span>
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-gray-300">
                      <input
                        type="checkbox"
                        checked={t.featured}
                        onChange={async (e) => {
                          await updateTemplateMetadata(t.templateId, { featured: e.target.checked }, user.uid);
                          await loadAdminData();
                          showToast(`${t.name} featured status updated.`);
                        }}
                        className="rounded accent-[#38BDF8]"
                      />
                      <span>Featured</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 7: 6. PRICING MANAGEMENT
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'pricing' && (
          <div className="space-y-4 max-w-4xl">
            <div>
              <h3 className="font-cormorant font-bold text-2xl text-white">Authoritative Pricing Schedule</h3>
              <p className="text-xs text-[#94A3B8]">Platform wholesale and retail rate configuration with server-side validation.</p>
            </div>

            <div className="space-y-3">
              {pricingTiers.map((tier) => (
                <div key={tier.packageId} className="bg-[#1E293B] rounded-2xl border border-gray-700 p-5 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">{tier.packageId.toUpperCase()} TIER</span>
                    <h4 className="font-cormorant font-bold text-xl text-white">{tier.name}</h4>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap text-xs">
                    <div className="bg-[#0F172A] px-3.5 py-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">Retail Rate:</span>
                      <strong className="text-emerald-400 text-sm">₹{tier.retailPrice}</strong>
                    </div>
                    <div className="bg-[#0F172A] px-3.5 py-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">Partner Wholesale:</span>
                      <strong className="text-sky-400 text-sm">₹{tier.partnerPrice}</strong>
                    </div>
                    <div className="bg-[#0F172A] px-3.5 py-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">Partner Margin:</span>
                      <strong className="text-amber-400 text-sm">₹{tier.partnerCommission}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 8: 10. AUDIT LOGS (Append-Only Trail)
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-cormorant font-bold text-2xl text-white">Append-Only Governance Audit Logs</h3>
              <p className="text-xs text-[#94A3B8]">Immutable history of administrative actions, status changes, and adjustments.</p>
            </div>

            <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-x-auto shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F172A] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-700">
                  <tr>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Entity Type</th>
                    <th className="py-3.5 px-4">Entity ID</th>
                    <th className="py-3.5 px-4">Actor Role</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#0F172A]/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-emerald-400">{log.action}</td>
                      <td className="py-3.5 px-4 text-sky-300">{log.entityType}</td>
                      <td className="py-3.5 px-4 text-gray-400 truncate max-w-[180px]">{log.entityId || '—'}</td>
                      <td className="py-3.5 px-4 text-amber-300">{log.actorRole}</td>
                      <td className="py-3.5 px-4 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 10: 📊 SYSTEM OBSERVABILITY & DISASTER RECOVERY
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'observability' && (
          <SystemObservabilityView />
        )}

      </main>

      {/* ══════════════════════════════════════════════════════════════════
          MODAL: RECORD FINANCIAL ADJUSTMENT
         ══════════════════════════════════════════════════════════════════ */}
      {isAdjModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-3xl max-w-md w-full p-6 border border-gray-700 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-cormorant font-bold text-xl text-white">Record Auditable Adjustment</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Partner *</label>
                <select
                  required
                  value={adjPartnerId}
                  onChange={(e) => setAdjPartnerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-gray-700 rounded-xl text-xs text-white focus:outline-none min-h-[44px] cursor-pointer"
                >
                  <option value="">Select Partner Studio</option>
                  {partnersList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.studioName} (@{p.partnerSlug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={adjAmount}
                    onChange={(e) => setAdjAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-gray-700 rounded-xl text-xs text-white focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Type</label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-gray-700 rounded-xl text-xs text-white focus:outline-none min-h-[44px] cursor-pointer"
                  >
                    <option value="BONUS">Bonus Credit</option>
                    <option value="CORRECTION">Ledger Correction</option>
                    <option value="CREDIT">Manual Credit</option>
                    <option value="DEBIT">Debit</option>
                    <option value="PENALTY">Penalty</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Auditable Reason *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Promotional bonus for completing 10 client weddings in August 2026."
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-gray-700 rounded-xl text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdj}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>{isSubmittingAdj ? 'Recording...' : 'Record Adjustment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔔 Admin Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className={`px-4 py-3 rounded-2xl border shadow-2xl text-xs font-bold flex items-center gap-2.5 ${
            toastNotification.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/60'
              : toastNotification.type === 'warning'
              ? 'bg-amber-950/90 text-amber-200 border-amber-500/60'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/60'
          }`}>
            {toastNotification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastNotification.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};
