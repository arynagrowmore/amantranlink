import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WeddingProjectState, WeddingSite } from '../types/wedding';
import { RsvpRecord, RsvpSummary, fetchWeddingRsvps } from './rsvpService';

export interface WeddingExpense {
  id: string;
  wedding_site_id: string;
  category: 'venue' | 'catering' | 'decoration' | 'photography' | 'videography' | 'music' | 'makeup' | 'clothing' | 'invitations' | 'transport' | 'other';
  item_name: string;
  estimated_cost: number;
  actual_cost: number;
  is_paid: boolean;
  paid_amount: number;
  vendor_name?: string;
  vendor_phone?: string;
  notes?: string;
  created_at?: string;
}

export interface WeddingChecklistItem {
  id: string;
  wedding_site_id: string;
  title: string;
  category: string;
  is_completed: boolean;
  due_date?: string;
  assigned_to?: string;
  notes?: string;
  is_system?: boolean;
}

export interface GuestCategoryMap {
  [guestIdOrPhone: string]: 'bride_side' | 'groom_side' | 'family' | 'friends' | 'vip' | 'general';
}

export interface CommandCenterMetrics {
  totalResponses: number;
  confirmedAttending: number;
  totalHeadcount: number;
  declinedCount: number;
  pendingCount: number;
  dietaryBreakdown: {
    jain: number;
    vegetarian: number;
    other: number;
    notSpecified: number;
  };
  sideBreakdown: {
    brideSide: number;
    groomSide: number;
    family: number;
    friends: number;
    vip: number;
    general: number;
  };
  totalBudgetPlanned: number;
  totalBudgetSpent: number;
  remainingBudget: number;
  eventsCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
}

// 📦 Scoped Local Storage Helpers for Instant Fallback
const getScopedStorageKey = (prefix: string, siteId: string) => `shahi_${prefix}_${siteId}`;

export const DEFAULT_BUDGET_CATEGORIES: { id: WeddingExpense['category']; label: string; icon: string }[] = [
  { id: 'venue', label: 'Venue & Palace', icon: '🏰' },
  { id: 'catering', label: 'Royal Catering & Sweets', icon: '🍽️' },
  { id: 'decoration', label: 'Mandap & Floral Decor', icon: '🌺' },
  { id: 'photography', label: 'Photography & Album', icon: '📸' },
  { id: 'videography', label: 'Cinematography & Drone', icon: '🎥' },
  { id: 'music', label: 'Shehnai, DJ & Sangeet', icon: '🎶' },
  { id: 'makeup', label: 'Bridal Makeup & Mehndi', icon: '💄' },
  { id: 'clothing', label: 'Royal Attire & Jewelry', icon: '👑' },
  { id: 'invitations', label: 'Kankotri & Gifts', icon: '💌' },
  { id: 'transport', label: 'Baraat & Guest Transport', icon: '🚗' },
  { id: 'other', label: 'Miscellaneous & Puja', icon: '🪔' },
];

// 📋 1. Fetch & Sync Expenses
export const fetchWeddingExpenses = async (siteId: string, userId?: string): Promise<WeddingExpense[]> => {
  const localKey = getScopedStorageKey('expenses', siteId);
  const localData: WeddingExpense[] = JSON.parse(localStorage.getItem(localKey) || '[]');

  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from('wedding_expenses')
        .select('*')
        .eq('wedding_site_id', siteId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        localStorage.setItem(localKey, JSON.stringify(data));
        return data as WeddingExpense[];
      }
    } catch (e) {
      console.warn('Expenses cloud fetch note:', e);
    }
  }

  return localData;
};

export const saveWeddingExpense = async (
  siteId: string, 
  expense: {
    id?: string;
    category: WeddingExpense['category'];
    item_name: string;
    estimated_cost?: number;
    actual_cost?: number;
    is_paid?: boolean;
    paid_amount?: number;
    vendor_name?: string;
    vendor_phone?: string;
    notes?: string;
  },
  userId?: string
): Promise<WeddingExpense> => {
  const localKey = getScopedStorageKey('expenses', siteId);
  const existing: WeddingExpense[] = JSON.parse(localStorage.getItem(localKey) || '[]');
  
  const id = expense.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newRecord: WeddingExpense = {
    id,
    wedding_site_id: siteId,
    category: expense.category,
    item_name: expense.item_name,
    estimated_cost: Number(expense.estimated_cost) || 0,
    actual_cost: Number(expense.actual_cost) || 0,
    is_paid: Boolean(expense.is_paid),
    paid_amount: Number(expense.paid_amount) || Number(expense.actual_cost) || 0,
    vendor_name: expense.vendor_name || '',
    vendor_phone: expense.vendor_phone || '',
    notes: expense.notes || '',
    created_at: new Date().toISOString()
  };

  const updated = expense.id 
    ? existing.map(item => item.id === expense.id ? newRecord : item)
    : [newRecord, ...existing];

  localStorage.setItem(localKey, JSON.stringify(updated));

  if (isSupabaseConfigured && userId) {
    try {
      await supabase.from('wedding_expenses').upsert({
        id: newRecord.id.startsWith('exp_') ? undefined : newRecord.id,
        wedding_site_id: siteId,
        user_id: userId,
        category: newRecord.category,
        item_name: newRecord.item_name,
        estimated_cost: newRecord.estimated_cost,
        actual_cost: newRecord.actual_cost,
        is_paid: newRecord.is_paid,
        paid_amount: newRecord.paid_amount,
        vendor_name: newRecord.vendor_name,
        vendor_phone: newRecord.vendor_phone,
        notes: newRecord.notes
      });
    } catch (e) {
      console.warn('Expense cloud save note:', e);
    }
  }

  return newRecord;
};

