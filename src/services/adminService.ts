/**
 * 👑 AMANTRANLINK ADMIN CONTROL CENTER SERVICE
 * Authoritative administrative API & Supabase data service for platform administration.
 */

import { supabase } from '../lib/supabase';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface AdminDashboardMetrics {
  totalUsers: number;
  totalEndCustomers: number;
  totalPartners: number;
  activePartners: number;
  suspendedUsers: number;
  totalInvitations: number;
  draftInvitations: number;
  liveInvitations: number;
  lockedInvitations: number;
  totalOrders: number;
  successfulPayments: number;
  failedPayments: number;
  totalRevenue: number;
  partnerRevenue: number;
  totalCommission: number;
  pendingCommission: number;
  settledCommission: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'end_customer' | 'partner' | 'admin';
  studioName?: string;
  partnerSlug?: string;
  accountStatus: 'active' | 'suspended';
  phone?: string;
  createdAt: string;
}

export interface AdminPartner {
  id: string;
  studioName: string;
  partnerSlug: string;
  email: string;
  phone?: string;
  payoutUpi?: string;
  invitationsCount: number;
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  pendingCommission: number;
  availableCredit: number;
  accountStatus: 'active' | 'suspended';
  createdAt: string;
}

export interface AdminTemplateMeta {
  templateId: string;
  name: string;
  displayName: string;
  category: string;
  previewImage: string;
  retailPrice: number;
  partnerPrice: number;
  partnerCommission: number;
  active: boolean;
  featured: boolean;
  displayOrder: number;
}

export interface AdminPricingTier {
  packageId: string;
  name: string;
  retailPrice: number;
  partnerPrice: number;
  partnerCommission: number;
  active: boolean;
}

export interface AdminAuditLog {
  id: string;
  actorUserId?: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  previousValue: any;
  newValue: any;
  createdAt: string;
}

/**
 * Log sensitive administrative actions
 */
export const logAdminAction = async (
  actorId: string,
  actorRole: string,
  action: string,
  entityType: string,
  entityId?: string,
  previousValue: any = {},
  newValue: any = {}
): Promise<boolean> => {
  try {
    await supabase.from('admin_audit_logs').insert({
      actor_user_id: UUID_REGEX.test(actorId) ? actorId : null,
      actor_role: actorRole || 'admin',
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      previous_value: previousValue,
      new_value: newValue,
      created_at: new Date().toISOString(),
    });
    return true;
  } catch (e) {
    console.warn('[AdminService] logAdminAction error:', e);
    return false;
  }
};

/**
 * Fetch Comprehensive Admin Dashboard Metrics
 */
export const fetchAdminDashboardMetrics = async (): Promise<AdminDashboardMetrics> => {
  try {
    // 1. Users
    const { data: users } = await supabase.from('profiles').select('id, role, account_status');
    const allUsers = users || [];
    const totalUsers = allUsers.length;
    const totalEndCustomers = allUsers.filter((u) => u.role === 'end_customer' || !u.role).length;
    const totalPartners = allUsers.filter((u) => u.role === 'partner').length;
    const activePartners = allUsers.filter((u) => u.role === 'partner' && u.account_status !== 'suspended').length;
    const suspendedUsers = allUsers.filter((u) => u.account_status === 'suspended').length;

    // 2. Wedding Sites
    const { data: sites } = await supabase.from('wedding_sites').select('id, status, is_locked, partner_id, is_suspended');
    const allSites = sites || [];
    const totalInvitations = allSites.length;
    const liveInvitations = allSites.filter((s) => s.status === 'published' && !s.is_suspended).length;
    const draftInvitations = allSites.filter((s) => s.status !== 'published').length;
    const lockedInvitations = allSites.filter((s) => s.is_locked || s.is_suspended).length;

    // 3. Commissions & Revenue
    const { data: commissions } = await supabase.from('commissions_ledger').select('*');
    const allCommissions = commissions || [];
    const totalOrders = allCommissions.length;
    const successfulPayments = allCommissions.filter((c) => c.status === 'credited' || c.status === 'paid').length;
    const failedPayments = allCommissions.filter((c) => c.status === 'failed' || c.status === 'cancelled').length;
    const totalRevenue = allCommissions.reduce((sum, c) => sum + (c.retail_price || 0), 0);
    const partnerRevenue = allCommissions.filter((c) => c.partner_id).reduce((sum, c) => sum + (c.retail_price || 0), 0);
    const totalCommission = allCommissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    const pendingCommission = allCommissions.filter((c) => c.status === 'pending').reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    const settledCommission = allCommissions.filter((c) => c.status === 'paid').reduce((sum, c) => sum + (c.commission_amount || 0), 0);

    return {
      totalUsers,
      totalEndCustomers,
      totalPartners,
      activePartners,
      suspendedUsers,
      totalInvitations,
      draftInvitations,
      liveInvitations,
      lockedInvitations,
      totalOrders,
      successfulPayments,
      failedPayments,
      totalRevenue,
      partnerRevenue,
      totalCommission,
      pendingCommission,
      settledCommission,
    };
  } catch (e) {
    console.warn('[AdminService] fetchAdminDashboardMetrics error:', e);
    return {
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
    };
  }
};

