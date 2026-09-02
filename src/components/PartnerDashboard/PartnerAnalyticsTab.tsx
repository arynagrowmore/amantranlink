import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  FileText, 
  Send, 
  CheckCircle2, 
  CreditCard, 
  Globe, 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  Layers, 
  PieChart, 
  Activity, 
  Clock, 
  Share2, 
  ChevronRight,
  Filter,
  BarChart3,
  Award,
  Wallet,
  Building2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resolveApiUrl } from '../../utils/apiConfig';

export type AnalyticsPeriod = 'today' | '7d' | '30d' | 'this_month' | 'all_time';

interface PartnerAnalyticsData {
  period: AnalyticsPeriod;
  hasData: boolean;
  kpis: {
    referralVisitors: number;
    clientSignups: number;
    invitationsCreated: number;
    previewsSent: number;
    clientApprovals: number;
    paidInvitations: number;
    liveInvitations: number;
    commissionEarned: number;
    pendingCommission: number;
    retailRevenue: number;
    partnerRevenue: number;
  };
  commissionBreakdown: {
    silver: { count: number; rate: number; total: number };
    gold: { count: number; rate: number; total: number };
    platinum: { count: number; rate: number; total: number };
  };
  topTemplates: Array<{
    id: string;
    name: string;
    invitations: number;
    paidOrders: number;
    liveCount: number;
  }>;
  funnel: Array<{
    stage: string;
    label: string;
    count: number;
    percentage: number;
    conversionFromPrev: number | null;
  }>;
  performance: {
    approvalRate: string;
    paymentConversion: string;
    liveRate: string;
    overallConversion: string;
    avgCommissionPerOrder: string;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    time: string;
    icon: string;
  }>;
}

interface PartnerAnalyticsTabProps {
  clientSitesCount?: number;
  onCreateInvitation?: () => void;
}

