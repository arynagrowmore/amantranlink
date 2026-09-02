import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Camera, Sparkles, Search, Filter, 
  DollarSign, Wallet, BarChart3, FileText, Settings, Layers, 
  Tag, CheckCircle2, AlertCircle, Lock, Unlock, ArrowLeft, 
  ArrowRight, Copy, Check, ExternalLink, RefreshCw, TrendingUp, 
  Eye, Edit3, UserX, UserCheck, Plus, History, Crown, X, 
  Activity, Globe, Server, ToggleLeft, ToggleRight, Radio, 
  SlidersHorizontal, Download, ChevronRight, AlertTriangle
} from 'lucide-react';
import { 
  PlatformOverviewMetrics, 
  AdminUserManagementItem, 
  AdminWeddingProjectItem, 
  AdminStudioPartnerItem, 
  PlatformRevenueAnalytics, 
  FeatureAdoptionMetric, 
  PlatformFunnelStep, 
  SystemHealthIndicator, 
  OperationalSignal, 
  FeatureFlagConfig, 
  PlatformGlobalConfig, 
  AdminSecurityAuditRecord, 
  TimeRangeFilter, 
  UserRole, 
  UserAccountStatus 
} from '../../../types/adminSuperCenter';
import { 
  fetchSuperCenterMetrics, 
  fetchAdminUserDirectory, 
  suspendUserAccount, 
  reactivateUserAccount, 
  promoteUserRole, 
  fetchAdminWeddingProjects, 
  fetchAdminStudioPartners, 
  fetchPlatformRevenueIntelligence, 
  fetchFeatureAdoptionAnalytics, 
  fetchSystemHealthIndicators, 
  fetchOperationalSignals, 
  fetchFeatureFlags, 
  toggleFeatureFlag, 
  fetchPlatformConfig, 
  updatePlatformConfig, 
  fetchSecurityAuditLogs, 
  DEFAULT_PLATFORM_CONFIG 
} from '../../../services/adminSuperCenterService';

interface AdminSuperControlCenterProps {
  onBackToHome: () => void;
  onBackToStudio: () => void;
}

type AdminSuperSection = 
  | 'overview' 
  | 'users' 
  | 'weddings' 
  | 'studios' 
  | 'revenue' 
  | 'adoption' 
  | 'health' 
  | 'flags' 
  | 'audit';

