import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Camera, QrCode, Search, CheckCircle2, XCircle, AlertTriangle, AlertCircle,
  Users, Clock, Utensils, RefreshCw, ArrowLeft, Send, Sparkles, 
  ShieldCheck, Loader2, Check, UserCheck
} from 'lucide-react';
import { GuestRecord } from '../../types/guest';
import { 
  CheckInResult, 
  LiveVenueAttendanceMetrics, 
  GuestEntryPass 
} from '../../types/entryPass';
import { 
  checkInGuest, 
  fetchLiveVenueStats, 
  fetchRecentCheckIns,
  issueOrFetchEntryPass 
} from '../../services/entryPassService';
import { fetchWeddingGuests } from '../../services/guestService';
import { WeddingProjectState } from '../../types/wedding';

interface VenueCheckInViewProps {
  state: WeddingProjectState;
  weddingSlug: string;
  weddingSiteId?: string;
  userId?: string;
  onBack?: () => void;
}

export const VenueCheckInView: React.FC<VenueCheckInViewProps> = ({
  state,
  weddingSlug,
  weddingSiteId,
  userId,
  onBack,
}) => {
  const [manualToken, setManualToken] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [stats, setStats] = useState<LiveVenueAttendanceMetrics>({
    totalExpectedMembers: 0,
    checkedInMembers: 0,
    remainingMembers: 0,
    checkInRatePercent: 0,
    totalPassesIssued: 0,
    usedPassesCount: 0,
  });
  const [recentCheckIns, setRecentCheckIns] = useState<GuestEntryPass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkInLoading, setCheckInLoading] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => setToastNotification(null), 4000);
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const coupleNames = `${state.couple.groomEn || 'Dhruv'} & ${state.couple.brideEn || 'Shreya'}`;

  // 🔄 Refresh Live Venue Stats & Guests
  const loadData = async () => {
    setLoading(true);
    try {
      const [guestsData, liveStats, recent] = await Promise.all([
        weddingSiteId ? fetchWeddingGuests(weddingSiteId) : Promise.resolve([]),
        fetchLiveVenueStats(weddingSlug),
        fetchRecentCheckIns(weddingSlug),
      ]);
      setGuests(guestsData);
      setStats(liveStats);
      setRecentCheckIns(recent);
    } catch (err) {
      console.error('Error loading venue check-in data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [weddingSlug, weddingSiteId]);

  // 📷 Start Camera Scanner Stream
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        setCameraError('Camera access not supported on this browser. Use manual entry below.');
      }
    } catch (err: any) {
      setCameraError('Camera permission denied or camera not found. Please use manual token entry below.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // ⚡ Execute Check-in by Token
  const handleCheckInByToken = async (tokenToUse: string) => {
    if (!tokenToUse.trim()) return;
    setCheckInLoading(true);
    
    // Extract token if user pasted full URL
    let token = tokenToUse.trim();
    if (token.includes('token=')) {
      token = token.split('token=')[1].split('&')[0];
    } else if (token.includes('/pass/')) {
      token = token.split('/pass/')[1].split('?')[0];
    }

    const res = await checkInGuest(token, weddingSlug, userId);
    setLastResult(res);
    setCheckInLoading(false);
    setManualToken('');

    if (res.success) {
      // Refresh live attendance numbers
      loadData();
    }
  };

  // 🔍 Manual Search & Check-in for Attending Guests
  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return guests.filter((g) => {
      return (
        g.full_name.toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        (g.family_name && g.family_name.toLowerCase().includes(q))
      );
    }).slice(0, 8);
  }, [guests, searchQuery]);

  const handleManualGuestCheckIn = async (g: GuestRecord) => {
    if (g.rsvp?.attendance_status !== 'Attending') {
      showToast(`Cannot check in ${g.full_name}: RSVP status is "${g.rsvp?.attendance_status || 'Pending'}". Only confirmed Attending guests can be checked in.`, 'warning');
      return;
    }

    setCheckInLoading(true);
    // Ensure entry pass is issued
    const passRes = await issueOrFetchEntryPass(g, weddingSlug, weddingSiteId);
    if (!passRes.success || !passRes.pass) {
      showToast(passRes.error || 'Failed to issue entry pass for guest.', 'error');
      setCheckInLoading(false);
      return;
    }

    const checkInRes = await checkInGuest(passRes.pass.entry_token, weddingSlug, userId);
    setLastResult(checkInRes);
    setCheckInLoading(false);
    setSearchQuery('');
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#20181A] font-manrope p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      
      {/* ========================================================================= */}
      {/* 1. TOP APP BAR & LIVE REFRESH                                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD1] pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-white border border-[#E8DFD1] hover:bg-[#FAF6EF] text-[#4A3E40] transition-colors cursor-pointer shadow-2xs"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
              Venue Check-in Workspace · {coupleNames}
            </span>
            <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#350811]">
              Live Wedding Day Check-in
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF6EF] text-[#4A3E40] border border-[#E8DFD1] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#9C772F] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Stats</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. LIVE ATTENDANCE OPERATIONAL METRICS                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Metric 1: Total Expected Members */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#736567] uppercase block">
            Expected Guests
          </span>
          <div className="font-cormorant font-bold text-3xl text-[#2A171B] mt-1">
            {stats.totalExpectedMembers}
          </div>
          <p className="text-[10px] text-[#736567] mt-0.5">Confirmed attending headcount</p>
        </div>

        {/* Metric 2: Checked In Members */}
        <div className="p-4 rounded-2xl bg-white border border-[#BCE3D1] shadow-2xs">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#136A4E] uppercase block">
            Checked In
          </span>
          <div className="font-cormorant font-bold text-3xl text-[#136A4E] mt-1">
            {stats.checkedInMembers}
          </div>
          <p className="text-[10px] text-[#247559] mt-0.5">{stats.usedPassesCount} passes scanned</p>
        </div>

        {/* Metric 3: Remaining Members */}
        <div className="p-4 rounded-2xl bg-white border border-[#F2DEB0] shadow-2xs">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#976008] uppercase block">
            Remaining
          </span>
          <div className="font-cormorant font-bold text-3xl text-[#976008] mt-1">
            {stats.remainingMembers}
          </div>
          <p className="text-[10px] text-[#9C772F] mt-0.5">Yet to arrive at venue</p>
        </div>

        {/* Metric 4: Check-in Rate % */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#736567] uppercase block">
            Check-in Rate
          </span>
          <div className="font-cormorant font-bold text-3xl text-[#540D1E] mt-1">
            {stats.checkInRatePercent}%
          </div>
          <p className="text-[10px] text-[#736567] mt-0.5">Venue arrival progress</p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. CHECK-IN SCANNER / MANUAL INPUT AREA                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Scanner & Token Input (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Main Scanner Box */}
          <div className="p-6 bg-white border border-[#E8DFD1] rounded-3xl shadow-md text-center space-y-4">
            <h3 className="font-cormorant text-2xl font-bold text-[#350811]">
              Venue QR Scanner
            </h3>
            
            {cameraActive ? (
              <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-black border-2 border-[#540D1E] shadow-inner">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-dashed border-[#F4D06F]/70 m-8 rounded-xl pointer-events-none animate-pulse" />
                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute bottom-3 right-3 px-3 py-1 bg-black/70 text-white rounded-lg text-xs font-bold"
                >
                  Stop Camera
                </button>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-[#E8DFD1] rounded-2xl bg-[#FCFAF7] space-y-3">
                <QrCode className="w-12 h-12 text-[#9C772F] mx-auto" />
                <div>
                  <h4 className="font-semibold text-sm text-[#20181A]">Scan Guest QR Entry Pass</h4>
                  <p className="text-xs text-[#736567] mt-0.5">
                    Position guest QR pass in front of device camera or enter token manually.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-2.5 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#F4D06F]" />
                  <span>Start Camera Scanner</span>
                </button>
              </div>
            )}

            {cameraError && (
              <div className="p-3 bg-[#FAF8F5] border border-[#E8DFD1] rounded-xl text-xs text-[#976008]">
                {cameraError}
              </div>
            )}

            {/* Manual Token Entry Bar */}
            <div className="pt-2 border-t border-[#F0EAE1]">
              <label className="block text-[11px] font-semibold text-[#4A3E40] uppercase tracking-wider text-left mb-1.5">
                Quick Token Check-in
              </label>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCheckInByToken(manualToken);
                }} 
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste URL or enter token (e.g. ent_abc123...)"
                  className="flex-1 px-3.5 py-2 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] placeholder:text-[#9C8C8E] focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  disabled={!manualToken.trim() || checkInLoading}
                  className="px-4 py-2 rounded-xl bg-[#167A5A] hover:bg-[#136A4E] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-40"
                >
                  {checkInLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                  <span>Check In</span>
                </button>
              </form>
            </div>
          </div>

          {/* Manual Guest Directory Search Fallback */}
          <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-[#736567] tracking-wider">
                Manual Guest Lookup &amp; Check-In
              </span>
              <span className="text-[11px] text-[#736567]">{guests.length} total guests</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#9C8C8E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest by name, mobile number, or family..."
                className="w-full pl-8.5 pr-3 py-2 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] placeholder:text-[#9C8C8E] focus:outline-none"
              />
            </div>

            {searchQuery.trim() && (
              <div className="divide-y divide-[#F2ECE1] border border-[#E8DFD1] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {filteredGuests.length === 0 ? (
                  <p className="p-3 text-xs text-[#736567] text-center">No matching guests found.</p>
                ) : (
                  filteredGuests.map((g) => {
                    const isAttending = g.rsvp?.attendance_status === 'Attending';
                    return (
                      <div key={g.id} className="p-2.5 bg-white hover:bg-[#FAF6EF] flex items-center justify-between gap-2 text-xs">
                        <div>
                          <div className="font-bold text-[#20181A]">{g.full_name}</div>
                          <div className="text-[10px] text-[#736567]">
                            {g.phone} {g.family_name ? `· ${g.family_name}` : ''} · <span className={isAttending ? 'text-[#136A4E] font-semibold' : 'text-[#8C4A4A]'}>{g.rsvp?.attendance_status || 'Pending'} ({g.number_of_members} members)</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!isAttending || checkInLoading}
                          onClick={() => handleManualGuestCheckIn(g)}
                          className="px-3 py-1 rounded-lg bg-[#167A5A] hover:bg-[#136A4E] text-white text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-40"
                        >
                          Check In
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Scan Feedback & Recent Check-ins (1 Col) */}
        <div className="space-y-4">
          
          {/* Result Card */}
          {lastResult && (
            <div className={`p-5 rounded-3xl border shadow-md animate-scaleUp text-center space-y-3 ${
              lastResult.status === 'CHECKED_IN'
                ? 'bg-[#EDF7F2] border-[#BCE3D1]'
                : lastResult.status === 'ALREADY_CHECKED_IN'
                ? 'bg-[#FFF8EC] border-[#F2DEB0]'
                : 'bg-[#FDF2F2] border-[#F0D5D5]'
            }`}>
              {lastResult.status === 'CHECKED_IN' ? (
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#167A5A] flex items-center justify-center text-[#167A5A] mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              ) : lastResult.status === 'ALREADY_CHECKED_IN' ? (
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#976008] flex items-center justify-center text-[#976008] mx-auto">
                  <Clock className="w-7 h-7" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#8C4A4A] flex items-center justify-center text-[#8C4A4A] mx-auto">
                  <XCircle className="w-7 h-7" />
                </div>
              )}

              <div>
                <span className={`text-[10px] font-mono uppercase font-bold tracking-wider block ${
                  lastResult.status === 'CHECKED_IN' ? 'text-[#136A4E]' : lastResult.status === 'ALREADY_CHECKED_IN' ? 'text-[#976008]' : 'text-[#8C4A4A]'
                }`}>
                  {lastResult.status === 'CHECKED_IN' ? '✓ Checked In Successfully' : lastResult.status === 'ALREADY_CHECKED_IN' ? '⚠️ Already Checked In' : '❌ Check-In Error'}
                </span>
                
                {lastResult.pass && (
                  <h4 className="font-cormorant text-2xl font-bold text-[#20181A] mt-1">
                    {lastResult.pass.guest_name}
                  </h4>
                )}

                <p className="text-xs text-[#4A3E40] mt-1 leading-relaxed">
                  {lastResult.message}
                </p>
              </div>

              {lastResult.pass && (
                <div className="p-3 bg-white/80 rounded-2xl border border-white text-xs grid grid-cols-2 gap-2 text-left">
                  <div>
                    <span className="text-[10px] font-mono text-[#8C7A7C] uppercase block">Headcount</span>
                    <span className="font-bold text-[#136A4E]">{lastResult.pass.allowed_members_count} Members</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#8C7A7C] uppercase block">Meal</span>
                    <span className="font-semibold text-[#20181A]">{lastResult.pass.meal_preference || 'Standard Veg'}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setLastResult(null)}
                className="w-full py-2 rounded-xl bg-white border border-[#E8DFD1] hover:bg-[#FAF6EF] text-xs font-bold text-[#350811] transition-colors cursor-pointer"
              >
                Ready for Next Scan
              </button>
            </div>
          )}

          {/* Recent Live Check-ins Feed */}
          <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-[#736567] tracking-wider">
                Recent Check-Ins ({recentCheckIns.length})
              </span>
              <span className="w-2 h-2 rounded-full bg-[#167A5A] animate-ping" />
            </div>

            {recentCheckIns.length === 0 ? (
              <p className="text-xs text-[#736567] py-6 text-center">
                No check-ins recorded yet today.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {recentCheckIns.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-xl bg-[#FAF6EF] border border-[#E8DFD1] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#20181A]">{item.guest_name}</div>
                      <div className="text-[10px] text-[#736567]">
                        {item.allowed_members_count} {item.allowed_members_count === 1 ? 'member' : 'members'} · {item.family_name || item.relationship}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-[10px] font-bold text-[#136A4E] block">
                        {item.checked_in_at 
                          ? new Date(item.checked_in_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                          : 'Checked In'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 🔔 Luxury Check-In Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className={`px-4 py-3 rounded-2xl border shadow-2xl text-xs font-bold flex items-center gap-2.5 ${
            toastNotification.type === 'error'
              ? 'bg-[#350811] text-rose-200 border-rose-500/60'
              : toastNotification.type === 'warning'
              ? 'bg-[#3A240A] text-amber-200 border-amber-500/60'
              : 'bg-[#0E3524] text-emerald-200 border-emerald-500/60'
          }`}>
            {toastNotification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : toastNotification.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
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

export default VenueCheckInView;