export const PartnerAnalyticsTab: React.FC<PartnerAnalyticsTabProps> = ({
  clientSitesCount = 0,
  onCreateInvitation,
}) => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<AnalyticsPeriod>('all_time');
  const [loading, setLoading] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<PartnerAnalyticsData | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchAnalytics() {
      if (!user?.uid) return;
      setLoading(true);

      try {
        const res = await fetch(resolveApiUrl(`/api/partner/analytics?userId=${user.uid}&period=${period}`));
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.success) {
            setAnalytics(data);
          }
        }
      } catch (e) {
        console.error('Failed to fetch partner analytics:', e);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchAnalytics();
    return () => { isCancelled = true; };
  }, [user?.uid, period]);

  const kpis = analytics?.kpis || {
    referralVisitors: 0,
    clientSignups: 0,
    invitationsCreated: clientSitesCount,
    previewsSent: 0,
    clientApprovals: 0,
    paidInvitations: 0,
    liveInvitations: 0,
    commissionEarned: 0,
    pendingCommission: 0,
    retailRevenue: 0,
    partnerRevenue: 0,
  };

  const performance = analytics?.performance || {
    approvalRate: 'Not enough data',
    paymentConversion: 'Not enough data',
    liveRate: 'Not enough data',
    overallConversion: 'Not enough data',
    avgCommissionPerOrder: 'Not enough data',
  };

  const hasActivity = analytics?.hasData || kpis.invitationsCreated > 0 || kpis.commissionEarned > 0;

  const partnerSlug = user?.partnerSlug || '';
  const partnerLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/?partner=${partnerSlug}`
    : (partnerSlug ? `/?partner=${partnerSlug}` : '');

  return (
    <div className="space-y-6 font-manrope animate-fadeIn">
      {/* 🧭 Top Bar: Title & Real Database-Backed Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8D5AD]/60">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#167A5A] uppercase block">
            Official Business Intelligence
          </span>
          <h3 className="font-cormorant font-bold text-2xl text-[#430914] leading-tight">
            Partner Growth &amp; Referral Analytics
          </h3>
        </div>

        {/* Date Filter Tabs */}
        <div className="inline-flex bg-[#F8F3E8] p-1 rounded-2xl border border-[#E8D5AD] text-xs font-semibold shadow-2xs self-start sm:self-auto">
          {(['today', '7d', '30d', 'this_month', 'all_time'] as AnalyticsPeriod[]).map((p) => {
            const labels: Record<AnalyticsPeriod, string> = {
              today: 'Today',
              '7d': '7 Days',
              '30d': '30 Days',
              this_month: 'This Month',
              all_time: 'All Time'
            };
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  period === p
                    ? 'bg-[#6E1020] text-[#FFFDF8] font-bold shadow-xs'
                    : 'text-[#75675C] hover:text-[#430914]'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 📊 1. 8 Main Database-Backed KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Referral Visitors */}
        <div className="bg-[#FFFDF8] p-4 rounded-2xl border border-[#E8D5AD] shadow-2xs hover:border-[#C49A35] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#75675C] mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Referral Visitors</span>
            <Users className="w-4 h-4 text-[#C49A35]" />
          </div>
          <div className="font-cormorant font-bold text-2xl sm:text-3xl text-[#430914]">
            {loading ? '...' : kpis.referralVisitors}
          </div>
          <span className="text-[10px] text-[#75675C] block mt-0.5">Via ?partner={user?.partnerSlug || 'link'}</span>
        </div>

        {/* Client Signups */}
        <div className="bg-[#FFFDF8] p-4 rounded-2xl border border-[#E8D5AD] shadow-2xs hover:border-[#C49A35] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#75675C] mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Client Signups</span>
            <UserCheck className="w-4 h-4 text-[#167A5A]" />
          </div>
          <div className="font-cormorant font-bold text-2xl sm:text-3xl text-[#167A5A]">
            {loading ? '...' : kpis.clientSignups}
          </div>
          <span className="text-[10px] text-[#75675C] block mt-0.5">Attributed Clients</span>
        </div>

        {/* Invitations Created */}
        <div className="bg-[#FFFDF8] p-4 rounded-2xl border border-[#E8D5AD] shadow-2xs hover:border-[#C49A35] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#75675C] mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Invitations Created</span>
            <FileText className="w-4 h-4 text-[#C49A35]" />
          </div>
          <div className="font-cormorant font-bold text-2xl sm:text-3xl text-[#430914]">
            {loading ? '...' : kpis.invitationsCreated}
          </div>
          <span className="text-[10px] text-[#75675C] block mt-0.5">Client Portals</span>
        </div>

        {/* Previews Sent */}
        <div className="bg-[#FFFDF8] p-4 rounded-2xl border border-[#E8D5AD] shadow-2xs hover:border-[#C49A35] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#75675C] mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Previews Sent</span>
            <Send className="w-4 h-4 text-[#C49A35]" />
          </div>
          <div className="font-cormorant font-bold text-2xl sm:text-3xl text-[#430914]">
            {loading ? '...' : kpis.previewsSent}
          </div>
          <span className="text-[10px] text-[#75675C] block mt-0.5">Under Client Review</span>
        </div>

        {/* Client Approvals */}
        <div className="bg-[#FFFDF8] p-4 rounded-2xl border border-[#E8D5AD] shadow-2xs hover:border-[#167A5A] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#75675C] mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Client Approvals</span>
            <CheckCircle2 className="w-4 h-4 text-[#167A5A]" />
          </div>
          <div className="font-cormorant font-bold text-2xl sm:text-3xl text-[#167A5A]">
            {loading ? '...' : kpis.clientApprovals}
          </div>
          <span className="text-[10px] text-[#75675C] block mt-0.5">Ready for Payment</span>
        </div>

        {/* Paid Invitations */}
        <div className="bg-[#FFFDF8] p-4 rounded-2xl border border-[#E8D5AD] shadow-2xs hover:border-[#C49A35] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#75675C] mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Paid Orders</span>
            <CreditCard className="w-4 h-4 text-[#6E1020]" />
          </div>
          <div className="font-cormorant font-bold text-2xl sm:text-3xl text-[#6E1020]">
            {loading ? '...' : kpis.paidInvitations}
          </div>
          <span className="text-[10px] text-[#75675C] block mt-0.5">Authoritative Unlocks</span>
        </div>

        {/* Live Invitations */}
        <div className="bg-[#FFFDF8] p-4 rounded-2xl border border-[#E8D5AD] shadow-2xs hover:border-[#167A5A] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#75675C] mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Live Invitations</span>
            <Globe className="w-4 h-4 text-[#167A5A]" />
          </div>
          <div className="font-cormorant font-bold text-2xl sm:text-3xl text-[#167A5A]">
            {loading ? '...' : kpis.liveInvitations}
          </div>
          <span className="text-[10px] text-[#75675C] block mt-0.5">Broadcasting Online</span>
        </div>

        {/* Commission Earned */}
        <div className="bg-[#FFFDF8] p-4 rounded-2xl border border-[#C49A35]/60 shadow-2xs hover:border-[#C49A35] transition-colors bg-gradient-to-br from-[#FFFDF8] to-[#F8F3E8]">
          <div className="flex items-center justify-between text-xs text-[#75675C] mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6E1020]">Commission Earned</span>
            <Wallet className="w-4 h-4 text-[#C49A35]" />
          </div>
          <div className="font-cormorant font-bold text-2xl sm:text-3xl text-[#6E1020]">
            ₹{loading ? '...' : kpis.commissionEarned.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#167A5A] font-semibold block mt-0.5">Credited to Payout UPI</span>
        </div>
      </div>

      {!hasActivity ? (
        /* 🌟 Clean Empty State & Onboarding Guidance */
        <div className="p-8 bg-[#FFFDF8] rounded-3xl border border-[#E8D5AD] text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#F8F3E8] border border-[#C49A35]/40 text-[#6E1020] flex items-center justify-center mx-auto shadow-2xs">
            <BarChart3 className="w-7 h-7 text-[#C49A35]" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-cormorant font-bold text-2xl text-[#430914]">
              Your Partner Analytics will appear here.
            </h4>
            <p className="text-xs text-[#75675C] leading-relaxed">
              As you invite clients, share previews, and unlock invitations, your real-time conversion rates and commission charts will populate automatically.
            </p>
          </div>

          {/* Quick Onboarding Steps */}
          <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left text-xs">
            <div className="p-3.5 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD]/60 space-y-1">
              <span className="w-6 h-6 rounded-full bg-[#6E1020] text-white flex items-center justify-center font-bold text-[10px] mb-1">
                1
              </span>
              <span className="font-bold text-[#430914] block">Share Referral Handle</span>
              <span className="text-[11px] text-[#75675C] block">
                Share <code className="text-[#6E1020] font-mono font-semibold">?partner={user?.partnerSlug}</code> with couples.
              </span>
            </div>

            <div className="p-3.5 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD]/60 space-y-1">
              <span className="w-6 h-6 rounded-full bg-[#6E1020] text-white flex items-center justify-center font-bold text-[10px] mb-1">
                2
              </span>
              <span className="font-bold text-[#430914] block">Create Client Invitation</span>
              <span className="text-[11px] text-[#75675C] block">
                Draft a wedding site in the Studio with couple details.
              </span>
            </div>

            <div className="p-3.5 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD]/60 space-y-1">
              <span className="w-6 h-6 rounded-full bg-[#6E1020] text-white flex items-center justify-center font-bold text-[10px] mb-1">
                3
              </span>
              <span className="font-bold text-[#430914] block">Send Preview Link</span>
              <span className="text-[11px] text-[#75675C] block">
                Let clients review on WhatsApp before unlocking.
              </span>
            </div>
          </div>

          {onCreateInvitation && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onCreateInvitation}
                className="px-6 py-2.5 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider shadow-sm border border-[#C49A35] inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <span>+ Create First Client Invitation</span>
                <ArrowRight className="w-4 h-4 text-[#C49A35]" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 🌊 2. Visual Conversion Funnel & Performance Overview */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Funnel Box (2 Columns on Large Screens) */}
            <div className="lg:col-span-2 bg-[#FFFDF8] p-6 rounded-3xl border border-[#E8D5AD] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#C49A35] uppercase tracking-wider block">
                    Full Commercial Lifecycle
                  </span>
                  <h4 className="font-cormorant font-bold text-xl text-[#430914]">
                    Client Conversion Funnel
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-[#167A5A] bg-[#167A5A]/10 px-2.5 py-1 rounded-full border border-[#167A5A]/20">
                  {performance.overallConversion !== 'Not enough data' ? `${performance.overallConversion} Overall Conversion` : 'Live Funnel'}
                </span>
              </div>

              {/* Visual Bars Funnel */}
              <div className="space-y-2.5 pt-1">
                {(analytics?.funnel || []).map((step, idx) => (
                  <div key={step.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-[#430914] flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[#75675C] w-4">{idx + 1}.</span>
                        <span>{step.label}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#430914]">{step.count}</span>
                        {step.conversionFromPrev !== null && (
                          <span className="text-[10px] font-mono text-[#167A5A] font-semibold">
                            ({step.conversionFromPrev}% prev)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Funnel Progress Bar */}
                    <div className="w-full h-3 bg-[#F8F3E8] rounded-full overflow-hidden border border-[#E8D5AD]/60">
                      <div 
                        className="h-full bg-gradient-to-r from-[#6E1020] via-[#C49A35] to-[#167A5A] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, step.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Summary Card (1 Column) */}
            <div className="bg-gradient-to-br from-[#430914] via-[#6E1020] to-[#24060B] text-[#FFFDF8] p-6 rounded-3xl border border-[#C49A35]/40 shadow-md space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#E8D5AD] uppercase block">
                  Studio Performance
                </span>
                <h4 className="font-cormorant font-bold text-2xl text-[#FFFDF8] leading-tight">
                  Efficiency Matrix
                </h4>
                <p className="text-xs text-[#E8D5AD]/80 leading-relaxed">
                  Real-time conversion benchmarks derived from your client review and payment events.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/10">
                  <span className="text-[#E8D5AD]">Client Approval Rate</span>
                  <span className="font-mono font-bold text-white">{performance.approvalRate}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/10">
                  <span className="text-[#E8D5AD]">Payment Conversion</span>
                  <span className="font-mono font-bold text-white">{performance.paymentConversion}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/10">
                  <span className="text-[#E8D5AD]">Live Publication Rate</span>
                  <span className="font-mono font-bold text-white">{performance.liveRate}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5">
                  <span className="text-[#E8D5AD]">Avg Commission / Order</span>
                  <span className="font-mono font-bold text-[#E8D5AD] text-sm">{performance.avgCommissionPerOrder}</span>
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-[11px] text-[#E8D5AD] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C49A35] shrink-0" />
                <span>Zero financial calculation on frontend — verified via server ledger.</span>
              </div>
            </div>
          </div>

          {/* 💵 3. Revenue Overview & Commission Tier Breakdown */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Revenue Overview Card */}
            <div className="bg-[#FFFDF8] p-6 rounded-3xl border border-[#E8D5AD] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#C49A35] uppercase tracking-wider block">
                    Financial Ledger
                  </span>
                  <h4 className="font-cormorant font-bold text-xl text-[#430914]">
                    Revenue Overview
                  </h4>
                </div>
                <DollarSign className="w-5 h-5 text-[#167A5A]" />
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD]/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#75675C] block text-[11px]">Retail Value Generated</span>
                    <span className="font-bold text-[#430914] text-base">₹{kpis.retailRevenue.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#6E1020]/10 text-[#6E1020] px-2 py-0.5 rounded font-bold">
                    Gross Volume
                  </span>
                </div>

                <div className="p-3.5 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD]/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#75675C] block text-[11px]">Partner Net Price Paid</span>
                    <span className="font-bold text-[#430914] text-base">₹{kpis.partnerRevenue.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#167A5A]/10 text-[#167A5A] px-2 py-0.5 rounded font-bold">
                    Wholesale
                  </span>
                </div>

                <div className="p-3.5 bg-gradient-to-r from-[#F4F9F6] to-[#FFFDF8] rounded-2xl border border-[#167A5A]/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#167A5A] block text-[11px] font-semibold">Credited Commission</span>
                    <span className="font-bold text-[#167A5A] text-lg">₹{kpis.commissionEarned.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#167A5A] text-white px-2 py-0.5 rounded font-bold">
                    UPI Settled
                  </span>
                </div>
              </div>
            </div>

            {/* Commission Analytics Tier Breakdown */}
            <div className="bg-[#FFFDF8] p-6 rounded-3xl border border-[#E8D5AD] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#C49A35] uppercase tracking-wider block">
                    Tier Economics
                  </span>
                  <h4 className="font-cormorant font-bold text-xl text-[#430914]">
                    Commission Breakdown
                  </h4>
                </div>
                <Award className="w-5 h-5 text-[#C49A35]" />
              </div>

              <div className="space-y-2.5">
                {/* Silver */}
                <div className="p-3 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <div>
                      <span className="font-bold text-[#430914] block">Shahi Silver (₹100/ea)</span>
                      <span className="text-[10px] text-[#75675C]">{analytics?.commissionBreakdown.silver.count || 0} Unlocks</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#430914] text-sm">
                    ₹{(analytics?.commissionBreakdown.silver.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Gold */}
                <div className="p-3 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C49A35]" />
                    <div>
                      <span className="font-bold text-[#430914] block">Shahi Gold Royal (₹200/ea)</span>
                      <span className="text-[10px] text-[#75675C]">{analytics?.commissionBreakdown.gold.count || 0} Unlocks (All 7 Themes)</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#430914] text-sm">
                    ₹{(analytics?.commissionBreakdown.gold.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Platinum */}
                <div className="p-3 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <div>
                      <span className="font-bold text-[#430914] block">Platinum VIP (₹1,000/ea)</span>
                      <span className="text-[10px] text-[#75675C]">{analytics?.commissionBreakdown.platinum.count || 0} Bespoke Unlocks</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#430914] text-sm">
                    ₹{(analytics?.commissionBreakdown.platinum.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 🏛️ 4. Top Royal Templates Usage Breakdown */}
          <div className="bg-[#FFFDF8] p-6 rounded-3xl border border-[#E8D5AD] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#C49A35] uppercase tracking-wider block">
                  Design Engagement
                </span>
                <h4 className="font-cormorant font-bold text-xl text-[#430914]">
                  Top 7 Royal Templates Usage
                </h4>
              </div>
              <Layers className="w-5 h-5 text-[#C49A35]" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {(analytics?.topTemplates || []).map((tpl) => (
                <div key={tpl.id} className="p-3.5 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD]/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#430914] truncate">{tpl.name}</span>
                    <span className="text-[10px] font-mono font-bold text-[#6E1020] bg-white px-1.5 py-0.5 rounded border border-[#E8D5AD]">
                      {tpl.invitations}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#75675C] pt-1 border-t border-[#E8D5AD]/40">
                    <span>Paid: <strong className="text-[#167A5A]">{tpl.paidOrders}</strong></span>
                    <span>Live: <strong className="text-[#430914]">{tpl.liveCount}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ⚡ 5. Recent Activity Feed (Supported Events Only) */}
          <div className="bg-[#FFFDF8] p-6 rounded-3xl border border-[#E8D5AD] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#C49A35] uppercase tracking-wider block">
                  Real-time Event Stream
                </span>
                <h4 className="font-cormorant font-bold text-xl text-[#430914]">
                  Recent Activity
                </h4>
              </div>
              <Activity className="w-5 h-5 text-[#167A5A]" />
            </div>

            <div className="space-y-2">
              {(analytics?.recentActivity || []).length === 0 ? (
                <p className="text-xs text-[#75675C] py-2">No activity recorded for this period.</p>
              ) : (
                (analytics?.recentActivity || []).map((act) => (
                  <div key={act.id} className="p-3 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD]/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-white text-[#167A5A] flex items-center justify-center shrink-0 border border-[#E8D5AD] shadow-2xs">
                        {act.icon === 'check' && <CheckCircle2 className="w-4 h-4 text-[#167A5A]" />}
                        {act.icon === 'wallet' && <Wallet className="w-4 h-4 text-[#C49A35]" />}
                        {act.icon === 'edit' && <MessageSquare className="w-4 h-4 text-[#6E1020]" />}
                        {act.icon === 'plus' && <FileText className="w-4 h-4 text-[#430914]" />}
                      </div>
                      <span className="font-medium text-[#430914]">{act.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#75675C] shrink-0">
                      {new Date(act.time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PartnerAnalyticsTab;