export const AdminSuperControlCenter: React.FC<AdminSuperControlCenterProps> = ({
  onBackToHome,
  onBackToStudio,
}) => {
  const [activeSection, setActiveSection] = useState<AdminSuperSection>('overview');
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('30d');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Core Data Stores
  const [metrics, setMetrics] = useState<PlatformOverviewMetrics | null>(null);
  const [users, setUsers] = useState<AdminUserManagementItem[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  const [weddings, setWeddings] = useState<AdminWeddingProjectItem[]>([]);
  const [studios, setStudios] = useState<AdminStudioPartnerItem[]>([]);
  const [revenueStats, setRevenueStats] = useState<PlatformRevenueAnalytics | null>(null);
  const [featureAdoption, setFeatureAdoption] = useState<FeatureAdoptionMetric[]>([]);
  const [funnelSteps, setFunnelSteps] = useState<PlatformFunnelStep[]>([]);
  const [healthIndicators, setHealthIndicators] = useState<SystemHealthIndicator[]>([]);
  const [signals, setSignals] = useState<OperationalSignal[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagConfig[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminSecurityAuditRecord[]>([]);

  // User Filter & Action Modals
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  
  const [selectedUserForAction, setSelectedUserForAction] = useState<AdminUserManagementItem | null>(null);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState<boolean>(false);
  const [suspendReason, setSuspendReason] = useState<string>('');
  
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState<boolean>(false);
  const [targetRole, setTargetRole] = useState<UserRole>('partner');
  const [promoteReason, setPromoteReason] = useState<string>('');
  const [actionProcessing, setActionProcessing] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    const [met, uData, wList, sList, rev, adopt, hlth, sigs, flags, logs] = await Promise.all([
      fetchSuperCenterMetrics(timeRange),
      fetchAdminUserDirectory({ search: userSearch, role: userRoleFilter, status: userStatusFilter }),
      fetchAdminWeddingProjects(),
      fetchAdminStudioPartners(),
      fetchPlatformRevenueIntelligence(timeRange),
      fetchFeatureAdoptionAnalytics(),
      fetchSystemHealthIndicators(),
      fetchOperationalSignals(),
      fetchFeatureFlags(),
      fetchSecurityAuditLogs(),
    ]);

    setMetrics(met);
    setUsers(uData.users);
    setTotalUsersCount(uData.total);
    setWeddings(wList);
    setStudios(sList);
    setRevenueStats(rev);
    setFeatureAdoption(adopt.adoption);
    setFunnelSteps(adopt.funnel);
    setHealthIndicators(hlth);
    setSignals(sigs);
    setFeatureFlags(flags);
    setAuditLogs(logs);
    setLoading(false);
  };

  useEffect(() => {
    loadAllAdminData();
  }, [timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllAdminData();
    setRefreshing(false);
    showToast('Platform metrics & health signals refreshed.');
  };

  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetchAdminUserDirectory({
      search: userSearch,
      role: userRoleFilter,
      status: userStatusFilter,
    });
    setUsers(res.users);
    setTotalUsersCount(res.total);
  };

  const handleSuspendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAction) return;
    setActionProcessing(true);
    const res = await suspendUserAccount(selectedUserForAction.id, 'admin@amantranlink.com', suspendReason);
    setActionProcessing(false);
    if (res.success) {
      showToast(`User ${selectedUserForAction.name} has been suspended.`);
      setIsSuspendModalOpen(false);
      setSelectedUserForAction(null);
      setSuspendReason('');
      loadAllAdminData();
    }
  };

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAction) return;
    setActionProcessing(true);
    const res = await promoteUserRole(selectedUserForAction.id, targetRole, 'admin@amantranlink.com', promoteReason);
    setActionProcessing(false);
    if (res.success) {
      showToast(`User ${selectedUserForAction.name} role changed to ${targetRole}.`);
      setIsPromoteModalOpen(false);
      setSelectedUserForAction(null);
      setPromoteReason('');
      loadAllAdminData();
    }
  };

  const handleReactivateUser = async (user: AdminUserManagementItem) => {
    const res = await reactivateUserAccount(user.id, 'admin@amantranlink.com');
    if (res.success) {
      showToast(`User ${user.name} reactivated cleanly.`);
      loadAllAdminData();
    }
  };

  const handleToggleFlag = async (flag: FeatureFlagConfig) => {
    const nextState = !flag.is_enabled;
    const res = await toggleFeatureFlag(flag.flag_key, nextState, 'admin@amantranlink.com');
    if (res.success) {
      setFeatureFlags(prev => prev.map(f => f.flag_key === flag.flag_key ? { ...f, is_enabled: nextState } : f));
      showToast(`Feature flag ${flag.name} ${nextState ? 'ENABLED' : 'DISABLED'}.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#20181A] font-manrope antialiased flex flex-col justify-between">
      
      {/* ========================================================================= */}
      {/* 1. TOP MASTER GOVERNANCE HEADER                                           */}
      {/* ========================================================================= */}
      <header className="bg-[#1A0509] text-white border-b border-stone-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#540D1E] border border-[#F4D06F]/40 flex items-center justify-center text-[#F4D06F] font-bold text-lg shadow-inner">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cormorant text-xl sm:text-2xl font-bold tracking-wide text-white">
                AmantranLink Super Control Center
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#F4D06F] text-[#120306] font-mono text-[9px] font-bold uppercase tracking-wider">
                Root Governance
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Multi-Tenant Platform Intelligence · Flow A Revenue · Security &amp; Audit Engine
            </p>
          </div>
        </div>

        {/* Global Controls & Return */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRangeFilter)}
            className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold focus:outline-none"
          >
            <option value="today" className="bg-[#1A0509]">Today</option>
            <option value="7d" className="bg-[#1A0509]">Last 7 Days</option>
            <option value="30d" className="bg-[#1A0509]">Last 30 Days</option>
            <option value="month" className="bg-[#1A0509]">This Month</option>
            <option value="all" className="bg-[#1A0509]">All Time</option>
          </select>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Refresh Platform Signals"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onBackToStudio}
            className="px-3 py-1.5 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold transition-all cursor-pointer"
          >
            Return to Studio
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. PERSISTENT MASTER NAVIGATION BAR                                       */}
      {/* ========================================================================= */}
      <nav className="bg-[#240A10] border-b border-stone-800 px-6 py-2 flex items-center gap-1 overflow-x-auto scrollbar-none text-xs font-bold select-none">
        {[
          { id: 'overview', label: 'Executive Overview', icon: Crown },
          { id: 'users', label: `Users (${totalUsersCount})`, icon: Users },
          { id: 'weddings', label: `Weddings (${weddings.length})`, icon: FileText },
          { id: 'studios', label: `Studios (${studios.length})`, icon: Camera },
          { id: 'revenue', label: 'Platform Revenue (Flow A)', icon: DollarSign },
          { id: 'adoption', label: 'Product & Feature Adoption', icon: BarChart3 },
          { id: 'health', label: 'System Health & Signals', icon: Activity },
          { id: 'flags', label: 'Feature Flags & Config', icon: SlidersHorizontal },
          { id: 'audit', label: 'Security Audit Log', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as AdminSuperSection)}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#F4D06F] text-[#120306] font-bold shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Body Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-6">
        
        {successToast && (
          <div className="p-3.5 bg-[#EDF7F2] border border-[#BCE3D1] rounded-2xl text-xs text-[#136A4E] flex items-center gap-2 animate-scaleUp">
            <CheckCircle2 className="w-4 h-4 text-[#167A5A] shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#736567]">Aggregating platform intelligence across clusters...</p>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* 1. EXECUTIVE OVERVIEW                                                     */}
            {/* ========================================================================= */}
            {activeSection === 'overview' && metrics && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Top Executive KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567]">Platform Revenue (Flow A)</span>
                    <div className="text-2xl font-bold text-[#20181A]">
                      ₹{(metrics.grossPlatformRevenuePaise / 100).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-[#136A4E] font-bold">
                      +₹{(metrics.periodNewRevenuePaise / 100).toLocaleString('en-IN')} this period
                    </div>
                  </div>

                  <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567]">Registered Users</span>
                    <div className="text-2xl font-bold text-[#20181A]">
                      {metrics.totalRegisteredUsers.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-[#736567]">
                      {metrics.totalCouples} Couples · {metrics.totalStudioPartners} Studios
                    </div>
                  </div>

                  <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567]">Active Wedding Sites</span>
                    <div className="text-2xl font-bold text-[#540D1E]">
                      {metrics.totalWeddings.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-[#247559] font-bold">
                      {metrics.publishedWeddings} Live &amp; Published
                    </div>
                  </div>

                  <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567]">Payment Success</span>
                    <div className="text-2xl font-bold text-[#136A4E]">
                      {metrics.paymentSuccessRate}%
                    </div>
                    <div className="text-[10px] text-[#736567]">
                      {metrics.activeSubscriptions} Paid Entitlements
                    </div>
                  </div>

                </div>

                {/* Operational Signals & Health Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Signals Feed (7 Cols) */}
                  <div className="lg:col-span-7 bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                        Operational Signals &amp; Platform Alerts
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#8C6D2E] font-bold">
                        Live Stream
                      </span>
                    </div>

                    <div className="space-y-3">
                      {signals.map((sig) => (
                        <div key={sig.id} className="p-3.5 bg-[#FAF8F5] border border-[#E8DFD1] rounded-2xl flex items-start gap-3 text-xs">
                          <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${sig.severity === 'critical' ? 'text-[#8C4A4A]' : 'text-[#976008]'}`} />
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#20181A]">{sig.title}</span>
                              <span className="text-[10px] font-mono text-[#8C7A7C]">{new Date(sig.created_at).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-[11px] text-[#6C5D60]">{sig.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Health Quick Matrix (5 Cols) */}
                  <div className="lg:col-span-5 bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                        Subsystem Health
                      </span>
                      <span className="text-[10px] font-mono uppercase text-[#136A4E] font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#167A5A] animate-pulse" />
                        100% Operational
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {healthIndicators.slice(0, 4).map((h) => (
                        <div key={h.service_key} className="p-2.5 bg-[#FAF8F5] border border-[#E8DFD1] rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[#20181A] block">{h.service_name}</span>
                            <span className="text-[10px] text-[#736567]">{h.details}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-[#136A4E] bg-[#EDF7F2] px-2 py-0.5 rounded-md">
                            {h.latency_ms}ms
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. USER MANAGEMENT                                                        */}
            {/* ========================================================================= */}
            {activeSection === 'users' && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Search & Filter Bar */}
                <form onSubmit={handleUserSearch} className="p-4 bg-white border border-[#E8DFD1] rounded-2xl shadow-2xs flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-[#736567] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search users by name, email, or studio..."
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="px-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs font-semibold"
                    >
                      <option value="all">All Roles</option>
                      <option value="end_customer">Couples</option>
                      <option value="partner">Studio Partners</option>
                      <option value="admin">Admins</option>
                    </select>

                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs font-semibold"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#540D1E] text-white text-xs font-bold cursor-pointer"
                    >
                      Filter
                    </button>
                  </div>
                </form>

                {/* User Directory Table */}
                <div className="bg-white border border-[#E8DFD1] rounded-3xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF8F5] border-b border-[#E8DFD1] text-[10px] font-mono uppercase tracking-wider text-[#736567]">
                        <tr>
                          <th className="p-3.5">User Identity</th>
                          <th className="p-3.5">Role</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">Plan &amp; Projects</th>
                          <th className="p-3.5">Joined Date</th>
                          <th className="p-3.5 text-right">Governance Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2ECE1]">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-[#FAF6EF]/50 transition-colors">
                            <td className="p-3.5">
                              <span className="font-bold text-[#20181A] block">{u.name}</span>
                              <span className="text-[10px] text-[#736567]">{u.email}</span>
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full font-mono uppercase font-bold text-[9px] ${
                                u.role === 'admin'
                                  ? 'bg-[#540D1E] text-white'
                                  : u.role === 'partner'
                                  ? 'bg-[#FAF4E8] text-[#8C6D2E] border border-[#F4D06F]/50'
                                  : 'bg-[#EDF7F2] text-[#136A4E]'
                              }`}>
                                {u.role === 'end_customer' ? 'Couple' : u.role === 'partner' ? 'Studio Partner' : 'Admin'}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full font-mono uppercase font-bold text-[9px] ${
                                u.account_status === 'active' ? 'bg-[#EDF7F2] text-[#136A4E]' : 'bg-[#FDF2F2] text-[#8C4A4A]'
                              }`}>
                                {u.account_status}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-[#20181A] block">{u.active_subscription_plan || 'Free'}</span>
                              <span className="text-[10px] text-[#736567]">{u.weddings_count} wedding site(s)</span>
                            </td>
                            <td className="p-3.5 text-[#736567]">
                              {new Date(u.created_at).toLocaleDateString('en-IN')}
                            </td>
                            <td className="p-3.5 text-right space-x-1.5">
                              {u.account_status === 'active' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUserForAction(u);
                                    setIsSuspendModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#FDF2F2] hover:bg-[#FBE5E5] text-[#8C4A4A] text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleReactivateUser(u)}
                                  className="px-2.5 py-1 rounded-lg bg-[#EDF7F2] hover:bg-[#DEF0E7] text-[#136A4E] text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Reactivate
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserForAction(u);
                                  setIsPromoteModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#FAF6EF] hover:bg-[#FAF4E8] text-[#540D1E] text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Edit Role
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. WEDDING PROJECT MONITORING                                             */}
            {/* ========================================================================= */}
            {activeSection === 'weddings' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                    Global Wedding Registry &amp; Site Monitor ({weddings.length})
                  </h3>
                </div>

                <div className="bg-white border border-[#E8DFD1] rounded-3xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF8F5] border-b border-[#E8DFD1] text-[10px] font-mono uppercase tracking-wider text-[#736567]">
                        <tr>
                          <th className="p-3.5">Wedding Project</th>
                          <th className="p-3.5">Theme / Lang</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">Guest &amp; RSVP Counts</th>
                          <th className="p-3.5">Entitlement Tier</th>
                          <th className="p-3.5 text-right">View Site</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2ECE1]">
                        {weddings.map((w) => (
                          <tr key={w.id} className="hover:bg-[#FAF6EF]/50 transition-colors">
                            <td className="p-3.5">
                              <span className="font-bold text-[#20181A] block">{w.couple_names}</span>
                              <span className="text-[10px] font-mono text-[#540D1E]">/i/{w.slug}</span>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold capitalize block text-[#20181A]">{w.theme}</span>
                              <span className="text-[10px] uppercase text-[#736567] font-mono">{w.language}</span>
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full font-mono uppercase font-bold text-[9px] ${
                                w.status === 'published' ? 'bg-[#EDF7F2] text-[#136A4E]' : 'bg-[#FFF8EC] text-[#976008]'
                              }`}>
                                {w.status}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-[#20181A] block">{w.guest_count} Guests</span>
                              <span className="text-[10px] text-[#136A4E] font-bold">{w.rsvp_count} Confirmed RSVPs</span>
                            </td>
                            <td className="p-3.5 font-bold text-[#540D1E]">{w.plan_tier}</td>
                            <td className="p-3.5 text-right">
                              <a
                                href={`/i/${w.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#FAF4E8] text-[#540D1E] inline-flex items-center gap-1 font-bold"
                              >
                                <span>Preview</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. STUDIO PARTNERS                                                        */}
            {/* ========================================================================= */}
            {activeSection === 'studios' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                    Studio Partner Agencies ({studios.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studios.map((s) => (
                    <div key={s.id} className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-[#20181A]">{s.studio_name}</h4>
                          <span className="text-[10px] text-[#736567]">Owner: {s.owner_name} · {s.email}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-mono uppercase font-bold text-[9px] ${
                          s.account_status === 'active' ? 'bg-[#EDF7F2] text-[#136A4E]' : 'bg-[#FDF2F2] text-[#8C4A4A]'
                        }`}>
                          {s.account_status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-[#FAF8F5] p-3 rounded-2xl text-center text-xs">
                        <div>
                          <span className="text-[10px] text-[#736567] block">Projects</span>
                          <strong className="text-[#20181A]">{s.total_client_projects}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#736567] block">White-Label</span>
                          <strong className={s.white_label_enabled ? 'text-[#136A4E]' : 'text-[#736567]'}>
                            {s.white_label_enabled ? 'Active' : 'Off'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#736567] block">Platform Paid</span>
                          <strong className="text-[#540D1E]">₹{(s.platform_revenue_paid_paise / 100).toLocaleString('en-IN')}</strong>
                        </div>
                      </div>

                      {s.custom_domain && (
                        <div className="text-[11px] text-[#540D1E] font-mono flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-[#9C772F]" />
                          <span>{s.custom_domain}</span>
                          <span className="text-[9px] text-[#136A4E] font-bold">({s.domain_status})</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. PLATFORM REVENUE (FLOW A)                                              */}
            {/* ========================================================================= */}
            {activeSection === 'revenue' && revenueStats && (
              <div className="space-y-6 animate-fadeIn">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567]">Gross Platform Revenue</span>
                    <div className="text-2xl font-bold text-[#20181A]">
                      ₹{(revenueStats.gross_revenue_paise / 100).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-[#736567]">{revenueStats.successful_payments_count} settled transactions</div>
                  </div>

                  <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567]">Couple Purchases</span>
                    <div className="text-2xl font-bold text-[#540D1E]">
                      ₹{(revenueStats.revenue_by_customer_type.couples_paise / 100).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-[#736567]">Direct wedding plan upgrades</div>
                  </div>

                  <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567]">Studio Subscriptions</span>
                    <div className="text-2xl font-bold text-[#9C772F]">
                      ₹{(revenueStats.revenue_by_customer_type.studios_paise / 100).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-[#736567]">Partner tier access fees</div>
                  </div>
                </div>

                {/* Plan Tier Distribution */}
                <div className="p-6 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                    Platform Revenue Breakdown by Plan Tier
                  </h3>

                  <div className="space-y-3">
                    {revenueStats.revenue_by_plan.map((p) => (
                      <div key={p.plan} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-[#20181A]">{p.plan} ({p.count} sales)</span>
                          <span className="font-mono text-[#540D1E]">₹{(p.amount_paise / 100).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#FAF6EE] rounded-full overflow-hidden flex">
                          <div 
                            className="bg-[#540D1E] h-full rounded-full"
                            style={{ width: `${(p.amount_paise / revenueStats.gross_revenue_paise) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. PRODUCT & FEATURE ADOPTION                                             */}
            {/* ========================================================================= */}
            {activeSection === 'adoption' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Feature Adoption Matrix */}
                <div className="bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xs space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                    Feature Adoption Rates (% of Eligible Active Weddings)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featureAdoption.map((f) => (
                      <div key={f.feature_key} className="p-4 bg-[#FAF8F5] border border-[#E8DFD1] rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#20181A]">{f.feature_name}</span>
                          <span className="font-bold text-xs font-mono text-[#136A4E]">{f.adoption_rate_pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#E8DFD1]">
                          <div className="bg-[#136A4E] h-full rounded-full" style={{ width: `${f.adoption_rate_pct}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#736567]">
                          <span>{f.unique_projects_using} Active Projects</span>
                          <span>{f.total_usage_count.toLocaleString('en-IN')} Lifetime Uses</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversion Funnel */}
                <div className="bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xs space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                    Platform Conversion &amp; Activation Funnel
                  </h3>

                  <div className="space-y-3">
                    {funnelSteps.map((step) => (
                      <div key={step.step_number} className="p-3 bg-[#FAF8F5] border border-[#E8DFD1] rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#540D1E] text-white flex items-center justify-center font-bold text-[10px]">
                            {step.step_number}
                          </span>
                          <span className="font-bold text-[#20181A]">{step.stage_name}</span>
                        </div>

                        <div className="flex items-center gap-4 font-mono text-[11px]">
                          <span className="text-[#20181A] font-bold">{step.count.toLocaleString('en-IN')} Users</span>
                          <span className="text-[#136A4E] font-bold">{step.conversion_rate_pct}% Rate</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 7. SYSTEM HEALTH & SIGNALS                                                */}
            {/* ========================================================================= */}
            {activeSection === 'health' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xs space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                    Subsystem Infrastructure &amp; Latency Monitors
                  </h3>

                  <div className="space-y-3">
                    {healthIndicators.map((h) => (
                      <div key={h.service_key} className="p-4 bg-[#FAF8F5] border border-[#E8DFD1] rounded-2xl flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#EDF7F2] text-[#136A4E] flex items-center justify-center font-bold">
                            ✓
                          </div>
                          <div>
                            <span className="font-bold text-[#20181A] block">{h.service_name}</span>
                            <span className="text-[11px] text-[#736567]">{h.details}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-mono font-bold text-[#136A4E] bg-[#EDF7F2] px-2.5 py-1 rounded-md block">
                            Latency: {h.latency_ms}ms
                          </span>
                          <span className="text-[9px] text-[#8C7A7C]">Checked: {new Date(h.last_checked_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 8. FEATURE FLAGS & PLATFORM CONFIG                                        */}
            {/* ========================================================================= */}
            {activeSection === 'flags' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                      Platform Feature Flags &amp; Global Kill-Switches
                    </span>
                  </div>

                  <div className="divide-y divide-[#F2ECE1]">
                    {featureFlags.map((flag) => (
                      <div key={flag.flag_key} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#20181A]">{flag.name}</span>
                            <span className="font-mono text-[10px] text-[#540D1E] bg-[#FAF4E8] px-1.5 py-0.2 rounded">
                              {flag.flag_key}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#736567] mt-0.5">{flag.description}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleFlag(flag)}
                          className="cursor-pointer"
                        >
                          {flag.is_enabled ? (
                            <ToggleRight className="w-8 h-8 text-[#136A4E]" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-[#9C8C8E]" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 9. SECURITY & AUDIT LOGS                                                  */}
            {/* ========================================================================= */}
            {activeSection === 'audit' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-white border border-[#E8DFD1] rounded-3xl overflow-hidden shadow-2xs">
                  <div className="p-4 border-b border-[#E8DFD1] bg-[#FAF8F5]">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                      Append-Only Security Audit Records ({auditLogs.length})
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF8F5] border-b border-[#E8DFD1] text-[10px] font-mono uppercase text-[#736567]">
                        <tr>
                          <th className="p-3.5">Timestamp</th>
                          <th className="p-3.5">Actor</th>
                          <th className="p-3.5">Action</th>
                          <th className="p-3.5">Target Entity</th>
                          <th className="p-3.5">Audit Reason / Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2ECE1]">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-[#FAF6EF]/50">
                            <td className="p-3.5 text-[#736567] font-mono text-[10px]">
                              {new Date(log.created_at).toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 font-bold text-[#540D1E]">{log.actor_email}</td>
                            <td className="p-3.5 font-mono uppercase text-[10px] font-bold text-[#20181A]">{log.action}</td>
                            <td className="p-3.5 text-[#736567] font-mono text-[10px]">{log.entity_id || '—'}</td>
                            <td className="p-3.5 text-[#4A3E40]">{log.reason || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODALS: Suspend & Promote                                                 */}
      {/* ========================================================================= */}
      {isSuspendModalOpen && selectedUserForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-manrope animate-fadeIn">
          <div className="max-w-md w-full bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-cormorant text-2xl font-bold text-[#8C4A4A]">Suspend User Account</h3>
            <p className="text-xs text-[#736567]">
              Are you sure you want to suspend <strong>{selectedUserForAction.name}</strong> ({selectedUserForAction.email})? This will restrict their access.
            </p>

            <form onSubmit={handleSuspendSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Administrative Reason (Mandatory)</label>
                <textarea
                  rows={2}
                  required
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Terms violation or suspicious activity report..."
                  className="w-full p-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSuspendModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="px-5 py-2 rounded-xl bg-[#8C4A4A] text-white text-xs font-bold"
                >
                  {actionProcessing ? 'Suspending...' : 'Confirm Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPromoteModalOpen && selectedUserForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-manrope animate-fadeIn">
          <div className="max-w-md w-full bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-cormorant text-2xl font-bold text-[#540D1E]">Modify User Role</h3>
            <p className="text-xs text-[#736567]">
              Update role permissions for <strong>{selectedUserForAction.name}</strong>.
            </p>

            <form onSubmit={handlePromoteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Select New Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as UserRole)}
                  className="w-full p-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs font-bold"
                >
                  <option value="end_customer">End Customer / Couple</option>
                  <option value="partner">Studio Partner</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Reason for Role Change</label>
                <input
                  type="text"
                  required
                  value={promoteReason}
                  onChange={(e) => setPromoteReason(e.target.value)}
                  placeholder="e.g. Verified wedding photography agency onboarded"
                  className="w-full p-2 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPromoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="px-5 py-2 rounded-xl bg-[#540D1E] text-white text-xs font-bold"
                >
                  {actionProcessing ? 'Updating...' : 'Save Role Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSuperControlCenter;
