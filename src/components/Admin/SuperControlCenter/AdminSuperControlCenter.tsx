import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Users, Camera, Sparkles, Search, Filter, 
  DollarSign, Wallet, BarChart3, FileText, Settings, Layers, 
  Tag, CheckCircle2, AlertCircle, Lock, Unlock, ArrowLeft, 
  ArrowRight, Copy, Check, ExternalLink, RefreshCw, TrendingUp, 
  Eye, EyeOff, Edit3, UserX, UserCheck, Plus, History, Crown, X, 
  Activity, Globe, Server, ToggleLeft, ToggleRight, Radio, 
  SlidersHorizontal, Download, ChevronRight, AlertTriangle, Trash2, KeyRound, Clock,
  UploadCloud, FolderUp, FileArchive, FolderArchive, Package, FileCode, CheckCircle
} from 'lucide-react';
import { 
  extractTemplateFromZip, 
  extractTemplateFromFiles, 
  ExtractedTemplatePackage 
} from '../../../utils/templatePackageParser';
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
  AdminTemplateItem,
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
  fetchComingSoonConfigAsync,
  updateComingSoonConfig,
  toggleLockWeddingSite,
  toggleSuspendWeddingSite,
  deleteAdminWeddingSite,
  // 👑 Dynamic Template CMS & Ingestion Services
  fetchAdminTemplatesAsync,
  toggleAdminTemplateAsync,
  createAdminCustomTemplateAsync,
  deleteAdminCustomTemplateAsync
} from '../../../services/adminSuperCenterService';

interface AdminSuperControlCenterProps {
  onBackToHome: () => void;
  onBackToStudio: () => void;
}

