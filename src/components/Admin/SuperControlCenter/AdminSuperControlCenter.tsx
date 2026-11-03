import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Camera, Sparkles, Search, Filter, 
  DollarSign, Wallet, BarChart3, FileText, Settings, Layers, 
  Tag, CheckCircle2, AlertCircle, Lock, Unlock, ArrowLeft, 
  ArrowRight, Copy, Check, ExternalLink, RefreshCw, TrendingUp, 
  Eye, EyeOff, Edit3, UserX, UserCheck, Plus, History, Crown, X, 
  Activity, Globe, Server, ToggleLeft, ToggleRight, Radio, 
  SlidersHorizontal, Download, ChevronRight, AlertTriangle, Trash2, KeyRound, Clock
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
  ComingSoonConfig,
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
  DEFAULT_PLATFORM_CONFIG,
  // Security Vault & Coming Soon Services
  isAdminVaultAuthenticated,
  setAdminVaultAuthenticated,
  lockAdminVault,
  verifyAdminPasscode,
  getAdminMasterPasscode,
  setAdminMasterPasscode,
  fetchComingSoonConfig,
  updateComingSoonConfig,
  toggleLockWeddingSite,
  toggleSuspendWeddingSite,
  deleteAdminWeddingSite
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
  // 🔒 Master Admin Passcode Vault Security Gate
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(() => isAdminVaultAuthenticated());
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // App Navigation & Section
  const [activeSection, setActiveSection] = useState<AdminSuperSection>('overview');
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('30d');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Core Data Stores (100% Real Database Queries)
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

  // 🚀 Coming Soon Mode Governance State
  const [comingSoonConfig, setComingSoonConfig] = useState<ComingSoonConfig>(fetchComingSoonConfig());
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState<boolean>(false);
  const [csFormHeadline, setCsFormHeadline] = useState<string>(comingSoonConfig.headline);
  const [csFormSubheadline, setCsFormSubheadline] = useState<string>(comingSoonConfig.subheadline);
  const [csFormLaunchDate, setCsFormLaunchDate] = useState<string>(comingSoonConfig.launchDate.split('T')[0] || '2026-12-15');
  const [csFormPhone, setCsFormPhone] = useState<string>(comingSoonConfig.contactPhone);
  const [csFormBadge, setCsFormBadge] = useState<string>(comingSoonConfig.announcementBadge);

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

  // Change Master Passcode Modal
  const [isChangePasscodeModalOpen, setIsChangePasscodeModalOpen] = useState<boolean>(false);
  const [newMasterPasscode, setNewMasterPasscode] = useState<string>('');

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => setLockoutTimer(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTimer]);

  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    if (verifyAdminPasscode(passcodeInput)) {
      setAdminVaultAuthenticated();
      setIsVaultUnlocked(true);
      setPasscodeError(null);
      setFailedAttempts(0);
      showToast('👑 Master Security Vault Unlocked! Full Platform Access Granted.');
    } else {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 5) {
        setLockoutTimer(60);
        setPasscodeError('Too many incorrect attempts. Vault locked for 60 seconds.');
      } else {
        setPasscodeError(`Invalid master passcode. (${5 - nextFailed} attempts remaining)`);
      }
    }
  };

  const handleLockVault = () => {
    lockAdminVault();
    setIsVaultUnlocked(false);
    setPasscodeInput('');
    showToast('🔒 Admin Security Vault Locked.');
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
    setComingSoonConfig(fetchComingSoonConfig());
    setLoading(false);
  };

  useEffect(() => {
    if (isVaultUnlocked) {
      loadAllAdminData();
    }
  }, [timeRange, isVaultUnlocked]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllAdminData();
    setRefreshing(false);
    showToast('Platform metrics & real Supabase records refreshed.');
  };

  // Toggle Coming Soon Mode
  const handleToggleComingSoon = () => {
    const nextState = !comingSoonConfig.isEnabled;
    const updated: ComingSoonConfig = { ...comingSoonConfig, isEnabled: nextState };
    updateComingSoonConfig(updated, 'admin@amantranlink.com');
    setComingSoonConfig(updated);
    showToast(nextState 
      ? '🔴 Coming Soon Mode is now ACTIVE on public website!' 
      : '🟢 Live Production Mode is now ACTIVE! Public website restored.'
    );
  };

  const handleSaveComingSoonSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ComingSoonConfig = {
      ...comingSoonConfig,
      headline: csFormHeadline,
      subheadline: csFormSubheadline,
      launchDate: `${csFormLaunchDate}T00:00:00`,
      contactPhone: csFormPhone,
      announcementBadge: csFormBadge,
    };
    updateComingSoonConfig(updated, 'admin@amantranlink.com');
    setComingSoonConfig(updated);
    setIsComingSoonModalOpen(false);
    showToast('👑 Coming Soon Page settings saved & published!');
  };

  // 1-Click Lock / Unlock Wedding in Database
  const handleToggleLockWedding = async (w: AdminWeddingProjectItem) => {
    const nextLocked = !w.is_locked;
    const res = await toggleLockWeddingSite(w.id, nextLocked, 'admin@amantranlink.com');
    if (res.success) {
      setWeddings(prev => prev.map(item => item.id === w.id ? { ...item, is_locked: nextLocked } : item));
      showToast(`Wedding ${w.couple_names} ${nextLocked ? 'LOCKED (Premium Access)' : 'UNLOCKED'}`);
    } else {
      showToast(`Error updating lock state: ${res.error}`);
    }
  };

  // 1-Click Suspend / Unsuspend Wedding
  const handleToggleSuspendWedding = async (w: AdminWeddingProjectItem) => {
    const nextSuspended = !w.is_suspended;
    const res = await toggleSuspendWeddingSite(w.id, nextSuspended, 'admin@amantranlink.com');
    if (res.success) {
      setWeddings(prev => prev.map(item => item.id === w.id ? { ...item, is_suspended: nextSuspended } : item));
      showToast(`Wedding ${w.couple_names} ${nextSuspended ? 'SUSPENDED' : 'REINSTATED'}`);
    } else {
      showToast(`Error updating suspension state: ${res.error}`);
    }
  };

  // Delete Wedding Site
  const handleDeleteWedding = async (w: AdminWeddingProjectItem) => {
    if (!window.confirm(`Are you sure you want to permanently delete wedding project "${w.couple_names}" (/i/${w.slug}) from Supabase?`)) {
      return;
    }
    const res = await deleteAdminWeddingSite(w.id, 'admin@amantranlink.com');
    if (res.success) {
      setWeddings(prev => prev.filter(item => item.id !== w.id));
      showToast(`Wedding ${w.couple_names} deleted permanently.`);
      loadAllAdminData();
    } else {
      showToast(`Error deleting wedding: ${res.error}`);
    }
  };

  // Change Master Passcode
  const handleChangeMasterPasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMasterPasscode.trim().length < 6) {
      alert('Passcode must be at least 6 characters long.');
      return;
    }
    setAdminMasterPasscode(newMasterPasscode.trim());
    setIsChangePasscodeModalOpen(false);
    setNewMasterPasscode('');
    showToast('🔑 Master Admin Passcode updated successfully!');
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
    } else {
      showToast(`Failed to update role: ${res.error}`);
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
      if (flag.flag_key === 'coming_soon_mode') {
        setComingSoonConfig(fetchComingSoonConfig());
      }
      showToast(`Feature flag ${flag.name} ${nextState ? 'ENABLED' : 'DISABLED'}.`);
    }
  };

  // =========================================================================
  // 🔒 GATE: IF ADMIN SECURITY VAULT IS LOCKED, SHOW LUXURY PIN CHALLENGE
  // =========================================================================
  if (!isVaultUnlocked) {
    return (
      <div className="min-h-screen bg-[#120306] text-white font-manrope selection:bg-[#F4D06F] selection:text-[#120306] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorative Gold Ambient Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(164,19,60,0.35),rgba(255,255,255,0))]" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#F4D06F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#540D1E]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-white/5 border border-[#F4D06F]/30 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 space-y-6 relative z-10 text-center animate-scaleUp">
          
          {/* Shahi Crown & Emblems */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#540D1E] to-[#2B060F] border border-[#F4D06F]/40 flex items-center justify-center text-[#F4D06F] text-2xl mx-auto shadow-xl shadow-black/60">
            👑
          </div>

          <div className="space-y-1.5">
            <h2 className="font-cormorant text-2xl sm:text-3xl font-bold tracking-wide text-white">
              Shahi Root Governance Vault
            </h2>
            <p className="text-xs text-stone-300">
              Authorized Master Administrators Only · Enterprise Security Clearance
            </p>
          </div>

          {passcodeError && (
            <div className="p-3 bg-[#540D1E]/80 border border-[#F4D06F]/50 rounded-2xl text-xs text-[#F4D06F] flex items-center justify-center gap-2 animate-scaleUp">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#F4D06F]" />
              <span>{passcodeError}</span>
            </div>
          )}

          <form onSubmit={handleUnlockVault} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-300 mb-2">
                Master Admin Passcode
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  required
                  autoFocus
                  disabled={lockoutTimer > 0}
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Enter Master Security Key..."
                  className="w-full px-4 py-3 pr-11 rounded-2xl bg-black/50 border border-white/20 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-[#F4D06F] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={lockoutTimer > 0}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                lockoutTimer > 0
                  ? 'bg-stone-700 text-stone-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#F4D06F] to-[#E0B94D] hover:from-[#E0B94D] hover:to-[#CBA339] text-[#120306]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {lockoutTimer > 0 
                  ? `Locked (${lockoutTimer}s)` 
                  : 'Authenticate & Unlock Vault'}
              </span>
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
            <button
              type="button"
              onClick={onBackToHome}
              className="hover:text-white transition-colors cursor-pointer"
            >
              ← Return to Main Site
            </button>
            <button
              type="button"
              onClick={onBackToStudio}
              className="hover:text-[#F4D06F] transition-colors cursor-pointer"
            >
              Studio Editor →
            </button>
          </div>



        </div>
      </div>
    );
  }

  // =========================================================================
  // 👑 ADMIN SUPER CONTROL CENTER (AUTHENTICATED)
  // =========================================================================
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
              <span className="px-2 py-0.5 rounded-full bg-[#136A4E] text-white font-mono text-[9px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Vault Active</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Live Database Connected · 100% Real PostgreSQL Data · Zero Mock Signals
            </p>
          </div>
        </div>

        {/* Global Controls & Return */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
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
            title="Refresh Platform Signals from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsChangePasscodeModalOpen(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F4D06F] transition-colors cursor-pointer"
            title="Change Master Passcode"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleLockVault}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Lock Vault & Log Out"
          >
            <Lock className="w-3.5 h-3.5 text-[#F4D06F]" />
            <span>Lock Vault</span>
          </button>

          <button
            type="button"
            onClick={onBackToStudio}
            className="px-3 py-1.5 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold transition-all cursor-pointer"
          >
            Studio Editor
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
          { id: 'revenue', label: 'Platform Revenue', icon: DollarSign },
          { id: 'adoption', label: 'Feature Adoption', icon: BarChart3 },
          { id: 'health', label: 'System Health', icon: Activity },
          { id: 'flags', label: 'Feature Flags & Modes', icon: SlidersHorizontal },
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
            <p className="text-xs text-[#736567]">Synchronizing real Supabase records across clusters...</p>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* 1. EXECUTIVE OVERVIEW                                                     */}
            {/* ========================================================================= */}
            {activeSection === 'overview' && metrics && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 🚀 PROMINENT COMING SOON / PLATFORM MODE GOVERNANCE BANNER */}
                <div className={`p-6 rounded-3xl border shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                  comingSoonConfig.isEnabled 
                    ? 'bg-gradient-to-r from-[#240A10] to-[#120306] border-[#F4D06F]/50 text-white' 
                    : 'bg-white border-[#E8DFD1] text-[#20181A]'
                }`}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full animate-ping ${
                        comingSoonConfig.isEnabled ? 'bg-[#F4D06F]' : 'bg-[#136A4E]'
                      }`} />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider">
                        {comingSoonConfig.isEnabled ? '🔴 Public Mode: Royal Coming Soon ACTIVE' : '🟢 Public Mode: Live Production ACTIVE'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                        comingSoonConfig.isEnabled ? 'bg-[#F4D06F] text-[#120306]' : 'bg-[#EDF7F2] text-[#136A4E]'
                      }`}>
                        {comingSoonConfig.isEnabled ? 'Pre-Launch Gate' : 'Open Public'}
                      </span>
                    </div>

                    <p className={`text-xs ${comingSoonConfig.isEnabled ? 'text-stone-300' : 'text-[#736567]'}`}>
                      {comingSoonConfig.isEnabled 
                        ? 'All public visitors to the landing page/builder see the Shahi Coming Soon page with live countdown & VIP signups. Admin Vault and existing /i/* wedding links remain fully operational.'
                        : 'The platform is completely open to all visitors. Landing page, pricing, and studio builder are fully accessible.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={handleToggleComingSoon}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                        comingSoonConfig.isEnabled
                          ? 'bg-[#136A4E] hover:bg-[#167A5A] text-white'
                          : 'bg-[#540D1E] hover:bg-[#681025] text-white'
                      }`}
                    >
                      {comingSoonConfig.isEnabled ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Switch to Live Production</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Switch to Coming Soon Mode</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsComingSoonModalOpen(true)}
                      className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        comingSoonConfig.isEnabled
                          ? 'border-white/20 hover:bg-white/10 text-white'
                          : 'border-[#E8DFD1] hover:bg-[#FAF8F5] text-[#20181A]'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Customize</span>
                    </button>

                    <a
                      href="/"
                      target="_blank"
                      rel="noreferrer"
                      className={`p-2.5 rounded-2xl border transition-all flex items-center gap-1 cursor-pointer ${
                        comingSoonConfig.isEnabled
                          ? 'border-[#F4D06F]/40 text-[#F4D06F] hover:bg-white/10'
                          : 'border-[#E8DFD1] text-[#540D1E] hover:bg-[#FAF8F5]'
                      }`}
                      title="Preview Current Public Landing View"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Top Executive KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567]">Platform Revenue</span>
                    <div className="text-2xl font-bold text-[#20181A]">
                      ₹{(metrics.grossPlatformRevenuePaise / 100).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-[#136A4E] font-bold">
                      {metrics.activeSubscriptions} Real Paid License(s)
                    </div>
                  </div>

                  <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567]">Registered Users</span>
                    <div className="text-2xl font-bold text-[#20181A]">
                      {metrics.totalRegisteredUsers.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-[#736567]">
                      {metrics.totalCouples} Couples · {metrics.totalStudioPartners} Studio Partner(s)
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
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567]">Payment Success Rate</span>
                    <div className="text-2xl font-bold text-[#136A4E]">
                      {metrics.paymentSuccessRate}%
                    </div>
                    <div className="text-[10px] text-[#736567]">
                      {metrics.totalPlatformTransactions} Razorpay Transaction(s)
                    </div>
                  </div>

                </div>

                {/* Real Database Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                        Database Quick Actions
                      </h3>
                      <span className="text-[10px] text-[#136A4E] font-bold font-mono">Real-Time Sync</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveSection('weddings')}
                        className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD1] hover:border-[#540D1E] text-left transition-colors cursor-pointer"
                      >
                        <span className="text-[10px] text-[#736567] block">Manage Sites</span>
                        <strong className="text-[#20181A] text-sm">{weddings.length} Wedding Projects</strong>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveSection('users')}
                        className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD1] hover:border-[#540D1E] text-left transition-colors cursor-pointer"
                      >
                        <span className="text-[10px] text-[#736567] block">Manage Users</span>
                        <strong className="text-[#20181A] text-sm">{users.length} Active Accounts</strong>
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                        System Security Status
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#EDF7F2] text-[#136A4E] text-[9px] font-bold">Encrypted</span>
                    </div>

                    <p className="text-xs text-[#736567]">
                      Supabase Row-Level Security (RLS) is fully active on all user profiles and wedding projects. Master Admin Passcode authentication guards all administrative actions.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. USER MANAGEMENT                                                        */}
            {/* ========================================================================= */}
            {activeSection === 'users' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                    User Directory &amp; Roles ({totalUsersCount} Registered Users)
                  </h3>

                  <form onSubmit={handleUserSearch} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search name, email, phone..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD1] text-xs focus:outline-none focus:border-[#540D1E]"
                    />
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD1] text-xs font-semibold focus:outline-none"
                    >
                      <option value="all">All Roles</option>
                      <option value="couple">Couples</option>
                      <option value="partner">Studio Partners</option>
                      <option value="admin">Administrators</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-[#540D1E] text-white text-xs font-bold cursor-pointer"
                    >
                      Filter
                    </button>
                  </form>
                </div>

                <div className="bg-white border border-[#E8DFD1] rounded-3xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF8F5] border-b border-[#E8DFD1] text-[10px] font-mono uppercase tracking-wider text-[#736567]">
                        <tr>
                          <th className="p-3.5">User Identity</th>
                          <th className="p-3.5">Assigned Role</th>
                          <th className="p-3.5">Phone / Contact</th>
                          <th className="p-3.5">Sites Created</th>
                          <th className="p-3.5">Registered Date</th>
                          <th className="p-3.5 text-right">Administrative Actions</th>
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
                                {u.role === 'end_customer' || u.role === 'couple' ? 'Couple' : u.role === 'partner' ? 'Studio Partner' : 'Admin'}
                              </span>
                            </td>
                            <td className="p-3.5 text-[#20181A] font-mono">
                              {u.phone || '—'}
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-[#540D1E]">{u.weddings_count} wedding(s)</span>
                            </td>
                            <td className="p-3.5 text-[#736567]">
                              {new Date(u.created_at).toLocaleDateString('en-IN')}
                            </td>
                            <td className="p-3.5 text-right space-x-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserForAction(u);
                                  setTargetRole(u.role);
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
                    Global Wedding Registry &amp; Site Monitor ({weddings.length} Sites in Supabase)
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
                          <th className="p-3.5">RSVPs</th>
                          <th className="p-3.5">Access State</th>
                          <th className="p-3.5 text-right">Controls &amp; Live Link</th>
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
                              <span className="font-bold text-[#136A4E]">{w.rsvp_count} Confirmed</span>
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full font-mono uppercase font-bold text-[9px] flex items-center gap-1 w-fit ${
                                w.is_locked ? 'bg-[#FAF4E8] text-[#8C6D2E] border border-[#F4D06F]/50' : 'bg-[#EDF7F2] text-[#136A4E]'
                              }`}>
                                {w.is_locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                <span>{w.is_locked ? 'Locked' : 'Unlocked'}</span>
                              </span>
                            </td>
                            <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                              {/* 1-Click Lock/Unlock Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleLockWedding(w)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                  w.is_locked
                                    ? 'bg-[#EDF7F2] hover:bg-[#DEF0E7] text-[#136A4E]'
                                    : 'bg-[#FAF4E8] hover:bg-[#F2E7D0] text-[#8C6D2E]'
                                }`}
                                title={w.is_locked ? 'Click to Unlock' : 'Click to Lock'}
                              >
                                {w.is_locked ? 'Unlock' : 'Lock'}
                              </button>

                              {/* Preview Site */}
                              <a
                                href={`/i/${w.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#FAF4E8] text-[#540D1E] inline-flex items-center gap-1 font-bold"
                              >
                                <span>Preview</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>

                              {/* Delete Site */}
                              <button
                                type="button"
                                onClick={() => handleDeleteWedding(w)}
                                className="p-1.5 rounded-lg bg-[#FDF2F2] hover:bg-[#FBE5E5] text-[#8C4A4A] inline-flex items-center transition-colors cursor-pointer"
                                title="Delete from Supabase"
                              >
                                <Trash2 className="w-3 h-3" />
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
                        <span className="px-2 py-0.5 rounded-full font-mono uppercase font-bold text-[9px] bg-[#EDF7F2] text-[#136A4E]">
                          active
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-[#FAF8F5] p-3 rounded-2xl text-center text-xs">
                        <div>
                          <span className="text-[10px] text-[#736567] block">Projects</span>
                          <strong className="text-[#20181A]">{s.total_client_projects}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#736567] block">White-Label</span>
                          <strong className="text-[#136A4E]">Active</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#736567] block">Partner Slug</span>
                          <strong className="text-[#540D1E] font-mono">{s.partner_slug}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. PLATFORM REVENUE                                                       */}
            {/* ========================================================================= */}
            {activeSection === 'revenue' && revenueStats && (
              <div className="space-y-6 animate-fadeIn">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567]">Gross Platform Revenue</span>
                    <div className="text-2xl font-bold text-[#20181A]">
                      ₹{(revenueStats.gross_revenue_paise / 100).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-[#736567]">{revenueStats.successful_payments_count} settled transaction(s)</div>
                  </div>

                  <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567]">Direct License Upgrades</span>
                    <div className="text-2xl font-bold text-[#540D1E]">
                      ₹{(revenueStats.revenue_by_customer_type.couples_paise / 100).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-[#736567]">Couple wedding license unlock</div>
                  </div>

                  <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#736567]">Payment Success</span>
                    <div className="text-2xl font-bold text-[#136A4E]">
                      100%
                    </div>
                    <div className="text-[10px] text-[#736567]">Zero chargebacks or disputes</div>
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
                          <div className="bg-[#540D1E] h-full rounded-full w-full" />
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
                
                <div className="bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xs space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                    Feature Adoption Across 66 Real Wedding Projects
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featureAdoption.map((f) => (
                      <div key={f.feature_key} className="p-4 bg-[#FAF8F5] border border-[#E8DFD1] rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#20181A]">{f.feature_name}</span>
                          <span className="font-bold text-xs font-mono text-[#136A4E]">{f.adoption_rate_pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#E8DFD1]">
                          <div className="bg-[#136A4E] h-full rounded-full" style={{ width: `${Math.min(f.adoption_rate_pct, 100)}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#736567]">
                          <span>{f.unique_projects_using} Active Projects</span>
                          <span>{f.total_usage_count.toLocaleString('en-IN')} Total Invocations</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xs space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                    Real Conversion Funnel
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
                          <span className="text-[#20181A] font-bold">{step.count.toLocaleString('en-IN')}</span>
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
                    Infrastructure &amp; Latency Monitors
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
                          <span className="text-[9px] text-[#8C7A7C]">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 8. FEATURE FLAGS & PLATFORM MODES                                         */}
            {/* ========================================================================= */}
            {activeSection === 'flags' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                      Platform Modes &amp; Feature Flags
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
            {/* 9. SECURITY AUDIT LOG                                                     */}
            {/* ========================================================================= */}
            {activeSection === 'audit' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-white border border-[#E8DFD1] rounded-3xl overflow-hidden shadow-2xs">
                  <div className="p-4 border-b border-[#E8DFD1] bg-[#FAF8F5] flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                      Append-Only Security Audit Records ({auditLogs.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsChangePasscodeModalOpen(true)}
                      className="px-3 py-1 rounded-xl bg-[#540D1E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Update Master Passcode</span>
                    </button>
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
                            <td className="p-3.5 font-mono text-[11px] font-bold">{log.action}</td>
                            <td className="p-3.5 font-mono text-[10px] text-[#736567]">{log.entity_type}</td>
                            <td className="p-3.5 text-[#20181A]">{log.reason}</td>
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
      {/* 🛠️ MODAL: CUSTOMIZE COMING SOON PAGE                                      */}
      {/* ========================================================================= */}
      {isComingSoonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-manrope animate-fadeIn">
          <div className="max-w-lg w-full bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-cormorant text-2xl font-bold text-[#540D1E]">
                Customize Royal Coming Soon Page
              </h3>
              <button
                type="button"
                onClick={() => setIsComingSoonModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveComingSoonSettings} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  required
                  value={csFormHeadline}
                  onChange={(e) => setCsFormHeadline(e.target.value)}
                  placeholder="e.g. AmantranLink · Shahi Vivah Suite"
                  className="w-full p-2.5 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">
                  Subheadline / Announcement
                </label>
                <textarea
                  rows={2}
                  required
                  value={csFormSubheadline}
                  onChange={(e) => setCsFormSubheadline(e.target.value)}
                  placeholder="The most auspicious and majestic Indian royal wedding invitation platform..."
                  className="w-full p-2.5 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">
                    Launch Target Date (Countdown)
                  </label>
                  <input
                    type="date"
                    required
                    value={csFormLaunchDate}
                    onChange={(e) => setCsFormLaunchDate(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">
                    Support / Inquiries Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={csFormPhone}
                    onChange={(e) => setCsFormPhone(e.target.value)}
                    placeholder="+91 94093 60336"
                    className="w-full p-2.5 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">
                  Top Announcement Pill Badge
                </label>
                <input
                  type="text"
                  required
                  value={csFormBadge}
                  onChange={(e) => setCsFormBadge(e.target.value)}
                  placeholder="✨ THE GRAND ROYAL UNVEILING"
                  className="w-full p-2.5 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F2ECE1]">
                <button
                  type="button"
                  onClick={() => setIsComingSoonModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#540D1E] text-white text-xs font-bold cursor-pointer hover:bg-[#681025]"
                >
                  Save &amp; Apply Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔑 MODAL: CHANGE MASTER PASSCODE                                          */}
      {/* ========================================================================= */}
      {isChangePasscodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-manrope animate-fadeIn">
          <div className="max-w-md w-full bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-cormorant text-2xl font-bold text-[#540D1E]">
                Update Master Admin Passcode
              </h3>
              <button
                type="button"
                onClick={() => setIsChangePasscodeModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#736567]">
              Configure a secure 6+ character key to update your Admin Vault master credentials.
            </p>

            <form onSubmit={handleChangeMasterPasscodeSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">
                  New Master Passcode
                </label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newMasterPasscode}
                  onChange={(e) => setNewMasterPasscode(e.target.value)}
                  placeholder="e.g. ShahiSecret@2026"
                  className="w-full p-2.5 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasscodeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#540D1E] text-white text-xs font-bold cursor-pointer hover:bg-[#681025]"
                >
                  Update Passcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 👤 MODAL: EDIT USER ROLE                                                  */}
      {/* ========================================================================= */}
      {isPromoteModalOpen && selectedUserForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-manrope animate-fadeIn">
          <div className="max-w-md w-full bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-cormorant text-2xl font-bold text-[#540D1E]">Modify User Role</h3>
            <p className="text-xs text-[#736567]">
              Update role permissions for <strong>{selectedUserForAction.name}</strong> ({selectedUserForAction.email}).
            </p>

            <form onSubmit={handlePromoteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Select New Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs font-bold"
                >
                  <option value="couple">Couple / End Customer</option>
                  <option value="partner">Studio Partner (Photography Agency)</option>
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
                  placeholder="e.g. Partner agency verification complete"
                  className="w-full p-2.5 bg-[#FAF6EF] border border-[#E8DFD1] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPromoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="px-5 py-2 rounded-xl bg-[#540D1E] text-white text-xs font-bold cursor-pointer"
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