/**
 * Fetch Users with Search and Filters
 */
export const fetchAdminUsers = async (
  searchQuery: string = '',
  roleFilter: string = 'all',
  statusFilter: string = 'all'
): Promise<AdminUser[]> => {
  try {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

    if (roleFilter !== 'all') {
      query = query.eq('role', roleFilter);
    }
    if (statusFilter !== 'all') {
      query = query.eq('account_status', statusFilter);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const mapped: AdminUser[] = data.map((u) => ({
      id: u.id,
      name: u.name || 'User',
      email: u.email || '—',
      role: u.role || 'end_customer',
      studioName: u.studio_name,
      partnerSlug: u.partner_slug,
      accountStatus: u.account_status || 'active',
      phone: u.phone,
      createdAt: u.created_at,
    }));

    if (!searchQuery.trim()) return mapped;

    const q = searchQuery.toLowerCase().trim();
    return mapped.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.studioName && u.studioName.toLowerCase().includes(q)) ||
        (u.partnerSlug && u.partnerSlug.toLowerCase().includes(q))
    );
  } catch (e) {
    return [];
  }
};

/**
 * Suspend / Reactivate User
 */
export const updateUserAccountStatus = async (
  userId: string,
  newStatus: 'active' | 'suspended',
  actorId: string
): Promise<boolean> => {
  if (!userId) return false;
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ account_status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (!error) {
      await logAdminAction(
        actorId,
        'admin',
        newStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
        'profiles',
        userId,
        { account_status: newStatus === 'suspended' ? 'active' : 'suspended' },
        { account_status: newStatus }
      );
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * Fetch Partners List with Performance & Financial Metrics
 */
export const fetchAdminPartners = async (): Promise<AdminPartner[]> => {
  try {
    const { data: partners } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'partner')
      .order('created_at', { ascending: false });

    if (!partners) return [];

    const { data: sites } = await supabase.from('wedding_sites').select('id, partner_id');
    const { data: commissions } = await supabase.from('commissions_ledger').select('*');

    const allSites = sites || [];
    const allCommissions = commissions || [];

    return partners.map((p) => {
      const partnerSites = allSites.filter((s) => s.partner_id === p.id);
      const partnerComm = allCommissions.filter((c) => c.partner_id === p.id);

      const totalRevenue = partnerComm.reduce((sum, c) => sum + (c.retail_price || 0), 0);
      const totalCommission = partnerComm.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
      const pendingCommission = partnerComm.filter((c) => c.status === 'pending').reduce((sum, c) => sum + (c.commission_amount || 0), 0);
      const availableCredit = partnerComm.filter((c) => c.status === 'credited').reduce((sum, c) => sum + (c.commission_amount || 0), 0);

      return {
        id: p.id,
        studioName: p.studio_name || p.name || 'Studio Partner',
        partnerSlug: p.partner_slug || 'studio',
        email: p.email || '—',
        phone: p.phone,
        payoutUpi: p.payout_upi,
        invitationsCount: partnerSites.length,
        totalOrders: partnerComm.length,
        totalRevenue,
        totalCommission,
        pendingCommission,
        availableCredit,
        accountStatus: p.account_status || 'active',
        createdAt: p.created_at,
      };
    });
  } catch (e) {
    return [];
  }
};

/**
 * Fetch Template Metadata CMS
 */
export const fetchAdminTemplates = async (): Promise<AdminTemplateMeta[]> => {
  try {
    const { data } = await supabase.from('template_metadata').select('*').order('display_order', { ascending: true });
    if (data && data.length > 0) {
      return data.map((t) => ({
        templateId: t.template_id,
        name: t.name,
        displayName: t.display_name,
        category: t.category,
        previewImage: t.preview_image,
        retailPrice: t.retail_price,
        partnerPrice: t.partner_price,
        partnerCommission: t.partner_commission,
        active: t.active,
        featured: t.featured,
        displayOrder: t.display_order,
      }));
    }
  } catch (e) {}

  // Fallback defaults
  return [
    { templateId: 'rajmahal', name: 'The Rajmahal 3D Palace', displayName: 'The Rajmahal 3D Palace', category: 'heritage', previewImage: '/previews/theme-rajmahal.webp', retailPrice: 1299, partnerPrice: 899, partnerCommission: 400, active: true, featured: true, displayOrder: 1 },
    { templateId: 'royaldawn', name: 'The Royal Dawn (Lakefront)', displayName: 'The Royal Dawn (Lakefront)', category: 'heritage', previewImage: '/previews/theme-royaldawn.webp', retailPrice: 1299, partnerPrice: 899, partnerCommission: 400, active: true, featured: true, displayOrder: 2 },
    { templateId: 'royalring', name: 'The Royal Ring (3D Engagement)', displayName: 'The Royal Ring (3D Engagement)', category: 'engagement', previewImage: '/previews/theme-royalring.webp', retailPrice: 1299, partnerPrice: 899, partnerCommission: 400, active: true, featured: false, displayOrder: 3 },
    { templateId: 'jharokha', name: 'The Jharokha Mandap', displayName: 'The Jharokha Mandap', category: 'traditional', previewImage: '/previews/theme-jharokha.webp', retailPrice: 999, partnerPrice: 699, partnerCommission: 300, active: true, featured: false, displayOrder: 4 },
    { templateId: 'mayura', name: 'The Mayura Peacock', displayName: 'The Mayura Peacock', category: 'traditional', previewImage: '/previews/theme-mayura.webp', retailPrice: 999, partnerPrice: 699, partnerCommission: 300, active: true, featured: false, displayOrder: 5 },
    { templateId: 'jodi', name: 'The Shubh Jodi', displayName: 'The Shubh Jodi', category: 'traditional', previewImage: '/previews/theme-jodi.webp', retailPrice: 999, partnerPrice: 699, partnerCommission: 300, active: true, featured: false, displayOrder: 6 },
    { templateId: 'dak', name: 'The Shahi Dâk', displayName: 'The Shahi Dâk', category: 'heritage', previewImage: '/previews/theme-dak.webp', retailPrice: 999, partnerPrice: 699, partnerCommission: 300, active: true, featured: false, displayOrder: 7 },
    { templateId: 'ivory', name: 'The Ivory Minimalist', displayName: 'The Ivory Minimalist', category: 'modern', previewImage: '/previews/theme-ivory.webp', retailPrice: 999, partnerPrice: 699, partnerCommission: 300, active: true, featured: false, displayOrder: 8 },
  ];
};

/**
 * Update Template Metadata
 */
export const updateTemplateMetadata = async (
  templateId: string,
  updates: Partial<AdminTemplateMeta>,
  actorId: string
): Promise<boolean> => {
  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.active !== undefined) payload.active = updates.active;
    if (updates.featured !== undefined) payload.featured = updates.featured;
    if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
    if (updates.retailPrice !== undefined) payload.retail_price = updates.retailPrice;
    if (updates.partnerPrice !== undefined) payload.partner_price = updates.partnerPrice;
    if (updates.partnerCommission !== undefined) payload.partner_commission = updates.partnerCommission;

    const { error } = await supabase.from('template_metadata').update(payload).eq('template_id', templateId);
    if (!error) {
      await logAdminAction(actorId, 'admin', 'TEMPLATE_METADATA_UPDATED', 'template_metadata', templateId, {}, payload);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * Fetch Pricing Tiers
 */
export const fetchAdminPricingTiers = async (): Promise<AdminPricingTier[]> => {
  try {
    const { data } = await supabase.from('pricing_tiers').select('*');
    if (data && data.length > 0) {
      return data.map((d) => ({
        packageId: d.package_id,
        name: d.name,
        retailPrice: d.retail_price,
        partnerPrice: d.partner_price,
        partnerCommission: d.partner_commission,
        active: d.active,
      }));
    }
  } catch (e) {}

  return [
    { packageId: 'silver', name: 'Shahi Silver (1 Theme)', retailPrice: 999, partnerPrice: 699, partnerCommission: 300, active: true },
    { packageId: 'gold', name: 'Shahi Gold Royal (All 7 Themes)', retailPrice: 1299, partnerPrice: 899, partnerCommission: 400, active: true },
    { packageId: 'platinum', name: 'Rajmahal Platinum VIP (Bespoke)', retailPrice: 2499, partnerPrice: 1699, partnerCommission: 800, active: true },
  ];
};

/**
 * Update Pricing Tier
 */
export const updatePricingTier = async (
  packageId: string,
  tier: Partial<AdminPricingTier>,
  actorId: string
): Promise<boolean> => {
  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (tier.retailPrice !== undefined) payload.retail_price = tier.retailPrice;
    if (tier.partnerPrice !== undefined) payload.partner_price = tier.partnerPrice;
    if (tier.partnerCommission !== undefined) payload.partner_commission = tier.partnerCommission;
    if (tier.active !== undefined) payload.active = tier.active;

    const { error } = await supabase.from('pricing_tiers').update(payload).eq('package_id', packageId);
    if (!error) {
      await logAdminAction(actorId, 'admin', 'PRICING_TIER_UPDATED', 'pricing_tiers', packageId, {}, payload);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * Suspend / Reactivate Wedding Invitation
 */
export const updateInvitationSuspension = async (
  siteId: string,
  isSuspended: boolean,
  actorId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wedding_sites')
      .update({ is_suspended: isSuspended, updated_at: new Date().toISOString() })
      .eq('id', siteId);

    if (!error) {
      await logAdminAction(
        actorId,
        'admin',
        isSuspended ? 'INVITATION_SUSPENDED' : 'INVITATION_REACTIVATED',
        'wedding_sites',
        siteId,
        { is_suspended: !isSuspended },
        { is_suspended: isSuspended }
      );
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * Create Financial Adjustment (Auditable Non-Destructive Ledger Entry)
 */
export const createFinancialAdjustment = async (
  partnerId: string,
  amount: number,
  adjustmentType: 'CREDIT' | 'DEBIT' | 'BONUS' | 'PENALTY' | 'CORRECTION',
  reason: string,
  actorId: string
): Promise<boolean> => {
  if (!partnerId || !amount || !reason) return false;
  try {
    const { error } = await supabase.from('financial_adjustments').insert({
      partner_id: partnerId,
      amount,
      adjustment_type: adjustmentType,
      reason,
      created_by: actorId,
      created_at: new Date().toISOString(),
    });

    if (!error) {
      await logAdminAction(
        actorId,
        'admin',
        'FINANCIAL_ADJUSTMENT_CREATED',
        'financial_adjustments',
        partnerId,
        {},
        { amount, adjustmentType, reason }
      );
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * Fetch Audit Logs
 */
export const fetchAdminAuditLogs = async (): Promise<AdminAuditLog[]> => {
  try {
    const { data } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    return (data || []).map((l) => ({
      id: l.id,
      actorUserId: l.actor_user_id,
      actorRole: l.actor_role,
      action: l.action,
      entityType: l.entity_type,
      entityId: l.entity_id,
      previousValue: l.previous_value,
      newValue: l.new_value,
      createdAt: l.created_at,
    }));
  } catch (e) {
    return [];
  }
};