export const deleteWeddingExpense = async (siteId: string, expenseId: string, userId?: string): Promise<boolean> => {
  const localKey = getScopedStorageKey('expenses', siteId);
  const existing: WeddingExpense[] = JSON.parse(localStorage.getItem(localKey) || '[]');
  const filtered = existing.filter(e => e.id !== expenseId);
  localStorage.setItem(localKey, JSON.stringify(filtered));

  if (isSupabaseConfigured && userId) {
    try {
      await supabase.from('wedding_expenses').delete().eq('id', expenseId).eq('wedding_site_id', siteId);
    } catch (e) {}
  }

  return true;
};

// 📝 2. Fetch & Sync Checklist Items
export const fetchWeddingChecklist = async (
  siteId: string, 
  state?: WeddingProjectState, 
  userId?: string
): Promise<WeddingChecklistItem[]> => {
  const localKey = getScopedStorageKey('checklist', siteId);
  const customItems: WeddingChecklistItem[] = JSON.parse(localStorage.getItem(localKey) || '[]');

  // Generate automated system status items based on real project state
  const isThemeSelected = Boolean(state?.theme);
  const isCoupleDone = Boolean(state?.couple?.groomEn && state?.couple?.brideEn);
  const isEventsDone = Boolean(state?.events && state?.events.length > 0);
  const isVenueDone = Boolean(state?.couple?.venueName);
  const isPhotosDone = Boolean(state?.media?.photoSlots?.hero?.url);
  const isMusicDone = Boolean(state?.media?.audioUrl || state?.media?.bgMusicPreset || state?.media?.audioName);
  const isRsvpDone = state?.rsvpConfig?.enabled !== false;

  const systemItems: WeddingChecklistItem[] = [
    { id: 'sys_theme', wedding_site_id: siteId, title: 'Select Royal Invitation Theme', category: 'digital', is_completed: isThemeSelected, is_system: true },
    { id: 'sys_couple', wedding_site_id: siteId, title: 'Fill Trilingual Couple & Parent Names', category: 'digital', is_completed: isCoupleDone, is_system: true },
    { id: 'sys_events', wedding_site_id: siteId, title: 'Configure Celebration Rasams & Muhurat Times', category: 'digital', is_completed: isEventsDone, is_system: true },
    { id: 'sys_venue', wedding_site_id: siteId, title: 'Add Venue Address & Google Maps GPS Link', category: 'digital', is_completed: isVenueDone, is_system: true },
    { id: 'sys_photos', wedding_site_id: siteId, title: 'Upload Main Couple & Moments Gallery Photos', category: 'digital', is_completed: isPhotosDone, is_system: true },
    { id: 'sys_music', wedding_site_id: siteId, title: 'Select Auspicious Shehnai Background Track', category: 'digital', is_completed: isMusicDone, is_system: true },
    { id: 'sys_rsvp', wedding_site_id: siteId, title: 'Enable Guest RSVP Form & Family Helpline', category: 'digital', is_completed: isRsvpDone, is_system: true },
  ];

  if (customItems.length === 0) {
    const defaultManualItems: WeddingChecklistItem[] = [
      { id: 'chk_1', wedding_site_id: siteId, title: 'Finalize Guest List & Assign Family Coordinator', category: 'guests', is_completed: false },
      { id: 'chk_2', wedding_site_id: siteId, title: 'Book Photographer & Drone Videography Team', category: 'vendors', is_completed: false },
      { id: 'chk_3', wedding_site_id: siteId, title: 'Schedule Bridal Mehndi Artist & Makeup Trials', category: 'ceremony', is_completed: false },
      { id: 'chk_4', wedding_site_id: siteId, title: 'Confirm Sangeet Choreography & DJ Sound Setup', category: 'entertainment', is_completed: false },
      { id: 'chk_5', wedding_site_id: siteId, title: 'Panditji Auspicious Muhurat & Samagri Review', category: 'rituals', is_completed: false },
      { id: 'chk_6', wedding_site_id: siteId, title: 'Arrange Baraat Welcome & Hotel Room Allocation', category: 'hospitality', is_completed: false },
    ];
    localStorage.setItem(localKey, JSON.stringify(defaultManualItems));
    return [...systemItems, ...defaultManualItems];
  }

  return [...systemItems, ...customItems];
};

