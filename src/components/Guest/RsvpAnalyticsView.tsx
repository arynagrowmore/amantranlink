import React, { useMemo, useState } from 'react';
import { 
  Users, CheckCircle2, Clock, XCircle, Utensils, 
  Sparkles, ArrowRight, Eye, TrendingUp, AlertTriangle, 
  ShieldCheck, ChevronRight, HelpCircle, UserCheck, Calendar
} from 'lucide-react';
import { GuestRecord } from '../../types/guest';
import { calculateGuestMetrics } from '../../services/guestService';
import { WeddingProjectState } from '../../types/wedding';

interface RsvpAnalyticsViewProps {
  guests: GuestRecord[];
  state: WeddingProjectState;
  weddingSlug: string;
  onSelectGuest: (guest: GuestRecord) => void;
}

export const RsvpAnalyticsView: React.FC<RsvpAnalyticsViewProps> = ({
  guests,
  state,
  weddingSlug,
  onSelectGuest,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Master calculated metrics
  const metrics = useMemo(() => calculateGuestMetrics(guests), [guests]);

  // Status Distribution Calculation
  const distribution = useMemo(() => {
    const total = guests.length;
    if (total === 0) {
      return {
        attending: { count: 0, percent: 0, members: 0 },
        pending: { count: 0, percent: 0, members: 0 },
        notAttending: { count: 0, percent: 0, members: 0 },
        maybe: { count: 0, percent: 0, members: 0 },
      };
    }

    let attendingCount = 0;
    let attendingMembers = 0;
    let notAttendingCount = 0;
    let notAttendingMembers = 0;
    let maybeCount = 0;
    let maybeMembers = 0;
    let pendingCount = 0;
    let pendingMembers = 0;

    guests.forEach((g) => {
      const status = g.rsvp?.attendance_status || 'Pending';
      const headcount = g.number_of_members || 1;

      if (status === 'Attending') {
        attendingCount++;
        attendingMembers += g.rsvp?.attending_member_count || headcount;
      } else if (status === 'Not Attending') {
        notAttendingCount++;
        notAttendingMembers += headcount;
      } else if (status === 'Maybe') {
        maybeCount++;
        maybeMembers += headcount;
      } else {
        pendingCount++;
        pendingMembers += headcount;
      }
    });

    return {
      attending: { count: attendingCount, percent: Math.round((attendingCount / total) * 100), members: attendingMembers },
      pending: { count: pendingCount, percent: Math.round((pendingCount / total) * 100), members: pendingMembers },
      notAttending: { count: notAttendingCount, percent: Math.round((notAttendingCount / total) * 100), members: notAttendingMembers },
      maybe: { count: maybeCount, percent: Math.round((maybeCount / total) * 100), members: maybeMembers },
    };
  }, [guests]);

  // Engagement Funnel
  const funnel = useMemo(() => {
    const registered = guests.length;
    const viewed = guests.filter(g => g.invitation_status === 'viewed' || Boolean(g.viewed_at) || Boolean(g.rsvp)).length;
    const rsvpReceived = guests.filter(g => Boolean(g.rsvp)).length;
    const attending = guests.filter(g => g.rsvp?.attendance_status === 'Attending').length;

    return {
      registered,
      viewed,
      viewedRate: registered > 0 ? Math.round((viewed / registered) * 100) : 0,
      rsvpReceived,
      responseRate: registered > 0 ? Math.round((rsvpReceived / registered) * 100) : 0,
      attending,
      conversionRate: rsvpReceived > 0 ? Math.round((attending / rsvpReceived) * 100) : 0,
    };
  }, [guests]);

  // Follow-up priority list
  const followUpList = useMemo(() => {
    return guests
      .filter((g) => !g.rsvp) // Has no RSVP submitted yet
      .map((g) => {
        const isViewed = g.invitation_status === 'viewed' || Boolean(g.viewed_at);
        const isSent = g.invitation_status === 'sent' || g.invitation_status === 'delivered';

        let priority: 'high' | 'medium' | 'low' = 'low';
        let reason = 'Draft invitation (not sent yet)';

        if (isViewed) {
          priority = 'high';
          reason = g.viewed_at 
            ? `Viewed on ${new Date(g.viewed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · Awaiting response`
            : 'Opened invitation · Awaiting response';
        } else if (isSent) {
          priority = 'medium';
          reason = 'Invitation sent · Not yet opened';
        }

        return {
          guest: g,
          priority,
          reason,
        };
      })
      .filter((item) => {
        if (priorityFilter === 'all') return true;
        return item.priority === priorityFilter;
      })
      .sort((a, b) => {
        const pOrder = { high: 1, medium: 2, low: 3 };
        return pOrder[a.priority] - pOrder[b.priority];
      });
  }, [guests, priorityFilter]);

  // Maybe Responses
  const maybeGuests = useMemo(() => {
    return guests.filter((g) => g.rsvp?.attendance_status === 'Maybe');
  }, [guests]);

  // Catering Summary by confirmed attending members
  const cateringSummary = useMemo(() => {
    const confirmedAttendingGuests = guests.filter((g) => g.rsvp?.attendance_status === 'Attending');
    const totals: Record<string, number> = {
      'Pure Jain': 0,
      'Gujarati Special': 0,
      'Standard Veg': 0,
      'Vegan': 0,
      'Other': 0,
    };

    let totalConfirmedMembers = 0;

    confirmedAttendingGuests.forEach((g) => {
      const meal = g.rsvp?.meal_preference || 'Standard Veg';
      const headcount = g.rsvp?.attending_member_count || g.number_of_members || 1;
      totalConfirmedMembers += headcount;

      if (totals[meal] !== undefined) {
        totals[meal] += headcount;
      } else {
        totals['Other'] += headcount;
      }
    });

    return {
      totals,
      totalConfirmedMembers,
    };
  }, [guests]);

  // Daily Response Trend Activity Log
  const responseTimeline = useMemo(() => {
    const dateMap: Record<string, { dateStr: string; count: number; attendingCount: number }> = {};

    guests.forEach((g) => {
      if (g.rsvp && g.rsvp.responded_at) {
        const d = new Date(g.rsvp.responded_at);
        const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        if (!dateMap[key]) {
          dateMap[key] = { dateStr: key, count: 0, attendingCount: 0 };
        }
        dateMap[key].count++;
        if (g.rsvp.attendance_status === 'Attending') {
          dateMap[key].attendingCount++;
        }
      }
    });

    return Object.values(dateMap).slice(0, 7);
  }, [guests]);

  if (guests.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-[#E8DFD1] shadow-2xs max-w-xl mx-auto font-manrope">
        <div className="w-12 h-12 rounded-full bg-[#FAF4E8] border border-[#E8DFD1] flex items-center justify-center text-[#9C772F] mx-auto mb-3">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h3 className="font-cormorant font-bold text-2xl text-[#350811]">
          No RSVP Analytics Available Yet
        </h3>
        <p className="text-xs text-[#6C5D60] mt-1.5 max-w-sm mx-auto leading-relaxed">
          Guest analytics, attendance conversions, catering numbers, and reminder insights will appear automatically once guests are invited and begin responding.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-manrope text-[#20181A]">
      
      {/* ========================================================================= */}
      {/* 1. TOP RSVP HEALTH SUMMARY (6 Operational Metric Cards)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Metric 1: Total Guests */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#736567] uppercase">
            Total Guests
          </span>
          <div className="mt-2">
            <div className="font-cormorant font-bold text-2xl sm:text-3xl text-[#2A171B] leading-none">
              {metrics.totalGuests}
            </div>
            <p className="text-[10px] text-[#736567] mt-1 font-medium">
              {metrics.totalMembersCount} expected members
            </p>
          </div>
        </div>

        {/* Metric 2: Confirmed Attending */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#BCE3D1] shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#136A4E] uppercase">
            Attending
          </span>
          <div className="mt-2">
            <div className="font-cormorant font-bold text-2xl sm:text-3xl text-[#136A4E] leading-none">
              {metrics.confirmedAttendingCount}
            </div>
            <p className="text-[10px] text-[#247559] mt-1 font-medium">
              {metrics.confirmedAttendingMembers} confirmed heads
            </p>
          </div>
        </div>

        {/* Metric 3: Response Rate */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#736567] uppercase">
            Response Rate
          </span>
          <div className="mt-2">
            <div className="font-cormorant font-bold text-2xl sm:text-3xl text-[#540D1E] leading-none">
              {metrics.responseRatePercent}%
            </div>
            <p className="text-[10px] text-[#736567] mt-1 font-medium">
              {funnel.rsvpReceived} / {funnel.registered} responded
            </p>
          </div>
        </div>

        {/* Metric 4: Invitations Viewed */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#736567] uppercase">
            Links Viewed
          </span>
          <div className="mt-2">
            <div className="font-cormorant font-bold text-2xl sm:text-3xl text-[#350811] leading-none">
              {metrics.viewedInvitationsCount}
            </div>
            <p className="text-[10px] text-[#736567] mt-1 font-medium">
              {funnel.viewedRate}% engagement
            </p>
          </div>
        </div>

        {/* Metric 5: Pending Responses */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#F2DEB0] shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#976008] uppercase">
            Pending
          </span>
          <div className="mt-2">
            <div className="font-cormorant font-bold text-2xl sm:text-3xl text-[#976008] leading-none">
              {metrics.pendingCount}
            </div>
            <p className="text-[10px] text-[#9C772F] mt-1 font-medium">
              Awaiting response
            </p>
          </div>
        </div>

        {/* Metric 6: Declined / Maybe */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E8D9D8] shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#8C4A4A] uppercase">
            Regrets / Maybe
          </span>
          <div className="mt-2">
            <div className="font-cormorant font-bold text-2xl sm:text-3xl text-[#8C4A4A] leading-none">
              {metrics.notAttendingCount + metrics.maybeCount}
            </div>
            <p className="text-[10px] text-[#8C6D6E] mt-1 font-medium">
              {metrics.notAttendingCount} regrets · {metrics.maybeCount} maybe
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. RSVP DISTRIBUTION & ENGAGEMENT FUNNEL                                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* RSVP Status Distribution (Horizontal Proportional Bars) */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-cormorant text-xl font-bold text-[#350811]">
              RSVP Response Distribution
            </h3>
            <span className="text-[10px] font-mono text-[#736567]">
              {guests.length} total families
            </span>
          </div>

          <div className="space-y-3">
            
            {/* Attending */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-[#136A4E] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Attending</span>
                </span>
                <span className="text-[#136A4E]">{distribution.attending.count} guests ({distribution.attending.percent}%) · {distribution.attending.members} confirmed heads</span>
              </div>
              <div className="h-2 w-full bg-[#FAF6EF] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#167A5A] rounded-full transition-all duration-500"
                  style={{ width: `${distribution.attending.percent}%` }}
                />
              </div>
            </div>

            {/* Pending */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-[#976008] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Response</span>
                </span>
                <span className="text-[#976008]">{distribution.pending.count} guests ({distribution.pending.percent}%) · {distribution.pending.members} expected</span>
              </div>
              <div className="h-2 w-full bg-[#FAF6EF] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#C59B4B] rounded-full transition-all duration-500"
                  style={{ width: `${distribution.pending.percent}%` }}
                />
              </div>
            </div>

            {/* Not Attending */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-[#8C4A4A] flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Not Attending</span>
                </span>
                <span className="text-[#8C4A4A]">{distribution.notAttending.count} guests ({distribution.notAttending.percent}%)</span>
              </div>
              <div className="h-2 w-full bg-[#FAF6EF] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#8C4A4A] rounded-full transition-all duration-500"
                  style={{ width: `${distribution.notAttending.percent}%` }}
                />
              </div>
            </div>

            {/* Maybe */}
            {distribution.maybe.count > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-[#6B5E7A] flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Maybe (Tentative)</span>
                  </span>
                  <span className="text-[#6B5E7A]">{distribution.maybe.count} guests ({distribution.maybe.percent}%) · {distribution.maybe.members} heads</span>
                </div>
                <div className="h-2 w-full bg-[#FAF6EF] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#8B789E] rounded-full transition-all duration-500"
                    style={{ width: `${distribution.maybe.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Engagement Progression Funnel */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-cormorant text-xl font-bold text-[#350811]">
              Invitation Engagement Funnel
            </h3>
            <span className="text-[10px] font-mono text-[#736567]">Conversion</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center pt-2">
            
            {/* Step 1: Registered */}
            <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#E8DFD1]">
              <span className="text-[10px] font-mono uppercase font-bold text-[#736567] block">
                1. Registered
              </span>
              <div className="font-cormorant font-bold text-2xl text-[#350811] mt-1">
                {funnel.registered}
              </div>
              <span className="text-[9px] text-[#736567]">100% Base</span>
            </div>

            {/* Step 2: Viewed */}
            <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#E8DFD1]">
              <span className="text-[10px] font-mono uppercase font-bold text-[#736567] block">
                2. Viewed
              </span>
              <div className="font-cormorant font-bold text-2xl text-[#350811] mt-1">
                {funnel.viewed}
              </div>
              <span className="text-[9px] text-[#136A4E] font-semibold">{funnel.viewedRate}% opened</span>
            </div>

            {/* Step 3: Responded */}
            <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#E8DFD1]">
              <span className="text-[10px] font-mono uppercase font-bold text-[#736567] block">
                3. Responded
              </span>
              <div className="font-cormorant font-bold text-2xl text-[#350811] mt-1">
                {funnel.rsvpReceived}
              </div>
              <span className="text-[9px] text-[#976008] font-semibold">{funnel.responseRate}% total</span>
            </div>

            {/* Step 4: Attending */}
            <div className="p-3 rounded-xl bg-[#EDF7F2] border border-[#BCE3D1]">
              <span className="text-[10px] font-mono uppercase font-bold text-[#136A4E] block">
                4. Attending
              </span>
              <div className="font-cormorant font-bold text-2xl text-[#136A4E] mt-1">
                {funnel.attending}
              </div>
              <span className="text-[9px] text-[#136A4E] font-semibold">{funnel.conversionRate}% of RSVPs</span>
            </div>
          </div>

          <p className="text-[11px] text-[#6C5D60] pt-1">
            💡 {metrics.pendingCount} guests have not responded yet. Following up with viewed links improves confirmation rates.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CATERING & MEAL REQUIREMENTS SUMMARY                                   */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#9C772F]" />
            <h3 className="font-cormorant text-xl font-bold text-[#350811]">
              Confirmed Catering &amp; Meal Requirements
            </h3>
          </div>
          <span className="text-xs font-bold text-[#136A4E] bg-[#EDF7F2] px-2.5 py-1 rounded-lg border border-[#BCE3D1]">
            {cateringSummary.totalConfirmedMembers} Total Confirmed Food Plates
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Pure Jain */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D2E] block">
              Pure Jain
            </span>
            <div className="font-cormorant font-bold text-2xl text-[#350811]">
              {cateringSummary.totals['Pure Jain']} <span className="text-xs font-normal text-[#736567]">heads</span>
            </div>
            <p className="text-[10px] text-[#736567]">
              {cateringSummary.totalConfirmedMembers > 0 
                ? `${Math.round((cateringSummary.totals['Pure Jain'] / cateringSummary.totalConfirmedMembers) * 100)}% of confirmed` 
                : 'No attendees yet'}
            </p>
          </div>

          {/* Gujarati Special */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D2E] block">
              Gujarati Special
            </span>
            <div className="font-cormorant font-bold text-2xl text-[#350811]">
              {cateringSummary.totals['Gujarati Special']} <span className="text-xs font-normal text-[#736567]">heads</span>
            </div>
            <p className="text-[10px] text-[#736567]">
              {cateringSummary.totalConfirmedMembers > 0 
                ? `${Math.round((cateringSummary.totals['Gujarati Special'] / cateringSummary.totalConfirmedMembers) * 100)}% of confirmed` 
                : 'No attendees yet'}
            </p>
          </div>

          {/* Standard Veg */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D2E] block">
              Standard Veg
            </span>
            <div className="font-cormorant font-bold text-2xl text-[#350811]">
              {cateringSummary.totals['Standard Veg']} <span className="text-xs font-normal text-[#736567]">heads</span>
            </div>
            <p className="text-[10px] text-[#736567]">
              {cateringSummary.totalConfirmedMembers > 0 
                ? `${Math.round((cateringSummary.totals['Standard Veg'] / cateringSummary.totalConfirmedMembers) * 100)}% of confirmed` 
                : 'No attendees yet'}
            </p>
          </div>

          {/* Vegan */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D2E] block">
              Vegan / Other
            </span>
            <div className="font-cormorant font-bold text-2xl text-[#350811]">
              {cateringSummary.totals['Vegan'] + cateringSummary.totals['Other']} <span className="text-xs font-normal text-[#736567]">heads</span>
            </div>
            <p className="text-[10px] text-[#736567]">
              {cateringSummary.totalConfirmedMembers > 0 
                ? `${Math.round(((cateringSummary.totals['Vegan'] + cateringSummary.totals['Other']) / cateringSummary.totalConfirmedMembers) * 100)}% of confirmed` 
                : 'No attendees yet'}
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. OPERATIONAL FOLLOW-UP INTELLIGENCE (Guests needing RSVP reminders)     */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#976008]" />
              <h3 className="font-cormorant text-xl font-bold text-[#350811]">
                Needs Follow-Up ({followUpList.length} Pending Guests)
              </h3>
            </div>
            <p className="text-xs text-[#6C5D60]">
              Prioritized list of guests who have not yet submitted their RSVP.
            </p>
          </div>

          {/* Segmented Priority Filter */}
          <div className="flex items-center p-0.5 bg-[#FAF6EF] rounded-xl border border-[#E8DFD1] text-[11px] self-start sm:self-auto">
            {(
              [
                { id: 'all', label: 'All Pending' },
                { id: 'high', label: 'High Priority (Viewed)' },
                { id: 'medium', label: 'Medium (Sent)' },
                { id: 'low', label: 'Low (Draft)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPriorityFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  priorityFilter === tab.id
                    ? 'bg-white text-[#540D1E] font-bold shadow-2xs'
                    : 'text-[#6C5D60] hover:text-[#2A171B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {followUpList.length === 0 ? (
          <div className="p-6 text-center bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-xs text-[#136A4E] font-semibold">
            🎉 Excellent! All guests in this category have submitted their RSVP responses.
          </div>
        ) : (
          <div className="divide-y divide-[#F2ECE1] border border-[#E8DFD1] rounded-xl overflow-hidden">
            {followUpList.slice(0, 10).map(({ guest, priority, reason }) => (
              <div 
                key={guest.id}
                className="p-3 sm:p-3.5 bg-white hover:bg-[#FAF6EF]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                onClick={() => onSelectGuest(guest)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    priority === 'high' 
                      ? 'bg-[#FFF8EC] text-[#976008] border-[#F2DEB0]' 
                      : 'bg-[#F4EFE6] text-[#736567] border-[#E8DFD1]'
                  }`}>
                    {guest.full_name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#20181A]">{guest.full_name}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                        priority === 'high'
                          ? 'bg-[#FFF8EC] text-[#976008] border border-[#F2DEB0]'
                          : priority === 'medium'
                          ? 'bg-[#EEF5FA] text-[#24638F] border border-[#CDE0ED]'
                          : 'bg-[#F4EFE6] text-[#736567] border border-[#E8DFD1]'
                      }`}>
                        {priority} priority
                      </span>
                    </div>
                    <p className="text-[11px] text-[#736567]">
                      {guest.phone} {guest.family_name ? `· ${guest.family_name}` : ''} · <span className="text-[#350811] font-medium">{reason}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onSelectGuest(guest)}
                    className="px-3 py-1.5 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#F4D06F]" />
                    <span>View Guest</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. MAYBE RESPONSES & RECENT RSVP ACTIVITY                                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Maybe Responses Management */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-cormorant text-xl font-bold text-[#350811]">
              Tentative Responses ({maybeGuests.length} Guests)
            </h3>
            <span className="text-[10px] font-mono text-[#736567]">Requires Re-check</span>
          </div>

          {maybeGuests.length === 0 ? (
            <p className="text-xs text-[#736567] py-4 text-center">
              No guests have marked their RSVP as "Maybe" at this time.
            </p>
          ) : (
            <div className="space-y-2">
              {maybeGuests.map((g) => (
                <div key={g.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-[#20181A] block">{g.full_name}</span>
                    <span className="text-[10px] text-[#736567]">{g.number_of_members} expected · {g.rsvp?.wishes || 'Awaiting travel plans'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectGuest(g)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#E8DFD1] hover:bg-[#FAF6EF] text-[#8C6D2E] text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3 h-3 text-[#9C772F]" />
                    <span>View Guest</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Response Activity Log */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-cormorant text-xl font-bold text-[#350811]">
              Recent RSVP Submissions
            </h3>
            <span className="text-[10px] font-mono text-[#736567]">Real Time Log</span>
          </div>

          {responseTimeline.length === 0 ? (
            <p className="text-xs text-[#736567] py-4 text-center">
              No response timestamps recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {responseTimeline.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#FAF6EF] border border-[#E8DFD1] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#9C772F]" />
                    <span className="font-semibold text-[#20181A]">{item.dateStr}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#136A4E] font-bold">{item.attendingCount} Confirmed</span>
                    <span className="text-[#736567]">· {item.count} total responses</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default RsvpAnalyticsView;
