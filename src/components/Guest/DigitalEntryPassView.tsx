import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Sparkles, Calendar, MapPin, Users, ShieldCheck, 
  Clock, AlertTriangle, Download, ArrowLeft, RefreshCw, Utensils
} from 'lucide-react';
import { GuestEntryPass } from '../../types/entryPass';
import { resolveEntryPass } from '../../services/entryPassService';
import { QRCodeDisplay } from '../QR/QRCodeDisplay';

interface DigitalEntryPassViewProps {
  token: string;
  weddingSlug?: string;
}

export const DigitalEntryPassView: React.FC<DigitalEntryPassViewProps> = ({
  token,
  weddingSlug,
}) => {
  const [pass, setPass] = useState<GuestEntryPass | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPass = async () => {
    setLoading(true);
    setError(null);
    const res = await resolveEntryPass(token, weddingSlug);
    if (res.success && res.pass) {
      setPass(res.pass);
    } else {
      setError(res.error || 'Invalid or unrecognized wedding entry pass.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      loadPass();
    }
  }, [token, weddingSlug]);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shahistudio.com';
  const passUrl = pass ? `${originUrl}/pass/${pass.entry_token}` : '';

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#20181A] font-manrope flex flex-col justify-center items-center p-4 py-8 relative">
      
      {/* Top Branding Eyebrow */}
      <div className="text-center mb-5 space-y-1">
        <span className="text-[10px] font-mono tracking-widest uppercase text-[#9C772F] font-bold">
          AmantranLink · Royal Wedding Entry Pass
        </span>
        <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#350811]">
          Digital Hospitality Pass
        </h1>
      </div>

      {/* Main Luxury Ticket Card */}
      <div className="w-full max-w-md bg-white border border-[#E8DFD1] rounded-3xl shadow-xl overflow-hidden relative">
        
        {/* Top Gold Accent */}
        <div className="h-2 w-full bg-linear-to-r from-[#9C772F] via-[#F4D06F] to-[#9C772F]" />

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#736567]">Authenticating your secure entry pass...</p>
          </div>
        ) : error || !pass ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FDF2F2] border border-[#F0D5D5] flex items-center justify-center text-[#8C4A4A] mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-cormorant text-2xl font-bold text-[#350811]">
              Invalid Entry Pass
            </h3>
            <p className="text-xs text-[#6C5D60] max-w-xs mx-auto leading-relaxed">
              {error || 'This digital wedding pass could not be authenticated. Please contact the wedding host.'}
            </p>
          </div>
        ) : (
          <div>
            
            {/* Header: Status Banner */}
            <div className={`p-4 text-center border-b ${
              pass.status === 'used' 
                ? 'bg-[#EDF7F2] border-[#BCE3D1] text-[#136A4E]' 
                : 'bg-[#FAF6EF] border-[#E8DFD1] text-[#350811]'
            }`}>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider block">
                {pass.status === 'used' ? '✓ Verified Check-In' : '● Digital Entry Pass Active'}
              </span>
              <div className="font-cormorant text-2xl font-bold mt-0.5">
                {pass.status === 'used' ? 'Welcome to the Wedding!' : 'Authorized Wedding Entry'}
              </div>
              {pass.checked_in_at && (
                <p className="text-[11px] text-[#136A4E] mt-0.5 font-medium">
                  Checked in at {new Date(pass.checked_in_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              )}
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-5 text-center">
              
              {/* Guest Profile */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-[#9C772F] uppercase font-bold tracking-widest block">
                  Guest Name
                </span>
                <h2 className="font-cormorant text-3xl font-bold text-[#20181A]">
                  {pass.guest_name}
                </h2>
                {pass.family_name && (
                  <p className="text-xs text-[#736567] font-medium">{pass.family_name}</p>
                )}
              </div>

              {/* Scannable High-Contrast QR Code */}
              <div className="py-2">
                <QRCodeDisplay 
                  value={passUrl}
                  size={210}
                  className="mx-auto"
                />
                <p className="text-[11px] text-[#6C5D60] font-medium mt-2">
                  Please present this QR code at the wedding entrance
                </p>
                <p className="text-[10px] font-mono text-[#8C7A7C] mt-0.5">
                  Secure Token: <strong className="text-[#540D1E]">{pass.entry_token}</strong>
                </p>
              </div>

              {/* Perforated Divider Visual */}
              <div className="relative my-4 flex items-center justify-between">
                <div className="w-4 h-8 bg-[#FAF6EE] rounded-r-full -ml-6 border-r border-t border-b border-[#E8DFD1]" />
                <div className="flex-1 border-t-2 border-dashed border-[#E8DFD1] mx-2" />
                <div className="w-4 h-8 bg-[#FAF6EE] rounded-l-full -mr-6 border-l border-t border-b border-[#E8DFD1]" />
              </div>

              {/* Ticket Key Data Grid */}
              <div className="grid grid-cols-2 gap-3 text-left text-xs bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8DFD1]">
                <div>
                  <span className="text-[10px] font-mono text-[#8C7A7C] uppercase block">Authorized Headcount</span>
                  <span className="font-bold text-[#136A4E] text-sm">{pass.allowed_members_count} Confirmed {pass.allowed_members_count === 1 ? 'Person' : 'Members'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#8C7A7C] uppercase block">Catering</span>
                  <span className="font-semibold text-[#20181A] text-xs flex items-center gap-1 mt-0.5">
                    <Utensils className="w-3 h-3 text-[#9C772F]" />
                    {pass.meal_preference || 'Standard Veg'}
                  </span>
                </div>
              </div>

            </div>

            {/* Footer Notice */}
            <div className="p-4 bg-[#FAF6EF] border-t border-[#E8DFD1] text-center text-[11px] text-[#736567]">
              🛡️ Scoped and securely verified by <strong className="text-[#540D1E]">AmantranLink</strong> for the wedding hosts.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DigitalEntryPassView;
