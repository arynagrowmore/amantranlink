import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  DollarSign, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Building2, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  X,
  CreditCard,
  Layers,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resolveApiUrl } from '../../utils/apiConfig';
import { MIN_SETTLEMENT_AMOUNT_INR } from '../../config/pricing';

interface SettlementRecord {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected' | 'reversed';
  payout_upi: string;
  requested_at: string;
  paid_at?: string;
  rejection_reason?: string;
}

interface CommissionItem {
  id: string;
  order_id: string;
  retail_price: number;
  partner_price?: number;
  commission_amount: number;
  status: string;
  created_at: string;
  wedding_sites?: {
    content?: {
      couple?: {
        groomEn?: string;
        brideEn?: string;
      };
    };
  };
}

interface WalletData {
  totalEarned: number;
  pendingCommission: number;
  availableBalance: number;
  reservedAmount: number;
  paidOut: number;
  totalSettlements: number;
  minSettlementAmount: number;
}

export const PartnerSettlementTab: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData>({
    totalEarned: 0,
    pendingCommission: 0,
    availableBalance: 0,
    reservedAmount: 0,
    paidOut: 0,
    totalSettlements: 0,
    minSettlementAmount: MIN_SETTLEMENT_AMOUNT_INR,
  });
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Settlement Request Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [requestAmount, setRequestAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const fetchWalletData = async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const res = await fetch(resolveApiUrl(`/api/partner/wallet?userId=${user.uid}`));
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setWallet(data.wallet);
          setCommissions(data.commissions || []);
          setSettlements(data.settlements || []);
        }
      }
    } catch (e) {
      console.warn('Failed to load partner wallet:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [user?.uid]);

  const handleOpenModal = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setRequestAmount(String(wallet.availableBalance >= MIN_SETTLEMENT_AMOUNT_INR ? wallet.availableBalance : MIN_SETTLEMENT_AMOUNT_INR));
    setIsModalOpen(true);
  };

  const handleSubmitSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    const amount = Number(requestAmount);
    if (!amount || isNaN(amount) || amount < MIN_SETTLEMENT_AMOUNT_INR) {
      setErrorMessage(`Minimum settlement request amount is ₹${MIN_SETTLEMENT_AMOUNT_INR}.`);
      return;
    }
    if (amount > wallet.availableBalance) {
      setErrorMessage(`Request amount cannot exceed your available balance of ₹${wallet.availableBalance}.`);
      return;
    }
    if (!user?.payoutUpi || !user?.payoutUpi.includes('@')) {
      setErrorMessage('Please configure a valid Payout UPI ID (e.g. yourname@upi) in Studio Profile.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const idempotencyKey = `set_${user.uid}_${Date.now()}`;
      const res = await fetch(resolveApiUrl('/api/partner/settlement-request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          amount,
          idempotencyKey
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to submit settlement request.');
      } else {
        setSuccessMessage(data.message || 'Settlement request submitted successfully!');
        fetchWalletData();
        setTimeout(() => {
          setIsModalOpen(false);
        }, 2200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error submitting request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'credited':
      case 'settled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#167A5A] bg-[#167A5A]/10 px-2 py-0.5 rounded-full border border-[#167A5A]/30">
            <CheckCircle2 className="w-3 h-3 text-[#167A5A]" />
            <span>{status.toUpperCase()}</span>
          </span>
        );
      case 'processing':
      case 'approved':
      case 'settlement_requested':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#C49A35] bg-[#C49A35]/10 px-2 py-0.5 rounded-full border border-[#C49A35]/30">
            <Clock className="w-3 h-3 text-[#C49A35]" />
            <span>{status.toUpperCase()}</span>
          </span>
        );
      case 'rejected':
      case 'reversed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#6E1020] bg-[#6E1020]/10 px-2 py-0.5 rounded-full border border-[#6E1020]/30">
            <AlertCircle className="w-3 h-3 text-[#6E1020]" />
            <span>{status.toUpperCase()}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#75675C] bg-[#F8F3E8] px-2 py-0.5 rounded-full border border-[#E8D5AD]">
            <Clock className="w-3 h-3 text-[#75675C]" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-manrope animate-fadeIn">
      {/* 🧭 Top Bar: Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8D5AD]/60">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#167A5A] uppercase block">
            Commercial Settlement Center
          </span>
          <h3 className="font-cormorant font-bold text-2xl text-[#430914] leading-tight">
            Partner Wallet &amp; Commission Ledger
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchWalletData}
            className="p-2 rounded-xl bg-[#FFFDF8] border border-[#E8D5AD] hover:border-[#C49A35] text-[#75675C] hover:text-[#430914] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shadow-2xs"
            title="Refresh Wallet Balance"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenModal}
            disabled={wallet.availableBalance < MIN_SETTLEMENT_AMOUNT_INR}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all min-h-[44px] cursor-pointer ${
              wallet.availableBalance >= MIN_SETTLEMENT_AMOUNT_INR
                ? 'bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] border border-[#C49A35] hover:scale-105'
                : 'bg-stone-200 text-stone-500 border border-stone-300 cursor-not-allowed'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-[#C49A35]" />
            <span>REQUEST SETTLEMENT</span>
          </button>
        </div>
      </div>

      {/* 💼 1. 5 Executive Wallet Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* TOTAL EARNED */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#75675C] mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">TOTAL EARNED</span>
            <Wallet className="w-4 h-4 text-[#C49A35]" />
          </div>
          <div className="font-cormorant font-bold text-2xl text-[#430914]">
            ₹{isLoading ? '...' : wallet.totalEarned.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#167A5A] font-semibold block mt-0.5">Authoritative Ledger</span>
        </div>

        {/* AVAILABLE BALANCE */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F4F9F6] to-[#FFFDF8] border border-[#167A5A]/40 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#167A5A] mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">AVAILABLE BALANCE</span>
            <DollarSign className="w-4 h-4 text-[#167A5A]" />
          </div>
          <div className="font-cormorant font-bold text-2xl text-[#167A5A]">
            ₹{isLoading ? '...' : wallet.availableBalance.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#75675C] block mt-0.5">Ready to Withdraw</span>
        </div>

        {/* PENDING COMMISSION */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#75675C] mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">PENDING</span>
            <Clock className="w-4 h-4 text-[#C49A35]" />
          </div>
          <div className="font-cormorant font-bold text-2xl text-amber-700">
            ₹{isLoading ? '...' : wallet.pendingCommission.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#75675C] block mt-0.5">In Client Review</span>
        </div>

        {/* PAID OUT */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#75675C] mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">PAID OUT</span>
            <CheckCircle2 className="w-4 h-4 text-[#167A5A]" />
          </div>
          <div className="font-cormorant font-bold text-2xl text-[#430914]">
            ₹{isLoading ? '...' : wallet.paidOut.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#75675C] block mt-0.5">Settled to UPI</span>
        </div>

        {/* TOTAL SETTLEMENTS */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-[#75675C] mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">SETTLEMENTS</span>
            <Layers className="w-4 h-4 text-[#6E1020]" />
          </div>
          <div className="font-cormorant font-bold text-2xl text-[#6E1020]">
            {isLoading ? '...' : wallet.totalSettlements}
          </div>
          <span className="text-[10px] text-[#75675C] block mt-0.5">Batch Batches</span>
        </div>
      </div>

      {/* ⚠️ Minimum Settlement Threshold Notice */}
      {wallet.availableBalance < MIN_SETTLEMENT_AMOUNT_INR && (
        <div className="p-3 bg-[#F8F3E8] border border-[#E8D5AD] rounded-2xl text-xs text-[#75675C] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#C49A35] shrink-0" />
            <span>Minimum settlement amount is <strong>₹{MIN_SETTLEMENT_AMOUNT_INR}</strong>. Complete more client invitations to reach the payout threshold.</span>
          </span>
          <span className="text-[10px] font-mono font-bold text-[#6E1020] bg-white px-2 py-0.5 rounded border border-[#E8D5AD]">
            Min ₹{MIN_SETTLEMENT_AMOUNT_INR}
          </span>
        </div>
      )}

      {/* 📜 2. Commission Ledger */}
      <div className="bg-[#FFFDF8] rounded-3xl border border-[#E8D5AD] p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#C49A35] uppercase tracking-wider block">
              Authoritative Records
            </span>
            <h4 className="font-cormorant font-bold text-xl text-[#430914]">
              Commission Ledger
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-[#75675C]">
            {commissions.length} Entries
          </span>
        </div>

        {commissions.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#75675C]">
            No commission available yet. Client payments will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8D5AD] text-[#75675C] text-[10px] font-mono uppercase tracking-wider">
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Order ID</th>
                  <th className="pb-2.5">Retail Price</th>
                  <th className="pb-2.5">Partner Price</th>
                  <th className="pb-2.5">Commission</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5AD]/40">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8F3E8]/40 transition-colors">
                    <td className="py-3 font-mono text-[#75675C]">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 font-mono font-bold text-[#430914]">
                      {c.order_id}
                    </td>
                    <td className="py-3 font-bold text-[#430914]">
                      ₹{c.retail_price?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-[#75675C]">
                      ₹{(c.partner_price || (c.retail_price - c.commission_amount))?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 font-mono font-bold text-[#167A5A]">
                      +₹{c.commission_amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right">
                      {getStatusBadge(c.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🏛️ 3. Settlement History Table */}
      <div className="bg-[#FFFDF8] rounded-3xl border border-[#E8D5AD] p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#C49A35] uppercase tracking-wider block">
              Payout Audit Log
            </span>
            <h4 className="font-cormorant font-bold text-xl text-[#430914]">
              Settlement History
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-[#75675C]">
            {settlements.length} Requests
          </span>
        </div>

        {settlements.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#75675C]">
            No settlement requests yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8D5AD] text-[#75675C] text-[10px] font-mono uppercase tracking-wider">
                  <th className="pb-2.5">Settlement ID</th>
                  <th className="pb-2.5">Requested Date</th>
                  <th className="pb-2.5">Amount</th>
                  <th className="pb-2.5">Payout UPI</th>
                  <th className="pb-2.5">Processed Date</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5AD]/40">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F8F3E8]/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-[#6E1020]">
                      SET-{s.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 font-mono text-[#75675C]">
                      {new Date(s.requested_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 font-bold text-[#430914] text-sm">
                      ₹{s.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 font-mono text-xs text-[#75675C]">
                      {s.payout_upi}
                    </td>
                    <td className="py-3 font-mono text-[#75675C]">
                      {s.paid_at ? new Date(s.paid_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 text-right">
                      {getStatusBadge(s.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 💳 Settlement Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-manrope">
          <div className="bg-[#FFFDF8] border border-[#E8D5AD] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#75675C] hover:text-[#430914] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold text-[#167A5A] uppercase tracking-wider block">
                Internal Payout Workflow
              </span>
              <h3 className="font-cormorant font-bold text-2xl text-[#430914]">
                Request Commission Settlement
              </h3>
              <p className="text-xs text-[#75675C] mt-1">
                Withdraw your credited commissions directly to your registered UPI ID.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSettlement} className="space-y-4">
              <div className="p-3.5 bg-[#F8F3E8] rounded-2xl border border-[#E8D5AD] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#75675C] block text-[11px]">Available Balance</span>
                  <span className="font-bold text-[#167A5A] text-lg">₹{wallet.availableBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#75675C] block text-[11px]">Registered Payout UPI</span>
                  <span className="font-mono font-bold text-[#430914]">{user?.payoutUpi || 'Not Configured'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#430914] mb-1">
                  Settlement Amount (₹)
                </label>
                <input
                  type="number"
                  min={MIN_SETTLEMENT_AMOUNT_INR}
                  max={wallet.availableBalance}
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#E8D5AD] rounded-xl text-sm font-mono font-bold text-[#430914] focus:outline-none focus:border-[#C49A35]"
                  placeholder={`Min ₹${MIN_SETTLEMENT_AMOUNT_INR}`}
                  required
                />
                <span className="text-[10px] text-[#75675C] block mt-1">
                  Minimum settlement is ₹{MIN_SETTLEMENT_AMOUNT_INR}. Amount will be immediately reserved upon submission.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#E8D5AD] text-xs font-semibold text-[#75675C] hover:text-[#430914] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || wallet.availableBalance < MIN_SETTLEMENT_AMOUNT_INR}
                  className="px-6 py-2.5 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider border border-[#C49A35] cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#C49A35]" />
                      <span>Confirm Settlement</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerSettlementTab;