export const toggleChecklistItem = async (
  siteId: string, 
  itemId: string, 
  userId?: string
): Promise<WeddingChecklistItem[]> => {
  const localKey = getScopedStorageKey('checklist', siteId);
  const existing: WeddingChecklistItem[] = JSON.parse(localStorage.getItem(localKey) || '[]');
  
  const updated = existing.map(item => {
    if (item.id === itemId) {
      return { ...item, is_completed: !item.is_completed };
    }
    return item;
  });

  localStorage.setItem(localKey, JSON.stringify(updated));
  return updated;
};

export const addCustomChecklistItem = async (
  siteId: string, 
  title: string, 
  category = 'custom',
  userId?: string
): Promise<WeddingChecklistItem> => {
  const localKey = getScopedStorageKey('checklist', siteId);
  const existing: WeddingChecklistItem[] = JSON.parse(localStorage.getItem(localKey) || '[]');
  
  const newItem: WeddingChecklistItem = {
    id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    wedding_site_id: siteId,
    title,
    category,
    is_completed: false
  };

  const updated = [...existing, newItem];
  localStorage.setItem(localKey, JSON.stringify(updated));
  return newItem;
};

export const deleteChecklistItem = async (siteId: string, itemId: string): Promise<boolean> => {
  const localKey = getScopedStorageKey('checklist', siteId);
  const existing: WeddingChecklistItem[] = JSON.parse(localStorage.getItem(localKey) || '[]');
  const filtered = existing.filter(i => i.id !== itemId);
  localStorage.setItem(localKey, JSON.stringify(filtered));
  return true;
};

// 🏷️ 3. Guest Side & Family Categorization
export const fetchGuestSideMap = (siteId: string): GuestCategoryMap => {
  const localKey = getScopedStorageKey('guest_sides', siteId);
  return JSON.parse(localStorage.getItem(localKey) || '{}');
};

export const updateGuestSideCategory = (
  siteId: string, 
  guestKey: string, 
  category: 'bride_side' | 'groom_side' | 'family' | 'friends' | 'vip' | 'general'
): GuestCategoryMap => {
  const localKey = getScopedStorageKey('guest_sides', siteId);
  const current = fetchGuestSideMap(siteId);
  current[guestKey] = category;
  localStorage.setItem(localKey, JSON.stringify(current));
  return current;
};

// 📊 4. Aggregate Command Center Metrics from Real Data
export const computeCommandCenterMetrics = (
  rsvps: RsvpRecord[],
  expenses: WeddingExpense[],
  checklist: WeddingChecklistItem[],
  guestSides: GuestCategoryMap,
  eventsCount: number
): CommandCenterMetrics => {
  let totalResponses = rsvps.length;
  let confirmedAttending = 0;
  let totalHeadcount = 0;
  let declinedCount = 0;

  const dietary = { jain: 0, vegetarian: 0, other: 0, notSpecified: 0 };
  const side = { brideSide: 0, groomSide: 0, family: 0, friends: 0, vip: 0, general: 0 };

  rsvps.forEach((r) => {
    if (r.attending) {
      confirmedAttending++;
      const count = Number(r.attendees_count) || 1;
      totalHeadcount += count;

      // Dietary
      const dietStr = (r.dietary || '').toLowerCase();
      if (dietStr.includes('jain')) dietary.jain += count;
      else if (dietStr.includes('veg') && !dietStr.includes('non')) dietary.vegetarian += count;
      else if (dietStr.length > 0) dietary.other += count;
      else dietary.notSpecified += count;

      // Side
      const cat = guestSides[r.id || r.guest_phone] || 'general';
      if (cat === 'bride_side') side.brideSide += count;
      else if (cat === 'groom_side') side.groomSide += count;
      else if (cat === 'family') side.family += count;
      else if (cat === 'friends') side.friends += count;
      else if (cat === 'vip') side.vip += count;
      else side.general += count;

    } else {
      declinedCount++;
    }
  });

  // Calculate Budget
  let totalBudgetPlanned = 0;
  let totalBudgetSpent = 0;
  expenses.forEach(e => {
    totalBudgetPlanned += Number(e.estimated_cost) || 0;
    totalBudgetSpent += Number(e.actual_cost) || Number(e.paid_amount) || 0;
  });
  const remainingBudget = Math.max(0, totalBudgetPlanned - totalBudgetSpent);

  // Calculate Tasks
  const totalTasksCount = checklist.length;
  const completedTasksCount = checklist.filter(c => c.is_completed).length;

  return {
    totalResponses,
    confirmedAttending,
    totalHeadcount,
    declinedCount,
    pendingCount: Math.max(0, 50 - totalResponses), // Relative estimate based on initial invitation list
    dietaryBreakdown: dietary,
    sideBreakdown: side,
    totalBudgetPlanned,
    totalBudgetSpent,
    remainingBudget,
    eventsCount,
    completedTasksCount,
    totalTasksCount
  };
};