type AdminSuperSection = 
  | 'overview' 
  | 'templates'
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

  // 👑 Dynamic Template CMS & Ingestion State
  const [templatesList, setTemplatesList] = useState<AdminTemplateItem[]>([]);
  const [templateSearch, setTemplateSearch] = useState<string>('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<'all' | 'royal' | 'modern' | 'live' | 'hidden'>('all');
  const [isAddTemplateModalOpen, setIsAddTemplateModalOpen] = useState<boolean>(false);
  const [isDeployingTemplate, setIsDeployingTemplate] = useState<boolean>(false);
  const [uploadedPackage, setUploadedPackage] = useState<ExtractedTemplatePackage | null>(null);
  const [isExtractingZip, setIsExtractingZip] = useState<boolean>(false);
  const [zipExtractionError, setZipExtractionError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [showCodePreview, setShowCodePreview] = useState<boolean>(false);

  // Hidden File Inputs Refs
  const zipFileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const [newTemplateForm, setNewTemplateForm] = useState({
    name: '',
    id: '',
    tagline: '',
    category: 'royal' as 'royal' | 'modern',
    price: 699,
    previewImg: '',
    htmlSource: '',
    cssSource: '',
    jsSource: ''
  });

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
    const [met, uData, wList, sList, rev, adopt, hlth, sigs, flags, logs, csConfig, tpls] = await Promise.all([
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
      fetchComingSoonConfigAsync(),
      fetchAdminTemplatesAsync(),
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
    setComingSoonConfig(csConfig);
    setTemplatesList(tpls || []);
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

  // 👑 Toggle Template Active / Hidden (Hide & Show CMS)
  const handleToggleTemplateStatus = async (tpl: AdminTemplateItem) => {
    const nextStatus = !tpl.active;
    setTemplatesList(prev => prev.map(t => t.id === tpl.id ? { ...t, active: nextStatus } : t));
    showToast(`Template "${tpl.name}" is now ${nextStatus ? '🟢 LIVE IN STUDIO' : '🔴 HIDDEN FROM USERS'}`);
    
    const res = await toggleAdminTemplateAsync(tpl.id, nextStatus, 'admin@amantranlink.com');
    if (!res.success) {
      showToast(`Error updating template status: ${res.error}`);
      setTemplatesList(prev => prev.map(t => t.id === tpl.id ? { ...t, active: !nextStatus } : t));
    }
  };

  // 📦 Process ZIP or HTML Archive
  const handleZipFileSelected = async (file: File) => {
    setIsExtractingZip(true);
    setZipExtractionError(null);
    try {
      let pkg: ExtractedTemplatePackage;
      if (file.name.toLowerCase().endsWith('.zip')) {
        pkg = await extractTemplateFromZip(file);
      } else if (file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm')) {
        pkg = await extractTemplateFromFiles([file]);
      } else {
        throw new Error('Please select a valid .ZIP archive or an .HTML file.');
      }
      setUploadedPackage(pkg);
      setNewTemplateForm(prev => ({
        ...prev,
        name: pkg.name || prev.name,
        id: pkg.slug || prev.id,
        tagline: pkg.tagline || prev.tagline,
        previewImg: pkg.previewImageUrl || prev.previewImg,
        htmlSource: pkg.htmlContent,
        cssSource: pkg.cssContent,
        jsSource: pkg.jsContent
      }));
    } catch (err: any) {
      console.error('Error unpacking template archive:', err);
      setZipExtractionError(err.message || 'Failed to extract template package.');
    } finally {
      setIsExtractingZip(false);
    }
  };

  // 📁 Process Folder of Template Files
  const handleFolderSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsExtractingZip(true);
    setZipExtractionError(null);
    try {
      const pkg = await extractTemplateFromFiles(files);
      setUploadedPackage(pkg);
      setNewTemplateForm(prev => ({
        ...prev,
        name: pkg.name || prev.name,
        id: pkg.slug || prev.id,
        tagline: pkg.tagline || prev.tagline,
        previewImg: pkg.previewImageUrl || prev.previewImg,
        htmlSource: pkg.htmlContent,
        cssSource: pkg.cssContent,
        jsSource: pkg.jsContent
      }));
    } catch (err: any) {
      console.error('Error unpacking template folder:', err);
      setZipExtractionError(err.message || 'Failed to extract template folder.');
    } finally {
      setIsExtractingZip(false);
    }
  };

  // 🚀 Deploy New Custom Template via ZIP / Folder or Source Package
  const handleCreateTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateForm.name.trim() || !newTemplateForm.id.trim() || !newTemplateForm.htmlSource.trim()) {
      alert('Please upload a ZIP file, Folder, or HTML file containing the template before deploying.');
      return;
    }
    setIsDeployingTemplate(true);
    const res = await createAdminCustomTemplateAsync(newTemplateForm, 'admin@amantranlink.com');
    setIsDeployingTemplate(false);
    if (res.success && res.template) {
      setTemplatesList(prev => [res.template!, ...prev.filter(t => t.id !== res.template!.id)]);
      setIsAddTemplateModalOpen(false);
      setUploadedPackage(null);
      setZipExtractionError(null);
      setNewTemplateForm({
        name: '',
        id: '',
        tagline: '',
        category: 'royal',
        price: 699,
        previewImg: '',
        htmlSource: '',
        cssSource: '',
        jsSource: ''
      });
      showToast(`👑 Template "${res.template.name}" deployed and activated live in Studio!`);
    } else {
      alert(`Error deploying template: ${res.error}`);
    }
  };

  // 🗑️ Delete Custom Template
  const handleDeleteTemplate = async (tpl: AdminTemplateItem) => {
    if (!window.confirm(`Are you sure you want to remove template "${tpl.name}" (${tpl.id}) from the registry?`)) {
      return;
    }
    const res = await deleteAdminCustomTemplateAsync(tpl.id, 'admin@amantranlink.com');
    if (res.success) {
      setTemplatesList(prev => prev.filter(t => t.id !== tpl.id));
      showToast(`Template "${tpl.name}" removed from registry.`);
    } else {
      showToast(`Error deleting template: ${res.error}`);
    }
  };

  // Toggle Coming Soon Mode
  const handleToggleComingSoon = async () => {
    const nextState = !comingSoonConfig.isEnabled;
    const updated: ComingSoonConfig = { ...comingSoonConfig, isEnabled: nextState };
    setComingSoonConfig(updated);
    showToast(nextState 
      ? '🔴 Coming Soon Mode is now ACTIVE globally across all mobile & desktop visitors!' 
      : '🟢 Live Production Mode is now ACTIVE! Public website restored for all visitors.'
    );
    await updateComingSoonConfig(updated, 'admin@amantranlink.com');
  };

  const handleSaveComingSoonSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ComingSoonConfig = {
      ...comingSoonConfig,
      headline: csFormHeadline,
      subheadline: csFormSubheadline,
      launchDate: `${csFormLaunchDate}T00:00:00`,
      contactPhone: csFormPhone,
      announcementBadge: csFormBadge,
    };
    setComingSoonConfig(updated);
    setIsComingSoonModalOpen(false);
    showToast('👑 Coming Soon Page settings saved & published globally!');
    await updateComingSoonConfig(updated, 'admin@amantranlink.com');
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
        const cs = await fetchComingSoonConfigAsync();
        setComingSoonConfig(cs);
      }
      showToast(`Feature flag ${flag.name} ${nextState ? 'ENABLED' : 'DISABLED'} globally in cloud database.`);
    } else {
      showToast(`Error toggling flag: ${res.error}`);
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
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#540D1E] to-[#2B060F] border border-[#F4D06F]/40 p-2 flex items-center justify-center mx-auto shadow-xl shadow-black/60">
            <img 
              src="/Amantran.png" 
              alt="Amantran" 
              className="w-full h-full object-contain filter drop-shadow-sm" 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/amantranlink.png'; }} 
            />
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
          <div className="w-10 h-10 rounded-2xl bg-[#540D1E] border border-[#F4D06F]/40 p-1.5 flex items-center justify-center shadow-inner">
            <img 
              src="/Amantran.png" 
              alt="Amantran" 
              className="w-full h-full object-contain filter drop-shadow-sm" 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/amantranlink.png'; }} 
            />
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
          { id: 'templates', label: `Templates (${templatesList.length})`, icon: Sparkles },
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
            {/* 👑 DYNAMIC TEMPLATE CMS & SOURCE CODE INGESTION ENGINE                    */}
            {/* ========================================================================= */}
            {activeSection === 'templates' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 👑 Top Action Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-[#240A10] via-[#350811] to-[#120306] border border-[#F4D06F]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F4D06F] animate-pulse" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#F4D06F] font-bold">
                        Authoritative Template Registry &amp; Ingestion Engine
                      </span>
                    </div>
                    <h2 className="font-cormorant font-bold text-2xl sm:text-3xl text-white">
                      Royal Templates CMS &amp; Hide / Show Control
                    </h2>
                    <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
                      Control which templates are live in the Studio, preview interactive 3D gates &amp; wax seal animations, or upload brand new templates via ZIP file or folder from any device.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsAddTemplateModalOpen(true)}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#F4D06F] to-[#DEA645] hover:from-[#FFE494] hover:to-[#E5B558] text-[#120306] font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>+ Add Template (Upload ZIP / Folder)</span>
                    </button>
                  </div>
                </div>

                {/* 📊 Real-time Template Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#736567] font-bold block">Total Registered</span>
                    <strong className="text-2xl font-cormorant font-bold text-[#540D1E]">{templatesList.length}</strong>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-[#BCE3D1] shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#167A5A] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live In Studio
                    </span>
                    <strong className="text-2xl font-cormorant font-bold text-[#136A4E]">
                      {templatesList.filter(t => t.active !== false).length}
                    </strong>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-[#F0D5D8] shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#961C2C] font-bold block">Hidden / Disabled</span>
                    <strong className="text-2xl font-cormorant font-bold text-[#961C2C]">
                      {templatesList.filter(t => t.active === false).length}
                    </strong>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#736567] font-bold block">Custom Ingested</span>
                    <strong className="text-2xl font-cormorant font-bold text-[#540D1E]">
                      {templatesList.filter(t => t.isCustom).length}
                    </strong>
                  </div>
                </div>

                {/* 🔍 Filter & Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-[#E8DFD1] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      placeholder="Search templates by title, slug, or tags..."
                      className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#E8DFD1] rounded-xl text-xs text-[#20181A] focus:outline-none focus:border-[#540D1E]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0 text-xs font-semibold">
                    {[
                      { id: 'all', label: 'All Templates' },
                      { id: 'live', label: '● Live Only' },
                      { id: 'hidden', label: '○ Hidden Only' },
                      { id: 'royal', label: '👑 Royal Heritage' },
                      { id: 'modern', label: '✨ Modern Classics' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setTemplateCategoryFilter(f.id as any)}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap text-xs ${
                          templateCategoryFilter === f.id
                            ? 'bg-[#540D1E] text-white font-bold shadow-xs'
                            : 'bg-[#FAF8F5] text-[#736567] hover:text-[#20181A] border border-[#E8DFD1]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 🏛️ Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {templatesList
                    .filter(t => {
                      if (templateSearch.trim()) {
                        const q = templateSearch.toLowerCase();
                        const matchName = t.name.toLowerCase().includes(q);
                        const matchId = t.id.toLowerCase().includes(q);
                        const matchTag = (t.tagline || '').toLowerCase().includes(q);
                        if (!matchName && !matchId && !matchTag) return false;
                      }
                      if (templateCategoryFilter === 'live') return t.active !== false;
                      if (templateCategoryFilter === 'hidden') return t.active === false;
                      if (templateCategoryFilter === 'royal') return t.category === 'royal';
                      if (templateCategoryFilter === 'modern') return t.category === 'modern';
                      return true;
                    })
                    .map((tpl) => (
                      <div
                        key={tpl.id}
                        className={`rounded-3xl border bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden ${
                          tpl.active !== false ? 'border-[#E8DFD1]' : 'border-stone-300 opacity-75'
                        }`}
                      >
                        {/* Preview Image Banner */}
                        <div className="relative w-full h-44 bg-stone-900 overflow-hidden group">
                          <img
                            src={tpl.previewImg || '/templates/royal-gateway/assets/gate/peacock.webp'}
                            alt={tpl.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold uppercase tracking-wider border border-white/20">
                              {tpl.badge || tpl.category.toUpperCase()}
                            </span>
                            {tpl.isCustom && (
                              <span className="px-2.5 py-1 rounded-full bg-[#F4D06F] text-[#120306] text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
                                👑 Custom Ingested
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                            <div>
                              <h4 className="font-cormorant font-bold text-xl text-[#FFFDF8] leading-tight drop-shadow-md">
                                {tpl.name}
                              </h4>
                              <span className="font-mono text-[10px] text-stone-300 block">
                                slug: /{tpl.id}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-[#F4D06F] bg-black/50 px-2 py-0.5 rounded-md font-mono">
                              ₹{tpl.price}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                          <p className="text-xs text-[#554749] leading-relaxed line-clamp-2">
                            {tpl.tagline || tpl.description || 'Exclusive luxury Indian wedding invitation.'}
                          </p>

                          {/* Live/Hidden Toggle Switch */}
                          <div className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                            tpl.active !== false
                              ? 'bg-[#EDF7F2] border-[#BCE3D1]'
                              : 'bg-[#FDF2F3] border-[#F0D5D8]'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${
                                tpl.active !== false ? 'bg-[#136A4E] animate-pulse' : 'bg-[#961C2C]'
                              }`} />
                              <div>
                                <strong className={`text-xs block font-bold ${
                                  tpl.active !== false ? 'text-[#136A4E]' : 'text-[#961C2C]'
                                }`}>
                                  {tpl.active !== false ? '● LIVE IN STUDIO' : '○ HIDDEN FROM USERS'}
                                </strong>
                                <span className="text-[10px] text-[#736567] block">
                                  {tpl.active !== false ? 'Couples can select & customize' : 'Hidden from studio & landing page'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleTemplateStatus(tpl)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shadow-xs cursor-pointer ${
                                tpl.active !== false
                                  ? 'bg-white hover:bg-stone-100 text-[#961C2C] border border-[#F0D5D8]'
                                  : 'bg-[#136A4E] hover:bg-[#167A5A] text-white'
                              }`}
                            >
                              {tpl.active !== false ? 'Hide' : 'Make Live'}
                            </button>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex items-center justify-between pt-3 border-t border-[#E8DFD1] text-xs">
                            <a
                              href={tpl.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#540D1E] hover:text-[#7A132B] font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview Live</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </a>

                            {tpl.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteTemplate(tpl)}
                                className="text-red-600 hover:text-red-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {templatesList.length === 0 && (
                  <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-[#E8DFD1]">
                    <div className="w-12 h-12 rounded-2xl bg-[#540D1E]/10 flex items-center justify-center text-[#540D1E] mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="font-cormorant font-bold text-xl text-[#20181A]">No Templates Registered Yet</h4>
                    <p className="text-xs text-[#736567] max-w-sm mx-auto">
                      Click "+ Add Template" to upload a ZIP archive or folder containing your template assets.
                    </p>
                  </div>
                )}

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
      {/* 👑 MODAL: + ADD CUSTOM TEMPLATE (UPLOAD ZIP, FOLDER OR FILE)             */}
      {/* ========================================================================= */}
      {isAddTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm font-manrope animate-fadeIn">
          <div className="max-w-3xl w-full bg-[#1A060B] border border-[#F4D06F]/40 rounded-3xl p-6 shadow-2xl text-white space-y-4 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F4D06F]/20 flex items-center justify-center text-[#F4D06F]">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cormorant text-2xl font-bold text-white">
                    Deploy Wedding Template (Upload ZIP / Folder)
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Upload a .ZIP archive, select an entire folder, or choose an HTML file. CSS, JS, and image assets are automatically unpacked and compiled.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddTemplateModalOpen(false);
                  setUploadedPackage(null);
                  setZipExtractionError(null);
                }}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={zipFileInputRef}
              type="file"
              accept=".zip,.html,.htm"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleZipFileSelected(file);
                e.target.value = '';
              }}
            />
            <input
              ref={folderInputRef}
              type="file"
              {...({ webkitdirectory: '', directory: '' } as any)}
              multiple
              className="hidden"
              onChange={(e) => {
                handleFolderSelected(e.target.files);
                e.target.value = '';
              }}
            />

            <form onSubmit={handleCreateTemplateSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* 📂 Drag & Drop Upload Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    handleZipFileSelected(file);
                  }
                }}
                className={`relative p-6 sm:p-7 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-3 ${
                  isDragOver
                    ? 'border-[#F4D06F] bg-[#F4D06F]/10 scale-[1.01]'
                    : uploadedPackage
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-stone-700 hover:border-[#F4D06F]/60 bg-black/30'
                }`}
              >
                {isExtractingZip ? (
                  <div className="py-4 flex flex-col items-center gap-3 text-center">
                    <div className="w-10 h-10 border-3 border-[#F4D06F] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-white">Unpacking &amp; Inlining Template Package...</p>
                    <p className="text-[11px] text-stone-400">
                      Extracting index.html, bundling stylesheets &amp; scripts, and encoding media assets...
                    </p>
                  </div>
                ) : uploadedPackage ? (
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 overflow-hidden">
                        {uploadedPackage.previewImageUrl ? (
                          <img
                            src={uploadedPackage.previewImageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-7 h-7 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Ready To Deploy
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {(uploadedPackage.totalSize / 1024).toFixed(1)} KB • {uploadedPackage.extractedFilesCount} file(s)
                          </span>
                        </div>
                        <h4 className="font-cormorant font-bold text-lg text-white mt-0.5">
                          {uploadedPackage.name}
                        </h4>
                        <p className="text-[11px] text-stone-300">
                          Slug: <code className="text-[#F4D06F] font-mono">{newTemplateForm.id}</code>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => zipFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Change File
                      </button>
                      <button
                        type="button"
                        onClick={() => folderInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Change Folder
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-[#F4D06F]/10 border border-[#F4D06F]/30 flex items-center justify-center text-[#F4D06F]">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-cormorant font-bold text-xl text-white">
                        Drag &amp; Drop Template ZIP or HTML File
                      </h4>
                      <p className="text-xs text-stone-400 max-w-md">
                        Drop your ready-made HTML/CSS/JS template as a single <strong>.ZIP archive</strong> or select your <strong>template folder</strong> directly.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
                      <button
                        type="button"
                        onClick={() => zipFileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-[#F4D06F] hover:bg-[#FFE494] text-[#120306] font-bold text-xs flex items-center gap-2 shadow cursor-pointer transition-all"
                      >
                        <FileArchive className="w-4 h-4" />
                        <span>Choose .ZIP / .HTML</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => folderInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-white font-semibold text-xs flex items-center gap-2 shadow cursor-pointer transition-all"
                      >
                        <FolderUp className="w-4 h-4 text-[#F4D06F]" />
                        <span>Choose Template Folder</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Extraction Error Notice */}
              {zipExtractionError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-semibold block text-red-300">Package Processing Error</strong>
                    <span>{zipExtractionError}</span>
                  </div>
                </div>
              )}

              {/* Form Metadata Fields (Auto-filled & Fully Editable) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                    Template Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTemplateForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                      setNewTemplateForm(prev => ({ ...prev, name, id: prev.id || slug }));
                    }}
                    placeholder="e.g. The Royal Peacock Gateway"
                    className="w-full p-2.5 bg-black/40 border border-stone-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#F4D06F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                    Template Slug / Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTemplateForm.id}
                    onChange={(e) => setNewTemplateForm(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="e.g. royal-peacock-gateway"
                    className="w-full p-2.5 bg-black/40 border border-stone-700 rounded-xl text-xs font-mono text-[#F4D06F] focus:outline-none focus:border-[#F4D06F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newTemplateForm.category}
                    onChange={(e) => setNewTemplateForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full p-2.5 bg-black/40 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#F4D06F]"
                  >
                    <option value="royal">👑 Royal Heritage</option>
                    <option value="modern">✨ Modern Classic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                    Retail Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newTemplateForm.price}
                    onChange={(e) => setNewTemplateForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-black/40 border border-stone-700 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-[#F4D06F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                    Preview Image URL
                  </label>
                  <input
                    type="text"
                    value={newTemplateForm.previewImg}
                    onChange={(e) => setNewTemplateForm(prev => ({ ...prev, previewImg: e.target.value }))}
                    placeholder="/templates/royal-gateway/assets/gate/peacock.webp"
                    className="w-full p-2.5 bg-black/40 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#F4D06F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                  Tagline / Auspicious Short Description
                </label>
                <input
                  type="text"
                  value={newTemplateForm.tagline}
                  onChange={(e) => setNewTemplateForm(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. Imperial palace doors opening with live shehnai & gold scratch card"
                  className="w-full p-2.5 bg-black/40 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#F4D06F]"
                />
              </div>

              {/* Collapsible Inspector for Bundled HTML Code */}
              {newTemplateForm.htmlSource && (
                <div className="border border-stone-800 rounded-2xl bg-black/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowCodePreview(!showCodePreview)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-left text-stone-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-[11px] font-semibold">
                      <FileCode className="w-4 h-4 text-[#F4D06F]" />
                      <span>Bundled Standalone HTML Source ({Math.round(newTemplateForm.htmlSource.length / 1024)} KB)</span>
                    </span>
                    <span className="text-[10px] text-[#F4D06F] underline">
                      {showCodePreview ? 'Hide Source' : 'View Source'}
                    </span>
                  </button>

                  {showCodePreview && (
                    <div className="p-3 border-t border-stone-800 bg-black/60">
                      <textarea
                        rows={6}
                        value={newTemplateForm.htmlSource}
                        onChange={(e) => setNewTemplateForm(prev => ({ ...prev, htmlSource: e.target.value }))}
                        className="w-full p-2.5 bg-black/80 border border-stone-700 rounded-xl text-[11px] font-mono text-stone-300 focus:outline-none focus:border-[#F4D06F] resize-y"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddTemplateModalOpen(false);
                    setUploadedPackage(null);
                    setZipExtractionError(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold cursor-pointer hover:bg-stone-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeployingTemplate || !newTemplateForm.htmlSource.trim()}
                  className={`px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all text-xs ${
                    isDeployingTemplate || !newTemplateForm.htmlSource.trim()
                      ? 'bg-stone-700 text-stone-400 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-[#F4D06F] to-[#DEA645] hover:from-[#FFE494] hover:to-[#E5B558] text-[#120306] cursor-pointer hover:shadow-xl'
                  }`}
                >
                  {isDeployingTemplate ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#120306] border-t-transparent rounded-full animate-spin" />
                      <span>Deploying to Studio...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Deploy &amp; Activate in Studio</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
